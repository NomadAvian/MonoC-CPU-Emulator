import { create } from 'zustand'
import { fetchOutput, sendInput, clearConsole } from '../api/cpu'

const initialState = {
  lines: [],     // ordered transcript: [{ kind: 'in' | 'out', text }]
  lastLen: 0,    // length of output already appended
  isConsoleOpen: false,
  loading: false,
}

export const useConsoleStore = create((set, get) => ({
  ...initialState,

  openConsole: () => set({ isConsoleOpen: true }),
  closeConsole: () => set({ isConsoleOpen: false }),
  toggleConsole: () => set((state) => ({ isConsoleOpen: !state.isConsoleOpen })),

  // Fetches output and appends only the newly-produced portion as an entry.
  poll: async () => {
    if (!get().isConsoleOpen) return
    if (get().loading) return
    set({ loading: true })
    try {
      const { text, len } = await fetchOutput()
      if (len > get().lastLen) {
        const delta = text.slice(get().lastLen, len)
        set({
          lines: [...get().lines, { kind: 'out', text: delta }],
          lastLen: len,
        })
      }
    } catch (error) {
      // silent: polling retries on the next tick, and output may simply not
      // be available yet
      console.error('console poll failed:', error)
    } finally {
      set({ loading: false })
    }
  },

  // Resets local state; call after compile/reset so a fresh program starts
  // with an empty console.
  reset: () => set({ lines: [], lastLen: 0 }),

  clear: async () => {
    try {
      await clearConsole()
    } catch (error) {
      console.error('console clear failed:', error)
    }
    set({ lines: [], lastLen: 0 })
  },

  // Sends a line of stdin and echoes it in the transcript immediately.
  write: async (data) => {
    try {
      await sendInput(data)
    } catch (error) {
      console.error('console input failed:', error)
    }
    set({ lines: [...get().lines, { kind: 'in', text: data }] })
  },

  // Appends a system message (like compilation status) to the transcript.
  writeSys: (text) => {
    set({ lines: [...get().lines, { kind: 'sys', text }] })
  },
}))