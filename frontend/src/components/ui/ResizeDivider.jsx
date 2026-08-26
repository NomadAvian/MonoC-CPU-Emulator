import { useCallback, useEffect, useRef } from 'react'
import './ResizeDivider.css'

export default function ResizeDivider({ direction = 'horizontal', onDrag, style }) {
  const cleanupRef = useRef(null)

  useEffect(() => {
    return () => {
      if (cleanupRef.current) cleanupRef.current()
    }
  }, [])

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    let lastPos = direction === 'horizontal' ? e.clientX : e.clientY

    const onMouseMove = (moveEvent) => {
      const current = direction === 'horizontal' ? moveEvent.clientX : moveEvent.clientY
      const delta = current - lastPos
      lastPos = current
      onDrag(delta)
    }

    const styleEl = document.createElement('style')
    styleEl.innerHTML = '* { pointer-events: none !important; }'
    document.head.appendChild(styleEl)

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      if (document.head.contains(styleEl)) {
        document.head.removeChild(styleEl)
      }
      cleanupRef.current = null
    }
    
    cleanupRef.current = onMouseUp

    document.body.style.cursor   = direction === 'horizontal' ? 'col-resize' : 'row-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [direction, onDrag])

  return (
    <div
      className={`resize-divider resize-divider--${direction}`}
      style={style}
      onMouseDown={handleMouseDown}
      role="separator"
      aria-orientation={direction === 'horizontal' ? 'vertical' : 'horizontal'}
    >
      <div className="resize-divider__track" />
    </div>
  )
}
