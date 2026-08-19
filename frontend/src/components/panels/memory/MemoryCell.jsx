import './MemoryCell.css'

/**
 * MemoryCell
 * Displays a single delta memory address + value.
 * Props:
 *   address {string} – hex address e.g. "0x1000"
 *   value   {string} – hex byte value e.g. "0xFF"
 */
export default function MemoryCell({ address, value = '0x00' }) {
  return (
    <div className="mem-cell">
      <span className="mem-cell__addr">{address}</span>
      <span className="mem-cell__sep">:</span>
      <span className="mem-cell__value">{value}</span>
    </div>
  )
}
