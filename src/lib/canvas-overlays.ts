import type { NormalizedRect, Zone } from '../types'
import { DETECTION_COLORS } from './detection-config'

/**
 * Editor overlay drawing helpers. The caller is expected to have already
 * translated/rotated the context to the image center, so rects are drawn
 * relative to (-drawWidth/2, -drawHeight/2). Extracted from renderCanvas.
 */

const SELECTED_COLOR = '#ff7a1a'
const DEFAULT_COLOR = '#2f81f7'

/** Smallest still-legible caption (px in view space). */
const LABEL_FONT_PX = 9

/** Draw a tiny type caption at the box's top-left. Faces stay unlabeled. */
function drawZoneLabel(
  ctx: CanvasRenderingContext2D,
  zx: number,
  zy: number,
  label: string,
  color: string,
  topBound: number,
) {
  ctx.save()
  ctx.font = `600 ${LABEL_FONT_PX}px ui-sans-serif, system-ui, -apple-system, sans-serif`
  ctx.textBaseline = 'alphabetic'
  const padX = 2.5
  const padY = 1.5
  const textW = ctx.measureText(label).width
  const chipH = LABEL_FONT_PX + padY * 2
  const chipW = textW + padX * 2
  // Sit the chip just above the box, but drop it inside the box when that would
  // clip above the image edge (zones hugging the top).
  const cy = zy - chipH - 1 < topBound ? zy + 1 : zy - chipH - 1
  ctx.fillStyle = 'rgba(0,0,0,0.72)'
  ctx.fillRect(zx, cy, chipW, chipH)
  ctx.fillStyle = color
  ctx.fillRect(zx, cy, 2, chipH)
  ctx.fillStyle = '#fff'
  ctx.fillText(label, zx + padX, cy + chipH - padY - 1)
  ctx.restore()
}

/** Stroke the normalize crop rectangle (template/draft) in view space. */
export function drawNormalizeCropInView(
  ctx: CanvasRenderingContext2D,
  rect: NormalizedRect,
  drawWidth: number,
  drawHeight: number,
  isDraft: boolean,
) {
  const x = -drawWidth / 2 + rect.x * drawWidth
  const y = -drawHeight / 2 + rect.y * drawHeight
  const w = rect.width * drawWidth
  const h = rect.height * drawHeight
  ctx.save()
  ctx.strokeStyle = isDraft ? SELECTED_COLOR : DEFAULT_COLOR
  ctx.lineWidth = isDraft ? 2.6 : 2
  ctx.strokeRect(x, y, w, h)
  ctx.restore()
}

/** Stroke a zone outline (with a resize handle when selected) in view space. */
export function drawZoneInView(
  ctx: CanvasRenderingContext2D,
  zone: Zone,
  drawWidth: number,
  drawHeight: number,
  selected: boolean,
  options?: { showLabel?: boolean },
) {
  const zx = -drawWidth / 2 + zone.x * drawWidth
  const zy = -drawHeight / 2 + zone.y * drawHeight
  const zw = zone.width * drawWidth
  const zh = zone.height * drawHeight
  const typeColor = zone.detectionType ? DETECTION_COLORS[zone.detectionType] : undefined
  ctx.save()
  ctx.strokeStyle = selected ? SELECTED_COLOR : (typeColor ?? DEFAULT_COLOR)
  ctx.lineWidth = selected ? 2.5 : 1.8
  ctx.setLineDash(selected ? [] : [])
  ctx.strokeRect(zx, zy, zw, zh)
  if (selected) {
    const hs = 8
    ctx.fillStyle = SELECTED_COLOR
    ctx.fillRect(zx + zw - hs / 2, zy + zh - hs / 2, hs, hs)
  }
  ctx.restore()
  // Tiny caption (faces excluded — they carry no label).
  if (options?.showLabel && zone.label && zone.detectionType !== 'face') {
    drawZoneLabel(ctx, zx, zy, zone.label, typeColor ?? (selected ? SELECTED_COLOR : DEFAULT_COLOR), -drawHeight / 2)
  }
}
