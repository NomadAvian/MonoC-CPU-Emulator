import {create} from 'zustand'
import { fetchRegisters, stepCpu, resetCpu, compile } from '../api/cpu'
import { useEditorStore } from './editorStore'

const initialState = {
    registers: Array(32).fill(0),
    programCounter: 0,
    status: 'stopped',
    halted: false,
    running: false,
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
        const data = await fetchRegisters()
        set({ registers: data.registers ?? initialState.registers, programCounter: data.pc ?? 0 })
        return data
      } catch (error) {
        console.error('fetchRegisters failed:', error)
        throw error
      }
    },

    compile: async() => {
      try {
        const source = useEditorStore.getState().source
        const result = await compile(source)
        set({ status: 'stopped', halted: false })
        await get().fetchRegisters()
        return result
      } catch (error) {
        console.error('compilation failed:', error)
        return { ok: false, error: error.message };
      }
    },

    step: async () => {
      if (get().halted === true) {
        console.log('step failed: program halted')
        return false
      } 
      try {
        const data = await stepCpu()
        await get().fetchRegisters()
        set({ halted: data?.halted ?? false })
        return true
      } catch (error) {
        console.error('step failed:', error)
        return false
      }
    },

    reset: async () => {
      try {
        await resetCpu()
        await get().fetchRegisters()
        set({ halted: false, running: false })
        return true
      } catch (error) {
        console.error('reset failed:', error)
        return false
      }
    },

    startRun: async () => {
      if (get().running) return
      set({ running: true, status: 'running' })
      const tick = async () => {
        if (!get().running) return
        const ok = await get().step()
        if (!ok) { get().stopRun(); return }
        await get().step()
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    },

    stopRun: () => set({ running: false, status: 'stopped' }),
}))
