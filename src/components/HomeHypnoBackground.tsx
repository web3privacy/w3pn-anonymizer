import { useEffect, useRef } from 'react'
import { createHomeSpiralRenderer, type HomeSpiralRenderer } from '../lib/gl/home-spiral-gl'

export interface HomeHypnoBackgroundProps {
  /** Extra class for layout/positioning. */
  className?: string
  /** 0..1 target visibility — the field eases toward this so it can fade in. */
  intensity?: number
  /** Reports whether the WebGL spiral initialised (for the CSS fallback). */
  onAvailability?: (available: boolean) => void
}

/**
 * Always-on, fullscreen hypnotic spiral background for the home screen. Runs its
 * own requestAnimationFrame loop at the display's native refresh (aiming for a
 * steady 60fps), eased pointer parallax, and fades the field in via `intensity`.
 * Renders nothing of substance when WebGL is unavailable or reduced motion is
 * requested — callers should show a static fallback in that case.
 */
export function HomeHypnoBackground({ className, intensity = 1, onAvailability }: HomeHypnoBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number>(0)
  const intensityRef = useRef(0)
  const targetRef = useRef(intensity)
  const pointerRef = useRef({ x: 0, y: 0 })
  const pointerTargetRef = useRef({ x: 0, y: 0 })

  targetRef.current = intensity

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduceMotion = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      onAvailability?.(false)
      return
    }

    let renderer: HomeSpiralRenderer | null = null
    try {
      renderer = createHomeSpiralRenderer(canvas)
    } catch {
      renderer = null
    }
    if (!renderer) {
      onAvailability?.(false)
      return
    }
    onAvailability?.(true)

    const onResize = () => renderer?.resize()
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

      intensityRef.current += (targetRef.current - intensityRef.current) * 0.08
      const p = pointerRef.current
      const pt = pointerTargetRef.current
      p.x += (pt.x - p.x) * 0.06
      p.y += (pt.y - p.y) * 0.06

      renderer?.resize()
      renderer?.render(t, p, intensityRef.current)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchmove', onTouch)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      renderer?.dispose()
    }
  }, [onAvailability])

  return <canvas ref={canvasRef} className={`home-hypno-bg${className ? ` ${className}` : ''}`} aria-hidden />
}
