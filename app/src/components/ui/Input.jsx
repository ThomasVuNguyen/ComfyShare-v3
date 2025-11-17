// Writebook-style input components

export function Input({ className = '', fullWidth = false, ...props }) {
  const classes = ['input', fullWidth && 'full-width', className]
    .filter(Boolean)
    .join(' ')

  return <input className={classes} {...props} />
}

export function Textarea({ className = '', ...props }) {
  const classes = ['input', 'input--textarea', className]
    .filter(Boolean)
    .join(' ')

  return <textarea className={classes} {...props} />
}

export function Switch({ id, label, checked, onChange, ...props }) {
  return (
    <label className="switch">
      <input
        id={id}
        type="checkbox"
        className="switch__input"
        checked={checked}
        onChange={onChange}
        {...props}
      />
      <span className="switch__btn"></span>
      {label && <span className="for-screen-reader">{label}</span>}
    </label>
  )
}

export function FileInput({ id, accept, onChange, preview, children }) {
  return (
    <label className="input input--file">
      {preview && <img src={preview} alt="Preview" />}
      {children}
      <input
        id={id}
        type="file"
        accept={accept}
        onChange={onChange}
      />
    </label>
  )
}
