import { create } from 'zustand'
import { fetchRegisters, stepCpu, resetCpu, compile } from '../api/cpu'
import { useEditorStore } from './editorStore'
import { useLogStore } from './logStore'
import { useScreenStore } from './screenStore'

// throttle framebuffer
const SCREEN_REFRESH_MS = 50
let lastScreenRefresh = 0

// force enabled when cpu halts to update the screen to final state
async function maybeRefreshScreen(force = false) {
  const now = Date.now()
  if (!force && now - lastScreenRefresh < SCREEN_REFRESH_MS) return
  lastScreenRefresh = now
  await useScreenStore.getState().refreshScreen()
}

export const SPEEDS = [
  { label: 'Trace',  steps: 1,    delay: 1000 }, 
  { label: 'Slow',   steps: 1,    delay: 100  }, 
  { label: 'Normal', steps: 1,    delay: 50   },
  { label: 'Fast',   steps: 128,  delay: 0    },
  { label: 'Full',   steps: 1024, delay: 0    }, 
]

const initialState = {
  registers: Array(32).fill(0),
  prevRegisters: Array(32).fill(0),
  programCounter: 0,
  status: 'stopped',       // 'stopped' | 'compiled' | 'running'
  changedRegisters: new Set(),
  romSize: 0,              // execution completion bound
  halted: false,
  running: false,
  compiling: false,
  speedIndex: 2, // default to 60 IPS
}

export const useCPUStore = create((set, get) => ({
  ...initialState,

  setRegister: (index, value) =>
    set((state) => {
      const registers = [...state.registers]
      registers[index] = value
      return { registers }
    }),
  setProgramCounter: (programCounter) => set({ programCounter }),
  setStatus: (status) => set({ status }),
  resetCPU: () => set(initialState),

  //  ------ FETCH REGISTERS ------
  fetchRegisters: async () => {
    try {
      const prev = get().registers
      const data = await fetchRegisters()
      const next = data.registers ?? initialState.registers

      // Track deltas so the UI can highlight modified registers
      const changed = new Set()
      for (let i = 0; i < next.length; i++) {
        if (next[i] !== prev[i]) changed.add(i)
      }

      const pc = data.pc ?? 0
      if (pc !== get().programCounter) changed.add('pc')
      const romSize = get().romSize
      
      // pc is a byte address; romSize is instruction count.
      // past the end = program ran off the end of ROM
      const halted = romSize > 0 && pc >= romSize * 4

      if (halted && !get().halted) {
        useLogStore.getState().addLog('Execution completed')
      }

      set({
        registers: next,
        prevRegisters: prev,
        programCounter: pc,
        changedRegisters: changed,
        halted,
      })
      return data
    } catch (error) {
      console.error('fetchRegisters failed:', error)
      throw error
    }
  },

  //  ------ COMPILE ------
  compile: async () => {
    const log = useLogStore.getState()
    set({ compiling: true })
    log.addLog('Compiling...')
    try {
      const source = useEditorStore.getState().source
      const result = await compile(source)
      set({
        status: 'compiled',
        changedRegisters: new Set(),
        romSize: result.size ?? 0,
        halted: false,
        compiling: false,
      })
      log.addLog('Compilation successful')
      await get().fetchRegisters()
      maybeRefreshScreen()
      return result
    } catch (error) {
      set({ compiling: false })
      console.error('compilation failed:', error)
      log.addLog(`Compilation failed`)
      return { ok: false, error: error.message };
    }
  },

  // -------- STEP --------
  step: async (count = 1) => {
    if (get().halted) {
      useLogStore.getState().addLog('Program terminated')
      return false
    }

    try {
      await stepCpu(count)
      await get().fetchRegisters()
      maybeRefreshScreen(get().halted)
      return true
    } catch (error) {
      console.error('step failed:', error)
      useLogStore.getState().addLog(`Error: ${error.message}`)
      return false
    }
  },

  // --------- RUN ---------
  startRun: async () => {
    if (get().running) return
    set({ running: true, status: 'running' })

    const tick = async () => {
      if (!get().running) return
      
      const { steps, delay } = SPEEDS[get().speedIndex]
      const ok = await get().step(steps)
      
      if (!ok) {
        get().stopRun()
        return
      }
      
      if (delay > 0) {
        setTimeout(tick, delay)
      } else {
        requestAnimationFrame(tick)
      }
    }
    
    requestAnimationFrame(tick)
  },

  stopRun: () => set({ running: false, status: 'stopped' }),
  setSpeedIndex: (speedIndex) => set({ speedIndex }),

  // --------- RESET ---------
  reset: async () => {
    try {
      await resetCpu()
      set({ status: 'stopped', changedRegisters: new Set(), halted: false })
      await get().fetchRegisters()
      maybeRefreshScreen()
      useLogStore.getState().addLog('CPU reset')
      return true
    } catch (error) {
      console.error('reset failed:', error)
      useLogStore.getState().addLog(`Error: ${error.message}`)
      return false
    }
  },
}))
