import { useEffect, useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useEditorStore } from '../../../store/editorStore'
import { useUIStore } from '../../../store/uiStore'
import ModalWrapper from '../../ui/ModalWrapper'
import deleteIcon from '../../../assets/delete.svg'
import './ProfileModal.css'

export default function ProfileModal({ onClose }) {
  // ── Local State ──
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)

  // ── Store Selectors & Actions ──
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const fetchSavedCodes = useAuthStore(s => s.fetchSavedCodes)
  const deleteCode = useAuthStore(s => s.deleteCode)
  const setSource = useEditorStore(s => s.setSource)
  const addToast = useUIStore(s => s.addToast)

  useEffect(() => {
    // prevent memory leak by checking if component is mounted before saving state
    let isMounted = true;

    fetchSavedCodes()
      .then(res => isMounted && setCodes(res))
      .catch(err => isMounted && addToast(err.message || 'Failed to load saved codes', 'error'))
      .finally(() => isMounted && setLoading(false))

    return () => {
      isMounted = false;
    }
  }, [fetchSavedCodes])

  // ── Handlers ──
  const handleLoadCode = (item) => {
    setSource(item.code)
    addToast(`Loaded Saved Program: ${item.name}`, 'success')
    onClose()
  }

  const handleDeleteCode = async (e, id, name) => {
    e.stopPropagation()
    try {
      await deleteCode(id)
      setCodes(prev => prev.filter(c => c.id !== id))
      addToast(`Deleted Program: ${name}`, 'info')
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const handleLogout = () => {
    logout()
    addToast("Logged Out", "info")
    onClose()
  }

  return (
    <ModalWrapper title={user?.username || 'User Profile'} onClose={onClose}>
      <span className="profile-modal__subtitle">Saved Programs</span>

      <div className="profile-modal__body">
        {loading ? (
          <p className="profile-modal__empty">Loading saved codes...</p>
        ) : codes.length === 0 ? (
          <p className="profile-modal__empty">No saved codes yet.</p>
        ) : (
          <div className="profile-modal__list">
            {codes.map((item) => (
              <div 
                key={item.id} 
                className="profile-modal__item"
                onClick={() => handleLoadCode(item)}
                title="Load program"
              >
                <span className="profile-modal__item-name">{item.name}</span>
                <div className="profile-modal__item-actions">
                  <button
                    className="icon-btn profile-modal__action-btn--delete"
                    onClick={(e) => handleDeleteCode(e, item.id, item.name)}
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
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>
    </ModalWrapper>
  )
}
