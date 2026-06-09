import { useRef, useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { OPTICAL, type OpticalMode } from '../lib/optical-calibration'
import { loadSpiralLogoPaths, getSpiralLogoPathsCache, type SpiralLogoPaths } from '../lib/spiral-logo-paths'
import { usePhoneCalibrationChrome } from '../hooks/usePhoneCalibrationChrome'
import './anonymizer-logo-motion.css'

const SIZE = 407
const CX = SIZE / 2
const CY = SIZE / 2
const OUTER_R = 145
const INNER_R = 148
/** Geometric center of green diamond + inner disc (407 artboard coords). */
const CENTER_PIVOT_X = 204.773
const CENTER_PIVOT_Y = 204.825
const CENTER_DOT_SIZE = 8

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

interface Props {
  mode: OpticalMode
  onActivate: () => void
  onCancel: () => void
  className?: string
}

function CenterArt({ paths }: { paths: SpiralLogoPaths }) {
  return (
    <>
      <path
        d={paths.center}
        fill="#00FF78"
        stroke="black"
        strokeWidth="0.5"
        vectorEffect="non-scaling-stroke"
      />
      {paths.centerDisc && (
        <path
          d={paths.centerDisc}
          fill="black"
          stroke="black"
          strokeWidth="0.5"
          vectorEffect="non-scaling-stroke"
        />
      )}
      <rect
        x={CENTER_PIVOT_X - CENTER_DOT_SIZE / 2}
        y={CENTER_PIVOT_Y - CENTER_DOT_SIZE / 2}
        width={CENTER_DOT_SIZE}
        height={CENTER_DOT_SIZE}
        fill="white"
      />
    </>
  )
}

function SpiralArt({ paths, maskId }: { paths: SpiralLogoPaths; maskId: string }) {
  return (
    <>
      <path
        d={paths.spiral}
        fill="white"
        stroke="black"
        vectorEffect="non-scaling-stroke"
        mask={`url(#${maskId})`}
      />
      <CenterArt paths={paths} />
    </>
  )
}

export function AnonymizerLogoMotion({ mode, onActivate, onCancel, className = '' }: Props) {
  const idleRef = useRef<SVGGElement>(null)
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
    intensity: 0,
  })
  const outerAngleRef = useRef(0)
  const innerAngleRef = useRef(0)
  const prevModeRef = useRef<OpticalMode>('idle')

  const [svgPaths, setSvgPaths] = useState<SpiralLogoPaths | null>(getSpiralLogoPathsCache())
  const [countdown, setCountdown] = useState(0)
  const [showComplete, setShowComplete] = useState(false)
  const phoneChrome = usePhoneCalibrationChrome()

  const isActive = mode === 'spinUp' || mode === 'illusion' || mode === 'coolDown'
  const maskId = 'lm-spiral-mask'

  useEffect(() => {
    loadSpiralLogoPaths().then(setSvgPaths).catch(() => {})
  }, [])

  useEffect(() => {
    const prev = prevModeRef.current
    if (mode === 'spinUp' && prev === 'idle') {
      outerAngleRef.current = angleRef.current
      innerAngleRef.current = angleRef.current
    }
    if (mode === 'idle' && prev !== 'idle' && prev !== 'disabledReducedMotion') {
      angleRef.current = outerAngleRef.current % 360
    }
    prevModeRef.current = mode
  }, [mode])

  useEffect(() => {
    if (mode === 'idle' && (prevModeRef.current === 'coolDown')) {
      setShowComplete(true)
      const t = window.setTimeout(() => setShowComplete(false), 2500)
      return () => window.clearTimeout(t)
    }
    return undefined
  }, [mode])

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

  const tick = useCallback((ts: number) => {
    const dt = Math.min(0.05, (ts - (lastTsRef.current || ts)) / 1000)
    lastTsRef.current = ts
    const s = speedsRef.current
    const m = prevModeRef.current

    let tOuter: number, tInner: number, tIntensity: number
    let lerpRate: number

    if (m === 'spinUp') {
      tOuter = OPTICAL.outerRotationDegPerSec
      tInner = OPTICAL.innerRotationDegPerSec
      tIntensity = 1
      lerpRate = 2.5
    } else if (m === 'illusion') {
      tOuter = OPTICAL.outerRotationDegPerSec
      tInner = OPTICAL.innerRotationDegPerSec
      tIntensity = 1
      lerpRate = 4
    } else if (m === 'coolDown') {
      tOuter = OPTICAL.idleRotationDegPerSec
      tInner = OPTICAL.idleRotationDegPerSec
      tIntensity = 0
      lerpRate = 1.8
    } else {
      tOuter = OPTICAL.idleRotationDegPerSec
      tInner = OPTICAL.idleRotationDegPerSec
      tIntensity = 0
      lerpRate = 3
    }

    const f = Math.min(1, dt * lerpRate)
    s.outer += (tOuter - s.outer) * f
    s.inner += (tInner - s.inner) * f
    s.intensity += (tIntensity - s.intensity) * f

    if (m === 'idle' || m === 'disabledReducedMotion') {
      if (m === 'idle') {
        angleRef.current = (angleRef.current + OPTICAL.idleRotationDegPerSec * dt) % 360
        const el = idleRef.current
        if (el) el.style.transform = `rotate(${angleRef.current}deg)`
      }
    } else {
      outerAngleRef.current += s.outer * dt
      innerAngleRef.current += s.inner * dt

      if (outerRef.current)
        outerRef.current.style.transform = `rotate(${outerAngleRef.current % 360}deg)`
      if (innerRef.current)
        innerRef.current.style.transform = `rotate(${innerAngleRef.current % 360}deg)`

      const intensity = s.intensity
      if (centerRef.current) {
        const cycle = (ts / OPTICAL.pulsePeriodMs) * Math.PI * 2
        const scale = lerp(OPTICAL.pulseScale.min, OPTICAL.pulseScale.max,
          (Math.sin(cycle) + 1) / 2 * intensity)
        centerRef.current.style.transform =
          `rotate(${outerAngleRef.current % 360}deg) scale(${scale})`
      }

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

  const handleClick = () => {
    if (isActive) onCancel()
    else onActivate()
  }

  const showCopy = mode === 'spinUp' || mode === 'illusion'
  const hintText = mode === 'illusion' && countdown > 0
    ? `Focus on the green center \u00B7 ${countdown}s`
    : 'Focus on the green center'

  const chromeLayout = phoneChrome ? 'phone' : 'corner'

  const copyPortal = showCopy && typeof document !== 'undefined'
    ? createPortal(
        <div className={`logo-motion-copy logo-motion-copy--visible logo-motion-copy--${chromeLayout}`}>
          <p className="logo-motion-copy-title">Privacy Calibration</p>
          <p className="logo-motion-copy-hint">{hintText}</p>
          <button type="button" className="logo-motion-skip" onClick={onCancel}>
            Skip
          </button>
        </div>,
        document.body,
      )
    : null

  const completePortal = showComplete && typeof document !== 'undefined'
    ? createPortal(
        <div className={`logo-motion-complete logo-motion-complete--visible logo-motion-complete--${chromeLayout}`}>
          Vision restored. Privacy engaged.
        </div>,
        document.body,
      )
    : null

  const spiralOnly = svgPaths ? (
    <path
      d={svgPaths.spiral}
      fill="white"
      stroke="black"
      vectorEffect="non-scaling-stroke"
      mask={`url(#${maskId})`}
    />
  ) : null

  return (
    <>
      <div className={`logo-motion-wrap${isActive ? ' logo-motion-calibrating' : ''} ${className}`}>
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="logo-motion-svg"
          onClick={handleClick}
          role="img"
          aria-label={isActive ? 'Privacy calibration animation' : 'Anonymizer logo'}
        >
          {svgPaths && (
            <defs>
              <mask id={maskId} fill="white">
                <path d={svgPaths.mask} />
              </mask>
              <clipPath id="lm-clip-outer">
                <path
                  fillRule="evenodd"
                  d={`M-10-10h${SIZE + 20}v${SIZE + 20}H-10z M${CX} ${CY - OUTER_R}a${OUTER_R} ${OUTER_R} 0 1 0 0 ${OUTER_R * 2} ${OUTER_R} ${OUTER_R} 0 1 0 0-${OUTER_R * 2}z`}
                />
              </clipPath>
              <clipPath id="lm-clip-inner">
                <circle cx={CX} cy={CY} r={INNER_R} />
              </clipPath>
            </defs>
          )}

          {!isActive && svgPaths && (
            <g
              ref={idleRef}
              className="logo-motion-idle"
              style={{ transformOrigin: `${CX}px ${CY}px` }}
            >
              <SpiralArt paths={svgPaths} maskId={maskId} />
            </g>
          )}

          {isActive && svgPaths && (
            <>
              <g
                ref={outerRef}
                className="logo-motion-layer-outer"
                style={{ transformOrigin: `${CX}px ${CY}px` }}
                clipPath="url(#lm-clip-outer)"
              >
                {spiralOnly}
              </g>

              <g
                ref={innerRef}
                className="logo-motion-layer-inner"
                style={{ transformOrigin: `${CX}px ${CY}px` }}
                clipPath="url(#lm-clip-inner)"
              >
                {spiralOnly}
              </g>

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

              <g
                ref={centerRef}
                className="logo-motion-center"
                style={{ transformOrigin: `${CENTER_PIVOT_X}px ${CENTER_PIVOT_Y}px` }}
              >
                <CenterArt paths={svgPaths} />
              </g>
            </>
          )}
        </svg>
      </div>

      {copyPortal}
      {completePortal}
    </>
  )
}
