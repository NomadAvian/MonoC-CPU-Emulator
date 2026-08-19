import { useState } from 'react'
import './LeftSideBar.css'
import RegisterGrid from '../panels/cpu/RegisterGrid'
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
    <motion.aside
      className="left-sidebar"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: style.width, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ ...style, alignItems: 'flex-end' }}
    >
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
    </motion.aside>
  )
}
