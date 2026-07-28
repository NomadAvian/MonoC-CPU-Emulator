import { create } from 'zustand'

const initialState = {
  theme: 'dark',
  format: 'Hex',
  isChatOpen: false,
}

export const useUIStore = create((set) => ({
  ...initialState,

  setTheme: (theme) => set({ theme }),

  setFormat: (format) => set({ format }),

  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

  resetUI: () => set(initialState),
}))
