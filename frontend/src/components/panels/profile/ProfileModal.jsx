import { useEffect, useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useEditorStore } from '../../../store/editorStore'
import closeIcon from '../../../assets/close.svg'
import loadIcon from '../../../assets/load.svg'
import deleteIcon from '../../../assets/delete.svg'
import './ProfileModal.css'

export default function ProfileModal({ onClose }) {
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const fetchSavedCodes = useAuthStore(s => s.fetchSavedCodes)
  const deleteCode = useAuthStore(s => s.deleteCode)
  const setCode = useEditorStore(s => s.setCode)

  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSavedCodes()
      .then(res => setCodes(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [fetchSavedCodes])

  const handleLoadCode = (item) => {
    setCode(item.code)
    onClose()
  }

  const handleDeleteCode = async (e, name) => {
    e.stopPropagation()
    try {
      await deleteCode(name)
      setCodes(prev => prev.filter(c => c.name !== name))
    } catch (err) {
      alert(err.message)
    }
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
                <div key={index} className="profile-modal__item">
                  <span className="profile-modal__item-name">{item.name}</span>
                  <div className="profile-modal__item-actions">
                    <button
                      className="icon-btn profile-modal__action-btn"
                      onClick={() => handleLoadCode(item)}
                      title="Load program"
                    >
                      <img src={loadIcon} alt="Load" />
                    </button>
                    <button
                      className="icon-btn profile-modal__action-btn profile-modal__action-btn--delete"
                      onClick={(e) => handleDeleteCode(e, item.name)}
                      title="Delete program"
                    >
                      <img src={deleteIcon} alt="Delete" />
                    </button>
                  </div>
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
