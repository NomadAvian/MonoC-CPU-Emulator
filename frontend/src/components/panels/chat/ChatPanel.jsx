import { useState, useRef, useEffect } from 'react'
import { SimpleMarkdown } from './SimpleMarkdown'
import { useChatStore } from '../../../store/chatStore'
import './ChatPanel.css'
import sendIcon from '../../../assets/send-horizontal.svg'


export default function ChatPanel() {
  // ── Refs ──
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // ── Local State ──
  const [input, setInput] = useState('')

  // ── Store Selectors ──
  const messages    = useChatStore(s => s.messages)
  const isLoading   = useChatStore(s => s.isLoading)
  const sendMessage = useChatStore(s => s.sendMessage)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }, [input])

  // ── Handlers ──
  const handleInputChange = (e) => {
    setInput(e.target.value)
  }

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    sendMessage(trimmed)
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-panel__messages" id="chat-messages">

        {messages.length === 0 ? (
          <div className="chat-panel__welcome">
            <p style={{ fontWeight: 400, fontSize: 14 }}>I can read and interact with the emulator. Try asking me questions about your code and I'll try to help! </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`chat-message chat-message--${msg.role}`}>
              <SimpleMarkdown content={msg.content} />
            </div>
          ))
        )}

        {isLoading && (
          <div className="chat-message chat-message--assistant chat-thinking">
            <span className="chat-thinking__dot" />
            <span className="chat-thinking__dot" />
            <span className="chat-thinking__dot" />
          </div>
        )}

        <div ref={messagesEndRef} />

      </div>

      {/* Input area */}
      <div className="chat-panel__input-wrap">
        <textarea
          ref={textareaRef}
          id="chat-input"
          className="ui-input chat-panel__input"
          placeholder="Ask anything…"
          rows={1}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <button
          id="chat-send-btn"
          className="icon-btn chat-panel__send-btn"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          <img
            src={sendIcon}
            alt="Send"
            className="chat-panel__send-icon"
          />
        </button>
      </div>
    </div>
  )
}
