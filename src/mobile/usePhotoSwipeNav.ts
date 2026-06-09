import { useEffect, useRef, type RefObject } from 'react'

interface PhotoSwipeNavOptions {
  enabled: boolean
  onSwipeLeft: () => void
  onSwipeRight: () => void
  isAllowed?: () => boolean
  minDistance?: number
}

/**
 * Horizontal swipe on the viewer to step between library photos.
 * Swipe left → next, swipe right → previous.
 */
export function usePhotoSwipeNav(
  elementRef: RefObject<HTMLElement | null>,
  {
    enabled,
    onSwipeLeft,
    onSwipeRight,
    isAllowed,
    minDistance = 72,
  }: PhotoSwipeNavOptions,
) {
  const onSwipeLeftRef = useRef(onSwipeLeft)
  const onSwipeRightRef = useRef(onSwipeRight)
  const isAllowedRef = useRef(isAllowed)
  onSwipeLeftRef.current = onSwipeLeft
  onSwipeRightRef.current = onSwipeRight
  isAllowedRef.current = isAllowed

  useEffect(() => {
    if (!enabled) return
    const el = elementRef.current
    if (!el) return

    let start: { x: number; y: number } | null = null

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        start = null
        return
      }
      start = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (!start || e.changedTouches.length === 0) return
      if (isAllowedRef.current && !isAllowedRef.current()) {
        start = null
        return
      }
      const end = e.changedTouches[0]
      const dx = end.clientX - start.x
      const dy = end.clientY - start.y
      start = null
      if (Math.abs(dx) < minDistance) return
      if (Math.abs(dy) > Math.abs(dx) * 0.65) return
      if (dx < 0) onSwipeLeftRef.current()
      else onSwipeRightRef.current()
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    el.addEventListener('touchcancel', onTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [elementRef, enabled, minDistance])
}
