import {create} from 'zustand'

const initialState = {
    registers: Array(32).fill(0),
    programCounter: 0,
    halter: false,
    // falgs? instruction Register?
}

//TODO: include api fetching here directly, instead of using wrapper
export const useCPUStore = create((set) => ({
    ...initialState,

    setRegister: (index, value) =>
        set((state) => {
            const registers = [...state.registers]
            registers[index] = value

            return {registers}
        }),
    setProgramCounter: (programCounter) => set({programCounter}),
    resetCPU: () => set(initialState),
}))
