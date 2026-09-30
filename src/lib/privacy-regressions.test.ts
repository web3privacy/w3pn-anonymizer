import { describe, expect, it, vi, afterEach } from 'vitest'
import { cropZones } from './zone-geometry'
import { dedupeOverlappingDetections, nmsPrivacyDetections } from './detectors/detectorUtils'
import { getFrameZonesAtTime } from './video-timeline-core'
import { VideoDetectionTrackStabilizer, getSupportedVideoExportOptions } from './video'
import type { PrivacyDetection, Zone } from '../types'

vi.mock('./effects', () => ({ pickRandomEmoji: () => '🙂', applyColorAdjustments: vi.fn(), applyEffectRect: vi.fn(), isColorAdjNoop: () => true }))
vi.mock('./distort-effects', () => ({ applyDistortPipeline: vi.fn() }))

const zone: Zone = { id: 'face', x: 0.2, y: 0.2, width: 0.4, height: 0.4, effect: 'pixelate', emoji: '🙂' }
const detection = (id: string, x: number): PrivacyDetection => ({ id, type: 'pii_text', bbox: { x, y: 0.2, width: 0.4, height: 0.2 }, confidence: 0.99, sourceModel: 'ocr' })
afterEach(() => vi.unstubAllGlobals())

describe('privacy regressions', () => {
  it.each([nmsPrivacyDetections, dedupeOverlappingDetections])('dedup preserves all protected pixels without mutating detections', (dedupe) => {
    const input = [detection('left', 0.1), detection('right', 0.2)]
    const result = dedupe(input)
    expect(result).toHaveLength(1)
    expect(result[0].bbox.x).toBe(0.1)
    expect(result[0].bbox.x + result[0].bbox.width).toBeCloseTo(0.6)
    expect(input[0].bbox.width).toBe(0.4)
  })
  it('keeps a new target throughout the interval preceding its observation', () => {
    const timeline = [{ timeSec: 0, zones: [] }, { timeSec: 0.125, zones: [zone] }]
    for (const time of [1 / 30, 2 / 30, 3 / 30]) expect(getFrameZonesAtTime(timeline, [], time)).toHaveLength(1)
  })
  it('covers both observed positions instead of lagging behind a moving face', () => {
    const timeline = [{ timeSec: 0, zones: [zone] }, { timeSec: 0.125, zones: [{ ...zone, x: 0.5 }] }]
    const mask = getFrameZonesAtTime(timeline, [], 0.06)[0]
    expect(mask.x).toBe(0.2)
    expect(mask.x + mask.width).toBeCloseTo(0.9)
  })
  it('rebases masks and detector bounds into a clipped crop', () => {
    const result = cropZones([{ ...zone, detectX: 0.2, detectY: 0.2, detectWidth: 0.4, detectHeight: 0.4 }], { x: 0.4, y: 0, width: 0.5, height: 1 })
    expect(result[0].x).toBe(0)
    expect(result[0].width).toBeCloseTo(0.4)
    expect(result[0].detectWidth).toBeCloseTo(0.4)
    expect(cropZones([zone], { x: 0.8, y: 0, width: 0.2, height: 1 })).toEqual([])
  })
  it('protects the first detection, close-ups and short detector dropouts', () => {
    const tracker = new VideoDetectionTrackStabilizer()
    const faces = [{ x: 200, y: 100, width: 480, height: 400, score: 0.99 }]
    const first = tracker.update(faces, 1280, 720, 0, 'pixelate', () => '🙂')
    expect(first).toHaveLength(1)
    const held = tracker.update([], 1280, 720, 0.125, 'pixelate', () => '🙂')
    expect(held).toHaveLength(1)
    expect(held[0].id).toBe(first[0].id)
    expect(tracker.update([], 1280, 720, 1, 'pixelate', () => '🙂')).toEqual([])
  })
  it('does not remove a larger face just because a small one was tracked first', () => {
    const tracker = new VideoDetectionTrackStabilizer()
    const small = { x: 10, y: 10, width: 30, height: 30, score: 0.99 }
    tracker.update([small], 1280, 720, 0, 'blur', () => '🙂')
    const result = tracker.update([small, { x: 700, y: 100, width: 480, height: 400, score: 0.99 }], 1280, 720, 0.125, 'blur', () => '🙂')
    expect(result).toHaveLength(2)
  })
  it('does not relabel MP4/WebM encoders as MOV/OGV, and handles no MediaRecorder', () => {
    vi.stubGlobal('window', { VideoEncoder: class {} })
    vi.stubGlobal('MediaRecorder', undefined)
    const formats = getSupportedVideoExportOptions()
    expect(formats.find((f) => f.id === 'mov')?.supported).toBe(false)
    expect(formats.find((f) => f.id === 'ogv')?.supported).toBe(false)
    expect(formats.find((f) => f.id === 'mp4')?.mimeType).toBe('video/mp4')
  })
})
