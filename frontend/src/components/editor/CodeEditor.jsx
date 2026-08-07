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
      doc: 'sample text\nPlease work',
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
        EditorView.theme({
          '&': { fontSize: '14px' },
          '.cm-content': { padding: '8px 0' },
          '.cm-gutters': { backgroundColor: 'var(--bg-base)', border: 'none' },
          '.cm-activeLine': { backgroundColor: 'var(--active-line)' },
          '.cm-selectionBackground': { backgroundColor: 'var(--selection)' },
          '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground': {
            backgroundColor: 'var(--selection)',
          },
          '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#7DCFFF' },
        })
      ],
    })
    return () => view.destroy()
  }, [])

  return <div className="code-editor" id="code-editor-root" ref={containerRef} />
}
