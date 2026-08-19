import './MemoryBar.css'
import MemoryCell from './MemoryCell'
import { useMemoryStore } from '../../../store/memoryStore'

export default function MemoryBar() {
  const deltas = useMemoryStore(s => s.mem_writes)

  return (
    <div className="memory-bar">
      <div className="memory-bar__header">
        <span className="memory-bar__label">Changed Memory Cells</span>
        <span className="memory-bar__count">{deltas.length} Entries</span>
      </div>

      {deltas.length === 0 ? (
        <div className="memory-bar__empty">
          <span>No memory changes yet.</span>
        </div>
      ) : (
        <div className="memory-bar__list">
          {deltas.map(({ address, value }) => (
            <MemoryCell key={address} address={address} value={value} />
          ))}
        </div>
      )}
    </div>
  )
}
