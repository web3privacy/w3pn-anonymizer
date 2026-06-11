import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import {
  DEFAULT_DISTORT_STRENGTHS,
  DISTORT_EFFECT_META,
  DISTORT_EFFECT_ORDER,
  type DistortEffectId,
} from '../lib/distort-effects'
import type { AppMobileBindings } from './bindings'
import { MobileRangeWithThumb } from './MobileRangeWithThumb'
import { MobileToolDrawer } from './MobileToolDrawer'

interface MobileDistortDrawerProps {
  b: AppMobileBindings
  liveMode?: boolean
}

function DistortSliderRow({
  label,
  min,
  max,
  value,
  step,
  onChange,
  format,
}: {
  label: string
  min: number
  max: number
  value: number
  step?: number
  onChange: (value: number) => void
  format?: (value: number) => string
}) {
  return (
    <div className="mobile-slider-row-v2">
      <span className="mobile-slider-row-v2-label">{label}</span>
      <MobileRangeWithThumb
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        format={format}
        ariaLabel={label}
      />
    </div>
  )
}

function DistortSettingsPanel({
  id,
  b,
  liveMode,
  videoEditor,
}: {
  id: DistortEffectId
  b: AppMobileBindings
  liveMode: boolean
  videoEditor: boolean
}) {
  const strength = b.distortStrengthByEffect[id] ?? DEFAULT_DISTORT_STRENGTHS[id]

  return (
    <div className="mobile-distort-settings mobile-distort-settings-v2">
      {id === 'halftone' && (
        <>
          {([['Dot size', 'dotSize', 2, 30], ['Contrast', 'halftoneContrast', 0, 100], ['Angle', 'halftoneAngle', 0, 360]] as const).map(([label, key, min, max]) => (
            <DistortSliderRow
              key={key}
              label={label}
              min={min}
              max={max}
              value={b.adjTransformParams[key]}
              onChange={(v) => b.setAdjParam(key, v)}
            />
          ))}
        </>
      )}
      {id === 'glitch' && (
        <DistortSliderRow
          label="Shift"
          min={1}
          max={40}
          value={b.adjTransformParams.glitchShift}
          onChange={(v) => b.setAdjParam('glitchShift', v)}
        />
      )}
      {id === 'pixel-shift' && (
        <>
          <div className="mobile-slider-row-v2 mobile-slider-row-v2--segmented">
            <span className="mobile-slider-row-v2-label">Type</span>
            <div className="mobile-segmented" role="group" aria-label="Pixel shift type">
              {(['wave', 'shear', 'ripple', 'mirror'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`mobile-segmented-btn${b.adjPixelShiftType === opt ? ' active' : ''}`}
                  onClick={() => b.setAdjPixelShiftType(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          {([['X shift', 'pixelShiftX', 1, 60], ['Y shift', 'pixelShiftY', 1, 60]] as const).map(([label, key, min, max]) => (
            <DistortSliderRow
              key={key}
              label={label}
              min={min}
              max={max}
              value={b.adjTransformParams[key]}
              onChange={(v) => b.setAdjParam(key, v)}
            />
          ))}
        </>
      )}
      {id === 'color-shift' && (
        <>
          {([['Hue', 'colorShiftHue', 0, 360], ['Sat', 'colorShiftSat', 0, 100]] as const).map(([label, key, min, max]) => (
            <DistortSliderRow
              key={key}
              label={label}
              min={min}
              max={max}
              value={b.adjTransformParams[key]}
              onChange={(v) => b.setAdjParam(key, v)}
            />
          ))}
        </>
      )}
      <DistortSliderRow
        label="Strength"
        min={1}
        max={80}
        value={strength}
        onChange={(v) => b.setDistortStrength(id, v)}
      />
      {!liveMode && !videoEditor && (
        <div className="mobile-distort-list-actions mobile-distort-list-actions--inline">
          <button
            className="mobile-distort-apply-btn"
            type="button"
            onClick={() => b.commitAdjTransform()}
            disabled={!b.activePhoto || !b.enabledDistorts.includes(id)}
          >
            APPLY
          </button>
        </div>
      )}
    </div>
  )
}

const DISTORT_SLIDE_MS = 220

export function MobileDistortDrawer({ b, liveMode = false }: MobileDistortDrawerProps) {
  const open = b.mobilePanel === 'tool-distort'
  const videoEditor = Boolean(b.activePhoto?.isVideo && !liveMode)
  const [settingsView, setSettingsView] = useState<DistortEffectId | null>(null)
  const [slideToSettings, setSlideToSettings] = useState(false)
  const slideTimerRef = useRef<ReturnType<typeof setTimeout>>()
  // Remember the settings sub-view so reopening the drawer returns to it.
  const lastSettingsRef = useRef<DistortEffectId | null>(null)
  const wasOpenRef = useRef(false)

  const clearSlideTimer = useCallback(() => {
    if (slideTimerRef.current) {
      clearTimeout(slideTimerRef.current)
      slideTimerRef.current = undefined
    }
  }, [])

  const openSettings = useCallback((id: DistortEffectId) => {
    clearSlideTimer()
    lastSettingsRef.current = id
    setSettingsView(id)
    setSlideToSettings(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setSlideToSettings(true))
    })
  }, [clearSlideTimer])

  const backToList = useCallback(() => {
    clearSlideTimer()
    lastSettingsRef.current = null
    setSlideToSettings(false)
    slideTimerRef.current = setTimeout(() => setSettingsView(null), DISTORT_SLIDE_MS)
  }, [clearSlideTimer])

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      if (lastSettingsRef.current) openSettings(lastSettingsRef.current)
    } else if (!open && wasOpenRef.current) {
      clearSlideTimer()
      setSettingsView(null)
      setSlideToSettings(false)
    }
    wasOpenRef.current = open
  }, [open, clearSlideTimer, openSettings])

  useEffect(() => () => clearSlideTimer(), [clearSlideTimer])

  const close = () => {
    clearSlideTimer()
    setSettingsView(null)
    setSlideToSettings(false)
    b.setMobilePanel(null)
  }

  const settingsMeta = settingsView ? DISTORT_EFFECT_META[settingsView] : null
  const inSettings = settingsView !== null

  const header = inSettings && settingsMeta ? (
    <div className="mobile-drawer-header-v2">
      <button type="button" className="mobile-drawer-header-v2-btn" onClick={backToList} aria-label="Back">
        <Icon name="arrow_back" size={20} />
      </button>
      <h2 className="mobile-drawer-header-v2-title">{settingsMeta.label.toUpperCase()}</h2>
      <button type="button" className="mobile-drawer-header-v2-btn mobile-drawer-header-v2-close" onClick={close} aria-label="Close">
        <Icon name="close" size={20} />
      </button>
    </div>
  ) : undefined

  return (
    <MobileToolDrawer
      open={open}
      onClose={close}
      title={inSettings ? (settingsMeta?.label.toUpperCase() ?? 'DISTORT') : 'DISTORT FX'}
      variant="tool"
      header={header}
    >
      <div className="mobile-distort-viewport">
        <div className={`mobile-distort-panels${slideToSettings ? ' show-settings' : ''}`}>
          <div className="mobile-distort-panel mobile-distort-panel-list">
            <div className="mobile-tool-drawer-v2">
            <div className="mobile-distort-list">
              {DISTORT_EFFECT_ORDER.map((id) => {
                const meta = DISTORT_EFFECT_META[id]
                const enabled = b.enabledDistorts.includes(id)
                return (
                  <div
                    key={id}
                    className={`mobile-distort-list-row${enabled ? ' active' : ''}`}
                  >
                    <button
                      type="button"
                      className="mobile-distort-toggle"
                      onClick={() => b.toggleDistortEffect(id)}
                      aria-pressed={enabled}
                    >
                      <span className={`mobile-distort-check${enabled ? ' on' : ''}`} aria-hidden="true">
                        {enabled && <Icon name="check" size={12} />}
                      </span>
                      <Icon name={meta.icon} size={16} />
                      <span className="mobile-distort-name">{meta.label.toUpperCase()}</span>
                    </button>
                    <button
                      type="button"
                      className="mobile-distort-settings-open"
                      onClick={() => openSettings(id)}
                      aria-label={`${meta.label} settings`}
                    >
                      <span className="mobile-distort-settings-hint">Settings</span>
                      <Icon name="chevron_right" size={18} />
                    </button>
                  </div>
                )
              })}
            </div>
            <div className="mobile-distort-list-actions">
              <button className="mobile-distort-reset-btn" type="button" onClick={b.resetAdjTransformPreview}>
                RESET ALL
              </button>
              {videoEditor && (
                <p className="mobile-distort-video-hint">Applied when you Process video</p>
              )}
              {!liveMode && !videoEditor && (
                <button
                  className="mobile-distort-apply-btn"
                  type="button"
                  onClick={() => { b.commitAdjTransform(); close() }}
                  disabled={!b.activePhoto || b.enabledDistorts.length === 0}
                >
                  APPLY TO PHOTO
                </button>
              )}
            </div>
            </div>
          </div>

          <div className="mobile-distort-panel mobile-distort-panel-settings">
            {settingsView ? (
              <DistortSettingsPanel id={settingsView} b={b} liveMode={liveMode} videoEditor={videoEditor} />
            ) : (
              <div className="mobile-distort-settings-placeholder" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>
    </MobileToolDrawer>
  )
}
