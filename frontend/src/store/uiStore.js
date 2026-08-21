import { create } from 'zustand'

const initialState = {
  isLeftOpen: true,
  isChatOpen: false,
  isDocsOpen: false,
  leftWidth: 260,
  docsWidth: 420,
  rightWidth: 420,
  bottomHeight: 180,
  toasts: [],
}

export const useUIStore = create((set) => ({
  ...initialState,

  setLeftWidth: (leftWidth) => set({ leftWidth }),
  setDocsWidth: (docsWidth) => set({ docsWidth }),
  setRightWidth: (rightWidth) => set({ rightWidth }),
  setBottomHeight: (bottomHeight) => set({ bottomHeight }),

  toggleLeft: () => set((state) => ({ isLeftOpen: !state.isLeftOpen })),
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
}))
