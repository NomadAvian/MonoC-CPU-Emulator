import { useState } from 'react'
import './TopBar.css'
import SettingsModal from '../panels/settings/SettingsModal'
import AuthModal from '../panels/profile/AuthModal'
import ProfileModal from '../panels/profile/ProfileModal'
import LibraryPanel from '../panels/library/LibraryPanel'
import SaveModal from '../panels/profile/SaveModal'
import SaveButtonGroup from '../panels/save/SaveButtonGroup'
import { useUIStore } from '../../store/uiStore'
import { useScreenStore } from '../../store/screenStore'
import { useAuthStore } from '../../store/authStore'

import aiIcon from '../../assets/ai.svg'
import screenIcon from '../../assets/screen.svg'
import docsIcon from '../../assets/docs.svg'
import settingsIcon from '../../assets/settings.svg'
import profileIcon from '../../assets/profile.svg'
import libraryIcon from '../../assets/library.svg'

export default function TopBar() {
  // ── Local State ──
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)

  // ── Store Selectors ──
  const isChatOpen = useUIStore(s => s.isChatOpen)
  const toggleChat = useUIStore(s => s.toggleChat)
  const isDocsOpen = useUIStore(s => s.isDocsOpen)
  const toggleDocs = useUIStore(s => s.toggleDocs)
  const isScreenOpen = useScreenStore(s => s.isScreenOpen)
  const toggleScreen = useScreenStore(s => s.toggleScreen)

  const user = useAuthStore(s => s.user)

  // ── Handlers ──
  const handleProfileClick = () => {
    if (user) {
      setProfileOpen(true)
    } else {
      setAuthOpen(true)
    }
  }

  const handleSaveClick = () => {
    if (!user) {
      setAuthOpen(true)
      return
    }
    setSaveOpen(true)
  }

  const handleLibraryClick = () => setLibraryOpen(true)
  const handleSettingsClick = () => setSettingsOpen(true)

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
            id="topbar-chat-btn"
            className={`topbar__nav-btn ${isChatOpen ? 'topbar__nav-btn--active' : ''}`}
            aria-pressed={isChatOpen}
            onClick={toggleChat}
            title="MonoC AI"
          >
            <img src={aiIcon} alt="MonoC AI" className="topbar__icon" />
          </button>

          <button
            className={`topbar__nav-btn ${isScreenOpen ? 'topbar__nav-btn--active' : ''}`}
            id="topbar-screen-btn"
            aria-pressed={isScreenOpen}
            onClick={toggleScreen}
            title="Screen"
          >
            <img src={screenIcon} alt="Screen" className="topbar__icon" />
          </button>

          <button
            className="topbar__nav-btn"
            id="topbar-library-btn"
            onClick={handleLibraryClick}
            title="Code Library"
          >
            <img src={libraryIcon} alt="Code Library" className="topbar__icon" />
          </button>

          <button
            id="topbar-settings-btn"
            className="topbar__nav-btn"
            onClick={handleSettingsClick}
            title="Settings"
          >
            <img src={settingsIcon} alt="Settings" className="topbar__icon" />
          </button>

          <SaveButtonGroup onSaveClick={handleSaveClick} />

          <button
            id="topbar-docs-btn"
            className={`topbar__nav-btn ${isDocsOpen ? 'topbar__nav-btn--active' : ''}`}
            aria-pressed={isDocsOpen}
            onClick={toggleDocs}
            title="Docs"
          >
            <img src={docsIcon} alt="Docs" className="topbar__icon" />
          </button>

          <button
            id="topbar-profile-btn"
            className="topbar__nav-btn"
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
