import { useEffect, useRef } from 'react'
import { basicSetup } from 'codemirror'
import { EditorView, keymap } from '@codemirror/view'
import { indentWithTab, defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { riscv } from './riscvLang'
import './CodeEditor.css'

export default function CodeEditor() {
  const containerRef = useRef(null)

  useEffect(() => {
    const view = new EditorView({
      doc: [
        '# Example program',
        '# Sum of two numbers',
        '',
        'addi x1, x0, 5   # x1 = 5',
        'addi x2, x0, 3   # x2 = 3',
        'add  x3, x1, x2  # x3 = x1 + x2 = 8',
      ].join('\n'),
      parent: containerRef.current,
      extensions: [
        basicSetup,
        riscv,
        history(),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          indentWithTab,
        ]),
      ],
    })
    return () => view.destroy()
  }, [])

  return <div className="code-editor" id="code-editor-root" ref={containerRef} />
}
