import { useState } from 'react'
import './TopBar.css'
import SettingsModal from '../settings/SettingsModal'
import { useUIStore } from '../../store/uiStore'

import aiIcon from '../../assets/ai.svg'
import docsIcon from '../../assets/docs.svg'
import settingsIcon from '../../assets/settings.svg'
import profileIcon from '../../assets/profile.svg'

export default function TopBar() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const isChatOpen = useUIStore(s => s.isChatOpen)
  const toggleChat = useUIStore(s => s.toggleChat)

  return (
    <>
      <header className="topbar">
        {/* Left: Logo */}
        <div className="topbar__logo">
          <span className="topbar__logo-text">MonoC</span>
        </div>

        {/* Right: Nav actions */}
        <nav className="topbar__nav">
          <button
            className={`ui-button ui-button--ghost topbar__nav-btn ${isChatOpen ? 'topbar__nav-btn--active' : ''}`}
            id="topbar-chat-btn"
            aria-pressed={isChatOpen}
            onClick={toggleChat}
            style={{ color: 'var(--accent)' }}
          >
            <img src={aiIcon} alt="" className="topbar__icon" />
            AI Chat
          </button>
          <button
            className="ui-button ui-button--ghost topbar__nav-btn"
            id="topbar-settings-btn"
            onClick={() => setSettingsOpen(true)}
          >
            <img src={settingsIcon} alt="" className="topbar__icon" />
            Settings
          </button>
          <a
            className="ui-button ui-button--ghost topbar__nav-btn"
            id="topbar-docs-btn"
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
          >
            <img src={docsIcon} alt="" className="topbar__icon" />
            Docs
          </a>
          <button className="ui-button ui-button--accent topbar__nav-btn topbar__nav-btn--accent" id="topbar-profile-btn">
            <img src={profileIcon} alt="" className="topbar__icon" />
            Profile
          </button>
        </nav>
      </header>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </>
  )
}
