import type { CSSProperties } from 'react'
import type { Zone } from '../types'
import { clamp } from './canvas-geometry'

/**
 * Pure video layout + face-scan helpers. Covers object-fit:contain geometry,
 * overlay positioning, time formatting, and progressive face-scan sensitivity.
 * Extracted from App.tsx for isolation and unit testing.
 */

export const formatVideoTime = (sec: number) => {
  const safe = Math.max(0, Number.isFinite(sec) ? sec : 0)
  const minutes = Math.floor(safe / 60)
  const seconds = Math.floor(safe % 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/** Fractional rect of the object-fit:contain video picture inside .video-media. */
export type VideoContentLayout = {
  left: number
  top: number
  width: number
  height: number
}

export const measureVideoContentLayout = (
  mediaWidth: number,
  mediaHeight: number,
  videoWidth: number,
  videoHeight: number,
): VideoContentLayout | null => {
  if (mediaWidth <= 0 || mediaHeight <= 0 || videoWidth <= 0 || videoHeight <= 0) return null
  const videoAR = videoWidth / videoHeight
  const mediaAR = mediaWidth / mediaHeight
  let contentW: number
  let contentH: number
  let offsetX: number
  let offsetY: number
  if (mediaAR > videoAR) {
    contentH = mediaHeight
    contentW = contentH * videoAR
    offsetX = (mediaWidth - contentW) / 2
    offsetY = 0
  } else {
    contentW = mediaWidth
    contentH = contentW / videoAR
    offsetX = 0
    offsetY = (mediaHeight - contentH) / 2
  }
  return {
    left: offsetX / mediaWidth,
    top: offsetY / mediaHeight,
    width: contentW / mediaWidth,
    height: contentH / mediaHeight,
  }
}

export const videoOverlayLayerStyle = (layout: VideoContentLayout | null): CSSProperties | undefined => {
  if (!layout) return undefined
  return {
    left: `${layout.left * 100}%`,
    top: `${layout.top * 100}%`,
    width: `${layout.width * 100}%`,
    height: `${layout.height * 100}%`,
    right: 'auto',
    bottom: 'auto',
  }
}

/** Progressive video face scan: default 10%, then +4%/s → 14/18/22%. */
export const VIDEO_FACE_SCAN_SENSITIVITY_STEP = 4
export const VIDEO_FACE_SCAN_MAX_PASSES = 3

export const getVideoFaceScanSensitivity = (userSensitivity: number, passIndex: number) =>
  clamp(userSensitivity + passIndex * VIDEO_FACE_SCAN_SENSITIVITY_STEP, 0, 100)

export const getVideoDetectSettings = (userSensitivity: number, passIndex: number) => {
  const sensitivity = getVideoFaceScanSensitivity(userSensitivity, passIndex)
  const confidence = 0.7 - (sensitivity / 100) * 0.4
  const thorough = passIndex >= 1
  return { sensitivity, confidence, thorough }
}

export type NormalizedFaceRect = { x: number; y: number; width: number; height: number }

export const faceRectsSimilar = (a: NormalizedFaceRect, b: NormalizedFaceRect, tolerance = 0.06) =>
  Math.abs(a.x - b.x) <= tolerance
  && Math.abs(a.y - b.y) <= tolerance
  && Math.abs(a.width - b.width) <= tolerance
  && Math.abs(a.height - b.height) <= tolerance

export const filterDismissedFaceZones = (zones: Zone[], dismissed: NormalizedFaceRect[]) =>
  zones.filter((zone) => !dismissed.some((rect) => faceRectsSimilar(zone, rect)))
