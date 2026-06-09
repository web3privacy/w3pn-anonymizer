import { createPortal } from 'react-dom'
import { Icon } from './Icon'
import type { DetectionTarget } from '../types'

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

interface DetectionSettingsDrawerProps {
  open: boolean
  onClose: () => void
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
  /** Live camera mode — hide photo-only controls. */
  liveMode?: boolean
}

export function DetectionSettingsDrawer({
  open,
  onClose,
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
}: DetectionSettingsDrawerProps) {
  if (!open) return null

  return createPortal(
    <div className="detect-settings-backdrop" onClick={onClose}>
      <div
        className="detect-settings-sheet"
        role="dialog"
        aria-label="Detection settings"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="detect-settings-header">
          <span className="detect-settings-header-spacer" aria-hidden="true" />
          <h2>Detection settings</h2>
          <button type="button" className="detect-settings-close" onClick={onClose} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="detect-settings-body">
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

          <div className="detect-settings-section">
            <div className="detect-settings-slider-head">
              <span className="detect-settings-label">Sensitivity</span>
              <span className="detect-settings-value">{sensitivity}%</span>
            </div>
            <input
              type="range"
              className="field-range"
              min={0}
              max={100}
              value={sensitivity}
              onChange={(e) => onSensitivityChange(Number(e.target.value))}
            />
            <p className="detect-settings-hint">
              Higher catches more faces (including small / turned ones) but may add false positives.
            </p>
          </div>

          <div className="detect-settings-section">
            <div className="detect-settings-slider-head">
              <span className="detect-settings-label">Face offset</span>
              <span className="detect-settings-value">+{faceOffset}%</span>
            </div>
            <input
              type="range"
              className="field-range"
              min={0}
              max={100}
              value={faceOffset}
              onChange={(e) => onFaceOffsetChange(Number(e.target.value))}
            />
            <p className="detect-settings-hint">
              Grows the anonymized area around each face. 0% = exact detection box; raise it if hair, ears or chin stay visible.
            </p>
          </div>

          {!liveMode && (
            <label className="detect-settings-toggle">
              <input type="checkbox" checked={thorough} onChange={(e) => onThoroughChange(e.target.checked)} />
              <span>Thorough scan</span>
              <span className="detect-settings-toggle-hint">Multi-pass tiling for distant / tiny faces (slower)</span>
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
              className="btn btn-primary detect-settings-detect"
              onClick={() => { onDetectNow(); onClose() }}
              disabled={!detectorReady || isVideo}
            >
              <Icon name="search" size={16} /> {isVideo ? 'Detected per-frame on anonymize' : 'Detect now'}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
