import { useState, useEffect, useCallback, useRef } from 'react'
import { OPTICAL, type OpticalMode, readEnableOpticalMode } from '../lib/optical-calibration'

export function useOpticalCalibration() {
  const [mode, setMode] = useState<OpticalMode>(() => {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
        return 'disabledReducedMotion'
    } catch { /* SSR fallback */ }
    return 'idle'
  })

  const modeRef = useRef(mode)
  modeRef.current = mode
  const timersRef = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(id => window.clearTimeout(id))
    timersRef.current = []
  }, [])

  const cancel = useCallback(() => {
    clearTimers()
    setMode('idle')
  }, [clearTimers])

  const activate = useCallback(() => {
    if (!readEnableOpticalMode()) return
    if (modeRef.current === 'disabledReducedMotion') return
    if (modeRef.current !== 'idle') { cancel(); return }

    clearTimers()
    setMode('spinUp')

    const { spinUpDurationMs, illusionDurationMs, coolDownDurationMs } = OPTICAL
    const t1 = window.setTimeout(() => setMode('illusion'), spinUpDurationMs)
    const t2 = window.setTimeout(() => setMode('coolDown'), spinUpDurationMs + illusionDurationMs)
    const t3 = window.setTimeout(() => setMode('idle'), spinUpDurationMs + illusionDurationMs + coolDownDurationMs)
    timersRef.current = [t1, t2, t3]
  }, [cancel, clearTimers])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) { clearTimers(); setMode('disabledReducedMotion') }
      else setMode('idle')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [clearTimers])

  useEffect(() => {
    if (mode === 'idle' || mode === 'disabledReducedMotion') return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') cancel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [mode, cancel])

  useEffect(() => () => {
    timersRef.current.forEach(id => window.clearTimeout(id))
  }, [])

  const isActive = mode === 'spinUp' || mode === 'illusion' || mode === 'coolDown'

  return { mode, activate, cancel, isActive }
}
