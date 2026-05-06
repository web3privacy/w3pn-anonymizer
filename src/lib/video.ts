import { detectFaces, getForceLocal, setForceLocal } from './detector'
import { applyEffectRect, pickRandomEmoji } from './effects'
import type { AnonymizeEffectId, Zone } from '../types'
import fixWebmDuration from 'webm-duration-fix'

export interface VideoProcessingOptions {
  effect: AnonymizeEffectId
  strength: number
  emoji: string
  forceLocal?: boolean
  outputFormat?: VideoExportFormatId
  frameOverrides?: VideoFrameOverride[]
  timedZones?: VideoTimedZone[]
  onProgress?: (current: number, total: number) => void
  onPhase?: (phase: VideoProcessingPhase) => void
  abortSignal?: AbortSignal
}

export interface VideoMetadata {
  width: number
  height: number
  duration: number
  fps: number
}

export interface VideoFrameOverride {
  timeSec: number
  frameBlob: Blob
}

export interface VideoTimedZone {
  id: string
  startSec: number
  endSec: number
  zone: Zone
}

export type VideoProcessingPhase = 'analyzing' | 'preparing' | 'rendering'

export type VideoExportFormatId = 'mp4' | 'webm' | 'mov' | 'avi' | 'mpeg' | 'mkv' | 'ogv'

export interface VideoExportOption {
  id: VideoExportFormatId
  label: string
  ext: string
  mimeType: string | null
  supported: boolean
}

export interface VideoPipelineCapabilities {
  mediaRecorder: boolean
  manualCanvasFrameCapture: boolean
  requestVideoFrameCallback: boolean
  timelineWorker: boolean
  offscreenCanvas: boolean
  webCodecs: boolean
  webCodecsRenderer: boolean
}

interface VideoExportConfig {
  id: VideoExportFormatId
  label: string
  ext: string
  mimeCandidates: string[]
}

type CaptureVideoElement = HTMLVideoElement & {
  captureStream?: () => MediaStream
  mozCaptureStream?: () => MediaStream
}

type ManualCanvasCaptureTrack = MediaStreamTrack & {
  requestFrame?: () => void
}

