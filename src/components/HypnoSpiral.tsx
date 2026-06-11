import { useEffect, useRef } from 'react'
import type { OpticalMode } from '../lib/optical-calibration'
import { createHypnoRenderer, type HypnoRenderer } from '../lib/gl/hypno-gl'

/** Target visibility/morph intensity for each calibration phase. */
function targetIntensity(mode: OpticalMode): number {
  switch (mode) {
    case 'spinUp': return 0.85
    case 'illusion': return 1
    case 'coolDown': return 0.35
    default: return 0 // idle, settling, disabledReducedMotion
  }
}

export interface HypnoSpiralProps {
  mode: OpticalMode
  className?: string
  /** Reports whether the WebGL renderer initialised, so callers can drop the
   *  heavier SVG fallback layers when the GPU spiral is doing the work. */
  onAvailability?: (available: boolean) => void
}

/**
 * Pointer-reactive WebGL Fraser spiral overlay. Sits above the SVG logo and
 * crossfades in during the calibration phases (spinUp → illusion → coolDown),
 * morphing the logo into a full motion-aftereffect illusion and back. Renders
 * nothing when WebGL is unavailable or reduced-motion is requested.
 */
export function HypnoSpiral({ mode, className, onAvailability }: HypnoSpiralProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rendererRef = useRef<HypnoRenderer | null>(null)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number>(0)

  const intensityRef = useRef(0)
  const targetRef = useRef(0)
  // Pointer in -1..1; current is eased toward target each frame.
  const pointerRef = useRef({ x: 0, y: 0 })
  const pointerTargetRef = useRef({ x: 0, y: 0 })
  const ensureRunningRef = useRef<(() => void) | null>(null)

  targetRef.current = targetIntensity(mode)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const renderer = createHypnoRenderer(canvas)
    if (!renderer) {
      onAvailability?.(false) // no WebGL → SVG fallback only
      return
    }
    rendererRef.current = renderer
    onAvailability?.(true)

    const onResize = () => renderer.resize()
    window.addEventListener('resize', onResize)

    const onPointer = (clientX: number, clientY: number) => {
      pointerTargetRef.current = {
        x: (clientX / window.innerWidth) * 2 - 1,
        y: -((clientY / window.innerHeight) * 2 - 1),
      }
    }
    const onMouse = (e: MouseEvent) => onPointer(e.clientX, e.clientY)
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) onPointer(t.clientX, t.clientY)
    }
    window.addEventListener('mousemove', onMouse, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })

    const loop = (now: number) => {
      if (!startRef.current) startRef.current = now
      const t = (now - startRef.current) / 1000

      // Ease intensity and pointer toward their targets for fluid transitions.
      intensityRef.current += (targetRef.current - intensityRef.current) * 0.06
      const p = pointerRef.current
      const pt = pointerTargetRef.current
      p.x += (pt.x - p.x) * 0.08
      p.y += (pt.y - p.y) * 0.08

      renderer.resize()
      renderer.render(t, p, intensityRef.current)

      // Pause the loop once fully idle (intensity settled near zero).
      if (targetRef.current <= 0.001 && intensityRef.current < 0.01) {
        rafRef.current = null
        intensityRef.current = 0
        return
      }
      rafRef.current = requestAnimationFrame(loop)
    }

    const ensureRunning = () => {
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(loop)
    }
    // Kick the loop whenever the target becomes non-zero.
    ensureRunningRef.current = ensureRunning
    if (targetRef.current > 0) ensureRunning()

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchmove', onTouch)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      renderer.dispose()
      rendererRef.current = null
    }
  }, [onAvailability])

  // Restart the loop when entering an active phase.
  useEffect(() => {
    if (targetIntensity(mode) > 0) ensureRunningRef.current?.()
  }, [mode])

  return <canvas ref={canvasRef} className={`hypno-spiral${className ? ` ${className}` : ''}`} aria-hidden />
}
