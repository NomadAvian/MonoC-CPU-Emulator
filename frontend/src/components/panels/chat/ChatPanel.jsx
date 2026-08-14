import { useState, useRef, useEffect } from 'react'
import { SimpleMarkdown } from './SimpleMarkdown'
import { useChatStore } from '../../../store/chatStore'
import './ChatPanel.css'
import sendIcon from '../../../assets/send-horizontal.svg'


export default function ChatPanel() {

  const messages = useChatStore(s => s.messages);
  const isLoading = useChatStore(s => s.isLoading);
  const sendMessage = useChatStore(s => s.sendMessage);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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

        <div ref={messagesEndRef} />

      </div>

      {/* Input area */}
      <div className="chat-panel__input-wrap">
        <textarea
          id="chat-input"
          className="ui-input chat-panel__input"
          placeholder="ask anything…"
          rows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          id="chat-send-btn"
          className="icon-btn chat-panel__send-btn"
          style={{ width: 24, height: 24, background: 'var(--accent)', color: '#fff', borderRadius: 4 }}
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? (
            <span style={{ fontSize: 10 }}>...</span>
          ) : (
            <img src={sendIcon} alt="Send" style={{ width: 14, height: 14, filter: 'brightness(0) invert(1)' }} />
          )}
        </button>
      </div>
    </div>
  )
}
