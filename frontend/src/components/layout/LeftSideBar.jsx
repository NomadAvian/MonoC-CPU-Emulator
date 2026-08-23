import { useState } from 'react'
import './LeftSideBar.css'
import RegisterGrid from '../panels/registers/RegisterGrid'
import { useUIStore } from '../../store/uiStore'

const TABS = ['Reg']

export default function LeftSideBar() {
  // ── Local State ──
  const [activeTab, setActiveTab] = useState('Reg')

  const isLeftOpen = useUIStore(s => s.isLeftOpen)
  const toggleLeft = useUIStore(s => s.toggleLeft)

  // ── Handlers ──
  const handleTabClick = (tab) => {
    setActiveTab(tab)
  }

  if (!isLeftOpen) {
    return (
      <div className="left-sidebar-container collapsed">
        <div className="left-sidebar__collapsed-header">
          <button
            className="icon-btn"
            onClick={toggleLeft}
            title="Expand Sidebar"
          >
            <span
              className="icon-collapse icon-collapse--right"
              role="img"
              aria-label="Expand"
            />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="left-sidebar-container">
      <div className="panel-content-wrapper">
        {/* Tab bar */}
        <div className="tab-bar tab-bar--sidebar">
          <div className="tab-bar__tabs">
            {TABS.map(tab => (
              <button
                key={tab}
                id={`left-tab-${tab.toLowerCase()}`}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => handleTabClick(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            className="icon-btn tab-bar__collapse-btn"
            onClick={toggleLeft}
            title="Collapse Sidebar"
          >
            <span
              className="icon-collapse"
              role="img"
              aria-label="Collapse"
            />
          </button>
        </div>

        {/* Tab content */}
        <div className="left-sidebar__content">
          {activeTab === 'Reg' && <RegisterGrid />}
        </div>
      </div>
    </div>
  )
}
