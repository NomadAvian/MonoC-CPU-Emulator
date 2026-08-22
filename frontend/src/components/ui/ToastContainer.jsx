import { useUIStore } from '../../store/uiStore'
import { motion, AnimatePresence } from 'motion/react'
import './ToastContainer.css'

export default function ToastContainer() {
  const toasts = useUIStore(s => s.toasts)
  const removeToast = useUIStore(s => s.removeToast)

  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 50, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.88 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            className={`toast toast--${toast.type}`}
            onClick={() => removeToast(toast.id)}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
