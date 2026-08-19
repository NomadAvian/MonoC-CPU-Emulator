import './ModalWrapper.css'
import closeIcon from '../../assets/close.svg'
import { motion } from 'motion/react'

export default function ModalWrapper({ title, onClose, children }) {
  const handleBackdropClick = () => {
    if (onClose) onClose()
  }

  const handleModalClick = (e) => {
    e.stopPropagation()
  }

  return (
      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <motion.div
          className="modal-wrapper"
          onClick={handleModalClick}
          initial={{ opacity: 0.1, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
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
        </motion.div>
      </div>
    )
}
