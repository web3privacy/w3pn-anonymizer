import { useCallback, useEffect, useRef } from 'react'

interface UseHoldRepeatOptions {
  /** Fires once on press, then repeatedly while held. */
  onStep: () => void
  /** Delay before auto-repeat kicks in (default 1000ms). */
  holdDelayMs?: number
  /** Interval between auto-repeat steps (default 50ms ≈ 20fps). */
  repeatMs?: number
}

/**
 * Press-and-hold auto-advance: triggers `onStep` immediately on pointer down,
 * then — if the pointer stays held past `holdDelayMs` — keeps firing it every
 * `repeatMs` so the user can scrub through frames by holding the button.
 */
export function useHoldRepeat({ onStep, holdDelayMs = 1000, repeatMs = 50 }: UseHoldRepeatOptions) {
  const stepRef = useRef(onStep)
  stepRef.current = onStep
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = useCallback(() => {
    if (delayTimerRef.current) { clearTimeout(delayTimerRef.current); delayTimerRef.current = null }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    stop()
    stepRef.current()
    delayTimerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => stepRef.current(), repeatMs)
    }, holdDelayMs)
  }, [holdDelayMs, repeatMs, stop])

  useEffect(() => stop, [stop])

  return {
    onPointerDown,
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
  }
}
