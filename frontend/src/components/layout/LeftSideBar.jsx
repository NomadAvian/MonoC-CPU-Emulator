import { useState } from 'react'
import './LeftSideBar.css'
import RegisterGrid from '../panels/registers/RegisterGrid'
import MemoryBar from '../panels/memory/MemoryBar'
import { useUIStore } from '../../store/uiStore'
import collapseIcon from '../../assets/collapse.svg'

const TABS = ['Reg', 'Mem']

export default function LeftSideBar({ style }) {
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
      <div className="left-sidebar-container collapsed" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', borderRight: '1px solid var(--border)' }}>
        <div style={{ height: '34px', display: 'flex', alignItems: 'center' }}>
          <button
            className="icon-btn"
            onClick={toggleLeft}
            title="Expand Sidebar"
          >
            <span
              style={{
                display: 'inline-block',
                width: '18px',
                height: '18px',
                WebkitMask: `url("${collapseIcon}") no-repeat center / contain`,
                mask: `url("${collapseIcon}") no-repeat center / contain`,
                backgroundColor: 'currentColor',
                transform: 'scaleX(-1)'
              }}
              role="img"
              aria-label="Expand"
            />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="left-sidebar-container" style={{ width: '100%', display: 'flex', flexShrink: 0, height: '100%' }}>
      <div className="panel-content-wrapper" style={{ width: '100%' }}>
        {/* Tab bar */}
        <div className="tab-bar" style={{ display: 'flex', paddingLeft: '8px', paddingRight: '4px' }}>
          <div style={{ display: 'flex', flex: 1, gap: '4px' }}>
            {TABS.map(tab => (
              <button
                key={tab}
                id={`left-tab-${tab.toLowerCase()}`}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                style={{ flex: 1 }}
                onClick={() => handleTabClick(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            className="icon-btn"
            style={{ margin: 'auto 0 auto 8px' }}
            onClick={toggleLeft}
            title="Collapse Sidebar"
          >
            <span
              style={{
                display: 'inline-block',
                width: '18px',
                height: '18px',
                WebkitMask: `url("${collapseIcon}") no-repeat center / contain`,
                mask: `url("${collapseIcon}") no-repeat center / contain`,
                backgroundColor: 'currentColor'
              }}
              role="img"
              aria-label="Collapse"
            />
          </button>
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
