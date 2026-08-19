import { useEffect, useRef } from 'react'
import './ScreenPanel.css'
import closeIcon from '../../../assets/close.svg'
import { useScreenStore } from '../../../store/screenStore'

// Renders the b&w framebuffer onto a canvas scaled to fit the panel.
// Each byte of the framebuffer maps to one pixel: 0 = black, anything else = white.
export default function ScreenPanel({ style }) {
  const canvasRef = useRef(null)
  const width = useScreenStore(s => s.width)
  const height = useScreenStore(s => s.height)
  const data = useScreenStore(s => s.data)
  const loading = useScreenStore(s => s.loading)
  const closeScreen = useScreenStore(s => s.closeScreen)
  const refreshScreen = useScreenStore(s => s.refreshScreen)

  // fetch on opening
  useEffect(() => {
    refreshScreen()
  }, [refreshScreen])

  // update screen
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = width || 128
    const h = height || 96
    if (w <= 0 || h <= 0) return
    ctx.clearRect(0, 0, w, h)
    const img = ctx.createImageData(w, h)
    for (let i = 0; i < w * h; i++) {
      const on = data ? data[i] !== 0 : false
      const v = on ? 255 : 0
      img.data[i * 4] = v
      img.data[i * 4 + 1] = v
      img.data[i * 4 + 2] = v
      img.data[i * 4 + 3] = 255
    }
    ctx.putImageData(img, 0, 0)
  }, [data, width, height])

  const hasData = width > 0 && height > 0
  const bufW = width || 128
  const bufH = height || 96

  return (
    <aside className="screen-panel" style={style}>
      <div className="screen-panel__header">
        <span className="screen-panel__title">Screen</span>
        <button
          id="screen-hide-btn"
          className="icon-btn screen-panel__hide-btn"
          onClick={closeScreen}
          title="Hide screen"
          aria-label="Hide screen"
        >
          <img src={closeIcon} alt="Close" />
        </button>
      </div>

      <div className="screen-panel__body">
        <div className="screen-panel__frame">
          <canvas
            ref={canvasRef}
            width={bufW}
            height={bufH}
            className="screen-panel__canvas"
          />
        </div>
        {/* <div className="screen-panel__meta">
          {hasData
            ? `${width} × ${height}`
            : loading
              ? 'Loading…'
              : 'No framebuffer available'}
        </div> */}
      </div>
    </aside>
  )
}
