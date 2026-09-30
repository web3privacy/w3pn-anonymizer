import { describe, expect, it } from 'vitest'
import { buildVideoReviewRanges, buildVideoSampleTimes, normalizeAnalysisSettings } from './video-analysis'
import type { Zone } from '../types'

describe('video analysis scheduling', () => {
  it('checks every output frame including a partial final frame', () => {
    const times = buildVideoSampleTimes(1.05, 30, { mode: 'every-frame', samplesPerSecond: 2, passes: 4 })
    expect(times).toHaveLength(32)
    expect(times[31]).toBe(31 / 30)
    expect(new Set(times).size).toBe(times.length)
  })
  it('additional passes retain all observations and fill different gaps', () => {
    const settings = { mode: 'sampled' as const, samplesPerSecond: 2, passes: 1 }
    const first = buildVideoSampleTimes(3, 30, settings, 1)
    const second = buildVideoSampleTimes(3, 30, settings, 2)
    const third = buildVideoSampleTimes(3, 30, settings, 3)
    expect(first.every((time) => second.includes(time))).toBe(true)
    expect(second.every((time) => third.includes(time))).toBe(true)
    expect(third.length).toBeGreaterThan(second.length)
    expect(second.length).toBeGreaterThan(first.length)
    expect(second).toEqual([...second].sort((a, b) => a - b))
  })
  it('caps sampling at the output frame grid without duplicate work', () => {
    expect(buildVideoSampleTimes(2, 24, { mode: 'sampled', samplesPerSecond: 120, passes: 8 })).toHaveLength(48)
  })
  it('rejects non-finite and invalid settings without unbounded loops', () => {
    expect(normalizeAnalysisSettings({ mode: 'sampled', samplesPerSecond: NaN, passes: Infinity })).toEqual({ mode: 'sampled', samplesPerSecond: 8, passes: 1 })
  })
  it('marks unsampled intervals even when no object was detected', () => {
    const review = buildVideoReviewRanges([{ timeSec: 0, zones: [] }, { timeSec: 1, zones: [] }], 1.05, 30)
    expect(review[0].reasons).toContain('Frames between samples were not analyzed')
  })
  it('marks weak detections and disappearances independently of sample density', () => {
    const zone: Zone = { id: 'a', x: 0.2, y: 0.2, width: 0.2, height: 0.2, effect: 'blackout', emoji: '', confidence: 0.6 }
    const ranges = buildVideoReviewRanges([{ timeSec: 0, zones: [zone] }, { timeSec: 1 / 30, zones: [] }], 2 / 30, 30)
    expect(ranges[0].reasons).toContain('Low detection confidence')
    expect(ranges[0].reasons).toContain('Target appeared or disappeared')
    expect(ranges[0].reasons).not.toContain('Frames between samples were not analyzed')
  })
})
