import { useState } from 'react'
import './SettingsModal.css'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { useEditorStore } from '../../store/editorStore'
import closeIcon from '../../assets/close.svg'

const FORMAT_OPTIONS = ['Hex', 'Unsigned']
const MODE_OPTIONS   = ['Dark', 'Light']
const FONT_OPTIONS   = ['Monospace', 'Consolas', 'Courier New']
const TAB_OPTIONS    = [2, 4, 8]

export default function SettingsModal({ onClose }) {
  const theme     = useUIStore(s => s.theme)
  const format    = useUIStore(s => s.format)
  const fontStyle = useUIStore(s => s.fontStyle)
  const tabSize   = useUIStore(s => s.tabSize)
  
  const setTheme  = useUIStore(s => s.setTheme)
  const setFormat = useUIStore(s => s.setFormat)
  const setFontStyle = useUIStore(s => s.setFontStyle)
  const setTabSize   = useUIStore(s => s.setTabSize)

  // Local draft state — only commit on Save
  const [draftMode,   setDraftMode]   = useState(theme === 'dark' ? 'Dark' : 'Light')
  const [draftFormat, setDraftFormat] = useState(format)
  const [draftFont,   setDraftFont]   = useState(fontStyle)
  const [draftTab,    setDraftTab]    = useState(tabSize)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setFormat(draftFormat)
    setTheme(draftMode === 'Light' ? 'light' : 'dark')
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
        className="settings-modal"
        id="settings-modal"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="settings-modal__header">
          <span className="settings-modal__title">Settings</span>
          <button
            id="settings-close-btn"
            className="icon-btn settings-modal__close-btn"
            onClick={onClose}
            aria-label="Close settings"
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
                  onClick={() => setDraftFormat(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Mode */}
          <div className="settings-modal__field">
            <label className="settings-modal__label">Theme</label>
            <div className="settings-modal__options">
              {MODE_OPTIONS.map(opt => (
                <button
                  key={opt}
                  id={`mode-${opt.toLowerCase()}`}
                  className={`ui-button settings-modal__opt-btn ${draftMode === opt ? 'active' : ''}`}
                  onClick={() => setDraftMode(opt)}
                >
                  {opt === 'Dark' ? 'Dark' : 'Light'}
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
                  onClick={() => setDraftFont(opt)}
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
                  onClick={() => setDraftTab(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* File actions */}
          <div className="settings-modal__divider" />

          <button id="settings-load-file" className="ui-button settings-modal__action-btn">
            Load File
          </button>
          <button id="settings-export-file" className="ui-button settings-modal__action-btn">
            Export File
          </button>

          <div className="settings-modal__divider" />

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
