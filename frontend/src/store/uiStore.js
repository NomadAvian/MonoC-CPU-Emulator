import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const initialState = {
  theme: 'catppuccin',
  format: 'Unsigned',
  isChatOpen: false,
  isDocsOpen: false,
  fontStyle: 'Monospace',
  tabSize: 4,
  toasts: [],
}

export const useUIStore = create(
  persist(
    (set) => ({
      ...initialState,

      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme)
        set({ theme })
      },
      setFormat: (format) => set({ format }),
      setFontStyle: (fontStyle) => set({ fontStyle }),
      setTabSize: (tabSize) => set({ tabSize }),

      toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
      toggleDocs: () => set((state) => ({ isDocsOpen: !state.isDocsOpen })),

      addToast: (message, type = 'info', duration = 3000) => {
        const id = Date.now().toString() + Math.random().toString()
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
        setTimeout(() => {
          set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }))
        }, duration)
      },

      removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })),

      resetUI: () => set(initialState),
    }),
    {
      name: 'monoc-ui-store',
      partialize: (state) => Object.fromEntries(
        Object.entries(state).filter(([key]) => key !== 'toasts')
      ),
    }
  )
)
