import { useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useEditorStore } from '../../../store/editorStore'
import ModalWrapper from '../../ui/ModalWrapper'
import './SaveModal.css'

export default function SaveModal({ onClose }) {
  // ── Local State ──
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // ── Store Actions & Selectors ──
  const saveCode = useAuthStore(s => s.saveCode)
  const source   = useEditorStore(s => s.source)

  // ── Handlers ──
  const handleNameChange = (e) => setName(e.target.value)

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
    <ModalWrapper title="Save Code" onClose={onClose}>
      {error && <div className="save-error">{error}</div>}
      {isSuccess && <div className="save-success">Code saved successfully!</div>}

      {!isSuccess && (
        <form onSubmit={handleSubmit} className="save-form">
          <input 
            type="text" 
            className="ui-input" 
            placeholder="Enter code name..." 
            value={name} 
            onChange={handleNameChange} 
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
    </ModalWrapper>
  )
}
