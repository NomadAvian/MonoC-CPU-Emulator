import { useState, useRef } from 'react'
import { useEditorStore } from '../../../store/editorStore'
import saveIcon from '../../../assets/save.svg'
import './SaveButtonGroup.css'

export default function SaveButtonGroup({ onSaveClick }) {
  const [fileMenuOpen, setFileMenuOpen] = useState(false)
  const fileInputRef = useRef(null)
  const { source, setSource } = useEditorStore()

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
        className="topbar__nav-btn"
        id="topbar-save-btn"
        onClick={() => setFileMenuOpen(!fileMenuOpen)}
        title="Save & File Options"
      >
        <img src={saveIcon} alt="Save Code" className="topbar__icon" />
      </button>

      {fileMenuOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setFileMenuOpen(false)} />
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
        style={{ display: 'none' }}
        accept=".s,.asm,.txt"
        onChange={handleFileChange}
      />
    </div>
  )
}
