import './ControlBar.css'
import { useCPUStore } from '../../store/cpuStore'
// import playIcon from '../../assets/play.svg'
// import stopIcon from '../../assets/stop.svg'
// import stepIcon from '../../assets/step-once.svg'
// import resetIcon from '../../assets/reset.svg'


const CONTROLS = [
  { id: 'ctrl-compile',   label: 'Compile',   /* icon: playIcon, shortcut: 'Ctrl-R',       */ variant: 'success' },
  { id: 'ctrl-play',      label: 'Run',       /* icon: playIcon, shortcut: 'Ctrl-R',       */ variant: 'success' },
  { id: 'ctrl-stop',      label: 'Stop',      /* icon: stopIcon, shortcut: 'Ctrl-S',       */ variant: 'danger' },
  { id: 'ctrl-step-over', label: 'Step Over', /* icon: stepIcon, shortcut: 'Ctrl-Shift-S', */ variant: 'default' },
  { id: 'ctrl-reset',     label: 'Reset',     /* icon: resetIcon, shortcut: 'Ctrl-Shift-R',*/ variant: 'default' },
]

export default function ControlBar() {
  const status = useCPUStore(s => s.status)
  const setStatus = useCPUStore(s => s.setStatus)
  const step = useCPUStore(s => s.step)
  const reset = useCPUStore(s => s.reset)
  const compile = useCPUStore(s => s.compile)
  const compiling = useCPUStore(s => s.compiling)
  const halted = useCPUStore(s => s.halted)

  const handleControl = (id) => {
    if (id === 'ctrl-compile') compile()
    if (id === 'ctrl-reset') reset()
    if (id === 'ctrl-stop') setStatus('stopped')
    if (id === 'ctrl-play') setStatus('running')
    if (id === 'ctrl-step-over') step()
  }

  const getButtonState = (id) => {
    if (id === 'ctrl-compile') return { disabled: compiling, loading: compiling }
    if (id === 'ctrl-play') return { disabled: compiling || halted }
    if (id === 'ctrl-stop') return { disabled: compiling || status !== 'running' }
    if (id === 'ctrl-step-over') return { disabled: compiling || halted || status === 'stopped' }
    if (id === 'ctrl-reset') return { disabled: compiling }
    return { disabled: false }
  }

  return (
    <div className="control-bar">
      <span className={`control-bar__status control-bar__status--${halted ? 'halted' : status}`}>
        {halted ? 'Halted' : status[0].toUpperCase() + status.slice(1)}
      </span>
      <div className="control-bar__actions">
        {CONTROLS.map(({ id, label, icon, shortcut, variant }) => {
          const { disabled, loading } = getButtonState(id)
          return (
            <button
              key={id}
              id={id}
              className={`ui-button control-bar__btn control-bar__btn--${variant} ${loading ? 'control-bar__btn--loading' : ''}`}
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
      </div>
    </div>
  )
}
