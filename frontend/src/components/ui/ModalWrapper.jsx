import './ModalWrapper.css'
import closeIcon from '../../assets/close.svg'
import { motion } from 'motion/react'

export default function ModalWrapper({ title, onClose, children, className = '', style }) {
  const handleBackdropClick = () => {
    if (onClose) onClose()
  }

  const handleModalClick = (e) => {
    e.stopPropagation()
  }

  return (
    <motion.div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        className={`modal-wrapper ${className}`}
        style={style}
        onClick={handleModalClick}
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
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
    </motion.div>
  )
}
