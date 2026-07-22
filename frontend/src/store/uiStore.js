import { create } from 'zustand'

const initialState = {
  activePanel: 'editor',
  theme: 'dark',
  isSidebarOpen: true,
  isChatOpen: false,
}

export const useUIStore = create((set) => ({
  ...initialState,

  setActivePanel: (activePanel) => set({ activePanel }),

  setTheme: (theme) => set({ theme }),

  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'dark' ? 'light' : 'dark',
    })),

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

  resetUI: () => set(initialState),
}))
