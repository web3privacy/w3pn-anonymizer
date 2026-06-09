import { useCallback, useRef } from 'react'

interface UseLongPressOptions {
  onTap?: () => void
  onLongPress?: () => void
  delayMs?: number
}

export function useLongPress({ onTap, onLongPress, delayMs = 450 }: UseLongPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressRef = useRef(false)

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    longPressRef.current = false
    clear()
    timerRef.current = setTimeout(() => {
      longPressRef.current = true
      onLongPress?.()
    }, delayMs)
  }, [clear, delayMs, onLongPress])

  const onPointerUp = useCallback(() => {
    clear()
    if (!longPressRef.current) onTap?.()
    longPressRef.current = false
  }, [clear, onTap])

  const onPointerLeave = useCallback(() => {
    clear()
    longPressRef.current = false
  }, [clear])

  const onPointerCancel = onPointerLeave

  return { onPointerDown, onPointerUp, onPointerLeave, onPointerCancel }
}
