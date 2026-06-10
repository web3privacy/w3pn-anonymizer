import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Icon } from '../components/Icon'
import { useDialogFocusTrap } from './useDialogFocusTrap'

export type MobileDrawerVariant = 'tool' | 'gallery' | 'batch'

const DRAWER_ANIM_MS = 180

interface MobileToolDrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  variant?: MobileDrawerVariant
  /** Stack above other drawers (e.g. download choice over library). */
  elevated?: boolean
  /** Replace default header row (title + close). */
  header?: ReactNode
}

export function MobileToolDrawer({
  open,
  onClose,
  title,
  children,
  footer,
  variant = 'tool',
  elevated = false,
  header,
}: MobileToolDrawerProps) {
  const [present, setPresent] = useState(open)
  const [active, setActive] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (open) {
      setPresent(true)
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setActive(true))
      })
      return () => cancelAnimationFrame(id)
    }
    setActive(false)
    const t = window.setTimeout(() => setPresent(false), DRAWER_ANIM_MS)
    return () => clearTimeout(t)
  }, [open])

  useDialogFocusTrap(open && present, panelRef, { initialFocusRef: closeButtonRef, onClose })

  if (!present) return null

  const isSide = variant === 'gallery' || variant === 'batch'
  const backdropClass = [
    variant === 'tool' ? 'mobile-drawer-backdrop mobile-drawer-backdrop--tool' : 'mobile-drawer-backdrop',
    active ? 'mobile-drawer-backdrop--open' : '',
    elevated ? 'mobile-drawer-backdrop--elevated' : '',
  ].filter(Boolean).join(' ')

  const panelClass = [
    isSide ? 'mobile-drawer-side' : 'mobile-drawer-bottom',
    isSide ? 'mobile-drawer-side--solid' : 'mobile-drawer-bottom--glass',
    active ? 'mobile-drawer-panel--open' : '',
    elevated ? 'mobile-drawer-panel--elevated' : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      <div className={backdropClass} onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className={panelClass}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-mobile-dialog="true"
        tabIndex={-1}
      >
        {!isSide && <div className="mobile-drawer-handle" aria-hidden="true" />}
        {header ?? (
          <div className={`mobile-drawer-header${variant === 'tool' ? ' mobile-drawer-header--bottom' : ''}`}>
            <span className="mobile-drawer-header-spacer" aria-hidden="true" />
            <h2>{title}</h2>
            <button ref={closeButtonRef} className="mobile-drawer-close" type="button" onClick={onClose} aria-label="Close">
              <Icon name="close" size={18} />
            </button>
          </div>
        )}
        <div className="mobile-drawer-body">{children}</div>
        {footer && <div className="mobile-drawer-sticky-footer">{footer}</div>}
      </div>
    </>
  )
}
