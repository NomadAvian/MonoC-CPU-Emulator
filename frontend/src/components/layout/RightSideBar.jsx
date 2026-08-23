import './RightSideBar.css'
import { motion } from 'motion/react'
import ChatPanel from '../panels/chat/ChatPanel'
import DocsPanel from '../panels/docs/DocsPanel'
import LibraryPanel from '../panels/library/LibraryPanel'
import { useUIStore } from '../../store/uiStore'

const TABS = [
  { id: 'docs', label: 'Docs' },
  { id: 'ai', label: 'MonoC AI' },
  { id: 'examples', label: 'Examples' },
]

export default function RightSideBar({ style }) {
  const activeRightTab = useUIStore(s => s.activeRightTab)
  const openRightTab = useUIStore(s => s.openRightTab)
  const closeRightPanel = useUIStore(s => s.closeRightPanel)

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
            onClick={closeRightPanel}
            title="Collapse Sidebar"
          >
            <span
              className="icon-collapse icon-collapse--right"
              role="img"
              aria-label="Collapse"
            />
          </button>
          <div className="tab-bar__tabs" role="tablist">
            {TABS.map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeRightTab === tab.id}
                className={`tab-btn ${activeRightTab === tab.id ? 'active' : ''}`}
                onClick={() => openRightTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="right-sidebar__content">
          {activeRightTab === 'docs' && <DocsPanel />}
          {activeRightTab === 'ai' && <ChatPanel />}
          {activeRightTab === 'examples' && <LibraryPanel />}
        </div>
      </div>
    </motion.aside>
  )
}
