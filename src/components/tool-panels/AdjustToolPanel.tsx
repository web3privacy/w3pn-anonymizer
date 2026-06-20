import { COLOR_PRESETS, DEFAULT_COLOR_ADJUSTMENTS, type ColorAdjustments } from '../../types'
import { ToolSliderRow } from '../ToolSliderRow'

const ADJUST_SLIDERS: { key: keyof ColorAdjustments; label: string; extended?: boolean }[] = [
  { key: 'brightness', label: 'Brightness' },
  { key: 'contrast', label: 'Contrast' },
  { key: 'saturation', label: 'Saturation' },
  { key: 'shadows', label: 'Shadows', extended: true },
  { key: 'highlights', label: 'Highlights', extended: true },
]

interface AdjustToolPanelProps {
  colorAdj: ColorAdjustments
  onChange: (next: ColorAdjustments) => void
  onReset: () => void
  onApply?: () => void
  showPresets?: boolean
  showExtended?: boolean
  showApply?: boolean
  applyDisabled?: boolean
}

export function AdjustToolPanel({
  colorAdj,
  onChange,
  onReset,
  onApply,
  showPresets = true,
  showExtended = true,
  showApply = false,
  applyDisabled = false,
}: AdjustToolPanelProps) {
  const sliders = ADJUST_SLIDERS.filter((s) => showExtended || !s.extended)

  return (
    <div className="tool-panel tool-panel--adjust">
      {showPresets && (
        <div className="color-presets">
          {COLOR_PRESETS.filter((p) => !['faded', 'newspaper', '4-colors'].includes(p.id)).map((p) => (
            <button
              key={p.id}
              type="button"
              className={`color-preset-btn${colorAdj.preset === p.id ? ' active' : ''}`}
              onClick={() => onChange({ ...DEFAULT_COLOR_ADJUSTMENTS, ...p.values, preset: p.id })}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
      <div className="tool-panel-sliders">
        {sliders.map(({ key, label }) => (
          <ToolSliderRow
            key={key}
            label={label}
            min={-100}
            max={100}
            defaultValue={0}
            value={colorAdj[key] as number}
            format={(v) => `${v > 0 ? '+' : ''}${v}`}
            onChange={(v) => onChange({ ...colorAdj, [key]: v, preset: 'none' })}
          />
        ))}
      </div>
      <div className="tool-panel-actions">
        <button className="btn btn-sm" type="button" onClick={onReset}>Reset</button>
        {showApply && onApply && (
          <button className="btn btn-sm btn-primary" type="button" onClick={onApply} disabled={applyDisabled}>
            Apply
          </button>
        )}
      </div>
    </div>
  )
}
