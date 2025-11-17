// Writebook-style button component
export default function Button({
  children,
  variant = 'default',
  size = 'default',
  circle = false,
  placeholder = false,
  className = '',
  ...props
}) {
  const variantClasses = {
    default: '',
    link: 'btn--link',
    negative: 'btn--negative',
    positive: 'btn--positive',
    reversed: 'btn--reversed',
    plain: 'btn--plain',
  }

  const sizeClasses = {
    default: '',
    small: 'txt-small',
    medium: 'txt-medium',
    large: 'txt-large',
  }

  const classes = [
    'btn',
    circle && 'btn--circle',
    placeholder && 'btn--placeholder',
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].filter(Boolean).join(' ')

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}

export function ButtonLink({ children, href, ...props }) {
  return (
    <a href={href} className="btn" {...props}>
      {children}
    </a>
  )
}

export function IconButton({ icon, label, ...props }) {
  return (
    <Button circle {...props}>
      <img src={`/images/${icon}.svg`} alt="" />
      {label && <span className="for-screen-reader">{label}</span>}
    </Button>
  )
}
