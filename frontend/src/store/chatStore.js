// Zustand store that manages the chat conversation state
// and communicates with the FastAPI backend.
import { create } from 'zustand'

const API_URL = 'http://localhost:8000'

const initialState = {
  messages: [],
  isLoading: false,
}

export const useChatStore = create((set, get) => ({
  ...initialState,
  addMessage: (role, content) => set((state) => ({ messages: [...state.messages, { role, content }] })),
  clearMessages: () => set(initialState),
  sendMessage: async (text) => {
    get().addMessage('user', text);
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: get().messages }),
      });
      const data = await response.json();
      get().addMessage('assistant', data.response);
    } catch (error) {
      get().addMessage('assistant', `Error: ${error.message}`);
    } finally {
      set({ isLoading: false });
    }
  },
}))
