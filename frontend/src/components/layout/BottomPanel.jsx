import { useState } from 'react'
import './BottomPanel.css'
import OutputTabs from '../panels/bottom/OutputTabs'
import LogPanel from '../panels/bottom/LogPanel'
import collapseIcon from '../../assets/collapse.svg'

const TABS = ['Log', 'Disassembler']

export default function BottomPanel({ style }) {
  // ── Local State ──
  const [activeTab, setActiveTab] = useState('Log')
  const [isCollapsed, setIsCollapsed] = useState(false)

  // ── Handlers ──
  const handleTabClick = (tab) => {
    setActiveTab(tab)
    if (isCollapsed) {
      setIsCollapsed(false)
    }
  }

  const handleCollapseClick = () => {
    setIsCollapsed(!isCollapsed)
  }

  const panelStyle = isCollapsed 
    ? { ...style, height: '36px', minHeight: '36px' } 
    : style

  return (
    <div className="bottom-panel" style={panelStyle}>
      <div className="tab-bar bottom-panel__tabs">
        <div className="bottom-panel__tab-buttons">
          {TABS.map(tab => (
            <button
              key={tab}
              id={`bottom-tab-${tab.toLowerCase()}`}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          className="bottom-panel__collapse-btn"
          title={isCollapsed ? "Expand Panel" : "Collapse Panel"}
          onClick={handleCollapseClick}
        >
          <img 
            src={collapseIcon} 
            alt="Toggle Collapse" 
            style={{ 
              transform: isCollapsed ? 'rotate(90deg)' : 'rotate(270deg)', 
              transition: 'transform 0.2s' 
            }}
          />
        </button>
      </div>

      {!isCollapsed && (
        <div className="bottom-panel__content">
          {activeTab === 'Log' && <LogPanel />}
          {activeTab === 'Disassembler' && <OutputTabs />}
        </div>
      )}
    </div>
  )
}
