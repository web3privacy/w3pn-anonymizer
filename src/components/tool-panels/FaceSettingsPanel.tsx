import { Icon } from '../Icon'
import type { DetectionTarget } from '../../types'
import { ToolSliderRow } from '../ToolSliderRow'

interface TargetOption {
  id: DetectionTarget
  label: string
  icon: string
  available: boolean
}

const TARGETS: TargetOption[] = [
  { id: 'faces', label: 'Faces', icon: 'face_retouching_natural', available: true },
  { id: 'plates', label: 'Plates', icon: 'directions_car', available: false },
  { id: 'documents', label: 'Documents', icon: 'description', available: false },
  { id: 'text', label: 'Text', icon: 'subject', available: false },
]

export interface FaceSettingsPanelProps {
  target: DetectionTarget
  onTargetChange: (t: DetectionTarget) => void
  sensitivity: number
  onSensitivityChange: (v: number) => void
  faceOffset: number
  onFaceOffsetChange: (v: number) => void
  thorough: boolean
  onThoroughChange: (v: boolean) => void
  detectEnabled: boolean
  onDetectEnabledChange: (v: boolean) => void
  showBoxes: boolean
  onShowBoxesChange: (v: boolean) => void
  detectorReady: boolean
  isVideo: boolean
  onDetectNow: () => void
  liveMode?: boolean
  compact?: boolean
}

export function FaceSettingsPanel({
  target,
  onTargetChange,
  sensitivity,
  onSensitivityChange,
  faceOffset,
  onFaceOffsetChange,
  thorough,
  onThoroughChange,
  detectEnabled,
  onDetectEnabledChange,
  showBoxes,
  onShowBoxesChange,
  detectorReady,
  isVideo,
  onDetectNow,
  liveMode = false,
  compact = false,
}: FaceSettingsPanelProps) {
  return (
    <div className={`tool-panel tool-panel--face${compact ? ' tool-panel--compact' : ''}`}>
      <div className="detect-settings-section">
        <span className="detect-settings-label">Anonymization target</span>
        <div className="detect-settings-targets">
          {TARGETS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`detect-settings-target${target === opt.id ? ' selected' : ''}${opt.available ? '' : ' disabled'}`}
              onClick={() => opt.available && onTargetChange(opt.id)}
              disabled={!opt.available}
              title={opt.available ? opt.label : `${opt.label} detection — coming soon`}
            >
              <Icon name={opt.icon} size={20} />
              <span>{opt.label}</span>
              {!opt.available && <span className="detect-settings-soon">SOON</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="tool-panel-sliders">
        <ToolSliderRow
          label="Sensitivity"
          min={0}
          max={100}
          value={sensitivity}
          format={(v) => `${v}%`}
          onChange={onSensitivityChange}
        />
        <ToolSliderRow
          label="Face offset"
          min={0}
          max={100}
          value={faceOffset}
          format={(v) => `+${v}%`}
          onChange={onFaceOffsetChange}
        />
      </div>

      {!liveMode && (
        <label className="detect-settings-toggle">
          <input type="checkbox" checked={thorough} onChange={(e) => onThoroughChange(e.target.checked)} />
          <span>Thorough scan</span>
        </label>
      )}

      <label className="detect-settings-toggle">
        <input type="checkbox" checked={detectEnabled} onChange={(e) => onDetectEnabledChange(e.target.checked)} />
        <span>{liveMode ? 'Face detection' : 'Auto-detect on open'}</span>
      </label>

      {!liveMode && (
        <label className="detect-settings-toggle">
          <input type="checkbox" checked={showBoxes} onChange={(e) => onShowBoxesChange(e.target.checked)} />
          <span>Show detection boxes</span>
        </label>
      )}

      {!liveMode && (
        <button
          type="button"
          className="btn btn-sm btn-primary tool-panel-detect-btn"
          onClick={onDetectNow}
          disabled={!detectorReady || isVideo}
        >
          <Icon name="search" size={16} /> {isVideo ? 'Detected per-frame on anonymize' : 'Detect now'}
        </button>
      )}
    </div>
  )
}
