import { create } from 'zustand'
import { fetchScreen } from '../api/cpu'
import { useUIStore } from './uiStore'

let lastErrorToast = 0

const initialState = {
  width: 0,
  height: 0,
  data: null, // Uint8Array of raw framebuffer bytes (0 = black, else white)
  isScreenOpen: false,
  loading: false,
}

export const useScreenStore = create((set, get) => ({
  ...initialState,

  openScreen: () => set({ isScreenOpen: true }),
  closeScreen: () => set({ isScreenOpen: false }),
  toggleScreen: () => set((state) => ({ isScreenOpen: !state.isScreenOpen })),

  // Fetches the framebuffer and updates the stored image. No-ops when the
  // screen is closed to avoid needless requests.
  refreshScreen: async () => {
    if (!get().isScreenOpen) return
    if (get().loading) return
    set({ loading: true })
    try {
      const { width, height, data } = await fetchScreen()
      set({ width, height, data })
    } catch (error) {
      console.error('refreshScreen failed:', error)
      const now = Date.now() // experimental code. otherwise spams frontend with errors
      if (now - lastErrorToast > 3000) { // 3s delay
        useUIStore.getState().addToast('Screen refresh failed', 'error')
        lastErrorToast = now
      }
    } finally {
      set({ loading: false })
    }
  },
}))
