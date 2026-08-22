import { create } from 'zustand'
import { fetchRegisters, stepCpu, resetCpu, compile } from '../api/cpu'
import { useEditorStore } from './editorStore'
import { useScreenStore } from './screenStore'
import { useConsoleStore } from './consoleStore'
import { useMemoryStore } from './memoryStore'

// throttle framebuffer
const SCREEN_REFRESH_MS = 50
let lastScreenRefresh = 0

// throttle console output polling
const CONSOLE_REFRESH_MS = 50
let lastConsoleRefresh = 0

// force enabled when cpu halts to update the screen to final state
async function maybeRefreshScreen(force = false) {
  const now = Date.now()
  if (!force && now - lastScreenRefresh < SCREEN_REFRESH_MS) return
  lastScreenRefresh = now
  await useScreenStore.getState().refreshScreen()
}

async function maybeRefreshConsole(force = false) {
  const now = Date.now()
  if (!force && now - lastConsoleRefresh < CONSOLE_REFRESH_MS) return
  lastConsoleRefresh = now
  await useConsoleStore.getState().poll(force)
}

export const SPEEDS = [
  { label: 'Trace', steps: 1, delay: 1000 },
  { label: 'Slow', steps: 1, delay: 100 },
  { label: 'Normal', steps: 1, delay: 50 },
  { label: 'Fast', steps: 128, delay: 0 },
  { label: 'Full', steps: 1024, delay: 0 },
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
  fetchRegisters: async (trackChanges = true) => {
    try {
      const prev = get().registers
      const data = await fetchRegisters()
      const next = data.registers ?? initialState.registers

      // Track deltas so the UI can highlight modified registers
      const changed = new Set()
      if (trackChanges) {
        for (let i = 0; i < next.length; i++) {
          if (next[i] !== prev[i]) changed.add(i)
        }
      }

      const pc = data.pc ?? 0
      if (trackChanges && pc !== get().programCounter) changed.add('pc')
      const romSize = get().romSize

      // pc is a byte address; romSize is instruction count.
      // past the end = program ran off the end of ROM
      const halted = romSize > 0 && pc >= romSize * 4

      if (halted && !get().halted) {
        useConsoleStore.getState().writeSys('Execution completed')
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
    const consoleStore = useConsoleStore.getState()
    consoleStore.reset()
    set({ compiling: true })
    consoleStore.writeSys('Compiling...')
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
      consoleStore.writeSys('Compilation successful')
      await get().fetchRegisters()
      maybeRefreshScreen()
      maybeRefreshConsole(true)
      return result
    } catch (error) {
      set({ compiling: false })
      console.error('compilation failed:', error)
      consoleStore.writeSys(`Compilation failed: ${error.message}`)
      return { ok: false, error: error.message };
    }
  },

  // -------- STEP --------
  step: async (count = 1) => {
    if (get().halted) {
      useConsoleStore.getState().writeSys('Program terminated')
      return false
    }

    try {
      await stepCpu(count)
      await get().fetchRegisters()
      maybeRefreshScreen(get().halted)
      maybeRefreshConsole(get().halted)
      return true
    } catch (error) {
      console.error('step failed:', error)
      useConsoleStore.getState().writeSys(`Error: ${error.message}`)
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
      useConsoleStore.getState().reset()
      useMemoryStore.getState().clearMemoryWrites()
      await get().fetchRegisters(false)
      maybeRefreshScreen()
      maybeRefreshConsole(true)
      useConsoleStore.getState().writeSys('CPU reset')
      return true
    } catch (error) {
      console.error('reset failed:', error)
      useConsoleStore.getState().writeSys(`Error: ${error.message}`)
      return false
    }
  },
}))
