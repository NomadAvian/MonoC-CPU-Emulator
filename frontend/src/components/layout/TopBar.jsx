import { useState, useRef, useEffect } from 'react'
import './TopBar.css'
import SettingsModal from '../panels/settings/SettingsModal'
import AboutModal from '../panels/about/AboutModal'
import AuthModal from '../panels/profile/AuthModal'
import ProfileModal from '../panels/profile/ProfileModal'
import SaveModal from '../panels/profile/SaveModal'
import { useUIStore } from '../../store/uiStore'
import { useScreenStore } from '../../store/screenStore'
import { useAuthStore } from '../../store/authStore'
import { useEditorStore } from '../../store/editorStore'

import graduationIcon from '../../assets/graduation-cap.svg'
import screenIcon from '../../assets/screen.svg'
import screenActiveIcon from '../../assets/screen-active.svg'
import settingsIcon from '../../assets/settings.svg'
import profileIcon from '../../assets/profile.svg'
import saveIcon from '../../assets/save.svg'
import loadIcon from '../../assets/load.svg'
import moreIcon from '../../assets/more.svg'
import exportIcon from '../../assets/export.svg'
import githubIcon from '../../assets/github.svg'
import resetIcon from '../../assets/reset.svg'
import infoIcon from '../../assets/info.svg'
import monocLogo from '../../assets/MonoCLogo.svg'

export default function TopBar() {
  // ── Local State ──
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
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
  const isRightPanelOpen = useUIStore(s => s.isRightPanelOpen)
  const toggleRightPanel = useUIStore(s => s.toggleRightPanel)
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
    input.style.display = 'none'
    
    document.body.appendChild(input)

    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) {
        document.body.removeChild(input)
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        setSource(e.target.result)
        document.body.removeChild(input)
      }
      reader.onerror = () => document.body.removeChild(input)
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
          <img src={monocLogo} alt="MonoC Logo" className="topbar__logo-image" />
        </div>

        {/* Right: Nav actions */}
        <nav className="topbar__nav">
          <button
            id="topbar-chat-btn"
            className={`topbar__nav-btn topbar__ai-btn ${isRightPanelOpen ? 'topbar__nav-btn--active' : ''}`}
            aria-pressed={isRightPanelOpen}
            onClick={toggleRightPanel}
            title="Learn"
          >
            <img src={graduationIcon} alt="MonoC Learn" className="topbar__icon" />
          </button>

          <button
            className={`topbar__nav-btn ${isScreenOpen ? 'topbar__nav-btn--active' : ''}`}
            id="topbar-screen-btn"
            aria-pressed={isScreenOpen}
            onClick={toggleScreen}
            title="Display"
          >
            <img
              src={isScreenOpen ? screenActiveIcon : screenIcon}
              alt="Screen"
              className="topbar__icon"
            />
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
                <a className="topbar__overflow-item topbar__link" href="https://github.com/NomadAvian/MonoC-CPU-Emulator" target="_blank" rel="noopener noreferrer" onClick={() => setOverflowOpen(false)}>
                  <img src={githubIcon} alt="" className="topbar__icon" />
                  <span>GitHub</span>
                </a>
                <button
                  id="topbar-about-btn"
                  className="topbar__overflow-item"
                  onClick={() => { setOverflowOpen(false); setAboutOpen(true) }}
                >
                  <img src={infoIcon} alt="" className="topbar__icon" />
                  <span>About</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
      {saveOpen && <SaveModal onClose={() => setSaveOpen(false)} />}
    </>
  )
}
