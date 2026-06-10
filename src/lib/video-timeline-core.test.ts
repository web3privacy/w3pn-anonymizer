import { describe, expect, it } from 'vitest'
import { expandTimelineFrames, getFrameZonesAtTime } from './video-timeline-core'
import type { VideoTrackKeyframe } from './video-timeline-core'
import type { VideoTimedZone } from './video'

const baseZone = {
  id: 'z1',
  x: 0.1,
  y: 0.2,
  width: 0.3,
  height: 0.4,
  effect: 'blur' as const,
  emoji: '🙂',
}

describe('getFrameZonesAtTime', () => {
  it('returns timed zone when media time is in range', () => {
    const timeline: VideoTrackKeyframe[] = []
    const timed: VideoTimedZone[] = [{
      id: 't1',
      startSec: 1,
      endSec: 2,
      zone: baseZone,
    }]
    const zones = getFrameZonesAtTime(timeline, timed, 1.5)
    expect(zones).toHaveLength(1)
    expect(zones[0].x).toBe(0.1)
  })
})

describe('expandTimelineFrames', () => {
  it('produces one zone list per frame', () => {
    const timeline: VideoTrackKeyframe[] = [{ timeSec: 0, zones: [baseZone] }]
    const frames = expandTimelineFrames(timeline, [], 10, 3)
    expect(frames).toHaveLength(3)
    expect(frames[0]).toHaveLength(1)
  })
})
