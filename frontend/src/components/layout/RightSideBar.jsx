import './RightSideBar.css'
import ChatPanel from '../panels/chat/ChatPanel'
import { useUIStore } from '../../store/uiStore'

export default function RightSideBar({ style }) {
  const toggleChat = useUIStore(s => s.toggleChat)

  return (
    <aside className="right-sidebar" style={style}>
      <div className="right-sidebar__header">
        <span className="right-sidebar__title">AI Chat</span>
        <button
          id="chat-hide-btn"
          className="ui-button ui-button--ghost right-sidebar__hide-btn"
          onClick={toggleChat}
          title="Hide chat panel"
          aria-label="Hide chat panel"
        >
          Close
        </button>
      </div>

      <div className="right-sidebar__content">
        <ChatPanel />
      </div>
    </aside>
  )
}
