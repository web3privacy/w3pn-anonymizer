import type { Zone } from '../types'
import type { VideoTrackKeyframe } from './video-timeline-core'
import type { VideoTimedZone } from './video'
import { expandTimelineFrames } from './video-timeline-core'
import type { TimelineExpandRequest, TimelineExpandResponse } from './video-timeline.worker'

let worker: Worker | null = null
let workerFailed = false

function getWorker(): Worker | null {
  if (workerFailed || typeof Worker === 'undefined') return null
  if (worker) return worker
  try {
    worker = new Worker(new URL('./video-timeline.worker.ts', import.meta.url), { type: 'module' })
    worker.addEventListener('error', () => {
      workerFailed = true
      worker?.terminate()
      worker = null
    })
    return worker
  } catch {
    workerFailed = true
    return null
  }
}

export function isVideoTimelineWorkerAvailable(): boolean {
  return getWorker() !== null
}

export async function expandTimelineViaWorker(
  timeline: VideoTrackKeyframe[],
  timedZones: VideoTimedZone[],
  fps: number,
  totalFrames: number,
  timeoutMs = 30_000,
): Promise<Zone[][] | null> {
  const w = getWorker()
  if (!w || totalFrames <= 0) return null

  const req: TimelineExpandRequest = {
    type: 'expand',
    timeline,
    timedZones,
    fps,
    totalFrames,
  }

  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      cleanup()
      resolve(null)
    }, timeoutMs)

    const onMessage = (ev: MessageEvent<TimelineExpandResponse>) => {
      cleanup()
      const data = ev.data
      if (data.ok) resolve(data.frames)
      else resolve(null)
    }

    const onError = () => {
      cleanup()
      workerFailed = true
      resolve(null)
    }

    const cleanup = () => {
      window.clearTimeout(timer)
      w.removeEventListener('message', onMessage)
      w.removeEventListener('error', onError)
    }

    w.addEventListener('message', onMessage)
    w.addEventListener('error', onError)
    w.postMessage(req)
  })
}

/** Worker when available; otherwise synchronous expansion on the main thread. */
export async function expandTimelineFramesAsync(
  timeline: VideoTrackKeyframe[],
  timedZones: VideoTimedZone[],
  fps: number,
  totalFrames: number,
): Promise<Zone[][]> {
  const fromWorker = await expandTimelineViaWorker(timeline, timedZones, fps, totalFrames)
  if (fromWorker) return fromWorker
  return expandTimelineFrames(timeline, timedZones, fps, totalFrames)
}
