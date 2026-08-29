import { useState, useRef, useEffect } from 'react'
import { SimpleMarkdown } from './SimpleMarkdown'
import { useChatStore } from '../../../store/chatStore'
import { useUIStore } from '../../../store/uiStore'
import './ChatPanel.css'
import sendIcon from '../../../assets/send-horizontal.svg'

const MAX_TEXTAREA_HEIGHT = 140;

const THINKING_MESSAGES = [
  'Debating the ALU…',
  'Counting Bits…',
  'Reading registers, not minds…',
  'Fighting with transistors…',
  'Asking the assembler nicely…',
  'Fetching, decoding, judging…',
  'Checking redacted documents…',
  'Waking up the MCP server…',
]

export default function ChatPanel() {
  // ── Refs ──
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // ── Local State ──
  const [input, setInput] = useState('')
  const [thinkingIndex, setThinkingIndex] = useState(0)

  // ── Store Selectors ──
  const messages    = useChatStore(s => s.messages)
  const isLoading   = useChatStore(s => s.isLoading)
  const sendMessage = useChatStore(s => s.sendMessage)
  const addToast    = useUIStore(s => s.addToast)

  // rotate the thinking status
  useEffect(() => {
    if (!isLoading) return
    const id = setInterval(() => {
      setThinkingIndex(i => (i + 1) % THINKING_MESSAGES.length)
    }, 3000)
    return () => clearInterval(id)
  }, [isLoading])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`
  }, [input])

  useEffect(() => {
    const handleCopyClick = (e) => {
      const btn = e.target.closest('.chat-codeblock__copy-btn')
      if (!btn) return
      const code = btn.getAttribute('data-code')
      if (!code) return
      if (!navigator.clipboard) {
        addToast('Copy not available over insecure connection', 'error')
        return
      }
      navigator.clipboard.writeText(code)
        .then(() => addToast('Copied', 'success', 1500))
        .catch(() => addToast('Copy failed', 'error'))
    }
    document.addEventListener('click', handleCopyClick)
    return () => document.removeEventListener('click', handleCopyClick)
  }, [addToast])

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
            <h3 className="chat-panel__welcome-title">Welcome to MonoC!</h3>
            <p className="chat-panel__welcome-text">
              I'm your local AI assistant. I can write MonoC assembly, debug your code, or explain how this emulator works.
            </p>
            <div className="chat-panel__suggestions">
              <button
                className="chat-suggestion-chip"
                onClick={() => sendMessage("Explain the UI layout")}
                disabled={isLoading}
              >
                Explain the UI layout
              </button>

              <button
                className="chat-suggestion-chip"
                onClick={() => sendMessage("Write a hello world program")}
                disabled={isLoading}
              >
                Write a hello world program
              </button>

              <button
                className="chat-suggestion-chip"
                onClick={() => sendMessage("What does line 10 do?")}
                disabled={isLoading}
              >
                What does line 10 do?
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`chat-message chat-message--${msg.role}`}>
              {msg.toolsUsed?.length > 0 && (
                <span className="chat-message__tool-badge">
                  [{msg.toolsUsed.length > 1 ? 'Tools Used' : 'Tool Used'}: {msg.toolsUsed.join(', ')}]
                </span>
              )}
              <SimpleMarkdown content={msg.content} />
            </div>
          ))
        )}

        {isLoading && (
          <div className="chat-message chat-message--assistant chat-thinking">
            <span className="chat-thinking__dot" />
            <span className="chat-thinking__dot" />
            <span className="chat-thinking__dot" />
            <span className="chat-thinking__text">{THINKING_MESSAGES[thinkingIndex]}</span>
          </div>
        )}

        <div ref={messagesEndRef} />

      </div>

      {useChatStore(s => s.contextualSuggestion) && (
        <div className="chat-panel__context-suggestion">
          <button
            className="chat-suggestion-chip"
            onClick={() => {
              sendMessage(useChatStore.getState().contextualSuggestion);
              useChatStore.getState().setContextualSuggestion(null);
            }}
            disabled={isLoading}
          >
            Ask AI about this compilation error
          </button>
        </div>
      )}

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
          disabled={isLoading}
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
