import { useState, type CSSProperties } from 'react'

export interface RangeWithThumbProps {
  min: number
  max: number
  value: number
  step?: number
  onChange: (value: number) => void
  format?: (value: number) => string
  ariaLabel?: string
  disabled?: boolean
  /** Neutral position used for the change fill. Defaults to 0 for bipolar ranges, otherwise min. */
  defaultValue?: number
  /** Desktop tool strip uses vertical sliders; mobile stays horizontal. */
  orientation?: 'horizontal' | 'vertical'
}

export function RangeWithThumb({
  min,
  max,
  value,
  step,
  onChange,
  format,
  ariaLabel,
  disabled,
  defaultValue,
  orientation = 'horizontal',
}: RangeWithThumbProps) {
  const [dragValue, setDragValue] = useState<number | null>(null)
  const displayValue = dragValue ?? value
  const pct = max > min ? ((displayValue - min) / (max - min)) * 100 : 0
  const neutralValue = Math.max(min, Math.min(max, defaultValue ?? (min < 0 && max > 0 ? 0 : min)))
  // Only bipolar adjustment sliders should fill as a delta around their neutral point.
  // Standard value sliders (0-100, sizes, block widths, etc.) fill from the start.
  const fillNeutralValue = min < 0 && max > 0 ? neutralValue : min
  const neutralPct = max > min ? ((fillNeutralValue - min) / (max - min)) * 100 : 0
  const fillStart = Math.min(pct, neutralPct)
  const fillEnd = Math.max(pct, neutralPct)
  const changed = Math.abs(displayValue - neutralValue) > Math.max(Number(step ?? 1) / 100, 0.0001)
  const label = format ? format(displayValue) : String(displayValue)

  return (
    <div
      className={`range-with-thumb mobile-range-with-thumb${orientation === 'vertical' ? ' range-with-thumb--vertical' : ''}${changed ? ' is-modified' : ''}`}
      style={{
        '--mobile-range-pct': pct,
        '--range-fill-start': `${fillStart}%`,
        '--range-fill-end': `${fillEnd}%`,
        '--range-fill-size': `${fillEnd - fillStart}%`,
      } as CSSProperties}
    >
      <span className="range-progress" aria-hidden="true" />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onInput={(e) => setDragValue(Number(e.currentTarget.value))}
        onChange={(e) => {
          const next = Number(e.target.value)
          setDragValue(null)
          onChange(next)
        }}
        onPointerUp={() => setDragValue(null)}
        onBlur={() => setDragValue(null)}
        aria-label={ariaLabel}
      />
      <span className="mobile-range-thumb-label" aria-hidden="true">{label}</span>
    </div>
  )
}
