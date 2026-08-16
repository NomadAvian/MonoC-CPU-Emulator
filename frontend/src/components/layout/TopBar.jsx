import { useState } from 'react'
import './TopBar.css'
import SettingsModal from '../panels/settings/SettingsModal'
import AuthModal from '../panels/profile/AuthModal'
import ProfileModal from '../panels/profile/ProfileModal'
import LibraryPanel from '../panels/library/LibraryPanel'
import SaveModal from '../panels/profile/SaveModal'
import SaveButtonGroup from '../panels/save/SaveButtonGroup'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'

import aiIcon from '../../assets/ai.svg'
import docsIcon from '../../assets/docs.svg'
import settingsIcon from '../../assets/settings.svg'
import profileIcon from '../../assets/profile.svg'
import libraryIcon from '../../assets/library.svg'

export default function TopBar() {
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)

  const { isChatOpen, toggleChat } = useUIStore()

  const user = useAuthStore(s => s.user)

  const handleProfileClick = () => {
    if (user) {
      setProfileOpen(true);
    } else {
      setAuthOpen(true);
    }
  }

  const handleSaveClick = () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setSaveOpen(true);
  }

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
            className={`topbar__nav-btn ${isChatOpen ? 'topbar__nav-btn--active' : ''}`}
            id="topbar-chat-btn"
            aria-pressed={isChatOpen}
            onClick={toggleChat}
            title="MonoC AI"
          >
            <img src={aiIcon} alt="MonoC AI" className="topbar__icon" />
          </button>

          <button
            className="topbar__nav-btn"
            id="topbar-library-btn"
            onClick={() => setLibraryOpen(true)}
            title="Code Library"
          >
            <img src={libraryIcon} alt="Code Library" className="topbar__icon" />
          </button>

          <button
            className="topbar__nav-btn"
            id="topbar-settings-btn"
            onClick={() => setSettingsOpen(true)}
            title="Settings"
          >
            <img src={settingsIcon} alt="Settings" className="topbar__icon" />
          </button>

          <SaveButtonGroup onSaveClick={handleSaveClick} />

          <a
            className="topbar__nav-btn"
            id="topbar-docs-btn"
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            title="Docs"
          >
            <img src={docsIcon} alt="Docs" className="topbar__icon" />
          </a>

          <button
            className="topbar__nav-btn"
            id="topbar-profile-btn"
            onClick={handleProfileClick}
            title={user ? user.username : 'Log In'}
          >
            <img src={profileIcon} alt="Profile" className="topbar__icon" />
          </button>
        </nav>
      </header>

      {libraryOpen && <LibraryPanel onClose={() => setLibraryOpen(false)} />}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
      {saveOpen && <SaveModal onClose={() => setSaveOpen(false)} />}
    </>
  )
}
