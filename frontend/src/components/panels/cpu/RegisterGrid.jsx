import './RegisterGrid.css'
import RegisterCell from './RegisterCell'
import { useCPUStore } from '../../../store/cpuStore'
import { useUIStore } from '../../../store/uiStore'
import { formatValue } from '../../../../utils/format'

export default function RegisterGrid() {
  const registers = useCPUStore(s => s.registers)
  const programCounter = useCPUStore(s => s.programCounter)
  const format = useUIStore(s => s.format)

  const sp = registers[1] ?? 0

  return (
    <div className="reg-grid">
      <div className="reg-grid__section-label">Pinned Registers</div>
      <div className="reg-grid__pinned">
        <RegisterCell name="PC" value={formatValue(programCounter, format)} />
        <RegisterCell name="SP" value={formatValue(sp, format)} />
      </div>

      <div className="divider-h reg-grid__divider" />

      <div className="reg-grid__section-label">Registers</div>
      <div className="reg-grid__list">
        {registers.map((val, i) => (
          <RegisterCell key={i} name={`R${i}`} value={formatValue(val, format)} />
        ))}
      </div>
    </div>
  )
}
