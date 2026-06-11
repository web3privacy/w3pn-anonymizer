import type { DetectionCategoryConfig, ModelAvailabilityStatus, PrivacyDetectionType } from '../../types'

/**
 * Every model that can satisfy a detection type. A type is available if ANY of
 * its backing models is ready (e.g. `screen`/`document` are served by both
 * yolo-coco and the custom privacy model), so a custom-only deployment still
 * exposes those targets. Mirror of MODEL_SUPPORTED_TYPES in yoloDetector.
 */
export const MODELS_FOR_DETECTION_TYPE: Partial<Record<PrivacyDetectionType, string[]>> = {
  face: ['yunet-face'],
  person: ['yolo-coco'],
  license_plate: ['yolo-license-plate'],
  screen: ['yolo-coco', 'yolo-privacy-custom'],
  tattoo: ['yolo-privacy-custom'],
  sign: ['yolo-privacy-custom'],
  document: ['yolo-coco', 'yolo-privacy-custom'],
}

export type DetectionAvailability = 'ready' | 'coming_soon' | 'loading' | 'error'

export function modelIdForDetectionType(type: PrivacyDetectionType): string | undefined {
  return MODELS_FOR_DETECTION_TYPE[type]?.[0]
}

export function getDetectionAvailability(
  type: PrivacyDetectionType,
  modelStatus: Record<string, ModelAvailabilityStatus>,
): DetectionAvailability {
  if (type === 'manual_zone') return 'ready'
  // Sensitive-text (PII) runs on the local OCR engine, whose assets lazy-load
  // on first use; the toggle is always available so it can default to on.
  if (type === 'pii_text') return 'ready'

  const modelIds = MODELS_FOR_DETECTION_TYPE[type]
  if (!modelIds || modelIds.length === 0) return 'coming_soon'

  const statuses = modelIds.map((id) => modelStatus[id] ?? 'missing')
  if (statuses.some((s) => s === 'ready')) return 'ready'
  if (statuses.some((s) => s === 'loading')) return 'loading'
  if (statuses.some((s) => s === 'error')) return 'error'
  // Metadata may exist in repo but ONNX is not bundled — treat as coming soon.
  return 'coming_soon'
}

export function isDetectionTypeOperational(
  type: PrivacyDetectionType,
  modelStatus: Record<string, ModelAvailabilityStatus>,
): boolean {
  return getDetectionAvailability(type, modelStatus) === 'ready'
}

export function detectionAvailabilityLabel(availability: DetectionAvailability): string | null {
  switch (availability) {
    case 'ready': return null
    case 'coming_soon': return 'Coming soon'
    case 'loading': return 'Loading…'
    case 'error': return 'Model error'
    default: return null
  }
}

/** Turn off toggles for targets whose ONNX model is confirmed unavailable.
 * Targets whose model is still loading/probing stay enabled so a slow probe
 * does not race-disable a default-on target (e.g. License plates). */
export function sanitizeDetectionConfig(
  config: DetectionCategoryConfig[],
  modelStatus: Record<string, ModelAvailabilityStatus>,
): DetectionCategoryConfig[] {
  return config.map((cat) => {
    if (!cat.enabled) return cat
    const availability = getDetectionAvailability(cat.type, modelStatus)
    if (availability === 'coming_soon' || availability === 'error') {
      return { ...cat, enabled: false }
    }
    return cat
  })
}

export function hasComingSoonDetectionTypes(
  modelStatus: Record<string, ModelAvailabilityStatus>,
): boolean {
  return (['person', 'license_plate', 'screen', 'tattoo', 'sign', 'document'] as PrivacyDetectionType[])
    .some((type) => getDetectionAvailability(type, modelStatus) === 'coming_soon')
}

export function hasOperationalNonFaceTargets(
  config: DetectionCategoryConfig[],
  modelStatus: Record<string, ModelAvailabilityStatus>,
): boolean {
  // pii_text runs via the separate local OCR branch, not the YOLO pipeline, so
  // it must not force the extended-pipeline route on its own.
  return config.some(
    (c) =>
      c.enabled &&
      c.type !== 'face' &&
      c.type !== 'manual_zone' &&
      c.type !== 'pii_text' &&
      isDetectionTypeOperational(c.type, modelStatus),
  )
}
