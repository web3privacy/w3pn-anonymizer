import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export function ToolFlyout({ anchor, title, wide = false, onClose, children }: {
  anchor: { top: number; left: number }
  title: string
  wide?: boolean
  onClose: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const focusReturnRef = useRef<HTMLElement | null>(null)
  const [position, setPosition] = useState(anchor)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useLayoutEffect(() => {
    const panel = ref.current
    if (!panel) return
    const place = () => {
      const bounds = panel.getBoundingClientRect()
      const left = Math.max(12, Math.min(anchor.left, window.innerWidth - bounds.width - 12))
      const top = Math.max(12, Math.min(anchor.top, window.innerHeight - bounds.height - 12))
      setPosition((current) => current.left === left && current.top === top ? current : { left, top })
    }
    place()
    const observer = new ResizeObserver(place)
    observer.observe(panel)
    window.addEventListener('resize', place)
    return () => { observer.disconnect(); window.removeEventListener('resize', place) }
  }, [anchor])
  useEffect(() => {
    if (!focusReturnRef.current && document.activeElement instanceof HTMLElement) focusReturnRef.current = document.activeElement
    const previous = focusReturnRef.current
    ref.current?.focus({ preventScroll: true })
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      closeRef.current()
      if (previous instanceof HTMLElement) previous.focus({ preventScroll: true })
    }
    window.addEventListener('keydown', escape)
    return () => {
      window.removeEventListener('keydown', escape)
      if (ref.current?.contains(document.activeElement)) previous?.focus({ preventScroll: true })
    }
  }, [])
  return createPortal(
    <div ref={ref} className={`ts-flyout-portal ts-flyout${wide ? ' ts-flyout--wide' : ''}`}
      style={{ position: 'fixed', ...position, maxHeight: 'calc(100dvh - 24px)', zIndex: 9999 }}
      role="dialog" aria-label={title} tabIndex={-1} onMouseDown={(event) => event.stopPropagation()}>
      <div className="ts-flyout-title">{title}</div>
      {children}
    </div>, document.body,
  )
}
