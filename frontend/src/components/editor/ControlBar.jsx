import './ControlBar.css'
import { useCPUStore, SPEEDS } from '../../store/cpuStore'
// import playIcon from '../../assets/play.svg'
// import stopIcon from '../../assets/stop.svg'
// import stepIcon from '../../assets/step-once.svg'
// import resetIcon from '../../assets/reset.svg'


const CONTROLS = [
  { id: 'ctrl-compile', label: 'Compile',   /* icon: playIcon, shortcut: 'Ctrl-R',       */ },
  { id: 'ctrl-play', label: 'Run',       /* icon: playIcon, shortcut: 'Ctrl-R',       */ },
  { id: 'ctrl-stop', label: 'Stop',      /* icon: stopIcon, shortcut: 'Ctrl-S',       */ },
  { id: 'ctrl-step-over', label: 'Step', /* icon: stepIcon, shortcut: 'Ctrl-Shift-S', */ },
  { id: 'ctrl-reset', label: 'Reset',     /* icon: resetIcon, shortcut: 'Ctrl-Shift-R',*/ },
]

export default function ControlBar() {
  // ── Store Selectors ──
  const status        = useCPUStore(s => s.status)
  const compiling     = useCPUStore(s => s.compiling)
  const halted        = useCPUStore(s => s.halted)
  const romSize       = useCPUStore(s => s.romSize)
  const speedIndex    = useCPUStore(s => s.speedIndex)

  // ── Store Actions ──
  const step          = useCPUStore(s => s.step)
  const reset         = useCPUStore(s => s.reset)
  const compile       = useCPUStore(s => s.compile)
  const startRun      = useCPUStore(s => s.startRun)
  const stopRun       = useCPUStore(s => s.stopRun)
  const setSpeedIndex = useCPUStore(s => s.setSpeedIndex)

  // ── Handlers ──
  const handleControl = (id) => {
    if (id === 'ctrl-compile') { stopRun(); compile() }
    if (id === 'ctrl-reset') { stopRun(); reset() }
    if (id === 'ctrl-stop') stopRun()
    if (id === 'ctrl-play') startRun()
    if (id === 'ctrl-step-over') step()
  }

  const handleSpeedChange = (e) => {
    setSpeedIndex(Number(e.target.value))
  }

  const getButtonState = (id) => {
    if (id === 'ctrl-compile') return { disabled: compiling, loading: compiling }
    if (id === 'ctrl-play') return { disabled: compiling || halted || romSize === 0 }
    if (id === 'ctrl-stop') return { disabled: compiling || status !== 'running' }
    if (id === 'ctrl-step-over') return { disabled: compiling || halted || romSize === 0 }
    if (id === 'ctrl-reset') return { disabled: compiling }
    return { disabled: false }
  }

  return (
    <div className="control-bar">
      <span className={`control-bar__status control-bar__status--${halted ? 'halted' : status}`}>
        {halted ? 'Halted' : status[0].toUpperCase() + status.slice(1)}
      </span>
      <div className="control-bar__actions">
        {CONTROLS.map(({ id, label, icon, shortcut }) => {
          const { disabled, loading } = getButtonState(id)
          return (
            <button
              key={id}
              id={id}
              className={`ui-button control-bar__btn ${loading ? 'control-bar__btn--loading' : ''}`}
              style={{ color: 'var(--accent)' }}
              title={label}
              disabled={disabled}
              onClick={() => handleControl(id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {loading ? (
                  <span className="control-bar__spinner" />
                ) : (
                  icon && <img src={icon} alt="" style={{ width: 14, height: 14, opacity: 0.9 }} />
                )}
                <span className="control-bar__btn-label">
                  {loading ? 'Compiling...' : label}
                </span>
              </div>
              {shortcut && <span className="control-bar__btn-shortcut">{shortcut}</span>}
            </button>
          )
        })}

        {/* Speed Control */}
        <div className="speed-control">
          <span className="speed-label">
            {SPEEDS[speedIndex].label}
          </span>
          <input
            type="range"
            min={0}
            max={SPEEDS.length - 1}
            step={1}
            value={speedIndex}
            title={SPEEDS[speedIndex].label}
            className="speed-slider-input"
            onChange={handleSpeedChange}
          />
        </div>
      </div>
    </div>
  )
}
