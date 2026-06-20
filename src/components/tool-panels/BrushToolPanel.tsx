import { getMobileStrengthLabel, mapPixelateBlockSize, pixelateStrengthForBlockSize } from '../../lib/effects'
import type { AnonymizeEffectId } from '../../types'
import { ToolSliderRow } from '../ToolSliderRow'

interface BrushToolPanelProps {
  brushSize: number
  onBrushSizeChange: (value: number) => void
  brushStrength: number
  onBrushStrengthChange: (value: number) => void
  selectedEffect: AnonymizeEffectId
}

export function BrushToolPanel({
  brushSize,
  onBrushSizeChange,
  brushStrength,
  onBrushStrengthChange,
  selectedEffect,
}: BrushToolPanelProps) {
  const pixelateActive = selectedEffect === 'pixelate'
  const strVal = pixelateActive
    ? mapPixelateBlockSize(brushStrength)
    : Math.min(100, Math.max(1, Math.round(brushStrength * 100)))
  const strLabel = getMobileStrengthLabel(selectedEffect)

  return (
    <div className="tool-panel tool-panel--brush">
      <ToolSliderRow
        label="SIZE"
        min={4}
        max={100}
        value={Math.min(brushSize, 100)}
        onChange={onBrushSizeChange}
      />
      <ToolSliderRow
        label={strLabel}
        min={pixelateActive ? 4 : 1}
        max={pixelateActive ? 52 : 100}
        value={strVal}
        onChange={(v) => onBrushStrengthChange(pixelateActive ? pixelateStrengthForBlockSize(v) : v / 100)}
      />
    </div>
  )
}
