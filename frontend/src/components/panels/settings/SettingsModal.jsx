import { useState } from 'react'
import './SettingsModal.css'
import { useSettingsStore } from '../../../store/settingsStore'
import ModalWrapper from '../../ui/ModalWrapper'

export const FORMAT_OPTIONS = ['Hex', 'Unsigned']
export const THEME_OPTIONS = ['Catppuccin', 'Gruvbox']
export const FONT_OPTIONS = ['Monospace', 'Courier New']
export const TAB_OPTIONS = [2, 4, 8]

export default function SettingsModal({ onClose }) {
  // ── Store Selectors & Actions ──
  const theme = useSettingsStore(s => s.theme)
  const format = useSettingsStore(s => s.format)
  const fontStyle = useSettingsStore(s => s.fontStyle)
  const editorFontSize = useSettingsStore(s => s.editorFontSize)
  const tabSize = useSettingsStore(s => s.tabSize)
  const showCompletionDocs = useSettingsStore(s => s.showCompletionDocs)

  const setTheme = useSettingsStore(s => s.setTheme)
  const setFormat = useSettingsStore(s => s.setFormat)
  const setFontStyle = useSettingsStore(s => s.setFontStyle)
  const setEditorFontSize = useSettingsStore(s => s.setEditorFontSize)
  const setTabSize = useSettingsStore(s => s.setTabSize)
  const setShowCompletionDocs = useSettingsStore(s => s.setShowCompletionDocs)

  // ── Local State ──
  const [draftTheme, setDraftTheme] = useState(theme === 'gruvbox' ? 'Gruvbox' : 'Catppuccin')
  const [draftFormat, setDraftFormat] = useState(format)
  const [draftFont, setDraftFont] = useState(fontStyle)
  const [draftFontSize, setDraftFontSize] = useState(editorFontSize)
  const [draftTab, setDraftTab] = useState(tabSize)
  const [draftShowDocs, setDraftShowDocs] = useState(showCompletionDocs)
  const [saved, setSaved] = useState(false)

  // ── Handlers ──

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
    let finalSize = parseInt(draftFontSize, 10)
    if (isNaN(finalSize) || finalSize < 16) finalSize = 16
    if (finalSize > 32) finalSize = 32

    setFormat(draftFormat)
    setTheme(draftTheme.toLowerCase())
    setFontStyle(draftFont)
    setEditorFontSize(finalSize)
    setDraftFontSize(finalSize) // update draft state with clamped value
    setTabSize(draftTab)
    setShowCompletionDocs(draftShowDocs)

    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onClose()
    }, 600)
  }

  return (
    <ModalWrapper title="Settings" onClose={onClose}>
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

        {/* Font Size */}
        <div className="settings-modal__field">
          <label className="settings-modal__label">Font Size (px)</label>
          <div className="settings-modal__options">
            <input
              type="number"
              className="ui-input"
              value={draftFontSize}
              onChange={(e) => setDraftFontSize(e.target.value)}
              min="16"
              max="32"
            />
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

        {/* Completion Docs */}
        <div className="settings-modal__field">
          <label className="settings-modal__label">Completion Docs</label>
          <div className="settings-modal__options">
            {['On', 'Off'].map(opt => (
              <button
                key={opt}
                id={`docs-${opt.toLowerCase()}`}
                className={`ui-button settings-modal__opt-btn ${(opt === 'On') === draftShowDocs ? 'active' : ''}`}
                onClick={() => setDraftShowDocs(opt === 'On')}
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
    </ModalWrapper>
  )
}
