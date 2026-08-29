import './BottomPanel.css'
import { useUIStore } from '../../store/uiStore'
import Disassembler from '../panels/bottom/Disassembler'
import ConsolePanel from '../panels/bottom/ConsolePanel'

const TABS = ['Console', 'Disassembler']

export default function BottomPanel({ style }) {
  // ── Store State ──
  const activeTab    = useUIStore(s => s.bottomActiveTab)
  const isCollapsed  = useUIStore(s => s.isBottomCollapsed)
  const setActiveTab = useUIStore(s => s.setBottomActiveTab)
  const toggleBottom = useUIStore(s => s.toggleBottom)

  // ── Handlers ──
  const handleTabClick = (tab) => {
    setActiveTab(tab)
    if (isCollapsed) {
      toggleBottom()
    }
  }

  const handleCollapseClick = () => {
    toggleBottom()
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
          {activeTab === 'Disassembler' && <Disassembler />}
        </div>
      )}
    </div>
  )
}
