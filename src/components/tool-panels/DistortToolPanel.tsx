import { useState } from 'react'
import { Icon } from '../Icon'
import {
  DEFAULT_DISTORT_STRENGTHS,
  DISTORT_EFFECT_META,
  DISTORT_EFFECT_ORDER,
  type DistortEffectId,
} from '../../lib/distort-effects'
import { DEFAULT_ADJ_TRANSFORM_PARAMS } from '../../lib/editor-constants'
import { ToolSliderRow } from '../ToolSliderRow'

type PixelShiftType = 'wave' | 'shear' | 'ripple' | 'mirror'

type AdjTransformParams = {
  dotSize: number
  halftoneContrast: number
  halftoneAngle: number
  glitchShift: number
  glitchColorSplit: number
  pixelShiftX: number
  pixelShiftY: number
  colorShiftHue: number
  colorShiftSat: number
}

function DistortEffectSettings({
  id,
  strength,
  params,
  pixelShiftType,
  onStrengthChange,
  onParamChange,
  onPixelShiftTypeChange,
}: {
  id: DistortEffectId
  strength: number
  params: AdjTransformParams
  pixelShiftType: PixelShiftType
  onStrengthChange: (v: number) => void
  onParamChange: <K extends keyof AdjTransformParams>(key: K, value: AdjTransformParams[K]) => void
  onPixelShiftTypeChange: (type: PixelShiftType) => void
}) {
  return (
    <div className="tool-distort-settings">
      {id === 'halftone' && (
        <>
          {([['Dot size', 'dotSize', 2, 30], ['Contrast', 'halftoneContrast', 0, 100], ['Angle', 'halftoneAngle', 0, 360]] as const).map(([label, key, min, max]) => (
            <ToolSliderRow
              key={key}
              label={label}
              min={min}
              max={max}
              defaultValue={DEFAULT_ADJ_TRANSFORM_PARAMS[key]}
              value={params[key]}
              onChange={(v) => onParamChange(key, v)}
            />
          ))}
        </>
      )}
      {id === 'glitch' && (
        <ToolSliderRow
          label="Shift"
          min={1}
          max={40}
          defaultValue={DEFAULT_ADJ_TRANSFORM_PARAMS.glitchShift}
          value={params.glitchShift}
          onChange={(v) => onParamChange('glitchShift', v)}
        />
      )}
      {id === 'pixel-shift' && (
        <>
          <div className="tool-slider-row tool-slider-row--segmented">
            <span className="tool-slider-row-label">Type</span>
            <div className="mobile-segmented" role="group" aria-label="Pixel shift type">
              {(['wave', 'shear', 'ripple', 'mirror'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`mobile-segmented-btn${pixelShiftType === opt ? ' active' : ''}`}
                  onClick={() => onPixelShiftTypeChange(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          {([['X shift', 'pixelShiftX', 1, 60], ['Y shift', 'pixelShiftY', 1, 60]] as const).map(([label, key, min, max]) => (
            <ToolSliderRow
              key={key}
              label={label}
              min={min}
              max={max}
              defaultValue={DEFAULT_ADJ_TRANSFORM_PARAMS[key]}
              value={params[key]}
              onChange={(v) => onParamChange(key, v)}
            />
          ))}
        </>
      )}
      {id === 'color-shift' && (
        <>
          {([['Hue', 'colorShiftHue', 0, 360], ['Sat', 'colorShiftSat', 0, 100]] as const).map(([label, key, min, max]) => (
            <ToolSliderRow
              key={key}
              label={label}
              min={min}
              max={max}
              defaultValue={DEFAULT_ADJ_TRANSFORM_PARAMS[key]}
              value={params[key]}
              onChange={(v) => onParamChange(key, v)}
            />
          ))}
        </>
      )}
      <ToolSliderRow
        label="Strength"
        min={1}
        max={80}
        defaultValue={DEFAULT_DISTORT_STRENGTHS[id]}
        value={strength}
        onChange={onStrengthChange}
      />
    </div>
  )
}

export interface DistortToolPanelProps {
  enabledDistorts: DistortEffectId[]
  toggleDistortEffect: (id: DistortEffectId) => void
  distortStrengthByEffect: Record<DistortEffectId, number>
  setDistortStrength: (id: DistortEffectId, value: number) => void
  adjTransformParams: AdjTransformParams
  setAdjParam: <K extends keyof AdjTransformParams>(key: K, value: AdjTransformParams[K]) => void
  adjPixelShiftType: PixelShiftType
  setAdjPixelShiftType: (type: PixelShiftType) => void
  onReset: () => void
  onApply: () => void
  canApply: boolean
  showApply?: boolean
  /** Desktop flyouts keep settings open for every enabled effect. */
  multiExpand?: boolean
}

export function DistortToolPanel({
  enabledDistorts,
  toggleDistortEffect,
  distortStrengthByEffect,
  setDistortStrength,
  adjTransformParams,
  setAdjParam,
  adjPixelShiftType,
  setAdjPixelShiftType,
  onReset,
  onApply,
  canApply,
  showApply = true,
  multiExpand = false,
}: DistortToolPanelProps) {
  const [expandedIds, setExpandedIds] = useState<Set<DistortEffectId>>(() => new Set())

  const setExpanded = (id: DistortEffectId, expanded: boolean) => {
    setExpandedIds((current) => {
      if (!multiExpand) return expanded ? new Set([id]) : new Set()
      const next = new Set(current)
      if (expanded) next.add(id)
      else next.delete(id)
      return next
    })
  }

  return (
    <div className="tool-panel tool-panel--distort">
      <div className="mobile-distort-list">
        {DISTORT_EFFECT_ORDER.map((id) => {
          const meta = DISTORT_EFFECT_META[id]
          const enabled = enabledDistorts.includes(id)
          const expanded = expandedIds.has(id)
          return (
            <div key={id} className={`mobile-distort-list-row${enabled ? ' active' : ''}`}>
              <button
                type="button"
                className="mobile-distort-toggle"
                onClick={() => {
                  toggleDistortEffect(id)
                  if (multiExpand) setExpanded(id, !enabled)
                }}
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
                className={`mobile-distort-settings-open${expanded ? ' expanded' : ''}`}
                onClick={() => setExpanded(id, !expanded)}
                aria-label={`${meta.label} settings`}
                aria-expanded={expanded}
              >
                <span className="mobile-distort-settings-hint">Settings</span>
                <Icon name="expand_more" size={18} />
              </button>
              {expanded && (
                <div className="tool-distort-settings-inline">
                  <DistortEffectSettings
                    id={id}
                    strength={distortStrengthByEffect[id] ?? DEFAULT_DISTORT_STRENGTHS[id]}
                    params={adjTransformParams}
                    pixelShiftType={adjPixelShiftType}
                    onStrengthChange={(v) => setDistortStrength(id, v)}
                    onParamChange={setAdjParam}
                    onPixelShiftTypeChange={setAdjPixelShiftType}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="tool-panel-actions tool-panel-actions--distort">
        <button className="btn btn-sm" type="button" onClick={onReset}>Reset all</button>
        {showApply && (
          <button className="btn btn-sm btn-primary" type="button" onClick={onApply} disabled={!canApply}>
            Apply
          </button>
        )}
      </div>
    </div>
  )
}
