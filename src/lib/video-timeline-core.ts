import type { Zone } from '../types'
import type { VideoTimedZone } from './video'

export interface VideoTrackKeyframe {
  timeSec: number
  zones: Zone[]
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}

function coverBothZones(a: Zone, b: Zone): Zone {
  const x = Math.min(a.x, b.x)
  const y = Math.min(a.y, b.y)
  return { ...a, x, y, width: Math.max(a.x + a.width, b.x + b.width) - x,
    height: Math.max(a.y + a.height, b.y + b.height) - y }
}

function cloneZone(zone: Zone): Zone {
  return { ...zone }
}

function coverTrackedMovement(zone: Zone, nextZones: Zone[]): Zone {
  const sameTrack = nextZones.find((next) => next.id === zone.id)
  if (sameTrack) return coverBothZones(zone, sameTrack)
  // A fast target can lose its track ID at sparse sampling rates. Cover possible
  // movement of the same category rather than leaving only disconnected end boxes.
  const candidates = nextZones.filter((next) => next.detectionType === zone.detectionType && next.objectClass === zone.objectClass)
  return candidates.reduce(coverBothZones, cloneZone(zone))
}

function interpolateZone(a: Zone, b: Zone, t: number): Zone {
  return {
    ...a,
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    width: a.width + (b.width - a.width) * t,
    height: a.height + (b.height - a.height) * t,
    effect: b.effect,
  }
}

export function resolveTimedZoneAtTime(timedZone: VideoTimedZone, mediaTime: number): Zone {
  const keyframes = (timedZone.keyframes ?? [])
    .filter((keyframe) => Number.isFinite(keyframe.timeSec))
    .sort((a, b) => a.timeSec - b.timeSec)
  if (keyframes.length === 0) return cloneZone(timedZone.zone)

  if (mediaTime <= keyframes[0].timeSec) return cloneZone(keyframes[0].zone)
  const last = keyframes[keyframes.length - 1]
  if (mediaTime >= last.timeSec) return cloneZone(last.zone)

  let prev = keyframes[0]
  let next = last
  for (let i = 1; i < keyframes.length; i++) {
    if (keyframes[i].timeSec >= mediaTime) {
      next = keyframes[i]
      break
    }
    prev = keyframes[i]
  }
  const span = Math.max(0.001, next.timeSec - prev.timeSec)
  const t = clamp((mediaTime - prev.timeSec) / span, 0, 1)
  return interpolateZone(prev.zone, next.zone, t)
}

export function zonesAtTime(timeline: VideoTrackKeyframe[], mediaTime: number): Zone[] {
  if (timeline.length === 0) return []
  if (mediaTime <= timeline[0].timeSec) return timeline[0].zones.map(cloneZone)

  let prev = timeline[0]
  let next: VideoTrackKeyframe | null = null
  for (let i = 1; i < timeline.length; i++) {
    if (timeline[i].timeSec >= mediaTime) {
      next = timeline[i]
      break
    }
    prev = timeline[i]
  }
  if (!next) return prev.zones.map(cloneZone)

  const zones = prev.zones.map((zone) => coverTrackedMovement(zone, next.zones))

  next.zones.forEach((zone) => {
    if (!prev.zones.some((prevZone) => prevZone.id === zone.id)) zones.push(cloneZone(zone))
  })
  return zones
}

export function zonesBetweenKeyframes(
  prev: VideoTrackKeyframe,
  next: VideoTrackKeyframe,
  mediaTime: number,
): Zone[] {
  if (mediaTime <= prev.timeSec) return prev.zones.map(cloneZone)
  if (mediaTime >= next.timeSec) return next.zones.map(cloneZone)

  const zones = prev.zones.map((zone) => coverTrackedMovement(zone, next.zones))

  next.zones.forEach((zone) => {
    if (!prev.zones.some((prevZone) => prevZone.id === zone.id)) zones.push(cloneZone(zone))
  })
  return zones
}

export function getFrameZonesAtTime(
  timeline: VideoTrackKeyframe[],
  timedZones: VideoTimedZone[],
  mediaTime: number,
): Zone[] {
  let zones: Zone[] = []
  if (timeline.length > 0) {
    if (timeline.length <= 1 || mediaTime <= timeline[0].timeSec || mediaTime >= timeline[timeline.length - 1].timeSec) {
      zones = zonesAtTime(timeline, mediaTime)
    } else {
      let lo = 0
      let hi = timeline.length - 1
      while (lo + 1 < hi) {
        const mid = (lo + hi) >>> 1
        if (timeline[mid].timeSec < mediaTime) lo = mid
        else hi = mid
      }
      const keyframeIndex = lo
      zones = zonesBetweenKeyframes(timeline[keyframeIndex], timeline[keyframeIndex + 1], mediaTime)
    }
  }
  for (const timedZone of timedZones) {
    if (mediaTime >= timedZone.startSec && mediaTime <= timedZone.endSec) {
      zones.push({ ...resolveTimedZoneAtTime(timedZone, mediaTime), id: `${timedZone.id}-t${Math.round(mediaTime * 1000)}` })
    }
  }
  return zones
}

/** Expand per-frame zone lists for the render pass (pure, testable). */
export function expandTimelineFrames(
  timeline: VideoTrackKeyframe[],
  timedZones: VideoTimedZone[],
  fps: number,
  totalFrames: number,
): Zone[][] {
  const frames: Zone[][] = []
  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
    const mediaTime = frameIndex / fps
    frames.push(getFrameZonesAtTime(timeline, timedZones, mediaTime))
  }
  return frames
}
