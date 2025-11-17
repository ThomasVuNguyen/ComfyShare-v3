import { useEffect, useRef } from 'react'

export default function Dialog({ open, onClose, children, className = '' }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleClose = () => {
      onClose?.()
    }

    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  return (
    <dialog ref={dialogRef} className={`dialog ${className}`}>
      {children}
    </dialog>
  )
}

export function DialogPanel({ children, onClose, size = '40ch' }) {
  return (
    <div className="panel shadow" style={{ '--panel-size': size }}>
      <form method="dialog">
        <button className="btn panel__close">
          <img src="/images/remove.svg" alt="Close" />
        </button>
      </form>
      {children}
    </div>
  )
}
