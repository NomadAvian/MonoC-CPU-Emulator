import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const initialState = {
    theme: 'catppuccin',
    format: 'Unsigned',
    fontStyle: 'Monospace',
    editorFontSize: 16,
    tabSize: 4,
    showCompletionDocs: true,
}

export const useSettingsStore = create(
    persist(
        (set) => ({
            ...initialState,

            setTheme: (theme) => {
                document.documentElement.setAttribute('data-theme', theme)
                set({ theme })
            },
            setFormat: (format) => set({ format }),
            setFontStyle: (fontStyle) => set({ fontStyle }),
            setEditorFontSize: (editorFontSize) => set({ editorFontSize }),
            setTabSize: (tabSize) => set({ tabSize }),
            setShowCompletionDocs: (showCompletionDocs) => set({ showCompletionDocs }),

            resetSettings: () => set(initialState),
        }),
        {
            name: 'monoc-settings-store',
        }
    )
)
