import './ControlBar.css'
import { useCPUStore } from '../../store/cpuStore'
import playIcon from '../../assets/play.svg'
import stopIcon from '../../assets/stop.svg'
import stepIcon from '../../assets/step-once.svg'
import resetIcon from '../../assets/reset.svg'

const CONTROLS = [
  { id: 'ctrl-play',      label: 'Run',       icon: playIcon, shortcut: 'Ctrl-R', variant: 'success' },
  { id: 'ctrl-stop',      label: 'Stop',      icon: stopIcon, shortcut: 'Ctrl-S', variant: 'danger' },
  { id: 'ctrl-step-over', label: 'Step Over', icon: stepIcon, shortcut: 'Ctrl-Shift-S', variant: 'default' },
  { id: 'ctrl-reset',     label: 'Reset',     icon: resetIcon, shortcut: 'Ctrl-Shift-R', variant: 'default' },
]

export default function ControlBar() {
  const status = useCPUStore(s => s.status)
  const step = useCPUStore(s => s.step)
  const run = useCPUStore(s => s.run)
  const pause = useCPUStore(s => s.pause)
  const reset = useCPUStore(s => s.reset)
  

  const handleControl = (id) => {
    if (id === 'ctrl-reset') reset()
    if (id === 'ctrl-stop') pause()
    if (id === 'ctrl-play') run()
    if (id === 'ctrl-step-over') step()
  }

  return (
    <div className="control-bar">
      <span className={`control-bar__status control-bar__status--${status}`}>
        {status[0].toUpperCase() + status.slice(1)}
      </span>
      <div className="control-bar__actions">
        {CONTROLS.map(({ id, label, icon, shortcut, variant }) => (
          <button
            key={id}
            id={id}
            className={`ui-button control-bar__btn control-bar__btn--${variant}`}
            style={{ color: 'var(--accent)' }}
            title={label}
            onClick={() => handleControl(id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {icon && <img src={icon} alt="" style={{ width: 14, height: 14, opacity: 0.9 }} />}
              <span className="control-bar__btn-label">{label}</span>
            </div>
            <span className="control-bar__btn-shortcut">{shortcut}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
