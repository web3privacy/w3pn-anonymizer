import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { OpticalMode } from '../lib/optical-calibration'
import { HomeHypnoBackground } from './HomeHypnoBackground'

interface Props {
  mode: OpticalMode
  /** Click anywhere on the overlay to stop calibration. */
  onCancel?: () => void
  /** Reports whether the GPU spiral initialised (false → SVG fallback). */
  onAvailability?: (available: boolean) => void
}

/**
 * Fullscreen, nested counter-rotating hypnotic spiral shown only while privacy
 * calibration is active (after the user clicks the idle logo). Crossfades in
 * over the home screen during spin-up / illusion and fades back out during
 * cool-down, then unmounts — so the default screen keeps showing the brand logo.
 */
export function CalibrationSpiralOverlay({ mode, onCancel, onAvailability }: Props) {
  const active = mode === 'spinUp' || mode === 'illusion' || mode === 'coolDown'
  const [mounted, setMounted] = useState(active)
  const [glOk, setGlOk] = useState(true)

  useEffect(() => {
    if (active) {
      setMounted(true)
      return
    }
    // Keep mounted briefly so the cool-down fade-out can finish.
    const t = window.setTimeout(() => setMounted(false), 760)
    return () => window.clearTimeout(t)
  }, [active])

  const handleAvailability = useCallback((available: boolean) => {
    setGlOk(available)
    onAvailability?.(available)
  }, [onAvailability])

  if (!mounted || typeof document === 'undefined') return null

  // Full opacity while spinning up / holding the illusion; fade out on cool-down.
  const visible = (mode === 'spinUp' || mode === 'illusion') && glOk

  return createPortal(
    <div
      className={`calib-spiral-overlay${visible ? ' is-visible' : ''}${glOk ? '' : ' calib-spiral-overlay--hidden'}`}
      onClick={onCancel}
      role="button"
      tabIndex={-1}
      aria-label="Stop privacy calibration"
    >
      <HomeHypnoBackground intensity={1} onAvailability={handleAvailability} />
    </div>,
    document.body,
  )
}
