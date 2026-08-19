import { useState } from 'react'
import './LeftSideBar.css'
import RegisterGrid from '../panels/registers/RegisterGrid'
import MemoryBar from '../panels/memory/MemoryBar'
import { motion } from 'motion/react'

const TABS = ['Reg', 'Mem']

export default function LeftSideBar({ style }) {
  // ── Local State ──
  const [activeTab, setActiveTab] = useState('Reg')

  // ── Handlers ──
  const handleTabClick = (tab) => {
    setActiveTab(tab)
  }

  return (
    <div className="left-sidebar-container" style={{ width: style.width, display: 'flex', flexShrink: 0, height: '100%' }}>
      <div className="panel-content-wrapper" style={{ width: style.width }}>
        {/* Tab bar */}
        <div className="tab-bar">
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

        {/* Tab content */}
        <div className="left-sidebar__content">
          {activeTab === 'Reg' && <RegisterGrid />}
          {activeTab === 'Mem' && <MemoryBar />}
        </div>
      </div>
    </div>
  )
}
