import { useEffect, useRef } from 'react'
import { basicSetup } from 'codemirror'
import { EditorView, keymap } from '@codemirror/view'
import { indentWithTab, defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { EditorState, Compartment } from '@codemirror/state'
import { indentUnit } from '@codemirror/language'

import { riscv } from './riscvLang'
import { useEditorStore } from '../../store/editorStore'
import { useSettingsStore } from '../../store/settingsStore'
import './CodeEditor.css'


// ─── Component ──────────────────────────────────────────────

export default function CodeEditor() {

  // ── Refs ──
  const containerRef       = useRef(null)
  const viewRef            = useRef(null)
  const tabSizeCompartment = useRef(new Compartment())
  const externalUpdate     = useRef(false)

  // ── Store selectors ──
  const setSource = useEditorStore(s => s.setSource)
  const fontStyle = useSettingsStore(s => s.fontStyle)
  const editorFontSize = useSettingsStore(s => s.editorFontSize)
  const tabSize   = useSettingsStore(s => s.tabSize)

  // ── INIT: create the CodeMirror editor instance ──
  useEffect(() => {
    const view = new EditorView({
      doc: useEditorStore.getState().source,
      parent: containerRef.current,
      extensions: [
        basicSetup,
        riscv,
        history(),
        EditorView.lineWrapping,
        tabSizeCompartment.current.of([
          EditorState.tabSize.of(tabSize),
          indentUnit.of(' '.repeat(tabSize)),
        ]),
        EditorView.updateListener.of((u) => {
          if (u.docChanged && !externalUpdate.current) setSource(u.state.doc.toString())
        }),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          indentWithTab,
        ]),
      ],
    })
    viewRef.current = view
    return () => {
      viewRef.current = null
      view.destroy()
    }
  }, [setSource])

  // ── LOADFILE: sync external source changes into codemirror ──
  useEffect(() => {
    const unsub = useEditorStore.subscribe((state, prev) => {
      const view = viewRef.current
      if (!view || state.source === prev.source) return
      const currentDoc = view.state.doc.toString()
      if (state.source === currentDoc) return
      externalUpdate.current = true
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: state.source },
      })
      externalUpdate.current = false
    })
    return unsub
  }, [])

  // ── TABSIZE: update tab size dynamically ──
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: tabSizeCompartment.current.reconfigure([
          EditorState.tabSize.of(tabSize),
          indentUnit.of(' '.repeat(tabSize)),
        ])
      })
    }
  }, [tabSize])

  return (
    <div
      className="code-editor"
      id="code-editor-root"
      ref={containerRef}
      style={{ '--font-mono': `'${fontStyle}', monospace`, '--editor-font-size': `${editorFontSize}px` }}
    />
  )
}