const VIDEO_EXPORT_CONFIGS: VideoExportConfig[] = [
  { id: 'mp4', label: 'MP4', ext: 'mp4', mimeCandidates: ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4'] },
  { id: 'webm', label: 'WebM', ext: 'webm', mimeCandidates: ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'] },
  { id: 'mov', label: 'MOV', ext: 'mov', mimeCandidates: ['video/quicktime', 'video/mp4'] },
  { id: 'avi', label: 'AVI', ext: 'avi', mimeCandidates: ['video/x-msvideo', 'video/avi'] },
  { id: 'mpeg', label: 'MPEG', ext: 'mpeg', mimeCandidates: ['video/mpeg'] },
  { id: 'mkv', label: 'MKV', ext: 'mkv', mimeCandidates: ['video/x-matroska;codecs=avc1,opus', 'video/x-matroska'] },
  { id: 'ogv', label: 'OGV', ext: 'ogv', mimeCandidates: ['video/ogg;codecs=theora,vorbis', 'video/ogg'] },
]

const FALLBACK_FPS = 30
const VIDEO_BITRATE = 6_000_000
const AUDIO_BITRATE = 128_000
const DETECT_MAX_DIM = 1280
const TRACK_KEEPALIVE_SEC = 0.4
const TRACK_SMOOTHING = 0.34
const VIDEO_ZONE_PADDING = 0.46
const VIDEO_DETECTION_PREROLL_SEC = 0.16
const VIDEO_MIN_FACE_SCORE = 0.42
const VIDEO_MIN_EFFECT_STRENGTH = 0.92

export const VIDEO_RUNTIME_LIMITS = {
  acceptedExtensions: ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', 'ogv'] as const,
  maxUploadBytes: 500 * 1024 * 1024,
  detectMaxDimension: DETECT_MAX_DIM,
  defaultFps: FALLBACK_FPS,
  estimatedFpsRange: { min: 10, max: 60 },
  videoBitrate: VIDEO_BITRATE,
  audioBitrate: AUDIO_BITRATE,
} as const

type WindowWithWebCodecs = Window & {
  VideoEncoder?: unknown
  VideoFrame?: VideoFrameConstructor
  MediaStreamTrackProcessor?: MediaStreamTrackProcessorConstructor
  MediaStreamTrackGenerator?: MediaStreamTrackGeneratorConstructor
}

interface BrowserVideoFrame {
  timestamp?: number
  duration?: number
  close: () => void
}

interface VideoFrameConstructor {
  new(source: CanvasImageSource, init: { timestamp: number; duration?: number }): BrowserVideoFrame
}

interface MediaStreamTrackProcessorConstructor {
  new(init: { track: MediaStreamTrack }): { readable: ReadableStream<BrowserVideoFrame> }
}

interface MediaStreamTrackGenerator extends MediaStreamTrack {
  writable: WritableStream<BrowserVideoFrame>
}

interface MediaStreamTrackGeneratorConstructor {
  new(init: { kind: 'video' }): MediaStreamTrackGenerator
}

interface WebCodecsVideoPipeline {
  VideoFrame: VideoFrameConstructor
  MediaStreamTrackProcessor: MediaStreamTrackProcessorConstructor
  MediaStreamTrackGenerator: MediaStreamTrackGeneratorConstructor
}

interface VideoTrackState {
  id: string
  zone: Zone
  vx: number
  vy: number
  lastSeenTime: number
  lastPredictTime: number
  missed: number
}

interface VideoTrackKeyframe {
  timeSec: number
  zones: Zone[]
}

interface TimelineWorkerProgress {
  id: number
  type: 'progress'
  done: number
}

interface TimelineWorkerResult {
  id: number
  type: 'result'
  frameZones: Zone[][]
}

type TimelineWorkerMessage = TimelineWorkerProgress | TimelineWorkerResult

let timelineWorkerRequestId = 0

function getCaptureStream(video: CaptureVideoElement): MediaStream | null {
  if (typeof video.captureStream === 'function') return video.captureStream()
  if (typeof video.mozCaptureStream === 'function') return video.mozCaptureStream()
  return null
}

function createCanvasStream(
  canvas: HTMLCanvasElement,
  fps: number,
): { stream: MediaStream; videoTrack: MediaStreamTrack; requestFrame: (() => void) | null } {
  const manualStream = canvas.captureStream(0)
  const manualTrack = manualStream.getVideoTracks()[0] as ManualCanvasCaptureTrack | undefined
  if (manualTrack && typeof manualTrack.requestFrame === 'function') {
    return {
      stream: manualStream,
      videoTrack: manualTrack,
      requestFrame: () => manualTrack.requestFrame?.(),
    }
  }

  manualStream.getTracks().forEach((track) => track.stop())
  const stream = canvas.captureStream(fps)
  const videoTrack = stream.getVideoTracks()[0]
  if (!videoTrack) throw new Error('Could not capture processed video track.')
  return { stream, videoTrack, requestFrame: null }
}

function getWebCodecsVideoPipeline(): WebCodecsVideoPipeline | null {
  const win = window as WindowWithWebCodecs
  if (
    typeof win.VideoFrame !== 'function' ||
    typeof win.MediaStreamTrackProcessor !== 'function' ||
    typeof win.MediaStreamTrackGenerator !== 'function'
  ) {
    return null
  }
  return {
    VideoFrame: win.VideoFrame,
    MediaStreamTrackProcessor: win.MediaStreamTrackProcessor,
    MediaStreamTrackGenerator: win.MediaStreamTrackGenerator,
  }
}

function resolveRecorderFormat(preferred?: VideoExportFormatId): VideoExportOption | null {
  const ordered = preferred
    ? [
        ...VIDEO_EXPORT_CONFIGS.filter((cfg) => cfg.id === preferred),
        ...VIDEO_EXPORT_CONFIGS.filter((cfg) => cfg.id !== preferred),
      ]
    : VIDEO_EXPORT_CONFIGS

  for (const config of ordered) {
    const mimeType = config.mimeCandidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? null
    if (mimeType) return { id: config.id, label: config.label, ext: config.ext, mimeType, supported: true }
  }
  return null
}

function videoZoneStrength(zone: Zone, strength: number): number {
  const base = Math.max(strength, VIDEO_MIN_EFFECT_STRENGTH)
  const size = Math.sqrt(Math.max(0, zone.width * zone.height))
  const foregroundBoost = clamp((size - 0.08) / 0.22, 0, 1)

  if (zone.effect === 'blur' || zone.effect === 'zoom-blur') return base * (1.35 + foregroundBoost * 1.7)
  if (zone.effect === 'pixelate' || zone.effect === 'noise' || zone.effect === 'static') return base * (1.15 + foregroundBoost * 0.75)
  return Math.min(1, base)
}

function drawZones(ctx: CanvasRenderingContext2D, zones: Zone[], w: number, h: number, strength: number): void {
  for (const zone of zones) {
    applyEffectRect(
      ctx,
      zone.effect,
      zone.x * w,
      zone.y * h,
      zone.width * w,
      zone.height * h,
      videoZoneStrength(zone, strength),
      zone.emoji,
    )
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function zoneCenter(zone: Zone): { x: number; y: number } {
  return { x: zone.x + zone.width / 2, y: zone.y + zone.height / 2 }
}

function zoneIou(a: Zone, b: Zone): number {
  const ax2 = a.x + a.width
  const ay2 = a.y + a.height
  const bx2 = b.x + b.width
  const by2 = b.y + b.height
  const ix = Math.max(0, Math.min(ax2, bx2) - Math.max(a.x, b.x))
  const iy = Math.max(0, Math.min(ay2, by2) - Math.max(a.y, b.y))
  const intersection = ix * iy
  if (intersection <= 0) return 0
  const union = a.width * a.height + b.width * b.height - intersection
  return union > 0 ? intersection / union : 0
}

function faceToZone(
  face: { x: number; y: number; width: number; height: number },
  w: number,
  h: number,
  effect: AnonymizeEffectId,
  emoji: string,
): Zone {
  const padX = face.width * VIDEO_ZONE_PADDING
  const padY = face.height * VIDEO_ZONE_PADDING
  const x = face.x - padX
  const y = face.y - padY
  const width = face.width + padX * 2
  const height = face.height + padY * 2
  return {
    id: '',
    x: clamp(x / w, 0, 1),
    y: clamp(y / h, 0, 1),
    width: clamp(width / w, 0.001, 1),
    height: clamp(height / h, 0.001, 1),
    effect,
    emoji,
  }
}

function isLikelyVideoFace(face: { width: number; height: number; score?: number }, w: number, h: number): boolean {
  const score = face.score ?? 1
  const aspect = face.width / Math.max(1, face.height)
  const relativeArea = (face.width * face.height) / Math.max(1, w * h)
  return (
    score >= VIDEO_MIN_FACE_SCORE &&
    aspect >= 0.45 &&
    aspect <= 1.75 &&
    relativeArea >= 0.00002
  )
}

function stabilizeTracks(
  tracks: VideoTrackState[],
  detections: Zone[],
  mediaTime: number,
  nextTrackId: () => string,
  nextTrackEmoji: () => string,
): VideoTrackState[] {
  const unmatchedTracks = new Set(tracks.map((_, index) => index))
  const nextTracks = [...tracks]

  detections.forEach((det) => {
    let bestTrackIndex = -1
    let bestScore = 0
    const dc = zoneCenter(det)

    unmatchedTracks.forEach((trackIndex) => {
      const track = nextTracks[trackIndex]
      const tc = zoneCenter(track.zone)
      const dist = Math.hypot(dc.x - tc.x, dc.y - tc.y)
      const score = zoneIou(track.zone, det) * 1.5 + Math.max(0, 0.35 - dist)
      if (score > bestScore) {
        bestScore = score
        bestTrackIndex = trackIndex
      }
    })

    if (bestTrackIndex >= 0 && bestScore > 0.12) {
      const track = nextTracks[bestTrackIndex]
      const prevCenter = zoneCenter(track.zone)
      const dt = Math.max(1 / FALLBACK_FPS, mediaTime - track.lastSeenTime)
      const smoothed: Zone = {
        ...track.zone,
        x: track.zone.x + (det.x - track.zone.x) * TRACK_SMOOTHING,
        y: track.zone.y + (det.y - track.zone.y) * TRACK_SMOOTHING,
        width: track.zone.width + (det.width - track.zone.width) * TRACK_SMOOTHING,
        height: track.zone.height + (det.height - track.zone.height) * TRACK_SMOOTHING,
        effect: det.effect,
      }
      const nextCenter = zoneCenter(smoothed)
      nextTracks[bestTrackIndex] = {
        ...track,
        zone: smoothed,
        vx: (nextCenter.x - prevCenter.x) / dt,
        vy: (nextCenter.y - prevCenter.y) / dt,
        lastSeenTime: mediaTime,
        lastPredictTime: mediaTime,
        missed: 0,
      }
      unmatchedTracks.delete(bestTrackIndex)
    } else {
      const id = nextTrackId()
      nextTracks.push({
        id,
        zone: { ...det, id, emoji: nextTrackEmoji() },
        vx: 0,
        vy: 0,
        lastSeenTime: mediaTime,
        lastPredictTime: mediaTime,
        missed: 0,
      })
    }
  })

  unmatchedTracks.forEach((trackIndex) => {
    nextTracks[trackIndex] = { ...nextTracks[trackIndex], missed: nextTracks[trackIndex].missed + 1 }
  })

  return nextTracks.filter((track) => mediaTime - track.lastSeenTime <= TRACK_KEEPALIVE_SEC && track.missed < 4)
}

function predictTrackZones(tracks: VideoTrackState[], mediaTime: number): Zone[] {
  tracks.forEach((track) => {
    const dt = clamp(mediaTime - track.lastPredictTime, 0, 0.25)
    if (dt > 0) {
      track.zone.x = clamp(track.zone.x + track.vx * dt, 0, 1 - track.zone.width)
      track.zone.y = clamp(track.zone.y + track.vy * dt, 0, 1 - track.zone.height)
      track.lastPredictTime = mediaTime
    }
  })
  return tracks.map((track) => track.zone)
}

function cloneZone(zone: Zone): Zone {
  return { ...zone }
}

function pushVideoKeyframe(timeline: VideoTrackKeyframe[], timeSec: number, zones: Zone[]): void {
  const safeTime = Math.max(0, timeSec)
  const clonedZones = zones.map(cloneZone)
  const last = timeline[timeline.length - 1]
  if (!last || safeTime > last.timeSec + 0.001) {
    timeline.push({ timeSec: safeTime, zones: clonedZones })
    return
  }
  if (last && Math.abs(last.timeSec - safeTime) <= 0.001) {
    last.zones = clonedZones
  }
}

function buildFrameSampleTimes(duration: number, fps: number): number[] {
  const frameDuration = 1 / Math.max(1, fps)
  const totalFrames = Math.max(1, Math.ceil(duration * fps))
  const lastSampleTime = Math.max(0, duration - frameDuration)
  const sampleTimes: number[] = []

  for (let frame = 0; frame < totalFrames; frame++) {
    const timeSec = Math.min(lastSampleTime, frame * frameDuration)
    const previous = sampleTimes[sampleTimes.length - 1]
    if (previous == null || timeSec > previous + 0.0005) sampleTimes.push(timeSec)
  }

  if (sampleTimes.length === 0) sampleTimes.push(0)
  return sampleTimes
}

async function normalizeRecordedVideoBlob(blob: Blob, mimeType: string): Promise<Blob> {
  const type = blob.type || mimeType
  if (!type.toLowerCase().includes('webm')) return blob

  try {
    const fixed = await fixWebmDuration(new Blob([blob], { type }))
    return fixed.type ? fixed : new Blob([fixed], { type })
  } catch (err) {
    console.warn('WebM duration repair failed; returning original recorder blob.', err)
    return blob
  }
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

async function buildFrameZonesFallback(
  timeline: VideoTrackKeyframe[],
  totalFrames: number,
  fps: number,
  abortSignal?: AbortSignal,
  onProgress?: (done: number) => void,
): Promise<Zone[][]> {
  const frameZones: Zone[][] = new Array(totalFrames)
  let keyframeIndex = 0
  for (let frame = 0; frame < totalFrames; frame++) {
    if (abortSignal?.aborted) throw new DOMException('Aborted', 'AbortError')
    const mediaTime = frame / fps
    while (keyframeIndex < timeline.length - 2 && timeline[keyframeIndex + 1].timeSec < mediaTime) {
      keyframeIndex += 1
    }
    if (timeline.length <= 1 || mediaTime <= timeline[0]?.timeSec || mediaTime >= timeline[timeline.length - 1]?.timeSec) {
      frameZones[frame] = zonesAtTime(timeline, mediaTime)
    } else {
      frameZones[frame] = zonesBetweenKeyframes(timeline[keyframeIndex], timeline[keyframeIndex + 1], mediaTime)
    }
    const done = frame + 1
    if (done % 120 === 0 || done === totalFrames) {
      onProgress?.(done)
      await new Promise<void>((resolve) => window.setTimeout(resolve, 0))
    }
  }
  return frameZones
}

async function buildFrameZones(
  timeline: VideoTrackKeyframe[],
  totalFrames: number,
  fps: number,
  abortSignal?: AbortSignal,
  onProgress?: (done: number) => void,
): Promise<Zone[][]> {
  if (typeof Worker === 'undefined') {
    return buildFrameZonesFallback(timeline, totalFrames, fps, abortSignal, onProgress)
  }

  try {
    return await new Promise<Zone[][]>((resolve, reject) => {
      if (abortSignal?.aborted) {
        reject(new DOMException('Aborted', 'AbortError'))
        return
      }

      const id = ++timelineWorkerRequestId
      const worker = new Worker(new URL('./video-timeline.worker.ts', import.meta.url), { type: 'module' })
      const cleanup = () => {
        worker.removeEventListener('message', onMessage)
        worker.removeEventListener('error', onError)
        abortSignal?.removeEventListener('abort', onAbort)
        worker.terminate()
      }
      const onAbort = () => {
        cleanup()
        reject(new DOMException('Aborted', 'AbortError'))
      }
      const onError = (event: ErrorEvent) => {
        cleanup()
        reject(event.error instanceof Error ? event.error : new Error(event.message || 'Timeline worker failed'))
      }
      const onMessage = (event: MessageEvent<TimelineWorkerMessage>) => {
        if (event.data.id !== id) return
        if (event.data.type === 'progress') {
          onProgress?.(event.data.done)
          return
        }
        cleanup()
        resolve(event.data.frameZones)
      }

      worker.addEventListener('message', onMessage)
      worker.addEventListener('error', onError)
      abortSignal?.addEventListener('abort', onAbort, { once: true })
      worker.postMessage({ id, timeline, totalFrames, fps })
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    console.warn('Timeline worker unavailable, falling back to main-thread frame map.', err)
    return buildFrameZonesFallback(timeline, totalFrames, fps, abortSignal, onProgress)
  }
}

function addTimedZonesToFrameMap(frameZones: Zone[][], timedZones: VideoTimedZone[], fps: number): void {
  timedZones.forEach((timedZone) => {
    const startFrame = clamp(Math.floor(timedZone.startSec * fps), 0, frameZones.length - 1)
    const endFrame = clamp(Math.ceil(timedZone.endSec * fps), startFrame, frameZones.length - 1)
    for (let frame = startFrame; frame <= endFrame; frame++) {
      frameZones[frame] = [
        ...(frameZones[frame] ?? []),
        { ...timedZone.zone, id: `${timedZone.id}-f${frame}` },
      ]
    }
  })
}

function waitForSeek(video: HTMLVideoElement, timeSec: number): Promise<void> {
  const targetTime = Math.min(Math.max(0, timeSec), Number.isFinite(video.duration) ? video.duration : timeSec)
  if (Math.abs(video.currentTime - targetTime) < 0.001) return Promise.resolve()
  return new Promise<void>((resolve, reject) => {
    const onSeeked = () => {
      cleanup()
      resolve()
    }
    const onError = () => {
      cleanup()
      reject(new Error('Video seek failed'))
    }
    const cleanup = () => {
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
    }
    video.addEventListener('seeked', onSeeked, { once: true })
    video.addEventListener('error', onError, { once: true })
    video.currentTime = targetTime
  })
}

function waitForVideoEvent(video: HTMLVideoElement, eventName: 'loadeddata' | 'loadedmetadata' | 'ended'): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const onResolve = () => {
      cleanup()
      resolve()
    }
    const onReject = () => {
      cleanup()
      reject(new Error(`Video event failed: ${eventName}`))
    }
    const cleanup = () => {
      video.removeEventListener(eventName, onResolve)
      video.removeEventListener('error', onReject)
    }
    video.addEventListener(eventName, onResolve, { once: true })
    video.addEventListener('error', onReject, { once: true })
  })
}

function waitForVideoEndedOrAbort(video: HTMLVideoElement, abortSignal?: AbortSignal): Promise<void> {
  if (abortSignal?.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'))
  return new Promise<void>((resolve, reject) => {
    const onEnded = () => {
      cleanup()
      resolve()
    }
    const onAbort = () => {
      cleanup()
      reject(new DOMException('Aborted', 'AbortError'))
    }
    const onError = () => {
      cleanup()
      reject(new Error('Video event failed: ended'))
    }
    const cleanup = () => {
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('error', onError)
      abortSignal?.removeEventListener('abort', onAbort)
    }
    video.addEventListener('ended', onEnded, { once: true })
    video.addEventListener('error', onError, { once: true })
    abortSignal?.addEventListener('abort', onAbort, { once: true })
  })
}

function normalizeEstimatedFps(fps: number): number {
  if (!Number.isFinite(fps) || fps <= 0) return FALLBACK_FPS
  const commonRates = [23.976, 24, 25, 29.97, 30, 50, 59.94, 60]
  const closest = commonRates.reduce((best, candidate) => (
    Math.abs(candidate - fps) < Math.abs(best - fps) ? candidate : best
  ), commonRates[0])
  if (Math.abs(closest - fps) <= 1.25) return closest
  return clamp(Math.round(fps), 10, 60)
}

async function estimateVideoFps(video: HTMLVideoElement, abortSignal?: AbortSignal): Promise<number> {
  if (typeof video.requestVideoFrameCallback !== 'function' || !Number.isFinite(video.duration) || video.duration < 0.4) {
    return FALLBACK_FPS
  }

  const originalMuted = video.muted
  const originalVolume = video.volume
  let callbackHandle: number | null = null

  try {
    await waitForSeek(video, 0)
    video.muted = true
    video.volume = 0

    return await new Promise<number>((resolve, reject) => {
      if (abortSignal?.aborted) {
        reject(new DOMException('Aborted', 'AbortError'))
        return
      }

      let settled = false
      let startMediaTime: number | null = null
      let startPresentedFrames: number | null = null
      let bestEstimate = FALLBACK_FPS

      const cleanup = () => {
        if (callbackHandle != null && typeof video.cancelVideoFrameCallback === 'function') {
          video.cancelVideoFrameCallback(callbackHandle)
        }
        callbackHandle = null
        window.clearTimeout(timeoutId)
        abortSignal?.removeEventListener('abort', onAbort)
      }
      const finish = (fps: number) => {
        if (settled) return
        settled = true
        cleanup()
        resolve(normalizeEstimatedFps(fps))
      }
      const fail = (err: unknown) => {
        if (settled) return
        settled = true
        cleanup()
        reject(err)
      }
      const onAbort = () => fail(new DOMException('Aborted', 'AbortError'))
      const sampleLimitSec = Math.min(1.2, Math.max(0.25, video.duration - 0.05))
      const timeoutId = window.setTimeout(() => finish(bestEstimate), 1800)

      abortSignal?.addEventListener('abort', onAbort, { once: true })

      const onVideoFrame: VideoFrameRequestCallback = (_, metadata) => {
        callbackHandle = null
        if (abortSignal?.aborted) {
          onAbort()
          return
        }

        if (startMediaTime == null || startPresentedFrames == null) {
          startMediaTime = metadata.mediaTime
          startPresentedFrames = metadata.presentedFrames
        } else {
          const elapsed = metadata.mediaTime - startMediaTime
          const frames = metadata.presentedFrames - startPresentedFrames
          if (elapsed > 0 && frames > 0) bestEstimate = frames / elapsed
          if (elapsed >= 0.55 && frames >= 8) {
            finish(bestEstimate)
            return
          }
        }

        if (metadata.mediaTime >= sampleLimitSec) {
          finish(bestEstimate)
          return
        }

        callbackHandle = video.requestVideoFrameCallback(onVideoFrame)
      }

      callbackHandle = video.requestVideoFrameCallback(onVideoFrame)
      video.play().catch((err) => finish(err instanceof DOMException ? FALLBACK_FPS : bestEstimate))
    })
  } finally {
    video.pause()
    video.muted = originalMuted
    video.volume = originalVolume
    await waitForSeek(video, 0).catch(() => undefined)
  }
}

/**
 * Extract a poster frame (first visible frame) from a video blob.
 */
export async function extractPosterFrame(videoBlob: Blob): Promise<{ blob: Blob; width: number; height: number }> {
  const url = URL.createObjectURL(videoBlob)
  try {
    const video = document.createElement('video')
    video.muted = true
    video.preload = 'auto'
    video.src = url

    await waitForVideoEvent(video, 'loadeddata')

    video.currentTime = Math.min(0.1, video.duration / 2)
    await new Promise<void>((resolve) => { video.onseeked = () => resolve() })

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0)

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Poster capture failed')), 'image/jpeg', 0.9)
    })

    return { blob, width: video.videoWidth, height: video.videoHeight }
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 * Get video metadata without fully decoding it.
 */
export async function getVideoMetadata(videoBlob: Blob): Promise<VideoMetadata> {
  const url = URL.createObjectURL(videoBlob)
  try {
    const video = document.createElement('video')
    video.muted = true
    video.preload = 'metadata'
    video.src = url

    await waitForVideoEvent(video, 'loadedmetadata')

    return {
      width: video.videoWidth,
      height: video.videoHeight,
      duration: video.duration,
      fps: FALLBACK_FPS,
    }
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 * Process video as a continuous stream so the output timing stays 1:1 with the source.
 * Audio is preserved by muxing the original audio track with the processed canvas video track.
 * Rendering and final encoding always stay in the browser. In Server mode only
 * sampled detection frames may be sent to the localhost YuNet backend.
 */
export async function processVideo(
  videoBlob: Blob,
  options: VideoProcessingOptions,
): Promise<Blob> {
  const wasForceLocal = getForceLocal()
  if (options.forceLocal !== false) setForceLocal(true)

  const recorderFormat = resolveRecorderFormat(options.outputFormat)
  if (!recorderFormat?.mimeType) {
    throw new Error('No supported browser video encoder found for the selected format.')
  }

  const url = URL.createObjectURL(videoBlob)
  let sourceStream: MediaStream | null = null
  let canvasStream: MediaStream | null = null
  let recorder: MediaRecorder | null = null
  let hiddenVideo: CaptureVideoElement | null = null
  let aborted = false
  let overrideBitmaps: Array<VideoFrameOverride & { bitmap: ImageBitmap }> = []

  try {
    const video = document.createElement('video') as CaptureVideoElement
    hiddenVideo = video
    video.preload = 'auto'
    video.src = url
    video.playsInline = true
    video.muted = false
    video.volume = 0
    video.crossOrigin = 'anonymous'
    video.style.position = 'fixed'
    video.style.left = '-99999px'
    video.style.top = '0'
    video.style.width = '1px'
    video.style.height = '1px'
    document.body.appendChild(video)

    await waitForVideoEvent(video, 'loadeddata')

    const w = video.videoWidth
    const h = video.videoHeight
    const duration = video.duration
    const fps = await estimateVideoFps(video, options.abortSignal)
    const totalFrames = Math.max(1, Math.ceil(duration * fps))
    const overrideWindowSec = Math.max(1 / fps, 0.04)

    overrideBitmaps = await Promise.all((options.frameOverrides ?? []).map(async (override) => ({
      ...override,
      bitmap: await createImageBitmap(override.frameBlob),
    })))

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!

    const detectScale = Math.min(1, DETECT_MAX_DIM / Math.max(w, h))
    const detectW = Math.max(1, Math.round(w * detectScale))
    const detectH = Math.max(1, Math.round(h * detectScale))
    const detectCanvas = document.createElement('canvas')
    detectCanvas.width = detectW
    detectCanvas.height = detectH
    const detectCtx = detectCanvas.getContext('2d')!

    let tracks: VideoTrackState[] = []
    let trackSeq = 0
    const usedTrackEmojis = new Set<string>()
    const nextTrackId = () => `vt-${++trackSeq}`
    const nextTrackEmoji = () => {
      for (let i = 0; i < 24; i++) {
        const emoji = pickRandomEmoji()
        if (!usedTrackEmojis.has(emoji)) {
          usedTrackEmojis.add(emoji)
          return emoji
        }
      }
      return pickRandomEmoji()
    }

    const sampleTimes = buildFrameSampleTimes(duration, fps)
    const timeline: VideoTrackKeyframe[] = []
    const totalWork = sampleTimes.length + totalFrames * 2

    options.onPhase?.('analyzing')
    for (let i = 0; i < sampleTimes.length; i++) {
      if (options.abortSignal?.aborted) throw new DOMException('Aborted', 'AbortError')
      const sampleTime = sampleTimes[i]
      await waitForSeek(video, sampleTime)
      detectCtx.clearRect(0, 0, detectW, detectH)
      detectCtx.drawImage(video, 0, 0, detectW, detectH)
      const faces = await detectFaces(detectCanvas, true)
      const detections = faces.filter((face) => isLikelyVideoFace(face, detectW, detectH)).map((face) => faceToZone(
        {
          x: face.x / detectScale,
          y: face.y / detectScale,
          width: face.width / detectScale,
          height: face.height / detectScale,
        },
        w,
        h,
        options.effect,
        options.emoji,
      ))
      tracks = stabilizeTracks(tracks, detections, sampleTime, nextTrackId, nextTrackEmoji)
      const zones = predictTrackZones(tracks, sampleTime).map(cloneZone)
      const lastTime = timeline[timeline.length - 1]?.timeSec ?? -1
      const preRollTime = Math.max(0, sampleTime - VIDEO_DETECTION_PREROLL_SEC)
      if (zones.length > 0 && preRollTime > lastTime + 0.001 && preRollTime < sampleTime - 0.001) {
        pushVideoKeyframe(timeline, preRollTime, zones)
      }
      pushVideoKeyframe(timeline, sampleTime, zones)
      options.onProgress?.(i + 1, totalWork)
      await new Promise<void>((resolve) => window.setTimeout(resolve, 0))
    }

    options.onPhase?.('preparing')
    const frameZones = await buildFrameZones(
      timeline,
      totalFrames,
      fps,
      options.abortSignal,
      (done) => options.onProgress?.(sampleTimes.length + done, totalWork),
    )
    addTimedZonesToFrameMap(frameZones, options.timedZones ?? [], fps)

    await waitForSeek(video, 0)
    options.onPhase?.('rendering')

    const renderProcessedFrame = (mediaTime: number, sourceFrame?: CanvasImageSource) => {
      const override = overrideBitmaps.find((item) => Math.abs(item.timeSec - mediaTime) <= overrideWindowSec)
      ctx.clearRect(0, 0, w, h)
      if (override) {
        ctx.drawImage(override.bitmap, 0, 0, w, h)
      } else {
        ctx.drawImage(sourceFrame ?? video, 0, 0, w, h)
        const frameIndex = clamp(Math.round(mediaTime * fps), 0, frameZones.length - 1)
        drawZones(ctx, frameZones[frameIndex] ?? [], w, h, options.strength)
      }
    }

    sourceStream = getCaptureStream(video)
    const webCodecsPipeline = getWebCodecsVideoPipeline()
    const sourceVideoTrack = sourceStream?.getVideoTracks()[0] ?? null
    const useWebCodecsRenderer = Boolean(webCodecsPipeline && sourceVideoTrack)
    const composedStream = new MediaStream()
    let capture: ReturnType<typeof createCanvasStream> | null = null
    let webCodecsGenerator: MediaStreamTrackGenerator | null = null
    let webCodecsPump: Promise<void> | null = null
    let cancelWebCodecsPump: (() => void) | null = null
    let finished = false

    if (useWebCodecsRenderer && webCodecsPipeline && sourceVideoTrack) {
      const processor = new webCodecsPipeline.MediaStreamTrackProcessor({ track: sourceVideoTrack })
      webCodecsGenerator = new webCodecsPipeline.MediaStreamTrackGenerator({ kind: 'video' })
      composedStream.addTrack(webCodecsGenerator)

      webCodecsPump = (async () => {
        const reader = processor.readable.getReader()
        const writer = webCodecsGenerator!.writable.getWriter()
        cancelWebCodecsPump = () => { void reader.cancel() }
        let processedFrames = 0
        try {
          while (!finished) {
            if (options.abortSignal?.aborted) throw new DOMException('Aborted', 'AbortError')
            const { value: frame, done } = await reader.read()
            if (done || !frame) break
            const mediaTime = Math.min(duration, processedFrames / fps)
            const timestamp = Math.round(mediaTime * 1_000_000)
            renderProcessedFrame(mediaTime, frame as unknown as CanvasImageSource)
            const outputFrame = new webCodecsPipeline.VideoFrame(canvas, {
              timestamp,
              duration: Number.isFinite(frame.duration) ? frame.duration : Math.round(1_000_000 / fps),
            })
            frame.close()
            await writer.write(outputFrame)
            outputFrame.close()

            processedFrames += 1
            const currentFrame = Math.min(totalFrames, Math.max(1, Math.round(mediaTime * fps) + 1))
            options.onProgress?.(sampleTimes.length + totalFrames + currentFrame, totalWork)
          }
        } finally {
          cancelWebCodecsPump = null
          reader.releaseLock()
          await writer.close().catch(() => undefined)
          webCodecsGenerator?.stop()
        }
      })()
    } else {
      capture = createCanvasStream(canvas, fps)
      canvasStream = capture.stream
      composedStream.addTrack(capture.videoTrack)
    }
    sourceStream?.getAudioTracks().forEach((track) => composedStream.addTrack(track))

    recorder = new MediaRecorder(composedStream, {
      mimeType: recorderFormat.mimeType,
      videoBitsPerSecond: VIDEO_BITRATE,
      audioBitsPerSecond: AUDIO_BITRATE,
    })

    const chunks: Blob[] = []
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }

    const recorderStopped = new Promise<void>((resolve) => {
      recorder!.onstop = () => resolve()
    })

    renderProcessedFrame(0)
    capture?.requestFrame?.()
    options.onProgress?.(sampleTimes.length + totalFrames, totalWork)

    const stopProcessing = async () => {
      if (finished) return
      finished = true
      video.pause()
      cancelWebCodecsPump?.()
      if (recorder && recorder.state !== 'inactive') recorder.stop()
      await recorderStopped
    }

    options.abortSignal?.addEventListener('abort', () => {
      aborted = true
      void stopProcessing()
    }, { once: true })

    const onFrame = (mediaTime: number, presentedFrames: number) => {
      if (finished) return
      if (options.abortSignal?.aborted) {
        aborted = true
        void stopProcessing()
        return
      }

      renderProcessedFrame(mediaTime)
      capture?.requestFrame?.()

      const currentFrame = Math.min(totalFrames, Math.max(1, Math.round(mediaTime * fps) + 1))
      const safePresentedFrames = Number.isFinite(presentedFrames) && presentedFrames > 0 ? Math.round(presentedFrames) : currentFrame
      options.onProgress?.(
        sampleTimes.length + totalFrames + Math.min(totalFrames, Math.max(currentFrame, safePresentedFrames)),
        totalWork,
      )

      if (!video.ended && !useWebCodecsRenderer) {
        if (typeof video.requestVideoFrameCallback === 'function') {
          video.requestVideoFrameCallback((_, metadata) => onFrame(metadata.mediaTime, metadata.presentedFrames))
        }
      }
    }

    recorder.start(1000)

    if (!useWebCodecsRenderer && typeof video.requestVideoFrameCallback === 'function') {
      video.requestVideoFrameCallback((_, metadata) => onFrame(metadata.mediaTime, metadata.presentedFrames))
    } else if (!useWebCodecsRenderer) {
      const iv = window.setInterval(() => {
        if (finished || video.ended) {
          window.clearInterval(iv)
          return
        }
        onFrame(video.currentTime, Math.round(video.currentTime * fps))
      }, Math.round(1000 / fps))
    }

    await video.play()
    await waitForVideoEndedOrAbort(video, options.abortSignal)
    await webCodecsPump?.catch((err) => {
      if (!(err instanceof DOMException && err.name === 'AbortError')) throw err
    })
    renderProcessedFrame(duration)
    capture?.requestFrame?.()
    options.onProgress?.(totalWork, totalWork)
    await stopProcessing()
    if (aborted) throw new DOMException('Aborted', 'AbortError')

    return normalizeRecordedVideoBlob(new Blob(chunks, { type: recorderFormat.mimeType }), recorderFormat.mimeType)
  } finally {
    URL.revokeObjectURL(url)
    recorder?.stream.getTracks().forEach((track) => track.stop())
    sourceStream?.getTracks().forEach((track) => track.stop())
    canvasStream?.getTracks().forEach((track) => track.stop())
    overrideBitmaps.forEach((item) => item.bitmap.close())
    if (hiddenVideo?.parentNode) hiddenVideo.parentNode.removeChild(hiddenVideo)
    if (!wasForceLocal && options.forceLocal !== false) setForceLocal(false)
  }
}

export function getSupportedVideoExportOptions(): VideoExportOption[] {
  return VIDEO_EXPORT_CONFIGS.map((config) => {
    const mimeType = config.mimeCandidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? null
    return {
      id: config.id,
      label: config.label,
      ext: config.ext,
      mimeType,
      supported: mimeType != null,
    }
  })
}

export function getVideoPipelineCapabilities(): VideoPipelineCapabilities {
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null
  const captureTrack = canvas?.captureStream?.(0).getVideoTracks()[0] as ManualCanvasCaptureTrack | undefined
  const manualCanvasFrameCapture = Boolean(captureTrack && typeof captureTrack.requestFrame === 'function')
  captureTrack?.stop()
  const win = window as WindowWithWebCodecs
  const webCodecsRenderer = Boolean(getWebCodecsVideoPipeline())

  return {
    mediaRecorder: typeof MediaRecorder !== 'undefined',
    manualCanvasFrameCapture,
    requestVideoFrameCallback: 'requestVideoFrameCallback' in HTMLVideoElement.prototype,
    timelineWorker: typeof Worker !== 'undefined',
    offscreenCanvas: typeof OffscreenCanvas !== 'undefined',
    webCodecs: typeof win.VideoEncoder !== 'undefined' && typeof win.VideoFrame !== 'undefined',
    webCodecsRenderer,
  }
}

export function mimeTypeToVideoExtension(mimeType: string): string {
  const normalized = mimeType.toLowerCase()
  if (normalized.includes('webm')) return 'webm'
  if (normalized.includes('quicktime')) return 'mov'
  if (normalized.includes('ogg')) return 'ogv'
  if (normalized.includes('mpeg')) return 'mpeg'
  if (normalized.includes('matroska')) return 'mkv'
  if (normalized.includes('avi') || normalized.includes('msvideo')) return 'avi'
  if (normalized.includes('mp4')) return 'mp4'
  return 'webm'
}

/**
 * Check whether a MIME type represents a video.
 */
export function isVideoMime(mime: string): boolean {
  return mime.startsWith('video/')
}

/**
 * Accepted video file extensions.
 */
export const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v', '.ogv'] as const

/**
 * Check whether a File is a supported video based on MIME or extension.
 */
export function isVideoFile(file: File): boolean {
  if (file.type.startsWith('video/')) return true
  const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '')
  return (VIDEO_EXTENSIONS as readonly string[]).includes(ext)
}
