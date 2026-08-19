import { create } from 'zustand'
import { EXAMPLES_DATA } from '../data/examplesData'
import { useEditorStore } from './editorStore'
import { useUIStore } from './uiStore'

const initialState = {
  examples: EXAMPLES_DATA,
  search: '',
}

export const useLibraryStore = create((set) => ({
  ...initialState,

  setSearch: (search) => set({ search }),

  selectExample: (id, onSuccess) => {
    const example = EXAMPLES_DATA.find(ex => ex.id === id)
    if (example && example.source) {
      useEditorStore.getState().setSource(example.source)
      if (onSuccess) onSuccess()
      useUIStore.getState().addToast(`Loaded Example`, 'success')
    } else {
      useUIStore.getState().addToast(`Error loading example: Not found`, 'error')
    }
  },
}))
