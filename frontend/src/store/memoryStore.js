import { create } from 'zustand'

const initialState = {
  ram: [],
  rom: [],
  mem_writes: [],
  lazyLoad: false,
}

export const useMemoryStore = create((set) => ({
  ...initialState,

  setRam: (ram) => set({ ram }),

  setRom: (rom) => set({ rom }),

  addMemoryWrite: (write) =>
    set((state) => ({
      mem_writes: [...state.mem_writes, write],
    })),

  clearMemoryWrites: () => set({ mem_writes: [] }),

  resetMemory: () => set(initialState),
}))
