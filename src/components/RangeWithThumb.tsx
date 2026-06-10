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
  orientation = 'horizontal',
}: RangeWithThumbProps) {
  const [dragValue, setDragValue] = useState<number | null>(null)
  const displayValue = dragValue ?? value
  const pct = max > min ? ((displayValue - min) / (max - min)) * 100 : 0
  const label = format ? format(displayValue) : String(displayValue)

  return (
    <div
      className={`range-with-thumb mobile-range-with-thumb${orientation === 'vertical' ? ' range-with-thumb--vertical' : ''}`}
      style={{ '--mobile-range-pct': pct } as CSSProperties}
    >
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
