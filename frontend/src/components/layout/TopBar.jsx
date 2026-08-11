import { useState } from 'react'
import './TopBar.css'
import SettingsModal from '../settings/SettingsModal'
import AuthModal from '../panels/profile/AuthModal'
import ProfileModal from '../panels/profile/ProfileModal'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { useEditorStore } from '../../store/editorStore'

import aiIcon from '../../assets/ai.svg'
import docsIcon from '../../assets/docs.svg'
import settingsIcon from '../../assets/settings.svg'
import profileIcon from '../../assets/profile.svg'
import saveIcon from '../../assets/save.svg'

export default function TopBar() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  
  const isChatOpen = useUIStore(s => s.isChatOpen)
  const toggleChat = useUIStore(s => s.toggleChat)
  
  const user = useAuthStore(s => s.user)

  const handleProfileClick = () => {
    if (user) {
      setProfileOpen(true);
    } else {
      setAuthOpen(true);
    }
  }

  const handleSaveClick = async () => {
    if (!user) {
      alert("Please log in to save code.");
      return;
    }
    const name = window.prompt("Enter code name:");
    if (!name) return;
    try {
      const currentCode = useEditorStore.getState().code;
      await useAuthStore.getState().saveCode(name, currentCode);
      alert("Code saved successfully!");
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <>
      <header className="topbar">
        {/* Left: Logo */}
        <div className="topbar__logo">
          <span className="topbar__logo-text">MonoC</span>
        </div>

        {/* Right: Nav actions (Order: AI, Settings, Save, Docs, Profile) */}
        <nav className="topbar__nav">
          <button
            className={`ui-button ui-button--ghost topbar__nav-btn ${isChatOpen ? 'topbar__nav-btn--active' : ''}`}
            id="topbar-chat-btn"
            aria-pressed={isChatOpen}
            onClick={toggleChat}
            title="AI Chat"
            style={{ color: 'var(--accent)' }}
          >
            <img src={aiIcon} alt="AI Chat" className="topbar__icon" />
          </button>

          <button
            className="ui-button ui-button--ghost topbar__nav-btn"
            id="topbar-settings-btn"
            onClick={() => setSettingsOpen(true)}
            title="Settings"
          >
            <img src={settingsIcon} alt="Settings" className="topbar__icon" />
          </button>

          <button
            className="ui-button ui-button--ghost topbar__nav-btn"
            id="topbar-save-btn"
            onClick={handleSaveClick}
            title="Save Code"
          >
            <img src={saveIcon} alt="Save Code" className="topbar__icon" />
          </button>

          <a
            className="ui-button ui-button--ghost topbar__nav-btn"
            id="topbar-docs-btn"
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            title="Docs"
          >
            <img src={docsIcon} alt="Docs" className="topbar__icon" />
          </a>

          <button 
            className="ui-button ui-button--ghost topbar__nav-btn" 
            id="topbar-profile-btn"
            onClick={handleProfileClick}
            title={user ? user.username : 'Log In'}
          >
            <img src={profileIcon} alt="Profile" className="topbar__icon" />
          </button>
        </nav>
      </header>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
    </>
  )
}
