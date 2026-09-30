import type { Zone } from '../types'
import type { VideoTrackKeyframe } from './video-timeline-core'

export interface VideoAnalysisSettings { mode: 'every-frame' | 'sampled'; samplesPerSecond: number; passes: number }
export const DEFAULT_VIDEO_ANALYSIS: VideoAnalysisSettings = { mode: 'sampled', samplesPerSecond: 8, passes: 1 }
export interface VideoReviewRange { id: string; startSec: number; endSec: number; reasons: string[] }
export interface VideoAnalysisResult {
  signature: string
  source: Blob
  duration: number
  fps: number
  passes: number
  samples: VideoTrackKeyframe[]
  timeline: VideoTrackKeyframe[]
  review: VideoReviewRange[]
  fullFrameCoverage: boolean
}

export function normalizeAnalysisSettings(settings = DEFAULT_VIDEO_ANALYSIS): VideoAnalysisSettings {
  const finite = (value: number, fallback: number) => Number.isFinite(value) ? value : fallback
  return { mode: settings.mode === 'every-frame' ? 'every-frame' : 'sampled',
    samplesPerSecond: Math.max(0.25, Math.min(120, finite(settings.samplesPerSecond, 8))),
    passes: Math.max(1, Math.min(8, Math.floor(finite(settings.passes, 1)))) }
}

function passOffset(pass: number): number {
  let fraction = 0, divisor = 2
  while (pass > 0) { fraction += (pass % 2) / divisor; pass = Math.floor(pass / 2); divisor *= 2 }
  return fraction
}

/** Each additional pass fills gaps; existing sample times remain stable. */
export function buildVideoSampleTimes(duration: number, fps: number, input = DEFAULT_VIDEO_ANALYSIS, passes = input.passes): number[] {
  const settings = normalizeAnalysisSettings(input)
  const count = Math.max(1, Math.ceil(duration * fps))
  if (settings.mode === 'every-frame' || settings.samplesPerSecond >= fps) {
    return Array.from({ length: count }, (_, frame) => frame / fps)
  }
  const frames = new Set<number>([0, count - 1])
  for (let pass = 0; pass < Math.max(1, passes); pass++) {
    const offset = passOffset(pass)
    for (let sample = 0; (sample + offset) / settings.samplesPerSecond < duration; sample++) {
      frames.add(Math.min(count - 1, Math.round((sample + offset) * fps / settings.samplesPerSecond)))
    }
  }
  return [...frames].sort((a, b) => a - b).map((frame) => frame / fps)
}

export function buildVideoReviewRanges(samples: VideoTrackKeyframe[], duration: number, fps: number): VideoReviewRange[] {
  const ranges: VideoReviewRange[] = []
  const center = (zone: Zone) => [zone.x + zone.width / 2, zone.y + zone.height / 2]
  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i], next = samples[i + 1]
    const endSec = next?.timeSec ?? duration
    const reasons: string[] = []
    if (next && next.timeSec - sample.timeSec > Math.max(0.25, 1.5 / fps)) reasons.push('Frames between samples were not analyzed')
    if (sample.zones.some((zone) => zone.confidence != null && zone.confidence < 0.75)) reasons.push('Low detection confidence')
    if (next && sample.zones.length !== next.zones.length) reasons.push('Target appeared or disappeared')
    if (next && sample.zones.some((zone) => {
      const [x, y] = center(zone)
      return !next.zones.some((other) => {
        const [ox, oy] = center(other)
        return other.detectionType === zone.detectionType && other.objectClass === zone.objectClass && Math.hypot(x - ox, y - oy) < 0.12
      })
    })) reasons.push('Movement or lost tracking')
    if (!reasons.length) continue
    const previous = ranges[ranges.length - 1]
    if (previous && previous.endSec === sample.timeSec && previous.reasons.join('|') === reasons.join('|')) previous.endSec = endSec
    else ranges.push({ id: `${sample.timeSec.toFixed(6)}:${reasons.join('|')}`, startSec: sample.timeSec, endSec, reasons })
  }
  return ranges
}
