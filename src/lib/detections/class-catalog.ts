import type { ModelAvailabilityStatus, PrivacyDetectionType } from '../../types'

/**
 * Catalog of raw object classes each bundled YOLO model can detect. Used by the
 * "All classes" UI so users can toggle individual classes beyond the curated
 * featured targets. The detection pipeline stays metadata-driven (see
 * yolo-*.metadata.json); this catalog must keep class names in sync with them.
 */

// Standard Ultralytics COCO class names (index = model channel).
export const COCO_CLASSES: string[] = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
  'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat',
  'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack',
  'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
  'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
  'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
  'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair',
  'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote',
  'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book',
  'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush',
]

/** COCO classes already represented by a curated featured target (managed at the top of the UI). */
export const FEATURED_COCO_CLASSES = new Set<string>([
  'person', // → person
  'tv', 'laptop', 'cell phone', // → screen
  'book', // → document
])

/** COCO classes grouped under the curated "Vehicles" quick toggle. */
export const VEHICLE_CLASSES: string[] = [
  'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'bicycle',
]

export type ModelClassEntry = {
  modelId: string
  className: string
  /** Featured privacy type this class maps to, if any (then hidden from the extra list). */
  featuredType?: PrivacyDetectionType
}

const COCO_FEATURED_TYPE: Record<string, PrivacyDetectionType> = {
  person: 'person',
  tv: 'screen',
  laptop: 'screen',
  'cell phone': 'screen',
  book: 'document',
}

/** All classes a model can output (featured + extra), in model order. */
export function classesForModel(modelId: string): ModelClassEntry[] {
  if (modelId === 'yolo-coco') {
    return COCO_CLASSES.map((className) => ({
      modelId,
      className,
      featuredType: COCO_FEATURED_TYPE[className],
    }))
  }
  if (modelId === 'yolo-license-plate') {
    return [{ modelId, className: 'license_plate', featuredType: 'license_plate' }]
  }
  return []
}

/** Extra (non-featured) classes available from currently-ready models, deduped by name. */
export function getAvailableExtraClasses(
  modelStatus: Record<string, ModelAvailabilityStatus>,
): ModelClassEntry[] {
  const out: ModelClassEntry[] = []
  const seen = new Set<string>()
  for (const modelId of Object.keys(modelStatus)) {
    if (modelStatus[modelId] !== 'ready') continue
    for (const entry of classesForModel(modelId)) {
      if (entry.featuredType) continue
      if (seen.has(entry.className)) continue
      seen.add(entry.className)
      out.push(entry)
    }
  }
  return out
}

/** Human label for a raw class name (Title Case). */
export function prettyClassName(className: string): string {
  return className.replace(/(^|\s)\w/g, (m) => m.toUpperCase())
}
