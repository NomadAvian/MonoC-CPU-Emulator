import './ControlBar.css'
import { useCPUStore } from '../../store/cpuStore'

const CONTROLS = [
  { id: 'ctrl-play',      label: 'Run',       shortcut: 'Ctrl-R', variant: 'success' },
  { id: 'ctrl-stop',      label: 'Stop',      shortcut: 'Ctrl-S', variant: 'danger' },
  { id: 'ctrl-step-over', label: 'Step Over', shortcut: 'Ctrl-Shift-S', variant: 'default' },
  { id: 'ctrl-reset',     label: 'Reset',     shortcut: 'Ctrl-Shift-R', variant: 'default' },
]

export default function ControlBar() {
  const status = useCPUStore(s => s.status)
  const setStatus = useCPUStore(s => s.setStatus)
  const resetCPU = useCPUStore(s => s.resetCPU)

  {/*TODO: dummy stop play for now, update please */}
  const handleControl = (id) => {
    if (id === 'ctrl-reset') resetCPU()
    if (id === 'ctrl-stop') setStatus('stopped')
    if (id === 'ctrl-play') setStatus('running')
  }

  return (
    <div className="control-bar">
      <span className={`control-bar__status control-bar__status--${status}`}>
        {status[0].toUpperCase() + status.slice(1)}
      </span>
      <div className="control-bar__actions">
        {CONTROLS.map(({ id, label, shortcut, variant }) => (
          <button
            key={id}
            id={id}
            className={`ui-button control-bar__btn control-bar__btn--${variant}`}
            title={label}
            onClick={() => handleControl(id)}
          >
            <span className="control-bar__btn-label">{label}</span>
            <span className="control-bar__btn-shortcut">{shortcut}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
