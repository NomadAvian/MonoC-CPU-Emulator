import { create } from 'zustand'

export const useLogStore = create((set) => ({
  entries: [],

  addLog: (message) => {
    set((state) => ({
      entries: [...state.entries, message],
    }))
  },

  clear: () => set({ entries: [] }),
}))

