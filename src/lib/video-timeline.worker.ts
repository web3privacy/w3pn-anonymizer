import type { Zone } from '../types'
import type { VideoTimedZone } from './video'
import type { VideoTrackKeyframe } from './video-timeline-core'
import { expandTimelineFrames } from './video-timeline-core'

export interface TimelineExpandRequest {
  type: 'expand'
  timeline: VideoTrackKeyframe[]
  timedZones: VideoTimedZone[]
  fps: number
  totalFrames: number
}

export type TimelineExpandResponse =
  | { ok: true; frames: Zone[][] }
  | { ok: false; error: string }

const ctx = self as unknown as DedicatedWorkerGlobalScope

ctx.onmessage = (ev: MessageEvent<TimelineExpandRequest>) => {
  const req = ev.data
  if (req.type !== 'expand') return
  try {
    const frames = expandTimelineFrames(req.timeline, req.timedZones, req.fps, req.totalFrames)
    const res: TimelineExpandResponse = { ok: true, frames }
    ctx.postMessage(res)
  } catch (err) {
    const res: TimelineExpandResponse = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    }
    ctx.postMessage(res)
  }
}

export {}
