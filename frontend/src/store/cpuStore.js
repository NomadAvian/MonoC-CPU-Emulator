import {create} from 'zustand'

const initialState = {
    registers: Array(32).fill(0),
    programCounter: 0,
    status: 'stopped',
    runIntervalId: null,
}

export const useCPUStore = create((set, get) => ({
    ...initialState,

    step: async () => {
        try {
            await fetch('http://localhost:6969/cpu/step', { method: 'POST' })
            const res = await fetch('http://localhost:6969/cpu/registers')
            if (res.ok) {
                const data = await res.json()
                if (data.registers) set({ registers: data.registers })
                if (data.programCounter !== undefined) set({ programCounter: data.programCounter })
            }
        } catch (e) {
            console.error("Step failed", e)
        }
    },
    
    run: () => {
        const { status, step, runIntervalId } = get()
        if (status === 'running') return
        
        if (runIntervalId) clearInterval(runIntervalId)
        
        const id = setInterval(() => {
            step()
        }, 50)
        
        set({ status: 'running', runIntervalId: id })
    },
    
    pause: () => {
        const { runIntervalId } = get()
        if (runIntervalId) clearInterval(runIntervalId)
        set({ status: 'stopped', runIntervalId: null })
    },
    
    reset: async () => {
        const { pause } = get()
        pause()
        try {
            await fetch('http://localhost:6969/cpu/load', { method: 'POST' })
        } catch (e) {
            console.error("Reset failed", e)
        }
        set({ ...initialState })
    },
}))
