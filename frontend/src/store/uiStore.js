import { create } from 'zustand'

const initialState = {
  theme: 'dark',
  format: 'Unsigned',
  isChatOpen: false,
  isDocsOpen: false,
  fontStyle: 'Monospace',
  tabSize: 4,
}

export const useUIStore = create((set) => ({
  ...initialState,

  setTheme: (theme) => set({ theme }),
  setFormat: (format) => set({ format }),
  setFontStyle: (fontStyle) => set({ fontStyle }),
  setTabSize: (tabSize) => set({ tabSize }),

  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  toggleDocs: () => set((state) => ({ isDocsOpen: !state.isDocsOpen })),

  resetUI: () => set(initialState),
}))
