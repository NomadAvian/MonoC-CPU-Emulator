import './ModalWrapper.css'
import closeIcon from '../../../assets/close.svg'

export default function ModalWrapper({ title, onClose, children }) {
  const handleBackdropClick = () => {
    if (onClose) onClose()
  }

  const handleModalClick = (e) => {
    e.stopPropagation()
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-wrapper" onClick={handleModalClick}>
        {title && <h2>{title}</h2>}
        
        <div className="modal-wrapper__content">
          {children}
        </div>

        <button 
          className="icon-btn modal-close" 
          onClick={onClose}
          aria-label="Close modal"
        >
          <img src={closeIcon} alt="Close" />
        </button>
      </div>
    </div>
  )
}
