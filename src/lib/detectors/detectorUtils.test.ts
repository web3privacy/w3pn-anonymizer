import { describe, it, expect } from 'vitest'
import { iouBox, nmsPrivacyDetections, dedupeOverlappingDetections, centerBoxToBbox } from './detectorUtils'
import type { PrivacyDetection, PrivacyDetectionType } from '../../types'

function det(id: string, x: number, y: number, w: number, h: number, score = 0.9): PrivacyDetection {
  return {
    id,
    type: 'face',
    bbox: { x, y, width: w, height: h },
    confidence: score,
    sourceModel: 'test',
  }
}

function typedDet(
  id: string,
  type: PrivacyDetectionType,
  x: number,
  y: number,
  w: number,
  h: number,
  score = 0.9,
): PrivacyDetection {
  return { id, type, bbox: { x, y, width: w, height: h }, confidence: score, sourceModel: 'test' }
}

describe('detectorUtils', () => {
  it('computes IoU for overlapping boxes', () => {
    const a = { x: 0, y: 0, width: 0.5, height: 0.5 }
    const b = { x: 0.25, y: 0.25, width: 0.5, height: 0.5 }
    expect(iouBox(a, b)).toBeGreaterThan(0.1)
    expect(iouBox(a, { x: 0.8, y: 0.8, width: 0.1, height: 0.1 })).toBe(0)
  })

  it('NMS suppresses overlapping detections', () => {
    const merged = nmsPrivacyDetections([
      det('a', 0.1, 0.1, 0.2, 0.2, 0.95),
      det('b', 0.12, 0.12, 0.2, 0.2, 0.7),
      det('c', 0.7, 0.7, 0.15, 0.15, 0.85),
    ], 0.4)
    expect(merged).toHaveLength(2)
    expect(merged.some((d) => d.id === 'a')).toBe(true)
    expect(merged.some((d) => d.id === 'c')).toBe(true)
  })

  it('dedupes overlapping cross-type detections into one (single effect per region)', () => {
    // A license_plate and a generic object over the same pixels must collapse to
    // a single detection so only one anonymization effect is applied.
    const merged = dedupeOverlappingDetections([
      typedDet('plate', 'license_plate', 0.30, 0.30, 0.20, 0.10, 0.80),
      typedDet('obj', 'object', 0.31, 0.30, 0.20, 0.10, 0.95),
      typedDet('far', 'object', 0.80, 0.80, 0.10, 0.10, 0.90),
    ], 0.55)
    expect(merged).toHaveLength(2)
    // license_plate wins over the higher-confidence generic object via priority.
    expect(merged.some((d) => d.id === 'plate')).toBe(true)
    expect(merged.some((d) => d.id === 'obj')).toBe(false)
    expect(merged.some((d) => d.id === 'far')).toBe(true)
  })

  it('drops a generic object mostly contained in a featured detection (low IoU)', () => {
    // A small license_plate sitting inside a big generic COCO object (e.g. a car)
    // has low IoU but high containment — the redundant object must be dropped so
    // the plate region is not redacted twice with two effects.
    const merged = dedupeOverlappingDetections([
      typedDet('plate', 'license_plate', 0.45, 0.55, 0.10, 0.05, 0.85),
      typedDet('car', 'object', 0.30, 0.30, 0.40, 0.40, 0.95),
    ], 0.55)
    // The big object is NOT contained in the small plate, so it survives; but a
    // small object inside the plate would be dropped (covered below).
    expect(merged.some((d) => d.id === 'plate')).toBe(true)

    const merged2 = dedupeOverlappingDetections([
      typedDet('plate', 'license_plate', 0.30, 0.30, 0.40, 0.20, 0.85),
      typedDet('obj', 'object', 0.34, 0.33, 0.10, 0.08, 0.95),
    ], 0.55)
    expect(merged2).toHaveLength(1)
    expect(merged2[0].id).toBe('plate')
  })

  it('keeps non-overlapping detections of different types', () => {
    const merged = dedupeOverlappingDetections([
      typedDet('face', 'face', 0.1, 0.1, 0.1, 0.1),
      typedDet('plate', 'license_plate', 0.6, 0.6, 0.2, 0.1),
    ], 0.55)
    expect(merged).toHaveLength(2)
  })

  it('converts center box to bbox', () => {
    expect(centerBoxToBbox(0.5, 0.5, 0.2, 0.4)).toEqual({
      x: 0.4,
      y: 0.3,
      width: 0.2,
      height: 0.4,
    })
  })
})
