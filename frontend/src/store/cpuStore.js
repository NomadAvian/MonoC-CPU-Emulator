import {create} from 'zustand'
import { fetchRegisters, stepCpu, resetCpu, compile } from '../api/cpu'
import { useEditorStore } from './editorStore'
import { useLogStore } from './logStore'

const initialState = {
    registers: Array(32).fill(0),
    prevRegisters: Array(32).fill(0),
    programCounter: 0,
    status: 'stopped',       // 'stopped' | 'compiled' | 'running'
    changedRegisters: new Set(),
    romSize: 0,              // for execution completion
    halted: false,
    compiling: false,
}

export const useCPUStore = create((set, get) => ({
    ...initialState,

    setRegister: (index, value) =>
        set((state) => {
            const registers = [...state.registers]
            registers[index] = value

            return {registers}
        }),
    setProgramCounter: (programCounter) => set({programCounter}),
    setStatus: (status) => set({status}),
    resetCPU: () => set(initialState),

    fetchRegisters: async () => {
      try {
        const prev = get().registers
        const data = await fetchRegisters()
        const next = data.registers ?? initialState.registers

        // list of changed registers
        const changed = new Set()
        for (let i = 0; i < next.length; i++) {
          if (next[i] !== prev[i]) changed.add(i)
        }

        // pc state & halted state
        const pc = data.pc ?? 0
        if (pc !== get().programCounter) changed.add('pc')
        const romSize = get().romSize
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

    compile: async() => {
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
        return result
      } catch (error) {
        set({ compiling: false })
        console.error('compilation failed:', error)
        log.addLog(`Compilation failed`)
        return { ok: false, error: error.message };
      }
    },

    step: async () => {
      try {
        if (get().halted) {
          useLogStore.getState().addLog('Program terminated')
          return false
        }
        await stepCpu()
        await get().fetchRegisters()
        return true
      } catch (error) {
        console.error('step failed:', error)
        useLogStore.getState().addLog(`Error: ${error.message}`)
        return false
      }
    },

    reset: async () => {
      try {
        await resetCpu()
        set({ status: 'stopped', changedRegisters: new Set(), halted: false })
        await get().fetchRegisters()
        useLogStore.getState().addLog('CPU reset')
        return true
      } catch (error) {
        console.error('reset failed:', error)
        useLogStore.getState().addLog(`Error: ${error.message}`)
        return false
      }
    },
}))
