import { useState } from 'react'
import './SettingsModal.css'
import { useUIStore } from '../../../store/uiStore'
import closeIcon from '../../../assets/close.svg'

export const FORMAT_OPTIONS = ['Hex', 'Unsigned']
export const THEME_OPTIONS  = ['Catppuccin', 'Gruvbox']
export const FONT_OPTIONS   = ['Monospace', 'Courier New']
export const TAB_OPTIONS    = [2, 4, 8]

export default function SettingsModal({ onClose }) {
  // ── Store Selectors & Actions ──
  const theme        = useUIStore(s => s.theme)
  const format       = useUIStore(s => s.format)
  const fontStyle    = useUIStore(s => s.fontStyle)
  const tabSize      = useUIStore(s => s.tabSize)
  const addToast     = useUIStore(s => s.addToast)
  
  const setTheme     = useUIStore(s => s.setTheme)
  const setFormat    = useUIStore(s => s.setFormat)
  const setFontStyle = useUIStore(s => s.setFontStyle)
  const setTabSize   = useUIStore(s => s.setTabSize)

  // ── Local State ──
  const [draftTheme, setDraftTheme]   = useState(theme === 'gruvbox' ? 'Gruvbox' : 'Catppuccin')
  const [draftFormat, setDraftFormat] = useState(format)
  const [draftFont, setDraftFont]     = useState(fontStyle)
  const [draftTab, setDraftTab]       = useState(tabSize)
  const [saved, setSaved]             = useState(false)

  // ── Handlers ──
  const handleModalClick = (e) => {
    e.stopPropagation()
  }

  const handleFormatChange = (opt) => {
    setDraftFormat(opt)
  }

  const handleThemeChange = (opt) => {
    setDraftTheme(opt)
  }

  const handleFontChange = (opt) => {
    setDraftFont(opt)
  }

  const handleTabChange = (opt) => {
    setDraftTab(opt)
  }

  const handleSave = () => {
    setFormat(draftFormat)
    setTheme(draftTheme.toLowerCase())
    setFontStyle(draftFont)
    setTabSize(draftTab)

    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onClose()
    }, 600)
  }

  return (
    <div className="modal-overlay" id="settings-overlay" onClick={onClose}>
      <div
        id="settings-modal"
        className="settings-modal"
        onClick={handleModalClick}
      >
        {/* Header */}
        <div className="settings-modal__header">
          <span className="settings-modal__title">Settings</span>
          <button
            id="settings-close-btn"
            className="icon-btn settings-modal__close-btn"
            aria-label="Close settings"
            onClick={onClose}
          >
            <img src={closeIcon} alt="Close" />
          </button>
        </div>

        {/* Body */}
        <div className="settings-modal__body">

          {/* Format */}
          <div className="settings-modal__field">
            <label className="settings-modal__label">Number Format</label>
            <div className="settings-modal__options">
              {FORMAT_OPTIONS.map(opt => (
                <button
                  key={opt}
                  id={`format-${opt.toLowerCase()}`}
                  className={`ui-button settings-modal__opt-btn ${draftFormat === opt ? 'active' : ''}`}
                  onClick={() => handleFormatChange(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="settings-modal__field">
            <label className="settings-modal__label">Theme</label>
            <div className="settings-modal__options">
              {THEME_OPTIONS.map(opt => (
                <button
                  key={opt}
                  id={`theme-${opt.toLowerCase()}`}
                  className={`ui-button settings-modal__opt-btn ${draftTheme === opt ? 'active' : ''}`}
                  onClick={() => handleThemeChange(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Font Style */}
          <div className="settings-modal__field">
            <label className="settings-modal__label">Font Style</label>
            <div className="settings-modal__options">
              {FONT_OPTIONS.map(opt => (
                <button
                  key={opt}
                  id={`font-${opt.replace(/\s+/g, '-').toLowerCase()}`}
                  className={`ui-button settings-modal__opt-btn ${draftFont === opt ? 'active' : ''}`}
                  onClick={() => handleFontChange(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Size */}
          <div className="settings-modal__field">
            <label className="settings-modal__label">Tab Size</label>
            <div className="settings-modal__options">
              {TAB_OPTIONS.map(opt => (
                <button
                  key={opt}
                  id={`tab-${opt}`}
                  className={`ui-button settings-modal__opt-btn ${draftTab === opt ? 'active' : ''}`}
                  onClick={() => handleTabChange(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Save */}
          <button
            id="settings-save-btn"
            className={`ui-button ui-button--accent settings-modal__save-btn ${saved ? 'saved' : ''}`}
            onClick={handleSave}
          >
            {saved ? 'Saved' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
