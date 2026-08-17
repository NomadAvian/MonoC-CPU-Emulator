import { create } from 'zustand'

const initialState = {
  source: [
    '# Welcome to MonoC CPU Emulator!',
    '#',
    '# This is a simple infinite counting loop.',
    '# Use the speed control to watch it execute at different rates!',
    '',
    '.global _start',
    '_start:',
    'addi x1, x0, 0     # Initialize counter (x1) to 0',
    'addi x2, x0, 1     # Step value (x2) = 1',
    '',
    'loop:',
    'add x1, x1, x2     # Increment counter by 1',
    'jal x0, loop       # Jump back to the start of the loop',
  ].join('\n'),
}

export const useEditorStore = create((set) => ({
  ...initialState,
  setSource: (source) => set({ source }),
}))
