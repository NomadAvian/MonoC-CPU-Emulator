import { useEffect, useRef, useState } from 'react'
import { useConsoleStore } from '../../../store/consoleStore'
import './ConsolePanel.css'

export default function ConsolePanel() {
  const lines = useConsoleStore(s => s.lines)
  const clear = useConsoleStore(s => s.clear)
  const write = useConsoleStore(s => s.write)
  const poll = useConsoleStore(s => s.poll)
  const openConsole = useConsoleStore(s => s.openConsole)
  const closeConsole = useConsoleStore(s => s.closeConsole)
  const bottomRef = useRef(null)
  const [input, setInput] = useState('')

  // opening/closing the tab gates polling in the console store
  useEffect(() => {
    openConsole()
    poll(true)
    return () => closeConsole()
  }, [openConsole, closeConsole, poll])

  // auto-scroll to bottom on new entries
  useEffect(() => {
    bottomRef.current?.scrollIntoView()
  }, [lines])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input) return
    write(input + '\n')
    setInput('')
  }

  return (
    <div className="console-panel" id="console-panel">
      <button className="ui-button ui-button--ghost console-panel__clear" onClick={clear}>
        Clear
      </button>
      <div className="console-panel__output">
        {lines.map((line, i) =>
            line.kind === 'sys' ? (
              <div key={i} className="console-panel__line console-panel__line--sys">
                [SYSTEM] {line.text}
              </div>
            ) : line.kind === 'in' ? (
              <div key={i} className="console-panel__line console-panel__line--in">
                <span className="console-panel__prompt">&gt;</span>
                <span className="console-panel__in">{line.text}</span>
              </div>
            ) : (
              <pre key={i} className="console-panel__line console-panel__line--out">
                {line.text}
              </pre>
            )
          )
        }
        <form className="console-panel__line console-panel__line--in" onSubmit={handleSubmit}>
          <span className="console-panel__prompt">&gt;</span>
          <input
            className="console-panel__input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder=""
            spellCheck={false}
            autoComplete="off"
            autoFocus
          />
        </form>
        <div ref={bottomRef} />
      </div>
    </div>
  )
}