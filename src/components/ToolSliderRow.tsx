import { RangeWithThumb, type RangeWithThumbProps } from './RangeWithThumb'
import { InfoHint } from './InfoHint'

interface ToolSliderRowProps extends Omit<RangeWithThumbProps, 'ariaLabel'> {
  label: string
  /** Optional explanatory note tucked behind an info icon at the end of the row. */
  hint?: string
}

export function ToolSliderRow({ label, hint, ...rangeProps }: ToolSliderRowProps) {
  return (
    <div className={`tool-slider-row${hint ? ' tool-slider-row--with-hint' : ''}`}>
      <span className="tool-slider-row-label">{label}</span>
      <RangeWithThumb {...rangeProps} ariaLabel={label} />
      {hint && <InfoHint text={hint} label={`${label} — info`} />}
    </div>
  )
}
