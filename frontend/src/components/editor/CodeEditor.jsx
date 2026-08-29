import { useEffect, useRef } from 'react'
import { basicSetup } from 'codemirror'
import { EditorView, keymap } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentMore, indentLess } from '@codemirror/commands'
import { EditorState, Compartment } from '@codemirror/state'
import { indentUnit } from '@codemirror/language'

import { riscv } from './riscvLang'
import { useEditorStore } from '../../store/editorStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useUIStore } from '../../store/uiStore'
import './CodeEditor.css'


// Tab inserts the configured indent unit at the cursor (indentWithTab/indentMore
// instead shift every selected line right, which reads as moving the whole line).
const indentAtCursor = {
  key: 'Tab',
  run: ({ state, dispatch }) => {
    if (state.readOnly) return false
    // Any non-empty selection indents the affected lines rather than replacing
    // the selected text with spaces.
    if (state.selection.ranges.some(r => !r.empty)) return indentMore({ state, dispatch })
    dispatch(state.update(state.replaceSelection(state.facet(indentUnit)), { scrollIntoView: true, userEvent: 'input' }))
    return true
  },
  shift: ({ state, dispatch }) => indentLess({ state, dispatch }),
}

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
  const compileErrorLine = useUIStore(s => s.compileErrorLine)

  // ── INIT: create the CodeMirror editor instance ──
  useEffect(() => {
    const view = new EditorView({
      doc: useEditorStore.getState().source,
      parent: containerRef.current,
      extensions: [
        basicSetup,
        riscv,
        history(),
        errorLineField,
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
          indentAtCursor,
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

  // ── COMPILE ERROR: underline + jump to the failing source line ──
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const lineNo = compileErrorLine
    if (lineNo == null || lineNo < 0 || lineNo >= view.state.doc.lines) {
      view.dispatch({ effects: setErrorLine.of(Decoration.none) })
      return
    }
    const line = view.state.doc.line(lineNo + 1)
    const deco = Decoration.line({ class: 'cm-error-line' }).range(line.from)
    view.dispatch({ effects: setErrorLine.of(Decoration.set([deco])) })
    view.dispatch({ effects: EditorView.scrollIntoView(line.from), selection: { anchor: line.from } })
  }, [compileErrorLine])

  return (
    <div
      className="code-editor"
      id="code-editor-root"
      ref={containerRef}
      style={{ '--font-mono': `'${fontStyle}', monospace`, '--editor-font-size': `${editorFontSize}px` }}
    />
  )
}
