import './RegisterGrid.css'
import RegisterCell from './RegisterCell'
import { useEffect } from 'react'
import { useCPUStore } from '../../../store/cpuStore'
import { useUIStore } from '../../../store/uiStore'
import { formatValue } from '../../../../utils/format'

const ABI_REGISTERS = [
  'zr ',   'ra ',   'sp ',   'gp ',   'tp ',   't0 ',   't1 ',   't2 ',
  's0 ',   's1 ',   'a0 ',   'a1 ',   'a2 ',   'a3 ',   'a4 ',   'a5 ',
  'a6 ',   'a7 ',   's2 ',   's3 ',   's4 ',   's5 ',   's6 ',   's7 ',
  's8 ',   's9 ',   's10',   's11',   't3 ',   't4 ',   't5 ',   't6 ',
]

export default function RegisterGrid() {
  const registers = useCPUStore(s => s.registers)
  const programCounter = useCPUStore(s => s.programCounter)
  const changedRegisters = useCPUStore(s => s.changedRegisters)
  const format = useUIStore(s => s.format)
  const fetchRegisters = useCPUStore(s => s.fetchRegisters)

  useEffect(() => {
    fetchRegisters()
  }, [fetchRegisters])

  const sp = registers[2] ?? 0

  return (
    <div className="reg-grid">
      <div className="reg-grid__section-label">Pinned Registers</div>
      <div className="reg-grid__pinned">
        <RegisterCell name="PC" value={formatValue(programCounter, format)} highlighted={changedRegisters.has('pc')} />
        <RegisterCell name={<>SP <span className="reg-grid__alias">x2</span></>} value={formatValue(sp, format)} highlighted={changedRegisters.has(2)} />
      </div>

      <div className="divider-h reg-grid__divider" />

      <div className="reg-grid__section-label">Registers</div>
      <div className="reg-grid__list">
        {registers.map((val, i) => (
          <RegisterCell key={i} name={<>{ABI_REGISTERS[i].trim()} <span className="reg-grid__alias">x{i}</span></>} value={formatValue(val, format)} highlighted={changedRegisters.has(i)} />
        ))}
      </div>
    </div>
  )
}
