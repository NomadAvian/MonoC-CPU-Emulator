import './ChatPanel.css'

export default function ChatPanel() {
  return (
    <div className="chat-panel">
      <div className="chat-panel__messages" id="chat-messages">
        <div className="chat-panel__welcome">
          <p>Ask about your assembly code.</p>
        </div>
      </div>

      {/* Input area */}
      <div className="chat-panel__input-wrap">
        <textarea
          id="chat-input"
          className="ui-input chat-panel__input"
          placeholder="ask anything…"
          rows={2}
        />
        <button id="chat-send-btn" className="ui-button ui-button--accent chat-panel__send-btn">
          Send
        </button>
      </div>
    </div>
  )
}
