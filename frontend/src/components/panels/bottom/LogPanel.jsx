import { useState } from 'react'
import './LogPanel.css'

export default function LogPanel({ entries = [] }) {
  const [cleared, setCleared] = useState(false)
  const visibleEntries = cleared ? [] : entries

  return (
    <div className="log-panel" id="log-panel">
      <div className="log-panel__header">
        <span>Messages</span>
        <button className="ui-button ui-button--ghost log-panel__clear" onClick={() => setCleared(true)}>
          Clear
        </button>
      </div>
      {visibleEntries.length === 0 ? (
        <div className="log-panel__empty">No messages</div>
      ) : (
        visibleEntries.map((entry, i) => (
          <div key={i} className={`log-panel__entry log-panel__entry--${entry.level}`}>
            <span className="log-panel__ts">{entry.timestamp}</span>
            <span className="log-panel__level">[{entry.level.toUpperCase()}]</span>
            <span className="log-panel__msg">{entry.message}</span>
          </div>
        ))
      )}
    </div>
  )
}
