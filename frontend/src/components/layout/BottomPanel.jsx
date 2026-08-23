import { useState } from 'react'
import './BottomPanel.css'
import OutputTabs from '../panels/bottom/OutputTabs'
import ConsolePanel from '../panels/bottom/ConsolePanel'

const TABS = ['Console', 'Disassembler']

export default function BottomPanel({ style }) {
  // ── Local State ──
  const [activeTab, setActiveTab] = useState('Console')
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
      <div className="tab-bar">
        <div className="tab-bar__tabs">
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
          className="icon-btn tab-bar__collapse-btn"
          title={isCollapsed ? "Expand Panel" : "Collapse Panel"}
          onClick={handleCollapseClick}
        >
          <span 
            className={`icon-collapse ${isCollapsed ? 'icon-collapse--up' : 'icon-collapse--down'}`}
            role="img"
            aria-label="Toggle Collapse"
          />
        </button>
      </div>

      {!isCollapsed && (
        <div className="bottom-panel__content">
          {activeTab === 'Console' && <ConsolePanel />}
          {activeTab === 'Disassembler' && <OutputTabs />}
        </div>
      )}
    </div>
  )
}
