import { detectFaces } from '../detector'
import { runPrivacyDetectionOnSource } from '../privacyDetectionPipeline'
import { faceBoxToPrivacyDetection } from './adapters'
import { hasOperationalNonFaceTargets } from './detection-availability'
import { dedupeOverlappingDetections } from '../detectors/detectorUtils'
import { detectPiiViaOcr, isPiiTextEnabled } from '../detectors/ocrPiiDetector'
import { getCategoryConfig } from '../detection-config'
import type {
  DetectionCategoryConfig,
  ModelAvailabilityStatus,
  PrivacyDetection,
  PrivacyDetectionType,
} from '../../types'

export function applyFaceConfidenceToConfig(
  config: DetectionCategoryConfig[],
  confidence: number,
): DetectionCategoryConfig[] {
  return config.map((c) => (c.type === 'face' ? { ...c, confidenceThreshold: confidence } : c))
}

export function usesExtendedPrivacyDetection(
  config: DetectionCategoryConfig[],
  modelStatus: Record<string, ModelAvailabilityStatus>,
  enabledClasses?: string[],
): boolean {
  if (hasOperationalNonFaceTargets(config, modelStatus)) return true
  // Raw "all classes" require at least one ready YOLO model.
  if ((enabledClasses?.length ?? 0) > 0) {
    return Object.entries(modelStatus).some(
      ([id, status]) => id !== 'yunet-face' && status === 'ready',
    )
  }
  return false
}

export type ImagePrivacyDetectOptions = {
  detectionConfig: DetectionCategoryConfig[]
  modelStatus: Record<string, ModelAvailabilityStatus>
  confidence: number
  thorough: boolean
  robust?: boolean
  enabledClasses?: string[]
}

export type ImagePrivacyDetectResult = {
  detections: PrivacyDetection[]
  counts: Partial<Record<PrivacyDetectionType, number>>
  usedPipeline: boolean
}

/** Face-only uses legacy YuNet path; extended targets use the privacy pipeline. */
export async function detectImagePrivacyDetections(
  canvas: HTMLCanvasElement,
  options: ImagePrivacyDetectOptions,
): Promise<ImagePrivacyDetectResult> {
  const { detectionConfig, modelStatus, confidence, thorough, robust, enabledClasses } = options
  const effectiveConfig = applyFaceConfidenceToConfig(detectionConfig, confidence)
  const runRobust = robust ?? thorough
  const piiEnabled = isPiiTextEnabled(effectiveConfig)
  const piiThreshold = getCategoryConfig(effectiveConfig, 'pii_text')?.confidenceThreshold ?? 0.5

  let detections: PrivacyDetection[]
  let usedPipeline: boolean

  if (usesExtendedPrivacyDetection(effectiveConfig, modelStatus, enabledClasses)) {
    const result = await runPrivacyDetectionOnSource(
      canvas, effectiveConfig, undefined, runRobust, enabledClasses,
    )
    detections = result.detections
    usedPipeline = true
  } else if (getCategoryConfig(effectiveConfig, 'face')?.enabled ?? true) {
    const boxes = await detectFaces(canvas, runRobust, confidence)
    const W = canvas.width
    const H = canvas.height
    detections = boxes.map((b) => faceBoxToPrivacyDetection(b, W, H))
    usedPipeline = false
  } else {
    // Faces disabled and no extended targets → nothing for the legacy path to
    // do. Any PII below still runs through its own OCR branch.
    detections = []
    usedPipeline = false
  }

  // Local OCR-based sensitive-text detection runs independently of the YOLO/face
  // models (still images only). Merge + cross-type dedup keeps one effect per region.
  if (piiEnabled) {
    const piiDetections = await detectPiiViaOcr(canvas, piiThreshold)
    if (piiDetections.length > 0) {
      detections = dedupeOverlappingDetections([...detections, ...piiDetections], 0.55)
      usedPipeline = true
    }
  }

  return { detections, counts: countByType(detections), usedPipeline }
}

function countByType(
  detections: PrivacyDetection[],
): Partial<Record<PrivacyDetectionType, number>> {
  const counts: Partial<Record<PrivacyDetectionType, number>> = {}
  for (const d of detections) counts[d.type] = (counts[d.type] ?? 0) + 1
  return counts
}

export function formatDetectionSummary(
  counts: Partial<Record<PrivacyDetectionType, number>>,
  elapsedMs: number,
  usedPipeline: boolean,
): string {
  const total = Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0)
  if (total === 0) return `No detections. (${elapsedMs} ms locally)`

  const parts = (Object.entries(counts) as [PrivacyDetectionType, number][])
    .filter(([, n]) => (n ?? 0) > 0)
    .map(([type, n]) => `${n} ${type}${n === 1 ? '' : 's'}`)

  const src = usedPipeline ? 'via local models' : 'via local YuNet'
  return `Detected ${parts.join(', ')} ${src} — ${elapsedMs} ms locally.`
}
