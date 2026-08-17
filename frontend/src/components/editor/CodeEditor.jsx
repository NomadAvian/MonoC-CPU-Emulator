import { useEffect, useRef } from 'react'
import { basicSetup } from 'codemirror'
import { EditorView, keymap, Decoration } from '@codemirror/view'
import { indentWithTab, defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { StateEffect, StateField, EditorState, Compartment } from '@codemirror/state'
import { indentUnit } from '@codemirror/language'

import { riscv } from './riscvLang'
import { useEditorStore } from '../../store/editorStore'
import { useCPUStore } from '../../store/cpuStore'
import { useUIStore } from '../../store/uiStore'
import './CodeEditor.css'


// ─── Helper functions for highlighting ──────────────────────

// StateEffect to set the highlighted line number
// 1 indexed, -1 to clear the highlights
const setHighlightLine = StateEffect.define()

// line decoration mark
const executingLineDeco = Decoration.line({ class: 'cm-executing-line' })

// memory of highlights/decorations
const highlightLineField = StateField.define({
  create() {
    return Decoration.none
  },
  // -1 : resets the decorations
  update(decos, tr) {
    for (const e of tr.effects) {
      if (e.is(setHighlightLine)) {
        if (e.value < 1) return Decoration.none
        try {
          const line = tr.state.doc.line(e.value)
          return Decoration.set([executingLineDeco.range(line.from)])
        } catch {
          return Decoration.none
        }
      }
    }
    return decos
  },
  provide: f => EditorView.decorations.from(f),
})

// builds a mapping from instruction index (0 based) to editor line number (1 based)
function buildInstructionLineMap(source) {
  const lines = source.split('\n')
  const editorMap = []
  // skips: empty lines, # comments, label:, .directives
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (trimmed === '') continue
    if (trimmed.startsWith('#')) continue
    if (/^[a-zA-Z_]\w*:\s*$/.test(trimmed)) continue
    if (trimmed.startsWith('.')) continue
    editorMap.push(i + 1)
  }
  return editorMap
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
  const fontStyle = useUIStore(s => s.fontStyle)
  const tabSize   = useUIStore(s => s.tabSize)

  // ── INIT: create the CodeMirror editor instance ──
  useEffect(() => {
    const view = new EditorView({
      doc: useEditorStore.getState().source,
      parent: containerRef.current,
      extensions: [
        basicSetup,
        riscv,
        history(),
        highlightLineField,
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

  // ── HIGHLIGHT: subscribe to CPU store changes & highlight current line ──
  useEffect(() => {
    let prevPc = -1
    let prevStatus = ''
    let cachedSource = ''
    let cachedMap = []

    const unsub = useCPUStore.subscribe((state) => {
      const { programCounter: pc, status, halted } = state
      const view = viewRef.current
      if (!view) return

      // clear highlight when stopped or editing
      if (status === 'stopped') {
        if (prevStatus !== 'stopped') {
          view.dispatch({ effects: setHighlightLine.of(-1) })
          prevStatus = status
        }
        return
      }

      // clear highlight if program ended
      if (halted) {
        view.dispatch({ effects: setHighlightLine.of(-1) })
        prevPc = pc
        prevStatus = status
        return
      }

      // only update when PC actually changes
      if (pc === prevPc && status === prevStatus) return
      prevPc = pc
      prevStatus = status

      // builds instruction to line map from current source
      const source = useEditorStore.getState().source
      if (source !== cachedSource) {
        cachedSource = source
        cachedMap = buildInstructionLineMap(source)
      }
      const instrIndex = Math.floor(pc / 4)

      if (instrIndex >= 0 && instrIndex < cachedMap.length) {
        const lineNumber = cachedMap[instrIndex]
        try {
          const line = view.state.doc.line(lineNumber)
          view.dispatch({
            effects: [
              setHighlightLine.of(lineNumber),
              EditorView.scrollIntoView(line.from, { y: 'center' }),
            ],
          })
        } catch {
          view.dispatch({ effects: setHighlightLine.of(lineNumber) })
        }
      } else {
        view.dispatch({ effects: setHighlightLine.of(-1) })
      }
    })
    return unsub
  }, [])

  return (
    <div
      className="code-editor"
      id="code-editor-root"
      ref={containerRef}
      style={{ '--font-mono': `'${fontStyle}', monospace` }}
    />
  )
}
