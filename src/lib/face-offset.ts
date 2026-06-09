import type { Zone } from '../types'

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/**
 * Padding multipliers applied to each detected face box (matches detection +
 * live halo). The slider is labelled 0–100 % for the user, but the real
 * expansion is capped at +50 % of the face size per side — beyond that the
 * coverage swallows neighbouring faces / the whole frame. So the displayed
 * percent maps linearly onto a 0…0.5 fraction.
 */
export const FACE_OFFSET_MAX_PERCENT = 100
const FACE_OFFSET_MAX_PAD = 0.5

export function faceOffsetPads(offsetPercent: number) {
  const offset = (offsetPercent / 100) * FACE_OFFSET_MAX_PAD
  return { padX: offset, padY: offset + 0.06 }
}

export function expandNormBox(
  x: number,
  y: number,
  width: number,
  height: number,
  padX: number,
  padY: number,
): { x: number; y: number; width: number; height: number } {
  const px = width * padX
  const py = height * padY
  const x0 = clamp(x - px, 0, 1)
  const y0 = clamp(y - py, 0, 1)
  const x1 = clamp(x + width + px, 0, 1)
  const y1 = clamp(y + height + py, 0, 1)
  return {
    x: x0,
    y: y0,
    width: clamp(x1 - x0, 0.02, 1),
    height: clamp(y1 - y0, 0.02, 1),
  }
}

export function expandPixelBox(
  bx: number,
  by: number,
  bw: number,
  bh: number,
  imgW: number,
  imgH: number,
  offsetPercent: number,
) {
  const { padX, padY } = faceOffsetPads(offsetPercent)
  const nx = bx / imgW
  const ny = by / imgH
  const nw = bw / imgW
  const nh = bh / imgH
  return expandNormBox(nx, ny, nw, nh, padX, padY)
}

export function zoneWithFaceOffset(zone: Zone, offsetPercent: number): Zone {
  if (
    zone.detectX == null || zone.detectY == null
    || zone.detectWidth == null || zone.detectHeight == null
  ) {
    return zone
  }
  const { padX, padY } = faceOffsetPads(offsetPercent)
  return {
    ...zone,
    ...expandNormBox(zone.detectX, zone.detectY, zone.detectWidth, zone.detectHeight, padX, padY),
  }
}

export function zonesWithFaceOffset(zones: Zone[], offsetPercent: number): Zone[] {
  return zones.map((z) => zoneWithFaceOffset(z, offsetPercent))
}

/** Expand a normalized live/photo zone for outline display. */
export function liveZoneDisplayRect(
  zone: { x: number; y: number; width: number; height: number },
  offsetPercent: number,
) {
  const { padX, padY } = faceOffsetPads(offsetPercent)
  return expandNormBox(zone.x, zone.y, zone.width, zone.height, padX, padY)
}

export const CLEAR_DETECT_FIELDS = {
  detectX: undefined,
  detectY: undefined,
  detectWidth: undefined,
  detectHeight: undefined,
} as const
