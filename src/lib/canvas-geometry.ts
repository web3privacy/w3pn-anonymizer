import type { NormalizedRect, Zone } from '../types'

/**
 * Pure geometry helpers for the editor canvas: the draw transform, normalized
 * ↔ local ↔ canvas coordinate conversions, zone hit-testing, and 90° zone
 * rotation. Extracted from App.tsx so the math is isolated and unit-testable.
 */

export interface DrawTransform {
  drawX: number
  drawY: number
  drawWidth: number
  drawHeight: number
  imageWidth: number
  imageHeight: number
  scale: number
  rotation?: number
  centerX?: number
  centerY?: number
}

export const DEFAULT_TRANSFORM: DrawTransform = {
  drawX: 0, drawY: 0, drawWidth: 0, drawHeight: 0,
  imageWidth: 0, imageHeight: 0, scale: 1,
}

export interface ViewTransformInput {
  cssWidth: number
  cssHeight: number
  sourceWidth: number
  sourceHeight: number
  viewZoom: number
  panX: number
  panY: number
  rotation: number
}

export interface ViewTransform extends DrawTransform {
  rotation: number
  centerX: number
  centerY: number
}

/**
 * Compute the editor's draw transform: fit the source into the viewport
 * (contain), apply the user's zoom/pan/rotation, and derive the rotation-aware
 * axis-aligned bounding box origin. Pure — extracted from renderCanvas.
 */
export function computeViewTransform(input: ViewTransformInput): ViewTransform {
  const { cssWidth, cssHeight, sourceWidth, sourceHeight, viewZoom, panX, panY, rotation } = input
  const baseScale = Math.min(cssWidth / sourceWidth, cssHeight / sourceHeight)
  const scale = baseScale * viewZoom
  const drawWidth = sourceWidth * scale
  const drawHeight = sourceHeight * scale
  const centerX = cssWidth / 2 + panX
  const centerY = cssHeight / 2 + panY
  const absCos = Math.abs(Math.cos(rotation))
  const absSin = Math.abs(Math.sin(rotation))
  const aabbW = drawWidth * absCos + drawHeight * absSin
  const aabbH = drawWidth * absSin + drawHeight * absCos
  const drawX = centerX - aabbW / 2
  const drawY = centerY - aabbH / 2
  return {
    drawX, drawY, drawWidth, drawHeight,
    imageWidth: sourceWidth, imageHeight: sourceHeight, scale,
    rotation, centerX, centerY,
  }
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export const makeNormalizedRect = (startX: number, startY: number, endX: number, endY: number): NormalizedRect => {
  const x = Math.min(startX, endX)
  const y = Math.min(startY, endY)
  return {
    x: clamp(x, 0, 1),
    y: clamp(y, 0, 1),
    width: clamp(Math.abs(endX - startX), 0, 1),
    height: clamp(Math.abs(endY - startY), 0, 1),
  }
}

export const localToCanvas = (lx: number, ly: number, t: DrawTransform) => {
  const rot = t.rotation ?? 0
  const cx = t.centerX ?? t.drawX + t.drawWidth / 2
  const cy = t.centerY ?? t.drawY + t.drawHeight / 2
  if (Math.abs(rot) < 0.001) return { x: cx + lx, y: cy + ly }
  const cos = Math.cos(rot)
  const sin = Math.sin(rot)
  return { x: cx + lx * cos - ly * sin, y: cy + lx * sin + ly * cos }
}

export const normalizedToLocal = (nx: number, ny: number, t: DrawTransform) => ({
  lx: -t.drawWidth / 2 + nx * t.drawWidth,
  ly: -t.drawHeight / 2 + ny * t.drawHeight,
})

export const zoneToCanvasRect = (zone: Zone, t: DrawTransform) => {
  const corners = [
    normalizedToLocal(zone.x, zone.y, t),
    normalizedToLocal(zone.x + zone.width, zone.y, t),
    normalizedToLocal(zone.x, zone.y + zone.height, t),
    normalizedToLocal(zone.x + zone.width, zone.y + zone.height, t),
  ].map(({ lx, ly }) => localToCanvas(lx, ly, t))
  const xs = corners.map((c) => c.x)
  const ys = corners.map((c) => c.y)
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y }
}

export const zoneContainsNormalized = (zone: Zone, nx: number, ny: number) =>
  nx >= zone.x && nx <= zone.x + zone.width && ny >= zone.y && ny <= zone.y + zone.height

