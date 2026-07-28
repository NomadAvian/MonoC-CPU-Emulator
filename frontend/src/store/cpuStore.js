import {create} from 'zustand'

const initialState = {
    registers: Array(32).fill(0),
    programCounter: 0,
    status: 'stopped',
}

export const useCPUStore = create((set) => ({
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
}))
