import { RangeWithThumb, type RangeWithThumbProps } from './RangeWithThumb'

interface ToolSliderRowProps extends Omit<RangeWithThumbProps, 'ariaLabel'> {
  label: string
}

export function ToolSliderRow({ label, ...rangeProps }: ToolSliderRowProps) {
  return (
    <div className="tool-slider-row">
      <span className="tool-slider-row-label">{label}</span>
      <RangeWithThumb {...rangeProps} ariaLabel={label} />
    </div>
  )
}
