import { useEffect, useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useEditorStore } from '../../../store/editorStore'
import closeIcon from '../../../assets/close.svg'
import './ProfileModal.css'

export default function ProfileModal({ onClose }) {
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const fetchSavedCodes = useAuthStore(s => s.fetchSavedCodes)
  const setCode = useEditorStore(s => s.setCode)

  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSavedCodes()
      .then(res => setCodes(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [fetchSavedCodes])

  const handleSelectCode = (item) => {
    setCode(item.code)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={e => e.stopPropagation()}>
        <div className="profile-modal__header">
          <div>
            <h3 className="profile-modal__username">{user?.username || 'User Profile'}</h3>
            <span className="profile-modal__subtitle">Saved Programs</span>
          </div>
          <button className="icon-btn profile-modal__close-btn" onClick={onClose}>
            <img src={closeIcon} alt="Close" />
          </button>
        </div>

        <div className="profile-modal__body">
          {loading ? (
            <p className="profile-modal__empty">Loading saved codes...</p>
          ) : codes.length === 0 ? (
            <p className="profile-modal__empty">No saved codes yet.</p>
          ) : (
            <div className="profile-modal__list">
              {codes.map((item, index) => (
                <div 
                  key={index} 
                  className="profile-modal__item"
                  onClick={() => handleSelectCode(item)}
                >
                  <span className="profile-modal__item-name">{item.name}</span>
                  <span className="profile-modal__item-hint">Click to load</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="profile-modal__footer">
          <button 
            className="ui-button profile-modal__logout-btn"
            onClick={() => {
              logout()
              onClose()
            }}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  )
}
