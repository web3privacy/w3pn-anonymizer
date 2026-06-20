import { describe, it, expect } from 'vitest'
import {
  formatVideoTime,
  measureVideoContentLayout,
  videoOverlayLayerStyle,
  getVideoFaceScanSensitivity,
  getVideoDetectSettings,
  getVideoPreviewDetectionSize,
  faceRectsSimilar,
  filterDismissedFaceZones,
} from './video-layout'
import type { Zone } from '../types'

describe('formatVideoTime', () => {
  it('formats seconds as m:ss with zero padding', () => {
    expect(formatVideoTime(0)).toBe('0:00')
    expect(formatVideoTime(5)).toBe('0:05')
    expect(formatVideoTime(65)).toBe('1:05')
    expect(formatVideoTime(125)).toBe('2:05')
  })
  it('guards against NaN/negative', () => {
    expect(formatVideoTime(NaN)).toBe('0:00')
    expect(formatVideoTime(-10)).toBe('0:00')
  })
})

describe('measureVideoContentLayout', () => {
  it('returns null for invalid dimensions', () => {
    expect(measureVideoContentLayout(0, 0, 16, 9)).toBeNull()
  })
  it('letterboxes (pillarbox) when container is wider than video', () => {
    // container 2:1, video 1:1 → vertical full, horizontal centered
    const l = measureVideoContentLayout(200, 100, 100, 100)!
    expect(l.top).toBeCloseTo(0, 6)
    expect(l.height).toBeCloseTo(1, 6)
    expect(l.width).toBeCloseTo(0.5, 6)
    expect(l.left).toBeCloseTo(0.25, 6)
  })
  it('letterboxes top/bottom when container is taller', () => {
    const l = measureVideoContentLayout(100, 200, 100, 100)!
    expect(l.left).toBeCloseTo(0, 6)
    expect(l.width).toBeCloseTo(1, 6)
    expect(l.height).toBeCloseTo(0.5, 6)
    expect(l.top).toBeCloseTo(0.25, 6)
  })
})

describe('videoOverlayLayerStyle', () => {
  it('returns undefined for null layout', () => {
    expect(videoOverlayLayerStyle(null)).toBeUndefined()
  })
  it('converts a layout to percentage CSS', () => {
    expect(videoOverlayLayerStyle({ left: 0.25, top: 0, width: 0.5, height: 1 })).toMatchObject({
      left: '25%', top: '0%', width: '50%', height: '100%', right: 'auto', bottom: 'auto',
    })
  })
})

describe('progressive face-scan sensitivity', () => {
  it('increases by 4% per pass, clamped to 100', () => {
    expect(getVideoFaceScanSensitivity(10, 0)).toBe(10)
    expect(getVideoFaceScanSensitivity(10, 2)).toBe(18)
    expect(getVideoFaceScanSensitivity(98, 3)).toBe(100)
  })
  it('derives confidence + thorough from sensitivity/pass', () => {
    const s0 = getVideoDetectSettings(10, 0)
    expect(s0.thorough).toBe(false)
    expect(s0.confidence).toBeCloseTo(0.7 - 0.1 * 0.4, 6)
    expect(getVideoDetectSettings(10, 1).thorough).toBe(true)
  })
})

describe('video preview detection dimensions', () => {
  it('downscales landscape and portrait video to one 640px detector frame', () => {
    expect(getVideoPreviewDetectionSize(1920, 1080)).toEqual({ width: 640, height: 360 })
    expect(getVideoPreviewDetectionSize(1080, 1920)).toEqual({ width: 360, height: 640 })
  })

  it('keeps already-small frames unchanged', () => {
    expect(getVideoPreviewDetectionSize(480, 270)).toEqual({ width: 480, height: 270 })
  })
})

describe('faceRectsSimilar / filterDismissedFaceZones', () => {
  const z = (over: Partial<Zone>): Zone => ({
    id: 'z', x: 0.1, y: 0.1, width: 0.2, height: 0.2, effect: 'blur', emoji: '', ...over,
  })
  it('treats near-equal rects as similar within tolerance', () => {
    expect(faceRectsSimilar({ x: 0.1, y: 0.1, width: 0.2, height: 0.2 }, { x: 0.12, y: 0.11, width: 0.2, height: 0.2 })).toBe(true)
    expect(faceRectsSimilar({ x: 0.1, y: 0.1, width: 0.2, height: 0.2 }, { x: 0.3, y: 0.1, width: 0.2, height: 0.2 })).toBe(false)
  })
  it('filters out zones matching a dismissed rect', () => {
    const zones = [z({ id: 'keep', x: 0.6 }), z({ id: 'drop', x: 0.1 })]
    const out = filterDismissedFaceZones(zones, [{ x: 0.1, y: 0.1, width: 0.2, height: 0.2 }])
    expect(out.map((zz) => zz.id)).toEqual(['keep'])
  })
})
