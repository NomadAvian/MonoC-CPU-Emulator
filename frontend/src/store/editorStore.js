import { create } from 'zustand'

const INITIAL_CODE = [
  '# Example program',
  '# Sum of two numbers',
  '',
  'addi x1, x0, 5   # x1 = 5',
  'addi x2, x0, 3   # x2 = 3',
  'add  x3, x1, x2  # x3 = x1 + x2 = 8',
].join('\n')

export const useEditorStore = create((set) => ({
  code: INITIAL_CODE,
  setCode: (newCode) => set({ code: newCode }),
}))
