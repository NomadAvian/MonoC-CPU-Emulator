import { useState, useRef, useEffect } from 'react'
import './TopBar.css'
import SettingsModal from '../panels/settings/SettingsModal'
import AuthModal from '../panels/profile/AuthModal'
import ProfileModal from '../panels/profile/ProfileModal'
import LibraryPanel from '../panels/library/LibraryPanel'
import SaveModal from '../panels/profile/SaveModal'
import { useUIStore } from '../../store/uiStore'
import { useScreenStore } from '../../store/screenStore'
import { useAuthStore } from '../../store/authStore'
import { useEditorStore } from '../../store/editorStore'

import aiIcon from '../../assets/ai.svg'
import screenIcon from '../../assets/screen.svg'
import docsIcon from '../../assets/docs.svg'
import settingsIcon from '../../assets/settings.svg'
import profileIcon from '../../assets/profile.svg'
import libraryIcon from '../../assets/library.svg'
import saveIcon from '../../assets/save.svg'
import loadIcon from '../../assets/load.svg'
import moreIcon from '../../assets/more.svg'
import exportIcon from '../../assets/export.svg'
import githubIcon from '../../assets/github.svg'
import resetIcon from '../../assets/reset.svg'

export default function TopBar() {
  // ── Local State ──
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const [overflowOpen, setOverflowOpen] = useState(false)

  const overflowRef = useRef(null)

  useEffect(() => {
    if (!overflowOpen) return
    const handler = (e) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target)) {
        setOverflowOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [overflowOpen])

  // ── Store Selectors ──
  const isChatOpen = useUIStore(s => s.isChatOpen)
  const toggleChat = useUIStore(s => s.toggleChat)
  const isDocsOpen = useUIStore(s => s.isDocsOpen)
  const toggleDocs = useUIStore(s => s.toggleDocs)
  const isScreenOpen = useScreenStore(s => s.isScreenOpen)
  const toggleScreen = useScreenStore(s => s.toggleScreen)
  const user = useAuthStore(s => s.user)
  const source = useEditorStore(s => s.source)
  const setSource = useEditorStore(s => s.setSource)
  const resetSource = useEditorStore(s => s.resetSource)

  // ── Handlers ──
  const handleProfileClick = () => {
    if (user) setProfileOpen(true)
    else setAuthOpen(true)
  }

  const handleResetEditor = () => {
    setOverflowOpen(false)
    resetSource()
  }

  const handleCloudSave = () => {
    setOverflowOpen(false)
    if (!user) { setAuthOpen(true); return }
    setSaveOpen(true)
  }

  const handleImport = () => {
    setOverflowOpen(false)
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.txt,.s,.asm'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => setSource(e.target.result)
      reader.readAsText(file)
    }
    input.click()
  }

  const handleExport = () => {
    setOverflowOpen(false)
    const blob = new Blob([source], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'monoc_code.s'
    a.click()
    URL.revokeObjectURL(url)
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
            id="topbar-chat-btn"
            className={`topbar__nav-btn topbar__ai-btn ${isChatOpen ? 'topbar__nav-btn--active' : ''}`}
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
            title="Display"
          >
            <img src={screenIcon} alt="Screen" className="topbar__icon" />
          </button>

          <button
            id="topbar-settings-btn"
            className="topbar__nav-btn"
            onClick={() => setSettingsOpen(true)}
            title="Settings"
          >
            <img src={settingsIcon} alt="Settings" className="topbar__icon" />
          </button>

          <button
            id="topbar-profile-btn"
            className="topbar__nav-btn"
            onClick={handleProfileClick}
            title={user ? user.username : 'Log In'}
          >
            <img src={profileIcon} alt="Profile" className="topbar__icon" />
          </button>

          <div className="topbar__overflow" ref={overflowRef}>
            <button
              className={`topbar__nav-btn ${overflowOpen ? 'topbar__nav-btn--active' : ''}`}
              onClick={() => setOverflowOpen(v => !v)}
              title="More Options"
            >
              <img src={moreIcon} alt="More Options" className="topbar__icon" />
            </button>

            {overflowOpen && (
              <div className="topbar__overflow-menu" role="menu">
                <button className="topbar__overflow-item" onClick={handleCloudSave}>
                  <img src={saveIcon} alt="" className="topbar__icon" />
                  <span>Cloud Save</span>
                </button>
                <button className="topbar__overflow-item" onClick={handleImport}>
                  <img src={loadIcon} alt="" className="topbar__icon" />
                  <span>Import File</span>
                </button>
                <button className="topbar__overflow-item" onClick={handleExport}>
                  <img src={exportIcon} alt="" className="topbar__icon" />
                  <span>Export File</span>
                </button>
                <button className="topbar__overflow-item" onClick={handleResetEditor}>
                  <img src={resetIcon} alt="" className="topbar__icon" />
                  <span>Reset Editor</span>
                </button>
                <div className="topbar__overflow-divider" />
                <button className="topbar__overflow-item" onClick={() => { setOverflowOpen(false); setLibraryOpen(true); }}>
                  <img src={libraryIcon} alt="" className="topbar__icon" />
                  <span>Example Codes</span>
                </button>
                <button className="topbar__overflow-item" onClick={() => { setOverflowOpen(false); toggleDocs(); }}>
                  <img src={docsIcon} alt="" className="topbar__icon" />
                  <span>Docs</span>
                </button>
                <a className="topbar__overflow-item topbar__link" href="https://github.com/" target="_blank" rel="noopener noreferrer" onClick={() => setOverflowOpen(false)}>
                  <img src={githubIcon} alt="" className="topbar__icon" />
                  <span>GitHub</span>
                </a>
              </div>
            )}
          </div>
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
