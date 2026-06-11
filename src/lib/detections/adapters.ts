import { DETECTION_COLORS, deriveDetectionLabel, effectForDetectionType } from '../detection-config'
import { expandPixelBox } from '../face-offset'
import type {
  AnonymizeEffectId,
  BoundingBox,
  DetectionCategoryConfig,
  FaceBox,
  PrivacyDetection,
  PrivacyDetectionType,
  Zone,
} from '../../types'

export function createDetectionId(prefix = 'det'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function faceBoxToPrivacyDetection(
  box: FaceBox,
  imageW: number,
  imageH: number,
  frameTime?: number,
): PrivacyDetection {
  return {
    id: createDetectionId('face'),
    type: 'face',
    bbox: {
      x: box.x / imageW,
      y: box.y / imageH,
      width: box.width / imageW,
      height: box.height / imageH,
    },
    confidence: box.score ?? 1,
    sourceModel: 'yunet-face',
    frameTime,
    color: DETECTION_COLORS.face,
  }
}

export function pixelBoxToPrivacyDetection(
  box: FaceBox,
  type: PrivacyDetectionType,
  sourceModel: string,
  imageW: number,
  imageH: number,
  frameTime?: number,
): PrivacyDetection {
  return {
    id: createDetectionId(type),
    type,
    bbox: {
      x: box.x / imageW,
      y: box.y / imageH,
      width: box.width / imageW,
      height: box.height / imageH,
    },
    confidence: box.score ?? 1,
    sourceModel,
    frameTime,
    color: DETECTION_COLORS[type],
  }
}

export function privacyDetectionsToFaceBoxes(
  detections: PrivacyDetection[],
  imageW: number,
  imageH: number,
): FaceBox[] {
  return detections
    .filter((d) => !d.hidden)
    .map((d) => ({
      x: d.bbox.x * imageW,
      y: d.bbox.y * imageH,
      width: d.bbox.width * imageW,
      height: d.bbox.height * imageH,
      score: d.confidence,
    }))
}

export function privacyDetectionToZone(
  det: PrivacyDetection,
  options: {
    config: DetectionCategoryConfig[]
    globalEffect: AnonymizeEffectId
    emoji: string
    faceOffsetPercent?: number
    imageW: number
    imageH: number
    zoneId?: string
  },
): Zone {
  const { config, globalEffect, emoji, faceOffsetPercent = 40, imageW, imageH, zoneId } = options
  const effect = effectForDetectionType(det.type, config, globalEffect)

  const px = det.bbox.x * imageW
  const py = det.bbox.y * imageH
  const pw = det.bbox.width * imageW
  const ph = det.bbox.height * imageH

  const expanded = det.type === 'face'
    ? expandPixelBox(px, py, pw, ph, imageW, imageH, faceOffsetPercent)
    : {
        x: det.bbox.x,
        y: det.bbox.y,
        width: det.bbox.width,
        height: det.bbox.height,
      }

  return {
    id: zoneId ?? det.id,
    ...expanded,
    detectX: det.type === 'face' ? det.bbox.x : undefined,
    detectY: det.type === 'face' ? det.bbox.y : undefined,
    detectWidth: det.type === 'face' ? det.bbox.width : undefined,
    detectHeight: det.type === 'face' ? det.bbox.height : undefined,
    effect,
    emoji,
    detectionType: det.type,
    objectClass: det.objectClass,
    label: det.label ?? deriveDetectionLabel(det.type, det.objectClass) ?? undefined,
    confidence: det.confidence,
    sourceModel: det.sourceModel,
    locked: det.locked,
    hidden: det.hidden,
  }
}

export function privacyDetectionsToZones(
  detections: PrivacyDetection[],
  options: Omit<Parameters<typeof privacyDetectionToZone>[1], 'zoneId' | 'emoji'> & {
    emojis: string[]
    createZoneId?: () => string
  },
): Zone[] {
  const visible = detections.filter((d) => !d.hidden)
  return visible.map((det, i) =>
    privacyDetectionToZone(det, {
      ...options,
      emoji: options.emojis[i] ?? options.emojis[0] ?? '😶',
      zoneId: options.createZoneId?.() ?? det.id,
    }),
  )
}

export function zoneToManualDetection(zone: Zone): PrivacyDetection {
  return {
    id: zone.id,
    type: zone.detectionType ?? 'manual_zone',
    bbox: { x: zone.x, y: zone.y, width: zone.width, height: zone.height },
    confidence: zone.confidence ?? 1,
    sourceModel: zone.sourceModel ?? 'manual',
    color: DETECTION_COLORS[zone.detectionType ?? 'manual_zone'],
    locked: zone.locked,
    hidden: zone.hidden,
  }
}

export function normalizedBoxToPixel(box: BoundingBox, w: number, h: number): FaceBox {
  return {
    x: box.x * w,
    y: box.y * h,
    width: box.width * w,
    height: box.height * h,
  }
}

/** Legacy DetectionTarget → PrivacyDetectionType (compat). */
export function legacyTargetToPrivacyType(target: 'faces' | 'plates' | 'documents' | 'text'): PrivacyDetectionType {
  switch (target) {
    case 'faces': return 'face'
    case 'plates': return 'license_plate'
    case 'documents': return 'document'
    case 'text': return 'sign'
    default: return 'face'
  }
}
