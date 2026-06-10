import { describe, it, expect } from 'vitest'
import {
  DEFAULT_VIDEO_FPS,
  resolveVideoFps,
  resolveVideoDuration,
  computeVideoFrameMetrics,
  computeSteppedVideoFrame,
  formatFrameLabel,
  computePlaybackFrameLabel,
  mapPointerToVideoNormalized,
  normalizeDraftZoneFromDrag,
  computeTimedMaskRange,
  computeAdjacentFrameTime,
  formatVideoFrameStamp,
  isDraftZoneTooSmall,
  clampVideoSeekTime,
} from './video-controller'

describe('resolveVideoFps', () => {
  it('falls back to 30 when fps is missing or invalid', () => {
    expect(resolveVideoFps(undefined)).toBe(DEFAULT_VIDEO_FPS)
    expect(resolveVideoFps(0)).toBe(DEFAULT_VIDEO_FPS)
    expect(resolveVideoFps(-1)).toBe(DEFAULT_VIDEO_FPS)
  })
  it('returns positive fps unchanged', () => {
    expect(resolveVideoFps(24)).toBe(24)
  })
})

describe('resolveVideoDuration', () => {
  it('prefers element duration when positive', () => {
    expect(resolveVideoDuration(10, 12.5)).toBe(12.5)
  })
  it('falls back to photo metadata', () => {
    expect(resolveVideoDuration(8, 0)).toBe(8)
    expect(resolveVideoDuration(8, NaN)).toBe(8)
  })
})

describe('computeVideoFrameMetrics', () => {
  it('computes frame index and total for a 10s @ 30fps clip', () => {
    expect(computeVideoFrameMetrics(1.0, 30, 10)).toEqual({ currentFrame: 30, totalFrames: 300 })
  })
  it('clamps frame index to last frame', () => {
    expect(computeVideoFrameMetrics(999, 30, 10).currentFrame).toBe(299)
  })
})

describe('computeSteppedVideoFrame', () => {
  it('steps forward one frame at 30fps', () => {
    const step = computeSteppedVideoFrame(1.0, 1, 30, 10)
    expect(step.nextFrame).toBe(31)
    expect(step.nextTime).toBeCloseTo(31 / 30, 6)
    expect(step.displayFrame).toBe(32)
    expect(step.totalFrames).toBe(300)
  })
  it('does not step before frame 0', () => {
    const step = computeSteppedVideoFrame(0, -1, 30, 10)
    expect(step.nextFrame).toBe(0)
    expect(step.nextTime).toBe(0)
  })
  it('does not step past the last frame', () => {
    const step = computeSteppedVideoFrame(10, 1, 30, 10)
    expect(step.nextFrame).toBe(299)
  })
})

describe('formatFrameLabel / computePlaybackFrameLabel', () => {
  it('formats 1-based frame counter', () => {
    expect(formatFrameLabel(0, 300)).toBe('1/300')
    expect(computePlaybackFrameLabel(1.0, 30, 10)).toBe('31/300')
  })
  it('omits total when duration unknown', () => {
    expect(formatFrameLabel(5, 0)).toBe('6')
  })
})

describe('mapPointerToVideoNormalized', () => {
  const layout = { left: 0.25, top: 0, width: 0.5, height: 1 }
  it('maps center of content area to 0.5, 0.5', () => {
    const pt = mapPointerToVideoNormalized(100, 50, { left: 0, top: 0, width: 200, height: 100 }, layout)
    expect(pt).toEqual({ x: 0.5, y: 0.5 })
  })
  it('returns null for zero-sized bounds', () => {
    expect(mapPointerToVideoNormalized(0, 0, { left: 0, top: 0, width: 0, height: 100 }, layout)).toBeNull()
  })
})

describe('normalizeDraftZoneFromDrag', () => {
  it('builds a normalized rect regardless of drag direction', () => {
    const rect = normalizeDraftZoneFromDrag({ x: 0.8, y: 0.7 }, { x: 0.2, y: 0.3 })
    expect(rect.x).toBeCloseTo(0.2, 6)
    expect(rect.y).toBeCloseTo(0.3, 6)
    expect(rect.width).toBeCloseTo(0.6, 6)
    expect(rect.height).toBeCloseTo(0.4, 6)
  })
})

describe('computeTimedMaskRange', () => {
  it('centers range around current time and clamps to duration', () => {
    expect(computeTimedMaskRange(5, 4, 10)).toEqual({ startSec: 3, endSec: 7 })
  })
  it('enforces minimum span between start and end', () => {
    const { startSec, endSec } = computeTimedMaskRange(0, 0.02, 10)
    expect(endSec - startSec).toBeGreaterThanOrEqual(0.05)
  })
})

describe('computeAdjacentFrameTime', () => {
  it('steps by one frame duration', () => {
    const { newTime, frameIndex } = computeAdjacentFrameTime(1.0, 1, 30, 10)
    expect(newTime).toBeCloseTo(1 + 1 / 30, 6)
    expect(frameIndex).toBe(31)
  })
})

describe('formatVideoFrameStamp', () => {
  it('formats minutes-seconds-centiseconds', () => {
    expect(formatVideoFrameStamp(65.47)).toBe('1-05-46')
  })
})

describe('isDraftZoneTooSmall', () => {
  it('rejects tiny masks', () => {
    expect(isDraftZoneTooSmall(0.005, 0.02)).toBe(true)
    expect(isDraftZoneTooSmall(0.05, 0.05)).toBe(false)
  })
})

describe('clampVideoSeekTime', () => {
  it('clamps to [0, duration]', () => {
    expect(clampVideoSeekTime(-1, 10)).toBe(0)
    expect(clampVideoSeekTime(12, 10)).toBe(10)
  })
})
