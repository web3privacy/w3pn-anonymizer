import type { AnonymizeEffectId, DetectionCategoryConfig, PrivacyDetectionType } from '../types'

export const DETECTION_COLORS: Record<PrivacyDetectionType, string> = {
  face: '#2f81f7',
  person: '#7C5CFF',
  license_plate: '#FFB000',
  screen: '#00C2FF',
  tattoo: '#FF4FD8',
  sign: '#FF5A3D',
  document: '#FFFFFF',
  pii_text: '#FF3B6B',
  object: '#8AE234',
  manual_zone: '#B6B6B6',
}

export const DETECTION_SHORT_LABELS: Record<PrivacyDetectionType, string> = {
  face: 'face',
  person: 'person',
  license_plate: 'SPZ',
  screen: 'screen',
  tattoo: 'tattoo',
  sign: 'sign',
  document: 'document',
  pii_text: 'PII',
  object: 'object',
  manual_zone: 'zone',
}

export function privacyTargetShortLabel(type: PrivacyDetectionType): string {
  return DETECTION_SHORT_LABELS[type] ?? type
}

/** Tiny caption for a detection on the preview. Faces stay unlabeled by design. */
export function deriveDetectionLabel(
  type: PrivacyDetectionType,
  objectClass?: string,
): string | null {
  if (type === 'face') return null
  if (type === 'object' && objectClass) return objectClass.replace(/(^|\s)\w/g, (m) => m.toUpperCase())
  if (type === 'pii_text') return objectClass ? objectClass.replace(/_/g, ' ') : 'PII'
  return DETECTION_SHORT_LABELS[type] ?? type
}

/** Default anonymization effect per detection type (overridable via global effect for face/manual). */
/** Fallback only — runtime always uses the user's global effect (pixelate by default). */
export const DEFAULT_EFFECT_BY_TYPE: Record<PrivacyDetectionType, AnonymizeEffectId> = {
  face: 'pixelate',
  person: 'pixelate',
  license_plate: 'pixelate',
  screen: 'pixelate',
  tattoo: 'pixelate',
  sign: 'pixelate',
  document: 'pixelate',
  pii_text: 'pixelate',
  object: 'pixelate',
  manual_zone: 'pixelate',
}

export const DEFAULT_DETECTION_CONFIG: DetectionCategoryConfig[] = [
  {
    type: 'face',
    label: 'Faces',
    enabled: true,
    confidenceThreshold: 0.65,
    color: DETECTION_COLORS.face,
    effectId: 'pixelate',
  },
  {
    type: 'person',
    label: 'People / full body',
    enabled: true,
    confidenceThreshold: 0.45,
    color: DETECTION_COLORS.person,
    effectId: 'pixelate',
  },
  {
    type: 'license_plate',
    label: 'License plates / SPZ',
    enabled: true,
    confidenceThreshold: 0.45,
    color: DETECTION_COLORS.license_plate,
    effectId: 'pixelate',
  },
  {
    type: 'screen',
    label: 'Screens / displays',
    enabled: false,
    confidenceThreshold: 0.45,
    color: DETECTION_COLORS.screen,
    effectId: 'pixelate',
  },
  {
    type: 'tattoo',
    label: 'Tattoos',
    enabled: false,
    confidenceThreshold: 0.35,
    color: DETECTION_COLORS.tattoo,
    effectId: 'pixelate',
  },
  {
    type: 'sign',
    label: 'Signs / billboards / shop signs',
    enabled: false,
    confidenceThreshold: 0.4,
    color: DETECTION_COLORS.sign,
    effectId: 'pixelate',
  },
  {
    type: 'document',
    label: 'Documents / papers / IDs',
    enabled: true,
    confidenceThreshold: 0.22,
    color: DETECTION_COLORS.document,
    effectId: 'pixelate',
  },
  {
    type: 'pii_text',
    label: 'Sensitive text (emails, cards, IDs…)',
    enabled: true,
    confidenceThreshold: 0.22,
    color: DETECTION_COLORS.pii_text,
    effectId: 'pixelate',
  },
]

export const VISUAL_DETECTION_TYPES: PrivacyDetectionType[] = DEFAULT_DETECTION_CONFIG.map((c) => c.type)

export function cloneDetectionConfig(config: DetectionCategoryConfig[]): DetectionCategoryConfig[] {
  return config.map((c) => ({ ...c }))
}

export function getCategoryConfig(
  config: DetectionCategoryConfig[],
  type: PrivacyDetectionType,
): DetectionCategoryConfig | undefined {
  return config.find((c) => c.type === type)
}

export function enabledVisualTypes(config: DetectionCategoryConfig[]): PrivacyDetectionType[] {
  return config.filter((c) => c.enabled).map((c) => c.type)
}

export function effectForDetectionType(
  _type: PrivacyDetectionType,
  _config: DetectionCategoryConfig[],
  globalEffect: AnonymizeEffectId,
): AnonymizeEffectId {
  // Every detection shares the single globally selected effect so stacked
  // targets (face + plate + PII box) never get different anonymizations.
  return globalEffect
}

/** Per-type heuristics for video frame detections (face defaults match legacy isLikelyVideoFace). */
export function isLikelyDetection(
  box: { width: number; height: number; score?: number },
  type: PrivacyDetectionType,
  w: number,
  h: number,
): boolean {
  const score = box.score ?? 1
  const aspect = box.width / Math.max(1, box.height)
  const relativeArea = (box.width * box.height) / Math.max(1, w * h)

  switch (type) {
    case 'face':
      return (
        score >= 0.58 &&
        aspect >= 0.55 &&
        aspect <= 1.55 &&
        relativeArea >= 0.00008 &&
        relativeArea <= 0.14
      )
    case 'person':
      return score >= 0.4 && relativeArea >= 0.002 && relativeArea <= 0.55
    case 'license_plate':
      return score >= 0.4 && aspect >= 1.4 && aspect <= 7 && relativeArea >= 0.00002 && relativeArea <= 0.04
    case 'screen':
      return score >= 0.35 && aspect >= 0.5 && aspect <= 2.5 && relativeArea >= 0.005 && relativeArea <= 0.45
    case 'document':
      return score >= 0.35 && aspect >= 0.4 && aspect <= 2.2 && relativeArea >= 0.001 && relativeArea <= 0.35
    case 'sign':
      return score >= 0.35 && relativeArea >= 0.0005 && relativeArea <= 0.25
    case 'tattoo':
      return score >= 0.3 && relativeArea >= 0.00002 && relativeArea <= 0.08
    case 'manual_zone':
      return true
    default:
      return score >= 0.35 && relativeArea >= 0.00002 && relativeArea <= 0.5
  }
}
