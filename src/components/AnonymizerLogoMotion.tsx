import { useRef, useEffect, useState, useCallback } from 'react'
import { OPTICAL, type OpticalMode } from '../lib/optical-calibration'
import './anonymizer-logo-motion.css'

const CX = 203.5
const CY = 203.5

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

interface SvgPaths { spiral: string; center: string }

let _svgPathsCache: SvgPaths | null = null

function loadSvgPaths(): Promise<SvgPaths> {
  if (_svgPathsCache) return Promise.resolve(_svgPathsCache)
  return fetch('/brand/spiral-logo.svg')
    .then(r => r.text())
    .then(text => {
      const doc = new DOMParser().parseFromString(text, 'image/svg+xml')
      const paths = doc.querySelectorAll('path')
      const result: SvgPaths = {
        spiral: paths[0]?.getAttribute('d') || '',
        center: paths[paths.length - 1]?.getAttribute('d') || '',
      }
      _svgPathsCache = result
      return result
    })
}

interface Props {
  mode: OpticalMode
  onActivate: () => void
  onCancel: () => void
  className?: string
}

export function AnonymizerLogoMotion({ mode, onActivate, onCancel, className = '' }: Props) {
  const imgRef = useRef<HTMLDivElement>(null)
  const outerRef = useRef<SVGGElement>(null)
  const innerRef = useRef<SVGGElement>(null)
  const centerRef = useRef<SVGGElement>(null)
  const ghostRefs = useRef<(SVGCircleElement | null)[]>([])
  const rafRef = useRef(0)
  const lastTsRef = useRef(0)

  const angleRef = useRef(0)
  const speedsRef = useRef({
    outer: OPTICAL.idleRotationDegPerSec,
    inner: OPTICAL.idleRotationDegPerSec,
    center: 0,
    intensity: 0,
  })
  const outerAngleRef = useRef(0)
  const innerAngleRef = useRef(0)
  const centerAngleRef = useRef(0)
  const prevModeRef = useRef<OpticalMode>('idle')

  const [svgPaths, setSvgPaths] = useState<SvgPaths | null>(_svgPathsCache)
  const [countdown, setCountdown] = useState(0)
  const [showComplete, setShowComplete] = useState(false)

  const isActive = mode === 'spinUp' || mode === 'illusion' || mode === 'coolDown'
  const showSvg = isActive && svgPaths != null

  // Preload SVG paths on mount
  useEffect(() => {
    loadSvgPaths().then(setSvgPaths).catch(() => {})
  }, [])

  // Sync angles when transitioning idle ↔ active
  useEffect(() => {
    const prev = prevModeRef.current
    if (mode === 'spinUp' && prev === 'idle') {
      outerAngleRef.current = angleRef.current
      innerAngleRef.current = angleRef.current
      centerAngleRef.current = angleRef.current
    }
    if (mode === 'idle' && prev !== 'idle' && prev !== 'disabledReducedMotion') {
      angleRef.current = outerAngleRef.current % 360
    }
    prevModeRef.current = mode
  }, [mode])

  // Completion message after coolDown → idle
  useEffect(() => {
    if (mode === 'idle' && (prevModeRef.current === 'coolDown')) {
      setShowComplete(true)
      const t = window.setTimeout(() => setShowComplete(false), 2500)
      return () => window.clearTimeout(t)
    }
    return undefined
    // prevModeRef is updated in the other effect which runs first
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  // Countdown during illusion
  useEffect(() => {
    if (mode !== 'illusion') { setCountdown(0); return }
    const start = Date.now()
    const total = Math.ceil(OPTICAL.illusionDurationMs / 1000)
    setCountdown(total)
    const iv = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((OPTICAL.illusionDurationMs - (Date.now() - start)) / 1000))
      setCountdown(remaining)
    }, 1000)
    return () => window.clearInterval(iv)
  }, [mode])

  // ── RAF animation loop ──
  const tick = useCallback((ts: number) => {
    const dt = Math.min(0.05, (ts - (lastTsRef.current || ts)) / 1000)
    lastTsRef.current = ts
    const s = speedsRef.current
    const m = prevModeRef.current

    // Target speeds based on current mode
    let tOuter: number, tInner: number, tCenter: number, tIntensity: number
    let lerpRate: number

    if (m === 'spinUp') {
      tOuter = OPTICAL.outerRotationDegPerSec
      tInner = OPTICAL.innerRotationDegPerSec
      tCenter = OPTICAL.centerRotationDegPerSec
      tIntensity = 1
      lerpRate = 2.5
    } else if (m === 'illusion') {
      tOuter = OPTICAL.outerRotationDegPerSec
      tInner = OPTICAL.innerRotationDegPerSec
      tCenter = OPTICAL.centerRotationDegPerSec
      tIntensity = 1
      lerpRate = 4
    } else if (m === 'coolDown') {
      tOuter = OPTICAL.idleRotationDegPerSec
      tInner = OPTICAL.idleRotationDegPerSec
      tCenter = 0
      tIntensity = 0
      lerpRate = 1.8
    } else {
      tOuter = OPTICAL.idleRotationDegPerSec
      tInner = OPTICAL.idleRotationDegPerSec
      tCenter = 0
      tIntensity = 0
      lerpRate = 3
    }

    const f = Math.min(1, dt * lerpRate)
    s.outer += (tOuter - s.outer) * f
    s.inner += (tInner - s.inner) * f
    s.center += (tCenter - s.center) * f
    s.intensity += (tIntensity - s.intensity) * f

    if (m === 'idle' || m === 'disabledReducedMotion') {
      if (m === 'idle') {
        angleRef.current = (angleRef.current + OPTICAL.idleRotationDegPerSec * dt) % 360
        const el = imgRef.current
        if (el) el.style.transform = `rotate(${angleRef.current}deg)`
      }
    } else {
      outerAngleRef.current += s.outer * dt
      innerAngleRef.current += s.inner * dt
      centerAngleRef.current += s.center * dt

      if (outerRef.current)
        outerRef.current.style.transform = `rotate(${outerAngleRef.current % 360}deg)`
      if (innerRef.current)
        innerRef.current.style.transform = `rotate(${innerAngleRef.current % 360}deg)`

      // Center: slight scale pulse + slow rotation — fixation point stays stable
      const intensity = s.intensity
      if (centerRef.current) {
        const cycle = (ts / OPTICAL.pulsePeriodMs) * Math.PI * 2
        const scale = lerp(OPTICAL.pulseScale.min, OPTICAL.pulseScale.max,
          (Math.sin(cycle) + 1) / 2 * intensity)
        centerRef.current.style.transform =
          `rotate(${centerAngleRef.current % 360}deg) scale(${scale})`
      }

      // Ghost rings: pulse opacity + blur for Troxler peripheral fading
      for (let i = 0; i < ghostRefs.current.length; i++) {
        const el = ghostRefs.current[i]
        if (!el) continue
        const phase = (ts / (OPTICAL.pulsePeriodMs * (1.2 + i * 0.3))) * Math.PI * 2
        const opBase = lerp(OPTICAL.ghostRingOpacity.min, OPTICAL.ghostRingOpacity.max,
          (Math.sin(phase + i * 1.1) + 1) / 2)
        const blur = lerp(OPTICAL.blurRangePx.min, OPTICAL.blurRangePx.max,
          (Math.cos(phase * 0.7 + i) + 1) / 2)
        el.style.opacity = (opBase * intensity).toFixed(3)
        el.style.filter = `blur(${(blur * intensity).toFixed(1)}px)`
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [tick])

  // ── Render ──

  const handleClick = () => {
    if (isActive) onCancel()
    else onActivate()
  }

  const showCopy = mode === 'spinUp' || mode === 'illusion'
  const hintText = mode === 'illusion' && countdown > 0
    ? `Focus on the green center \u00B7 ${countdown}s`
    : 'Focus on the green center'

  return (
    <>
      <div className={`logo-motion-wrap${isActive ? ' logo-motion-calibrating' : ''} ${className}`}>
        {/* Idle: rotating <img>, same as today's HP */}
        <div
          ref={imgRef}
          className={`logo-motion-idle${showSvg ? ' logo-motion-idle--hidden' : ''}`}
          onClick={handleClick}
          role="img"
          aria-label="Anonymizer logo"
        >
          <img src="/brand/spiral-logo.svg" alt="" draggable={false} />
        </div>

        {/* Active: layered SVG with split rotation */}
        {showSvg && (
          <svg
            viewBox="0 0 407 407"
            className="logo-motion-svg"
            onClick={handleClick}
            aria-label="Privacy calibration animation"
          >
            <defs>
              <path id="lm-spiral" d={svgPaths.spiral} fill="white" />
              {/* Annulus: everything outside r=145 from center */}
              <clipPath id="lm-clip-outer">
                <path
                  fillRule="evenodd"
                  d={`M-10-10h427v427H-10z M${CX} ${CY - 145}a145 145 0 1 0 0 290 145 145 0 1 0 0-290z`}
                />
              </clipPath>
              {/* Inner disc: r ≤ 148 (slight overlap avoids seam) */}
              <clipPath id="lm-clip-inner">
                <circle cx={CX} cy={CY} r={148} />
              </clipPath>
            </defs>

            {/* Outer rings — rotate CW */}
            <g
              ref={outerRef}
              className="logo-motion-layer-outer"
              style={{ transformOrigin: `${CX}px ${CY}px` }}
              clipPath="url(#lm-clip-outer)"
            >
              <use href="#lm-spiral" />
            </g>

            {/* Inner spiral — rotate CCW */}
            <g
              ref={innerRef}
              className="logo-motion-layer-inner"
              style={{ transformOrigin: `${CX}px ${CY}px` }}
              clipPath="url(#lm-clip-inner)"
            >
              <use href="#lm-spiral" />
            </g>

            {/* Ghost rings for Troxler peripheral fading */}
            <g className="logo-motion-ghost">
              {Array.from({ length: OPTICAL.ghostRingCount }, (_, i) => (
                <circle
                  key={i}
                  ref={el => { ghostRefs.current[i] = el }}
                  cx={CX}
                  cy={CY}
                  r={160 + i * 14}
                  fill="none"
                  stroke="white"
                  strokeWidth="0.6"
                  opacity="0"
                />
              ))}
            </g>

            {/* Green center — stable fixation point */}
            <g
              ref={centerRef}
              className="logo-motion-center"
              style={{ transformOrigin: `${CX}px ${CY}px` }}
            >
              <path d={svgPaths.center} fill="#00FF78" />
            </g>
          </svg>
        )}
      </div>

      {/* Calibration copy */}
      {showCopy && (
        <div className={`logo-motion-copy${showCopy ? ' logo-motion-copy--visible' : ''}`}>
          <p className="logo-motion-copy-title">Privacy Calibration</p>
          <p className="logo-motion-copy-hint">{hintText}</p>
          <button type="button" className="logo-motion-skip" onClick={onCancel}>
            Skip
          </button>
        </div>
      )}

      {/* Completion flash */}
      {showComplete && (
        <div className={`logo-motion-complete${showComplete ? ' logo-motion-complete--visible' : ''}`}>
          Vision restored. Privacy engaged.
        </div>
      )}
    </>
  )
}
