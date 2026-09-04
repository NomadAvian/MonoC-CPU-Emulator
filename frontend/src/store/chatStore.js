// Zustand store that manages the chat conversation state
// and communicates with the FastAPI backend.
import { create } from 'zustand'
import { sendPrompt } from '../api/ai';
import { useEditorStore } from './editorStore';
import { sessionId } from '../api/cpu';

const initialState = {
  messages: [],
  isLoading: false,
  contextualSuggestion: null,
}

export const useChatStore = create((set, get) => ({
  ...initialState,
  setContextualSuggestion: (suggestion) => set({ contextualSuggestion: suggestion }),
  addMessage: (role, content, toolsUsed = []) => set((state) => ({ messages: [...state.messages, { role, content, toolsUsed }] })),
  clearMessages: () => set(initialState),
  sendMessage: async (text) => {
    if (get().isLoading) return
    if (!text || !text.trim()) return
    
    get().addMessage('user', text);
    set({ isLoading: true });
    try {
      const source = useEditorStore.getState().source;
      const data = await sendPrompt(get().messages, source, sessionId())
      if (!data.response && (!data.tools_used || data.tools_used.length === 0)) {
        get().addMessage('assistant', 'Error: AI returned an empty response. Please try again.');
      } else {
        get().addMessage('assistant', data.response, data.tools_used);
      }
    } catch (error) {
      get().addMessage('assistant', `Error: ${error.message}`);
    } finally {
      set({ isLoading: false });
    }
  },
}))
