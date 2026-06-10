import { clamp, localToCanvas, normalizedToLocal, type DrawTransform } from './canvas-geometry'

export const BRUSH_MIN_SIZE = 4
export const BRUSH_MAX_SIZE = 100
export const BRUSH_MIN_STRENGTH = 0.01
export const BRUSH_MAX_STRENGTH = 1
export const ZONE_HANDLE_HIT_SIZE = 12

/** Image-space brush radius from screen brush size and current zoom scale. */
export function computeBrushRadius(brushSize: number, scale: number): number {
  if (scale <= 0) return BRUSH_MIN_SIZE
  return Math.max(BRUSH_MIN_SIZE, brushSize / scale)
}

export type EraserPatchBounds = { x0: number; y0: number; w: number; h: number }

/** Bounding box for an eraser stamp clipped to the work canvas. */
export function computeEraserPatchBounds(
  imageX: number,
  imageY: number,
  radius: number,
  canvasWidth: number,
  canvasHeight: number,
): EraserPatchBounds {
  const x0 = Math.max(0, Math.floor(imageX - radius))
  const y0 = Math.max(0, Math.floor(imageY - radius))
  const x1 = Math.min(canvasWidth, Math.ceil(imageX + radius))
  const y1 = Math.min(canvasHeight, Math.ceil(imageY + radius))
  return {
    x0,
    y0,
    w: Math.max(1, x1 - x0),
    h: Math.max(1, y1 - y0),
  }
}

/** Throttle interval for brush strokes while dragging (ms). */
export function brushApplyIntervalMs(isMobile: boolean): number {
  return isMobile ? 80 : 50
}

export function shouldApplyBrushStroke(now: number, lastApplyMs: number, isMobile: boolean): boolean {
  return now - lastApplyMs >= brushApplyIntervalMs(isMobile)
}

/** Wheel delta → next brush size (screen pixels). */
export function computeBrushSizeFromWheel(deltaY: number, ctrlKey: boolean, currentSize: number): number {
  const delta = ctrlKey ? -deltaY * 0.5 : -deltaY * 0.25
  return clamp(Math.round(currentSize + delta), BRUSH_MIN_SIZE, BRUSH_MAX_SIZE)
}

/** Alt+wheel delta → next brush strength (0.01–1). */
export function computeBrushStrengthFromWheel(deltaY: number, currentStrength: number): number {
  const delta = -deltaY * 0.2
  return clamp(Math.round(currentStrength * 100 + delta) / 100, BRUSH_MIN_STRENGTH, BRUSH_MAX_STRENGTH)
}

/** Draw the dashed brush-size ring on the overlay canvas. */
export function drawBrushSizeRing(
  ctx: CanvasRenderingContext2D,
  canvasX: number,
  canvasY: number,
  size: number,
): void {
  ctx.save()
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.lineWidth = 1.5
  ctx.setLineDash([5, 4])
  ctx.beginPath()
  ctx.arc(canvasX, canvasY, size, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'
  ctx.lineWidth = 0.8
  ctx.setLineDash([])
  ctx.beginPath()
  ctx.arc(canvasX, canvasY, size, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

export function clearOverlayCanvas(
  overlay: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  devicePixelRatio = window.devicePixelRatio || 1,
): void {
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
  ctx.clearRect(0, 0, overlay.width / devicePixelRatio, overlay.height / devicePixelRatio)
}

/** Hit-test the bottom-right resize handle of a zone in canvas space. */
export function isNearZoneResizeHandle(
  canvasX: number,
  canvasY: number,
  zone: { x: number; y: number; width: number; height: number },
  transform: DrawTransform,
  handleSize = ZONE_HANDLE_HIT_SIZE,
): boolean {
  const { lx, ly } = normalizedToLocal(zone.x + zone.width, zone.y + zone.height, transform)
  const br = localToCanvas(lx, ly, transform)
  return Math.hypot(canvasX - br.x, canvasY - br.y) <= handleSize
}
