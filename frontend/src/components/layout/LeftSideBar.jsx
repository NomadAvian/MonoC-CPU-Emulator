import { useState } from 'react'
import './LeftSideBar.css'
import RegisterGrid from '../panels/cpu/RegisterGrid'
import MemoryBar from '../panels/memory/MemoryBar'

const TABS = ['Reg', 'Mem']

export default function LeftSideBar({ style }) {
  // ── Local State ──
  const [activeTab, setActiveTab] = useState('Reg')

  // ── Handlers ──
  const handleTabClick = (tab) => {
    setActiveTab(tab)
  }

  return (
    <aside className="left-sidebar" style={style}>
      {/* Tab bar */}
      <div className="tab-bar left-sidebar__tabs">
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
    </aside>
  )
}
