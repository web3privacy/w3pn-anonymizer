import { useState } from 'react'
import { Icon } from '../Icon'
import type { DetectionCategoryConfig, ModelAvailabilityStatus, PrivacyDetectionType } from '../../types'
import { ToolSliderRow } from '../ToolSliderRow'
import { PrimaryTargetsToggles } from './PrimaryTargetsToggles'
import { DetectionClassListPanel } from './DetectionClassListPanel'

const SENSITIVITY_HINT = 'Higher catches more targets (incl. small / turned faces) but may add false positives.'
const FACE_OFFSET_HINT = 'Grows the anonymized area around each face. Raise it if hair, ears or chin stay visible.'

export interface FaceSettingsPanelProps {
  detectionConfig?: DetectionCategoryConfig[]
  modelStatus?: Record<string, ModelAvailabilityStatus>
  onToggleCategory?: (type: PrivacyDetectionType, enabled: boolean) => void
  enabledClasses?: string[]
  onToggleClass?: (className: string, enabled: boolean) => void
  onSetAllClasses?: (classNames: string[], enabled: boolean) => void
  sensitivity: number
  onSensitivityChange: (v: number) => void
  faceOffset: number
  onFaceOffsetChange: (v: number) => void
  facesEnabled: boolean
  onFacesToggle: (v: boolean) => void
  showBoxes: boolean
  onShowBoxesChange: (v: boolean) => void
  liveMode?: boolean
  compact?: boolean
}

export function FaceSettingsPanel({
  detectionConfig = [],
  modelStatus = {},
  onToggleCategory,
  enabledClasses = [],
  onToggleClass,
  onSetAllClasses,
  sensitivity,
  onSensitivityChange,
  faceOffset,
  onFaceOffsetChange,
  facesEnabled,
  onFacesToggle,
  showBoxes,
  onShowBoxesChange,
  liveMode = false,
  compact = false,
}: FaceSettingsPanelProps) {
  const [classesOpen, setClassesOpen] = useState(false)
  return (
    <div className={`tool-panel tool-panel--face${compact ? ' tool-panel--compact' : ''}`}>
      {onToggleCategory && detectionConfig.length > 0 && (
        <PrimaryTargetsToggles
          detectionConfig={detectionConfig}
          modelStatus={modelStatus}
          facesEnabled={facesEnabled}
          onFacesToggle={onFacesToggle}
          onToggleCategory={onToggleCategory}
          enabledClasses={enabledClasses}
          onSetClasses={(names, enabled) => onSetAllClasses?.(names, enabled)}
          compact={compact}
        />
      )}

      {onToggleClass && onSetAllClasses && (
        <div className="detect-class-section">
          <button
            type="button"
            className={`detect-class-toggle${classesOpen ? ' open' : ''}`}
            onClick={() => setClassesOpen((v) => !v)}
            aria-expanded={classesOpen}
          >
            <span className="detect-class-toggle-text">
              <Icon name="category" size={16} />
              <span>All classes</span>
              {enabledClasses.length > 0 && (
                <span className="detect-class-toggle-count">{enabledClasses.length}</span>
              )}
            </span>
            <Icon name={classesOpen ? 'expand_less' : 'expand_more'} size={18} />
          </button>
          {classesOpen && (
            <DetectionClassListPanel
              modelStatus={modelStatus}
              enabledClasses={enabledClasses}
              onToggleClass={onToggleClass}
              onSetAll={onSetAllClasses}
              compact
            />
          )}
        </div>
      )}

      <div className="tool-panel-sliders">
        <ToolSliderRow
          label="Sensitivity"
          min={0}
          max={100}
          value={sensitivity}
          format={(v) => `${v}%`}
          onChange={onSensitivityChange}
          hint={SENSITIVITY_HINT}
        />
        <ToolSliderRow
          label="Face offset"
          min={0}
          max={100}
          value={faceOffset}
          format={(v) => `+${v}%`}
          onChange={onFaceOffsetChange}
          hint={FACE_OFFSET_HINT}
        />
      </div>

      {!liveMode && (
        <label className="detect-settings-toggle">
          <input type="checkbox" checked={showBoxes} onChange={(e) => onShowBoxesChange(e.target.checked)} />
          <span>Show detection boxes</span>
        </label>
      )}
    </div>
  )
}
