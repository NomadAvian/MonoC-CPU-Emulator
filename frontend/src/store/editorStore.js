import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_SOURCE = [
  '# Welcome to MonoC CPU Emulator!',
  '#',
  '# This is a simple addition program.',
  '# Use the control panel below to compile, and run the code',
  '#',
  '.global _start',
  '_start:',
  '    li a0, 10       # load 10 into a0 register',
  '    li a1, 25       # load 25 into a1 register',
  '    add t0, a0, a1  # t0 = a0 + a1',
].join('\n')

export const useEditorStore = create(
  persist(
    (set) => ({
      source: DEFAULT_SOURCE,
      setSource: (source) => set({ source }),
      resetSource: () => set({ source: DEFAULT_SOURCE }),
    }),
    {
      name: 'monoc_draft_code',
    }
  )
)
