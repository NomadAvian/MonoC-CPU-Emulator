import './RightSideBar.css'
import { motion } from 'motion/react'
import ChatPanel from '../panels/chat/ChatPanel'
import DocsPanel from '../panels/docs/DocsPanel'
import { useUIStore } from '../../store/uiStore'
import collapseIcon from '../../assets/collapse.svg'

export default function RightSideBar({ style }) {
  const isChatOpen = useUIStore(s => s.isChatOpen)
  const isDocsOpen = useUIStore(s => s.isDocsOpen)
  const toggleChat = useUIStore(s => s.toggleChat)
  const toggleDocs = useUIStore(s => s.toggleDocs)

  const handleClose = () => {
    if (isChatOpen) toggleChat()
    if (isDocsOpen) toggleDocs()
  }

  return (
    <motion.aside
      className="panel right-sidebar"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: style.width, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ width: style.width }}
    >
      <div className="panel-content-wrapper" style={{ width: style.width }}>
        <div className="tab-bar tab-bar--sidebar">
          <button
            className="icon-btn tab-bar__collapse-btn--left"
            onClick={handleClose}
            title="Collapse Sidebar"
          >
            <span
              className="icon-collapse icon-collapse--right"
              role="img"
              aria-label="Collapse"
            />
          </button>
          <div className="tab-bar__title">
            {isChatOpen ? 'MonoC AI' : 'Documentation'}
          </div>
        </div>
        <div className="right-sidebar__content">
          {isChatOpen && <ChatPanel />}
          {isDocsOpen && <DocsPanel />}
        </div>
      </div>
    </motion.aside>
  )
}
