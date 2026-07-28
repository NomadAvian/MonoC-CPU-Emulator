import './RegisterCell.css'

export default function RegisterCell({ name, value = '0x00000000', highlighted = false }) {
  return (
    <div className={`reg-cell ${highlighted ? 'reg-cell--highlighted' : ''}`}>
      <span className="reg-cell__name">{name}</span>
      <span className="reg-cell__value">{value}</span>
    </div>
  )
}
