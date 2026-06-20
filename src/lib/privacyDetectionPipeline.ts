import type {
  DetectionCategoryConfig,
  DetectorInput,
  DetectorOutput,
  PrivacyDetection,
} from '../types'
import { getCategoryConfig } from './detection-config'
import { nmsPrivacyDetections, dedupeOverlappingDetections } from './detectors/detectorUtils'
import { yoloDetector, probeAllYoloModels, checkYoloNeeded } from './detectors/yoloDetector'
import { yunetFaceDetector, buildDetectorInputFromSource } from './detectors/yunetFaceDetector'

const DEFAULT_OBJECT_CLASS_CONFIDENCE = 0.9

export type PrivacyPipelineResult = DetectorOutput & {
  counts: Partial<Record<string, number>>
}

function applyThresholds(
  detections: PrivacyDetection[],
  config: DetectionCategoryConfig[],
): PrivacyDetection[] {
  return detections.filter((d) => {
    const cat = getCategoryConfig(config, d.type)
    const threshold = cat?.confidenceThreshold ?? (d.type === 'object' ? DEFAULT_OBJECT_CLASS_CONFIDENCE : 0.5)
    return d.confidence >= threshold
  })
}

function countByType(detections: PrivacyDetection[]): Partial<Record<string, number>> {
  const counts: Partial<Record<string, number>> = {}
  for (const d of detections) {
    counts[d.type] = (counts[d.type] ?? 0) + 1
  }
  return counts
}

/**
 * Run enabled privacy detectors and merge results.
 * Face (YuNet) loads as today; YOLO models lazy-load only when non-face targets are enabled.
 */
export async function runPrivacyDetection(
  input: DetectorInput,
  config: DetectionCategoryConfig[],
): Promise<PrivacyPipelineResult> {
  const enabled = config.filter((c) => c.enabled)
  const enabledClasses = input.enabledClasses ?? []
  if (enabled.length === 0 && enabledClasses.length === 0) {
    return { detections: [], counts: {} }
  }

  const timings: Record<string, number> = {}
  const warnings: string[] = []
  let merged: PrivacyDetection[] = []

  const faceEnabled = enabled.some((c) => c.type === 'face')
  if (faceEnabled) {
    const t0 = performance.now()
    const faceOut = await yunetFaceDetector.detect(input, config)
    merged.push(...faceOut.detections)
    timings.yunet = performance.now() - t0
    if (faceOut.warnings) warnings.push(...faceOut.warnings)
    if (faceOut.timings) Object.assign(timings, faceOut.timings)
  }

  const yoloNeeded = await checkYoloNeeded(config, enabledClasses)
  if (yoloNeeded) {
    await probeAllYoloModels()
    const t0 = performance.now()
    const yoloOut = await yoloDetector.detect(input, config)
    merged.push(...yoloOut.detections)
    timings.yolo = performance.now() - t0
    if (yoloOut.warnings) warnings.push(...yoloOut.warnings)
    if (yoloOut.timings) Object.assign(timings, yoloOut.timings)
  }

  merged = applyThresholds(merged, config)
  merged = nmsPrivacyDetections(merged, 0.45)
  // Cross-type dedup: one overlapping region must yield a single zone/effect so
  // we never stack two anonymization effects on the same area.
  merged = dedupeOverlappingDetections(merged, 0.55)

  return {
    detections: merged,
    timings,
    warnings: warnings.length ? warnings : undefined,
    counts: countByType(merged),
  }
}

/** Convenience for canvas/image/video sources. */
export async function runPrivacyDetectionOnSource(
  source: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement,
  config: DetectionCategoryConfig[],
  frameTime?: number,
  robust?: boolean,
  enabledClasses?: string[],
): Promise<PrivacyPipelineResult> {
  const input = buildDetectorInputFromSource(source, frameTime, robust)
  if (enabledClasses && enabledClasses.length > 0) input.enabledClasses = enabledClasses
  return runPrivacyDetection(input, config)
}

export async function preloadPrivacyModels(config: DetectionCategoryConfig[]): Promise<void> {
  if (config.some((c) => c.enabled && c.type === 'face')) {
    await yunetFaceDetector.load()
  }
  if (await checkYoloNeeded(config)) {
    await yoloDetector.load()
  }
}

export { probeAllYoloModels }
