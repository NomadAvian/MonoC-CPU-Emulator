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
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setCode(update.state.doc.toString())
          }
        }),
      ],
    })
    viewRef.current = view
    return () => view.destroy()
  }, [setSource])

  // sync external store changes to CodeMirror
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