import { create } from 'zustand'
import { fetchExamples, fetchExampleDetail } from '../api/library'
import { useEditorStore } from './editorStore'

const initialState = {
  examples: [],
  loading: false,
  error: null,
  search: '',
  loadingId: null,
}

export const useLibraryStore = create((set) => ({
  ...initialState,

  setSearch: (search) => set({ search }),

  fetchExamples: async () => {
    set({ loading: true, error: null })
    try {
      const data = await fetchExamples()
      set({ examples: data.examples || [], loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  selectExample: async (id, onSuccess) => {
    set({ loadingId: id })
    try {
      const detail = await fetchExampleDetail(id)
      if (detail.source) {
        useEditorStore.getState().setSource(detail.source)
        if (onSuccess) onSuccess()
      }
    } catch (err) {
      alert(`Error loading example: ${err.message}`)
    } finally {
      set({ loadingId: null })
    }
  },
}))
