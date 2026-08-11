import { useEffect, useRef } from 'react'
import { basicSetup } from 'codemirror'
import { EditorView, keymap } from '@codemirror/view'
import { indentWithTab, defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { riscv } from './riscvLang'
import { useEditorStore } from '../../store/editorStore'
import './CodeEditor.css'

export default function CodeEditor() {
  const containerRef = useRef(null)
  const viewRef = useRef(null)
  const code = useEditorStore(s => s.code)
  const setCode = useEditorStore(s => s.setCode)

  useEffect(() => {
    const view = new EditorView({
      doc: code,
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
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setCode(update.state.doc.toString())
          }
        }),
      ],
    })
    viewRef.current = view
    return () => view.destroy()
  }, [])

  // Sync external store changes (e.g. from Profile load) to CodeMirror
  useEffect(() => {
    if (viewRef.current) {
      const currentDoc = viewRef.current.state.doc.toString()
      if (currentDoc !== code) {
        viewRef.current.dispatch({
          changes: { from: 0, to: currentDoc.length, insert: code },
        })
      }
    }
  }, [code])

  return <div className="code-editor" id="code-editor-root" ref={containerRef} />
}
