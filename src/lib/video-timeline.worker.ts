import type { Zone } from '../types'

interface VideoTrackKeyframe {
  timeSec: number
  zones: Zone[]
}

interface BuildTimelineRequest {
  id: number
  timeline: VideoTrackKeyframe[]
  totalFrames: number
  fps: number
}

interface BuildTimelineProgress {
  id: number
  type: 'progress'
  done: number
}

interface BuildTimelineResult {
  id: number
  type: 'result'
  frameZones: Zone[][]
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const cloneZone = (zone: Zone): Zone => ({ ...zone })

const interpolateZone = (a: Zone, b: Zone, t: number): Zone => ({
  ...a,
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  width: a.width + (b.width - a.width) * t,
  height: a.height + (b.height - a.height) * t,
  effect: b.effect,
})

function zonesAtTime(timeline: VideoTrackKeyframe[], mediaTime: number): Zone[] {
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

  const span = Math.max(0.001, next.timeSec - prev.timeSec)
  const t = clamp((mediaTime - prev.timeSec) / span, 0, 1)
  const nextById = new Map(next.zones.map((zone) => [zone.id, zone]))

  const zones = prev.zones.map((zone) => {
    const matchingNext = nextById.get(zone.id)
    return matchingNext ? interpolateZone(zone, matchingNext, t) : cloneZone(zone)
  })

  next.zones.forEach((zone) => {
    if (!prev.zones.some((prevZone) => prevZone.id === zone.id) && t > 0.66) zones.push(cloneZone(zone))
  })
  return zones
}

function zonesBetweenKeyframes(prev: VideoTrackKeyframe, next: VideoTrackKeyframe, mediaTime: number): Zone[] {
  if (mediaTime <= prev.timeSec) return prev.zones.map(cloneZone)
  if (mediaTime >= next.timeSec) return next.zones.map(cloneZone)

  const span = Math.max(0.001, next.timeSec - prev.timeSec)
  const t = clamp((mediaTime - prev.timeSec) / span, 0, 1)
  const nextById = new Map(next.zones.map((zone) => [zone.id, zone]))

  const zones = prev.zones.map((zone) => {
    const matchingNext = nextById.get(zone.id)
    return matchingNext ? interpolateZone(zone, matchingNext, t) : cloneZone(zone)
  })

  next.zones.forEach((zone) => {
    if (!prev.zones.some((prevZone) => prevZone.id === zone.id) && t > 0.66) zones.push(cloneZone(zone))
  })
  return zones
}

self.onmessage = (event: MessageEvent<BuildTimelineRequest>) => {
  const { id, timeline, totalFrames, fps } = event.data
  const frameZones: Zone[][] = new Array(totalFrames)
  let keyframeIndex = 0

  for (let frame = 0; frame < totalFrames; frame++) {
    const mediaTime = frame / fps
    while (keyframeIndex < timeline.length - 2 && timeline[keyframeIndex + 1].timeSec < mediaTime) {
      keyframeIndex += 1
    }

    if (timeline.length <= 1 || mediaTime <= timeline[0]?.timeSec || mediaTime >= timeline[timeline.length - 1]?.timeSec) {
      frameZones[frame] = zonesAtTime(timeline, mediaTime)
    } else {
      frameZones[frame] = zonesBetweenKeyframes(timeline[keyframeIndex], timeline[keyframeIndex + 1], mediaTime)
    }

    if ((frame + 1) % 120 === 0) {
      self.postMessage({ id, type: 'progress', done: frame + 1 } satisfies BuildTimelineProgress)
    }
  }

  self.postMessage({ id, type: 'progress', done: totalFrames } satisfies BuildTimelineProgress)
  self.postMessage({ id, type: 'result', frameZones } satisfies BuildTimelineResult)
}

export {}
