import './RightSideBar.css'
import { motion } from 'motion/react'
import ChatPanel from '../panels/chat/ChatPanel'
import { useUIStore } from '../../store/uiStore'
import closeIcon from '../../assets/close.svg'

export default function RightSideBar({ style }) {
  const toggleChat = useUIStore(s => s.toggleChat)

  return (
    <motion.aside
      className="panel right-sidebar"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: style.width, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={style}
    >
      <div className="panel-content-wrapper" style={{ width: style.width }}>
        <div className="right-sidebar__header">
          <span className="right-sidebar__title">MonoC AI</span>
          <button
            id="chat-hide-btn"
            className="icon-btn right-sidebar__hide-btn"
            onClick={toggleChat}
            title="Hide chat panel"
            aria-label="Hide chat panel"
          >
            <img src={closeIcon} alt="Close" />
          </button>
        </div>
        <div className="right-sidebar__content">
          <ChatPanel />
        </div>
      </div>
    </motion.aside>
  )
}
