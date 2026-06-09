import { useEffect } from 'react'

const VIEWPORT_DEFAULT =
  'width=device-width, initial-scale=1.0, viewport-fit=cover'
const VIEWPORT_LOCKED =
  'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'

/** Scrollable panels where browser pan/zoom should still work. */
const SCROLL_GESTURE_SELECTOR = [
  '.mobile-drawer-body',
  '.mobile-about-scroll',
  '.mobile-distort-viewport',
  '.mobile-effects-viewport',
  '.mobile-gallery-inner',
  '.mobile-home-v2',
  '.mobile-live-settings',
].join(', ')

function isScrollGestureTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(SCROLL_GESTURE_SELECTOR))
}

/**
 * Prevents browser-level pinch/double-tap zoom on mobile so gestures stay on
 * the photo canvas (usePinchZoom) and UI chrome stays fixed.
 */
export function useLockMobileViewport(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const meta = document.querySelector('meta[name="viewport"]')
    const previous = meta?.getAttribute('content') ?? VIEWPORT_DEFAULT
    meta?.setAttribute('content', VIEWPORT_LOCKED)

    const blockMultiTouch = (e: TouchEvent) => {
      if (e.touches.length < 2) return
      if (isScrollGestureTarget(e.target)) return
      e.preventDefault()
    }

    const blockGesture = (e: Event) => {
      if (isScrollGestureTarget(e.target)) return
      e.preventDefault()
    }

    document.addEventListener('touchmove', blockMultiTouch, { capture: true, passive: false })
    document.addEventListener('touchstart', blockMultiTouch, { capture: true, passive: false })
    document.addEventListener('gesturestart', blockGesture, { capture: true, passive: false } as AddEventListenerOptions)
    document.addEventListener('gesturechange', blockGesture, { capture: true, passive: false } as AddEventListenerOptions)
    document.addEventListener('gestureend', blockGesture, { capture: true, passive: false } as AddEventListenerOptions)

    return () => {
      meta?.setAttribute('content', previous)
      document.removeEventListener('touchmove', blockMultiTouch, { capture: true })
      document.removeEventListener('touchstart', blockMultiTouch, { capture: true })
      document.removeEventListener('gesturestart', blockGesture, { capture: true })
      document.removeEventListener('gesturechange', blockGesture, { capture: true })
      document.removeEventListener('gestureend', blockGesture, { capture: true })
    }
  }, [enabled])
}
