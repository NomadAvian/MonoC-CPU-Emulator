import { create } from 'zustand'

const initialState = {
  isLeftOpen: true,
  isRightPanelOpen: false,
  activeRightTab: 'docs',   // 'docs' | 'ai' | 'examples'
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

  toggleLeft: () => set((state) => ({ isLeftOpen: !state.isLeftOpen })),

  // opens the right panel on the given tab; clicking the entry for the
  // already-active tab collapses the panel instead
  openRightTab: (tab) => set((state) => (
    state.isRightPanelOpen && state.activeRightTab === tab
      ? { isRightPanelOpen: false }
      : { isRightPanelOpen: true, activeRightTab: tab }
  )),
  closeRightPanel: () => set({ isRightPanelOpen: false }),

  // plain open/close of the whole panel; the last-active tab is kept
  // (defaults to 'docs' on a fresh session)
  toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),

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
