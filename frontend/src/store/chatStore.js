// Zustand store that manages the chat conversation state
// and communicates with the FastAPI backend.
import { create } from 'zustand'
import { sendPrompt } from '../api/ai';
import { useEditorStore } from './editorStore';

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
      const source = useEditorStore.getState().source;
      const data = await sendPrompt(get().messages, source)
      get().addMessage('assistant', data.response);
    } catch (error) {
      get().addMessage('assistant', `Error: ${error.message}`);
    } finally {
      set({ isLoading: false });
    }
  },
}))
