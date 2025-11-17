import { Link } from 'react-router-dom'

export default function Breadcrumbs({ items }) {
  return (
    <div className="breadcrumbs">
      {items.map((item, index) => (
        <span key={index}>
          {item.href ? (
            <Link to={item.href}>{item.label}</Link>
          ) : item.editable ? (
            <input
              type="text"
              value={item.label}
              onChange={(e) => item.onChange?.(e.target.value)}
              className="input"
            />
          ) : (
            <strong>{item.label}</strong>
          )}
          {index < items.length - 1 && (
            <span className="flex-item-no-shrink"> ▸ </span>
          )}
        </span>
      ))}
    </div>
  )
}
