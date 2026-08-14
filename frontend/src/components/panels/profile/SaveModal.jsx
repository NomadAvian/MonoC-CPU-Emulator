import { useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useEditorStore } from '../../../store/editorStore'
import closeIcon from '../../../assets/close.svg'
import './SaveModal.css'

export default function SaveModal({ onClose }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const saveCode = useAuthStore(s => s.saveCode)
  const source = useEditorStore(s => s.source)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setError('')
    setIsLoading(true)

    try {
      await saveCode(name.trim(), source)
      setIsSuccess(true)
      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="save-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <img src={closeIcon} alt="Close" />
        </button>
        
        <h2>Save Code</h2>
        
        {error && <div className="save-error">{error}</div>}
        {isSuccess && <div className="save-success">Code saved successfully!</div>}

        {!isSuccess && (
          <form onSubmit={handleSubmit} className="save-form">
            <input 
              type="text" 
              className="ui-input" 
              placeholder="Enter code name..." 
              value={name} 
              onChange={e => setName(e.target.value)} 
              autoFocus
              required 
            />
            <button 
              type="submit" 
              className="ui-button save-submit"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
