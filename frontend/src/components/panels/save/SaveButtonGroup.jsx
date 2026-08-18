import { useState, useRef } from 'react'
import { useEditorStore } from '../../../store/editorStore'
import saveIcon from '../../../assets/save.svg'
import './SaveButtonGroup.css'

export default function SaveButtonGroup({ onSaveClick }) {
  // ── Refs ──
  const fileInputRef = useRef(null)

  // ── Local State ──
  const [fileMenuOpen, setFileMenuOpen] = useState(false)

  // ── Store Selectors & Actions ──
  const source    = useEditorStore(s => s.source)
  const setSource = useEditorStore(s => s.setSource)

  // ── Handlers ──
  const handleToggleMenu = () => {
    setFileMenuOpen(!fileMenuOpen)
  }

  const handleCloseMenu = () => {
    setFileMenuOpen(false)
  }

  const handleCloudSave = () => {
    setFileMenuOpen(false)
    if (onSaveClick) onSaveClick()
  }

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
        id="topbar-save-btn"
        className="topbar__nav-btn"
        onClick={handleToggleMenu}
        title="Save & File Options"
      >
        <img src={saveIcon} alt="Save Code" className="topbar__icon" />
      </button>

      {fileMenuOpen && (
        <>
          <div 
            className="save-btn-menu__overlay"
            onClick={handleCloseMenu} 
          />
          <div className="save-btn-menu">
            <button className="ui-button" onClick={handleCloudSave}>
              Cloud Save
            </button>
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
        className="save-btn-menu__hidden-input"
        accept=".s,.asm,.txt"
        onChange={handleFileChange}
      />
    </div>
  )
}
