import { create } from 'zustand'

const initialState = {
  isLeftOpen: true,
  isChatOpen: false,
  isDocsOpen: false,
  leftWidth: 260,
  rightWidth: 420,
  screenWidth: 420,
  bottomHeight: 204,
  toasts: [],
}

export const useUIStore = create((set) => ({
  ...initialState,

  setLeftWidth: (leftWidth) => set({ leftWidth }),
  setRightWidth: (rightWidth) => set({ rightWidth }),
  setScreenWidth: (screenWidth) => set({ screenWidth }),
  setBottomHeight: (bottomHeight) => set({ bottomHeight }),
  setActiveRightTab: (activeRightTab) => set({ activeRightTab }),

  toggleLeft: () => set((state) => ({ isLeftOpen: !state.isLeftOpen })),
  toggleChat: () => set((state) => {
    // if opening chat, make sure right sidebar is open and tab is chat
    if (!state.isChatOpen) {
      return { isChatOpen: true, isDocsOpen: false }
    }
    return { isChatOpen: false }
  }),
  toggleDocs: () => set((state) => {
    // if opening docs, make sure right sidebar is open and tab is docs
    if (!state.isDocsOpen) {
      return { isDocsOpen: true, isChatOpen: false }
    }
    return { isDocsOpen: false }
  }),

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
