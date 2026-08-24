import { useEffect, useRef } from 'react'
import './Disassembler.css'
import { useCPUStore } from '../../../store/cpuStore'

export default function Disassembler() {
  const instructions = useCPUStore(s => s.instructions)
  const programCounter = useCPUStore(s => s.programCounter)
  const activeRowRef = useRef(null)

  // follow the highlighted instruction while executing;
  // 'nearest' scrolls only when the row leaves the viewport
  useEffect(() => {
    activeRowRef.current?.scrollIntoView({ block: 'nearest' })
  }, [programCounter, instructions])

  return (
    <div className="disassembler" id="disassembler-panel">
      {instructions.length === 0 ? (
        <div className="disassembler__empty">No instructions</div>
      ) : (
        <table className="disassembler__table">
          <thead>
            <tr>
              <th>Address</th>
              <th>Hex</th>
              <th>Instruction</th>
            </tr>
          </thead>
          <tbody>
            {instructions.map((ins) => (
              <tr
                key={ins.address}
                ref={ins.address === programCounter ? activeRowRef : undefined}
                className={ins.address === programCounter ? 'disassembler__row--active' : ''}
              >
                <td className="disassembler__addr">{hexAddr(ins.address)}</td>
                <td className="disassembler__hex">{ins.hex}</td>
                <td className="disassembler__ins">{ins.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function hexAddr(addr) {
  return `0x${(addr >>> 0).toString(16).padStart(8, '0')}`
}
