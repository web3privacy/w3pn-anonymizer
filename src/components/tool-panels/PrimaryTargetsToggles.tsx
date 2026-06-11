import { Icon } from '../Icon'
import type { DetectionCategoryConfig, ModelAvailabilityStatus, PrivacyDetectionType } from '../../types'
import {
  detectionAvailabilityLabel,
  getDetectionAvailability,
} from '../../lib/detections/detection-availability'
import { VEHICLE_CLASSES } from '../../lib/detections/class-catalog'

export interface PrimaryTargetsTogglesProps {
  detectionConfig: DetectionCategoryConfig[]
  modelStatus: Record<string, ModelAvailabilityStatus>
  /** Faces are driven by the always-available YuNet detector master switch. */
  facesEnabled: boolean
  onFacesToggle: (enabled: boolean) => void
  onToggleCategory: (type: PrivacyDetectionType, enabled: boolean) => void
  enabledClasses: string[]
  /** Bulk enable/disable a set of raw class names (used for the Vehicles group). */
  onSetClasses: (classNames: string[], enabled: boolean) => void
  compact?: boolean
}

interface RowView {
  key: string
  icon: string
  label: string
  enabled: boolean
  status: string | null
  onToggle: (enabled: boolean) => void
}

const ICONS = {
  faces: 'face_retouching_natural',
  person: 'accessibility_new',
  license_plate: 'directions_car',
  document: 'description',
  vehicles: 'commute',
} as const

export function PrimaryTargetsToggles({
  detectionConfig,
  modelStatus,
  facesEnabled,
  onFacesToggle,
  onToggleCategory,
  enabledClasses,
  onSetClasses,
  compact = false,
}: PrimaryTargetsTogglesProps) {
  const cat = (type: PrivacyDetectionType) => detectionConfig.find((c) => c.type === type)
  const statusFor = (type: PrivacyDetectionType) =>
    detectionAvailabilityLabel(getDetectionAvailability(type, modelStatus))
  const vehiclesEnabled = VEHICLE_CLASSES.some((c) => enabledClasses.includes(c))
  const cocoStatus = (() => {
    const s = modelStatus['yolo-coco']
    if (s === 'ready') return null
    if (s === 'loading') return 'Loading…'
    if (s === 'error') return 'Model error'
    return 'Coming soon'
  })()

  const rows: RowView[] = [
    {
      key: 'faces',
      icon: ICONS.faces,
      label: 'Faces',
      enabled: facesEnabled,
      status: null,
      onToggle: onFacesToggle,
    },
  ]

  const person = cat('person')
  if (person) rows.push({
    key: 'person', icon: ICONS.person, label: person.label,
    enabled: person.enabled, status: statusFor('person'),
    onToggle: (v) => onToggleCategory('person', v),
  })

  const plate = cat('license_plate')
  if (plate) rows.push({
    key: 'license_plate', icon: ICONS.license_plate, label: plate.label,
    enabled: plate.enabled, status: statusFor('license_plate'),
    onToggle: (v) => onToggleCategory('license_plate', v),
  })

  const doc = cat('document')
  if (doc) rows.push({
    key: 'document', icon: ICONS.document, label: doc.label,
    enabled: doc.enabled, status: statusFor('document'),
    onToggle: (v) => onToggleCategory('document', v),
  })

  rows.push({
    key: 'vehicles', icon: ICONS.vehicles, label: 'Vehicles',
    enabled: vehiclesEnabled, status: cocoStatus,
    onToggle: (v) => onSetClasses(VEHICLE_CLASSES, v),
  })

  return (
    <div className={`target-toggles${compact ? ' target-toggles--compact' : ''}`}>
      {rows.map((row) => (
        <label key={row.key} className={`target-toggle-row${row.enabled ? ' on' : ''}`}>
          <span className="target-toggle-main">
            <Icon name={row.icon} size={18} filled={row.enabled} />
            <span className="target-toggle-label">{row.label}</span>
            {row.status && <span className="target-toggle-status">{row.status}</span>}
          </span>
          <span className={`mobile-switch${row.enabled ? ' on' : ''}`}>
            <input
              type="checkbox"
              checked={row.enabled}
              onChange={(e) => row.onToggle(e.target.checked)}
            />
            <span className="mobile-switch-track" />
            <span className="mobile-switch-knob" />
          </span>
        </label>
      ))}
    </div>
  )
}
