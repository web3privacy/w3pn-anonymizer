import { useEffect, useRef, type RefObject } from 'react'

export interface ViewPan {
  x: number
  y: number
}

interface PinchZoomOptions {
  enabled: boolean
  zoom: number
  zoomRef: RefObject<number>
  pan: ViewPan
  panRef: RefObject<ViewPan>
  rotation?: number
  rotationRef?: RefObject<number>
  onZoomChange: (zoom: number) => void
  onPanChange: (pan: ViewPan) => void
  onRotationChange?: (rotation: number) => void
  isPanGestureAllowed?: () => boolean
  onPinchStart?: () => void
  onViewTransformChange?: () => void
  minZoom?: number
  maxZoom?: number
}

const touchDist = (t0: Touch, t1: Touch) =>
  Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY)

const touchAngle = (t0: Touch, t1: Touch) =>
  Math.atan2(t1.clientY - t0.clientY, t1.clientX - t0.clientX)

const touchCenter = (t0: Touch, t1: Touch) => ({
  x: (t0.clientX + t1.clientX) / 2,
  y: (t0.clientY + t1.clientY) / 2,
})

export function usePinchZoom(
  elementRef: RefObject<HTMLElement | null>,
  {
    enabled,
    zoom,
    zoomRef,
    panRef,
    rotationRef,
    onZoomChange,
    onPanChange,
    onRotationChange,
    isPanGestureAllowed,
    onPinchStart,
    onViewTransformChange,
    minZoom = 0.5,
    maxZoom = 4,
  }: PinchZoomOptions,
) {
  const onZoomChangeRef = useRef(onZoomChange)
  const onPanChangeRef = useRef(onPanChange)
  const onRotationChangeRef = useRef(onRotationChange)
  onZoomChangeRef.current = onZoomChange
  onPanChangeRef.current = onPanChange
  onRotationChangeRef.current = onRotationChange

  const onPinchStartRef = useRef(onPinchStart)
  onPinchStartRef.current = onPinchStart

  const onViewTransformChangeRef = useRef(onViewTransformChange)
  onViewTransformChangeRef.current = onViewTransformChange

  useEffect(() => {
    if (!enabled) return
    const el = elementRef.current
    if (!el) return

    let pinchStartDist = 0
    let pinchStartZoom = zoomRef.current ?? zoom
    let pinchStartAngle = 0
    let pinchStartRotation = rotationRef?.current ?? 0
    let pinchStartCenter: ViewPan = { x: 0, y: 0 }
    let pinchStartPan: ViewPan = { x: 0, y: 0 }
    let panStart: ViewPan = { x: 0, y: 0 }
    let panTouchStart: { x: number; y: number } | null = null
    let panPointerId: number | null = null

    const notifyTransform = () => onViewTransformChangeRef.current?.()

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Always allow pinch — onPinchStart resets any active draw session.
        e.preventDefault()
        onPinchStartRef.current?.()
        pinchStartDist = touchDist(e.touches[0], e.touches[1])
        pinchStartZoom = zoomRef.current ?? 1
        pinchStartAngle = touchAngle(e.touches[0], e.touches[1])
        pinchStartRotation = rotationRef?.current ?? 0
        pinchStartCenter = touchCenter(e.touches[0], e.touches[1])
        pinchStartPan = { ...(panRef.current ?? { x: 0, y: 0 }) }
        panTouchStart = null
        panPointerId = null
      } else if (e.touches.length === 1) {
        if (isPanGestureAllowed && !isPanGestureAllowed()) return
        panTouchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        panStart = { ...(panRef.current ?? { x: 0, y: 0 }) }
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        if (pinchStartDist <= 0) return
        const ratio = touchDist(e.touches[0], e.touches[1]) / pinchStartDist
        const next = Math.min(maxZoom, Math.max(minZoom, pinchStartZoom * ratio))
        onZoomChangeRef.current(next)
        const center = touchCenter(e.touches[0], e.touches[1])
        onPanChangeRef.current({
          x: pinchStartPan.x + (center.x - pinchStartCenter.x),
          y: pinchStartPan.y + (center.y - pinchStartCenter.y),
        })
        if (onRotationChangeRef.current) {
          const angle = touchAngle(e.touches[0], e.touches[1])
          onRotationChangeRef.current(pinchStartRotation + (angle - pinchStartAngle))
        }
        notifyTransform()
        return
      }
      if (e.touches.length === 1 && panTouchStart) {
        if (isPanGestureAllowed && !isPanGestureAllowed()) return
        e.preventDefault()
        const dx = e.touches[0].clientX - panTouchStart.x
        const dy = e.touches[0].clientY - panTouchStart.y
        onPanChangeRef.current({ x: panStart.x + dx, y: panStart.y + dy })
        notifyTransform()
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinchStartDist = 0
      if (e.touches.length === 0) panTouchStart = null
    }

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return
      if (isPanGestureAllowed && !isPanGestureAllowed()) return
      if (e.isPrimary && panPointerId == null) {
        panPointerId = e.pointerId
        panTouchStart = { x: e.clientX, y: e.clientY }
        panStart = { ...(panRef.current ?? { x: 0, y: 0 }) }
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      if (panPointerId !== e.pointerId || !panTouchStart) return
      if (isPanGestureAllowed && !isPanGestureAllowed()) return
      e.preventDefault()
      const dx = e.clientX - panTouchStart.x
      const dy = e.clientY - panTouchStart.y
      onPanChangeRef.current({ x: panStart.x + dx, y: panStart.y + dy })
      notifyTransform()
    }

    const onPointerUp = (e: PointerEvent) => {
      if (panPointerId === e.pointerId) {
        panPointerId = null
        panTouchStart = null
      }
    }

    el.addEventListener('touchstart', onTouchStart, { capture: true, passive: false })
    el.addEventListener('touchmove', onTouchMove, { capture: true, passive: false })
    el.addEventListener('touchend', onTouchEnd, { capture: true })
    el.addEventListener('touchcancel', onTouchEnd, { capture: true })
    el.addEventListener('pointerdown', onPointerDown, { capture: true })
    el.addEventListener('pointermove', onPointerMove, { capture: true, passive: false })
    el.addEventListener('pointerup', onPointerUp, { capture: true })
    el.addEventListener('pointercancel', onPointerUp, { capture: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart, { capture: true })
      el.removeEventListener('touchmove', onTouchMove, { capture: true })
      el.removeEventListener('touchend', onTouchEnd, { capture: true })
      el.removeEventListener('touchcancel', onTouchEnd, { capture: true })
      el.removeEventListener('pointerdown', onPointerDown, { capture: true })
      el.removeEventListener('pointermove', onPointerMove, { capture: true })
      el.removeEventListener('pointerup', onPointerUp, { capture: true })
      el.removeEventListener('pointercancel', onPointerUp, { capture: true })
    }
  }, [elementRef, enabled, isPanGestureAllowed, maxZoom, minZoom, panRef, rotationRef, zoom, zoomRef])
}