/** Rotate normalized zone coords 90° (direction 1 = CW, -1 = CCW). */
export const rotateZone90 = (zone: Zone, direction: 1 | -1): Zone => {
  const { x, y, width, height } = zone
  const base = direction === 1
    ? { x: y, y: 1 - x - width, width: height, height: width }
    : { x: 1 - y - height, y: x, width: height, height: width }
  const next: Zone = { ...zone, ...base }
  if (
    zone.detectX != null && zone.detectY != null
    && zone.detectWidth != null && zone.detectHeight != null
  ) {
    const dx = zone.detectX
    const dy = zone.detectY
    const dw = zone.detectWidth
    const dh = zone.detectHeight
    if (direction === 1) {
      next.detectX = dy
      next.detectY = 1 - dx - dw
      next.detectWidth = dh
      next.detectHeight = dw
    } else {
      next.detectX = 1 - dy - dh
      next.detectY = dx
      next.detectWidth = dh
      next.detectHeight = dw
    }
  }
  return next
}

export const rotateZones90 = (zones: Zone[], direction: 1 | -1): Zone[] =>
  zones.map((z) => rotateZone90(z, direction))

/** Pointer position mapped into canvas and image (normalized + pixel) space. */
export interface PointerMap {
  canvasX: number
  canvasY: number
  imageX: number
  imageY: number
  normalizedX: number
  normalizedY: number
}

/** Inverse of the mobile CSS preview transform (translate → rotate → scale around center). */
export function unapplyMobileCssViewTransform(
  canvasX: number,
  canvasY: number,
  centerX: number,
  centerY: number,
  zoom: number,
  panX: number,
  panY: number,
  rotation: number,
): { canvasX: number; canvasY: number } {
  const x = canvasX - panX
  const y = canvasY - panY
  let lx = x - centerX
  let ly = y - centerY
  const cos = Math.cos(-rotation)
  const sin = Math.sin(-rotation)
  const rx = lx * cos - ly * sin
  const ry = lx * sin + ly * cos
  lx = rx / zoom
  ly = ry / zoom
  return { canvasX: lx + centerX, canvasY: ly + centerY }
}

/**
 * Map a canvas-space point to normalized/image coordinates using the current
 * draw transform. Inverse of localToCanvas ∘ normalizedToLocal.
 */
export function canvasPointToNormalized(
  canvasX: number,
  canvasY: number,
  t: DrawTransform,
): { normalizedX: number; normalizedY: number } {
  if (t.rotation != null && t.centerX != null && t.centerY != null) {
    const lx = canvasX - t.centerX
    const ly = canvasY - t.centerY
    const cos = Math.cos(-t.rotation)
    const sin = Math.sin(-t.rotation)
    const rx = lx * cos - ly * sin
    const ry = lx * sin + ly * cos
    return {
      normalizedX: (rx + t.drawWidth / 2) / t.drawWidth,
      normalizedY: (ry + t.drawHeight / 2) / t.drawHeight,
    }
  }
  return {
    normalizedX: (canvasX - t.drawX) / t.drawWidth,
    normalizedY: (canvasY - t.drawY) / t.drawHeight,
  }
}

export interface MapClientPointInput {
  clientX: number
  clientY: number
  bounds: { left: number; top: number; width: number; height: number }
  transform: DrawTransform
  clampToBounds?: boolean
  /** Unapply mobile CSS preview transform before mapping (viewport bounds). */
  mobileCssView?: {
    centerX: number
    centerY: number
    zoom: number
    panX: number
    panY: number
    rotation: number
  }
}

/**
 * Map a client (screen) point to canvas + normalized + image pixel coords.
 * Pure inverse of the editor viewport transform — extracted from mapPointerToImage.
 */
export function mapClientPointToImage(input: MapClientPointInput): PointerMap | null {
  const { clientX, clientY, bounds, transform: t, clampToBounds = false, mobileCssView } = input
  if (t.drawWidth <= 0 || t.drawHeight <= 0) return null
  if (bounds.width <= 0 || bounds.height <= 0) return null

  let canvasX = clientX - bounds.left
  let canvasY = clientY - bounds.top

  if (mobileCssView) {
    const unapplied = unapplyMobileCssViewTransform(
      canvasX, canvasY,
      mobileCssView.centerX, mobileCssView.centerY,
      mobileCssView.zoom, mobileCssView.panX, mobileCssView.panY, mobileCssView.rotation,
    )
    canvasX = unapplied.canvasX
    canvasY = unapplied.canvasY
  }

  const { normalizedX: rawNx, normalizedY: rawNy } = canvasPointToNormalized(canvasX, canvasY, t)
  const outsideImage = rawNx < 0 || rawNx > 1 || rawNy < 0 || rawNy > 1
  if (outsideImage && !clampToBounds) return null

  const normalizedX = clamp(rawNx, 0, 1)
  const normalizedY = clamp(rawNy, 0, 1)
  return {
    canvasX,
    canvasY,
    imageX: normalizedX * t.imageWidth,
    imageY: normalizedY * t.imageHeight,
    normalizedX,
    normalizedY,
  }
}
