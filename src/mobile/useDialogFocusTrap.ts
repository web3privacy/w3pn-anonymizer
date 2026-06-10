import { useEffect, type RefObject } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusable(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'))
}

function isVisibleDialog(el: HTMLElement) {
  return el.getClientRects().length > 0
}

function isTopmostDialog(el: HTMLElement) {
  const dialogs = Array.from(document.querySelectorAll<HTMLElement>(
    '[data-dialog-focus-trap="true"], [data-mobile-dialog="true"]',
  ))
    .filter(isVisibleDialog)
  return dialogs[dialogs.length - 1] === el
}

interface DialogFocusTrapOptions {
  initialFocusRef?: RefObject<HTMLElement | null>
  onClose?: () => void
}

export function useDialogFocusTrap(
  open: boolean,
  dialogRef: RefObject<HTMLElement | null>,
  { initialFocusRef, onClose }: DialogFocusTrapOptions = {},
) {
  useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current
    if (!dialog) return

    const previousActive = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const focusInitial = () => {
      const target = initialFocusRef?.current ?? getFocusable(dialog)[0] ?? dialog
      target.focus({ preventScroll: true })
    }
    const frame = requestAnimationFrame(focusInitial)

    const onKeyDown = (e: KeyboardEvent) => {
      const currentDialog = dialogRef.current
      if (!currentDialog || !isTopmostDialog(currentDialog)) return
      if (e.key === 'Escape' && onClose) {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const focusable = getFocusable(currentDialog)
      if (focusable.length === 0) {
        e.preventDefault()
        currentDialog.focus({ preventScroll: true })
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (!currentDialog.contains(active)) {
        e.preventDefault()
        first.focus({ preventScroll: true })
        return
      }
      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus({ preventScroll: true })
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus({ preventScroll: true })
      }
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('keydown', onKeyDown, true)
      if (previousActive?.isConnected) previousActive.focus({ preventScroll: true })
    }
  }, [dialogRef, initialFocusRef, onClose, open])
}
