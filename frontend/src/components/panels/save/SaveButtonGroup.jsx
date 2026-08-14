import { useState, useRef } from 'react'
import { useEditorStore } from '../../../store/editorStore'
import saveIcon from '../../../assets/save.svg'
import './SaveButtonGroup.css'

export default function SaveButtonGroup({ onSaveClick }) {
  const [fileMenuOpen, setFileMenuOpen] = useState(false)
  const fileInputRef = useRef(null)
  const { source, setSource } = useEditorStore()

  const handleExport = () => {
    setFileMenuOpen(false)
    const blob = new Blob([source], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'program.s'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleLoadClick = () => {
    setFileMenuOpen(false)
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result
      if (typeof content === 'string') {
        setSource(content)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="save-btn-group">
      <button
        className="topbar__nav-btn save-btn-main"
        id="topbar-save-btn"
        onClick={onSaveClick}
        title="Save to Cloud"
      >
        <img src={saveIcon} alt="Save Code" className="topbar__icon" />
      </button>
      <button
        className="topbar__nav-btn save-btn-caret"
        onClick={() => setFileMenuOpen(!fileMenuOpen)}
        title="More File Actions"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {fileMenuOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setFileMenuOpen(false)} />
          <div className="save-btn-menu">
            <button className="ui-button" onClick={handleLoadClick}>
              Import File
            </button>
            <button className="ui-button" onClick={handleExport}>
              Export File
            </button>
          </div>
        </>
      )}

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".s,.asm,.txt"
        onChange={handleFileChange}
      />
    </div>
  )
}
