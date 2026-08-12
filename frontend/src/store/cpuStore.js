import {create} from 'zustand'
import { fetchRegisters, stepCpu, resetCpu, compile } from '../api/cpu'
import { useEditorStore } from './editorStore'

const initialState = {
    registers: Array(32).fill(0),
    programCounter: 0,
    status: 'stopped',
    runIntervalId: null,
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
        set({ status: 'stopped' })
        await get().fetchRegisters()
        return result
      } catch (error) {
        console.error('compilation failed:', error)
        return { ok: false, error: error.message };
      }
    },

    step: async () => {
      try {
        await stepCpu()
        await get().fetchRegisters()
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
        return true
      } catch (error) {
        console.error('reset failed:', error)
        return false
      }
    },
}))
