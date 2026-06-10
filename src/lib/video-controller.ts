import { clamp } from './canvas-geometry'
import type { VideoContentLayout } from './video-layout'

export const DEFAULT_VIDEO_FPS = 30

export function resolveVideoFps(fps?: number | null): number {
  return fps && fps > 0 ? fps : DEFAULT_VIDEO_FPS
}

/** Prefer a positive HTMLMediaElement duration, then photo metadata. */
export function resolveVideoDuration(
  photoDuration?: number | null,
  elementDuration?: number,
): number {
  if (Number.isFinite(elementDuration) && (elementDuration ?? 0) > 0) return elementDuration!
  return Number.isFinite(photoDuration) ? (photoDuration ?? 0) : 0
}

export interface VideoFrameMetrics {
  currentFrame: number
  totalFrames: number
}

export function computeVideoFrameMetrics(
  currentTimeSec: number,
  fps: number,
  durationSec: number,
): VideoFrameMetrics {
  const totalFrames = durationSec > 0 ? Math.max(1, Math.round(durationSec * fps)) : 0
  const currentFrame = clamp(
    Math.round(currentTimeSec * fps),
    0,
    totalFrames > 0 ? totalFrames - 1 : Number.MAX_SAFE_INTEGER,
  )
  return { currentFrame, totalFrames }
}

export interface SteppedVideoFrame {
  nextFrame: number
  nextTime: number
  totalFrames: number
  displayFrame: number
}

export function computeSteppedVideoFrame(
  currentTimeSec: number,
  direction: -1 | 1,
  fps: number,
  durationSec: number,
): SteppedVideoFrame {
  const totalFrames = durationSec > 0
    ? Math.max(1, Math.round(durationSec * fps))
    : Math.max(computeVideoFrameMetrics(currentTimeSec, fps, 0).currentFrame + 2, 1)
  const currentFrame = clamp(
    Math.round(currentTimeSec * fps),
    0,
    durationSec > 0 ? Math.max(0, Math.round(durationSec * fps) - 1) : Number.MAX_SAFE_INTEGER,
  )
  const nextFrame = clamp(currentFrame + direction, 0, totalFrames - 1)
  const nextTime = clamp(
    nextFrame / fps,
    0,
    durationSec > 0 ? Math.max(0, durationSec - 0.001) : Number.MAX_SAFE_INTEGER,
  )
  return { nextFrame, nextTime, totalFrames, displayFrame: nextFrame + 1 }
}

export function formatFrameLabel(frameIndex: number, totalFrames: number): string {
  return totalFrames > 0 ? `${frameIndex + 1}/${totalFrames}` : `${frameIndex + 1}`
}

export function computePlaybackFrameLabel(
  activeVideoTime: number,
  fps: number,
  durationSec: number,
): string {
  const { currentFrame, totalFrames } = computeVideoFrameMetrics(activeVideoTime, fps, durationSec)
  return formatFrameLabel(currentFrame, totalFrames)
}

export interface NormalizedPoint {
  x: number
  y: number
}

export function mapPointerToVideoNormalized(
  clientX: number,
  clientY: number,
  bounds: { left: number; top: number; width: number; height: number },
  layout: VideoContentLayout,
): NormalizedPoint | null {
  if (bounds.width <= 0 || bounds.height <= 0) return null
  const contentLeft = layout.left * bounds.width
  const contentTop = layout.top * bounds.height
  const contentW = layout.width * bounds.width
  const contentH = layout.height * bounds.height
  if (contentW <= 0 || contentH <= 0) return null
  return {
    x: clamp((clientX - bounds.left - contentLeft) / contentW, 0, 1),
    y: clamp((clientY - bounds.top - contentTop) / contentH, 0, 1),
  }
}

export function normalizeDraftZoneFromDrag(start: NormalizedPoint, end: NormalizedPoint) {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  }
}

export function computeTimedMaskRange(centerSec: number, rangeSec: number, durationSec: number) {
  const halfRange = Math.max(0.1, rangeSec / 2)
  const startSec = Math.max(0, centerSec - halfRange)
  const endSec = durationSec > 0 ? Math.min(durationSec, centerSec + halfRange) : centerSec + halfRange
  return {
    startSec,
    endSec: Math.max(startSec + 0.05, endSec),
  }
}

export function computeAdjacentFrameTime(
  currentTimeSec: number,
  direction: -1 | 1,
  fps: number,
  durationSec: number,
) {
  const totalFrames = durationSec > 0
    ? Math.max(1, Math.round(durationSec * fps))
    : Math.max(Math.round(currentTimeSec * fps) + 2, 1)
  const newTime = clamp(
    currentTimeSec + direction / fps,
    0,
    durationSec > 0 ? durationSec : Number.MAX_SAFE_INTEGER,
  )
  const frameIndex = clamp(Math.round(newTime * fps), 0, totalFrames - 1)
  return { newTime, totalFrames, frameIndex }
}

export function formatVideoFrameStamp(timeSec: number): string {
  return `${Math.floor(timeSec / 60)}-${String(Math.floor(timeSec % 60)).padStart(2, '0')}-${String(Math.floor((timeSec % 1) * 100)).padStart(2, '0')}`
}

export function isDraftZoneTooSmall(width: number, height: number, min = 0.01): boolean {
  return width < min || height < min
}

export function clampVideoSeekTime(timeSec: number, durationSec?: number | null): number {
  const duration = durationSec ?? 0
  return clamp(timeSec, 0, Number.isFinite(duration) && duration > 0 ? duration : timeSec)
}
