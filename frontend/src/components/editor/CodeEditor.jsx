import { useEffect, useRef } from 'react'
import { basicSetup } from 'codemirror'
import { EditorView, keymap } from '@codemirror/view'
import { indentWithTab, defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { riscv } from './riscvLang'
import { useEditorStore } from '../../store/editorStore'
import './CodeEditor.css'

export default function CodeEditor() {
  const containerRef = useRef(null)
  const setSource = useEditorStore(s => s.setSource)

  useEffect(() => {
    const view = new EditorView({
      doc: useEditorStore.getState().source,
      parent: containerRef.current,
      extensions: [
        basicSetup,
        riscv,
        history(),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) setSource(u.state.doc.toString())
        }),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          indentWithTab,
        ]),
      ],
    })
    return () => view.destroy()
  }, [setSource])

  return <div className="code-editor" id="code-editor-root" ref={containerRef} />
}