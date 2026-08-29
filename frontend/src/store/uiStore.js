import { create } from 'zustand'

const initialState = {
  isLeftOpen: true,
  isRightPanelOpen: true,
  activeRightTab: 'docs',   // 'docs' | 'ai' | 'examples'
  leftWidth: 260,
  rightWidth: 460,
  screenWidth: 420,
  bottomHeight: 204,
  isBottomCollapsed: false,
  bottomActiveTab: 'Console', // 'Console' | 'Disassembler'
  toasts: [],
  compileErrorLine: null,
  revealOnOutput: false,
}

export const useUIStore = create((set) => ({
  ...initialState,

  setLeftWidth: (leftWidth) => set({ leftWidth }),
  setRightWidth: (rightWidth) => set({ rightWidth }),
  setScreenWidth: (screenWidth) => set({ screenWidth }),
  setBottomHeight: (bottomHeight) => set({ bottomHeight }),

  toggleBottom: () => set((state) => ({ isBottomCollapsed: !state.isBottomCollapsed })),
  setBottomActiveTab: (tab) => set({ bottomActiveTab: tab }),

  // expand the bottom panel and switch to a given tab
  openBottomWithTab: (tab) => set({ isBottomCollapsed: false, bottomActiveTab: tab }),
  setCompileErrorLine: (compileErrorLine) => set({ compileErrorLine }),
  armRevealOnOutput: () => set({ revealOnOutput: true }),

  // if armed, expands the bottom panel onto the Console tab
  consumeConsoleReveal: () => set((state) => {
    if (!state.revealOnOutput) return {}
    return { revealOnOutput: false, isBottomCollapsed: false, bottomActiveTab: 'Console' }
  }),

  toggleLeft: () => set((state) => ({ isLeftOpen: !state.isLeftOpen })),

  // already active tab collapses the panel instead
  openRightTab: (tab) => set((state) => (
    state.isRightPanelOpen && state.activeRightTab === tab
      ? { isRightPanelOpen: false }
      : { isRightPanelOpen: true, activeRightTab: tab }
  )),
  closeRightPanel: () => set({ isRightPanelOpen: false }),

  // defaults to docs on a fresh session
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
