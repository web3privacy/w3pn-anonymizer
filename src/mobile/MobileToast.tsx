import { useEffect } from 'react'
import { Icon } from '../components/Icon'

interface MobileToastProps {
  message: string | null
  onDismiss: () => void
  actionLabel?: string
  onAction?: () => void
  durationMs?: number
}

export function MobileToast({
  message,
  onDismiss,
  actionLabel,
  onAction,
  durationMs = 2800,
}: MobileToastProps) {
  useEffect(() => {
    if (!message) return
    const t = window.setTimeout(onDismiss, durationMs)
    return () => window.clearTimeout(t)
  }, [message, onDismiss, durationMs])

  if (!message) return null

  return (
    <div className="mobile-toast" role="status" aria-live="polite">
      <Icon name="check_circle" size={18} />
      <span className="mobile-toast-text">{message}</span>
      {actionLabel && onAction && (
        <button type="button" className="mobile-toast-action" onClick={() => { onAction(); onDismiss() }}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
