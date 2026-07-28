import './OutputTabs.css'

export default function OutputTabs({ instructions = [] }) {
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
            {instructions.map((ins, i) => (
              <tr key={i} className={ins.active ? 'disassembler__row--active' : ''}>
                <td className="disassembler__addr">{ins.address}</td>
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
