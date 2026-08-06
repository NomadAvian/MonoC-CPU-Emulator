import { useState, useRef, useEffect } from 'react'
import { useChatStore } from '../../../store/chatStore'
import './ChatPanel.css'


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
            <p>Ask about your assembly code.</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`chat-message chat-message--${msg.role}`}>
              <p>{msg.content}</p>
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
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          id="chat-send-btn"
          className="ui-button ui-button--accent chat-panel__send-btn"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? 'Thinking…' : 'Send'}
        </button>
      </div>
    </div>
  )
}
