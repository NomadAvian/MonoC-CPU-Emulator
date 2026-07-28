import { useState } from 'react'
import './BottomPanel.css'
import OutputTabs from '../panels/bottom/OutputTabs'
import LogPanel from '../panels/bottom/LogPanel'

const TABS = ['Log', 'Disassembler']

export default function BottomPanel({ style }) {
  const [activeTab, setActiveTab] = useState('Log')

  return (
    <div className="bottom-panel" style={style}>
      <div className="tab-bar bottom-panel__tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            id={`bottom-tab-${tab.toLowerCase()}`}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bottom-panel__content">
        {activeTab === 'Log' && <LogPanel />}
        {activeTab === 'Disassembler' && <OutputTabs />}
      </div>
    </div>
  )
}
