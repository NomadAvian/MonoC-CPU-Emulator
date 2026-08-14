import { useEffect, useRef } from 'react'
import { useLogStore } from '../../../store/logStore'
import './LogPanel.css'

export default function LogPanel() {
  const entries = useLogStore(s => s.entries)
  const clearLog = useLogStore(s => s.clear)
  const bottomRef = useRef(null)

  // auto-scroll to bottom on new entries
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  return (
    <div className="log-panel" id="log-panel">
      <div className="log-panel__header">
        <span>Messages</span>
        <button className="ui-button ui-button--ghost log-panel__clear" onClick={clearLog}>
          Clear
        </button>
      </div>
      {entries.length === 0 ? (
        <div className="log-panel__empty">No messages</div>
      ) : (
        <div className="log-panel__entries">
          {entries.map((msg, i) => (
            <div key={i} className="log-panel__entry">
              <span className="log-panel__msg">{msg}</span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}
