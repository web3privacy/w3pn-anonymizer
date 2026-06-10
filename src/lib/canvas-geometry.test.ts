import { describe, it, expect } from 'vitest'
import {
  clamp,
  makeNormalizedRect,
  localToCanvas,
  normalizedToLocal,
  zoneToCanvasRect,
  zoneContainsNormalized,
  rotateZone90,
  rotateZones90,
  DEFAULT_TRANSFORM,
  computeViewTransform,
  canvasPointToNormalized,
  unapplyMobileCssViewTransform,
  mapClientPointToImage,
  type DrawTransform,
} from './canvas-geometry'
import type { Zone } from '../types'

const zone = (over: Partial<Zone> = {}): Zone => ({
  id: 'z', x: 0.1, y: 0.2, width: 0.3, height: 0.4, effect: 'pixelate', emoji: '', ...over,
})

describe('clamp', () => {
  it('clamps below/above/within', () => {
    expect(clamp(-1, 0, 1)).toBe(0)
    expect(clamp(2, 0, 1)).toBe(1)
    expect(clamp(0.5, 0, 1)).toBe(0.5)
  })
})

describe('makeNormalizedRect', () => {
  it('normalizes regardless of point order and clamps to [0,1]', () => {
    const r = makeNormalizedRect(0.8, 0.8, 0.2, 0.2)
    expect(r.x).toBeCloseTo(0.2, 6)
    expect(r.y).toBeCloseTo(0.2, 6)
    expect(r.width).toBeCloseTo(0.6, 6)
    expect(r.height).toBeCloseTo(0.6, 6)
  })
  it('clamps width/height to 1', () => {
    const r = makeNormalizedRect(-1, -1, 2, 2)
    expect(r.x).toBe(0); expect(r.y).toBe(0); expect(r.width).toBe(1); expect(r.height).toBe(1)
  })
})

describe('localToCanvas / normalizedToLocal', () => {
  const t: DrawTransform = { ...DEFAULT_TRANSFORM, drawX: 0, drawY: 0, drawWidth: 200, drawHeight: 100 }
  it('maps center (no rotation) to the draw center', () => {
    expect(localToCanvas(0, 0, t)).toEqual({ x: 100, y: 50 })
  })
  it('normalizedToLocal places the origin at -half size', () => {
    expect(normalizedToLocal(0, 0, t)).toEqual({ lx: -100, ly: -50 })
    expect(normalizedToLocal(1, 1, t)).toEqual({ lx: 100, ly: 50 })
  })
  it('applies rotation', () => {
    const rt: DrawTransform = { ...t, rotation: Math.PI / 2 }
    const p = localToCanvas(10, 0, rt)
    expect(p.x).toBeCloseTo(100, 5)
    expect(p.y).toBeCloseTo(60, 5)
  })
})

describe('zoneToCanvasRect', () => {
  it('produces an axis-aligned bbox in canvas space', () => {
    const t: DrawTransform = { ...DEFAULT_TRANSFORM, drawWidth: 100, drawHeight: 100 }
    const r = zoneToCanvasRect(zone({ x: 0, y: 0, width: 0.5, height: 0.5 }), t)
    expect(r.x).toBeCloseTo(0, 5)
    expect(r.y).toBeCloseTo(0, 5)
    expect(r.width).toBeCloseTo(50, 5)
    expect(r.height).toBeCloseTo(50, 5)
  })
})

describe('zoneContainsNormalized', () => {
  it('hit-tests inside/outside', () => {
    const z = zone({ x: 0.1, y: 0.1, width: 0.2, height: 0.2 })
    expect(zoneContainsNormalized(z, 0.2, 0.2)).toBe(true)
    expect(zoneContainsNormalized(z, 0.05, 0.2)).toBe(false)
  })
})

describe('rotateZone90', () => {
  it('rotates clockwise and is reversible by a CCW rotation', () => {
    const z = zone({ x: 0.1, y: 0.2, width: 0.3, height: 0.4 })
    const cw = rotateZone90(z, 1)
    expect(cw.width).toBeCloseTo(0.4, 6)
    expect(cw.height).toBeCloseTo(0.3, 6)
    const back = rotateZone90(cw, -1)
    expect(back.x).toBeCloseTo(z.x, 6)
    expect(back.y).toBeCloseTo(z.y, 6)
    expect(back.width).toBeCloseTo(z.width, 6)
    expect(back.height).toBeCloseTo(z.height, 6)
  })
  it('rotates the detect box when present', () => {
    const z = zone({ detectX: 0.1, detectY: 0.2, detectWidth: 0.3, detectHeight: 0.4 })
    const cw = rotateZone90(z, 1)
    expect(cw.detectWidth).toBeCloseTo(0.4, 6)
    expect(cw.detectHeight).toBeCloseTo(0.3, 6)
  })
  it('rotateZones90 maps over all zones', () => {
    const out = rotateZones90([zone(), zone({ id: 'z2' })], 1)
    expect(out).toHaveLength(2)
    expect(out[1].id).toBe('z2')
  })
})

describe('computeViewTransform', () => {
  const base = {
    cssWidth: 800, cssHeight: 600,
    sourceWidth: 400, sourceHeight: 300,
    viewZoom: 1, panX: 0, panY: 0, rotation: 0,
  }

  it('contains the source (fits by the limiting dimension) and centers it', () => {
    const t = computeViewTransform(base)
    // 800/400=2, 600/300=2 → baseScale 2
    expect(t.scale).toBeCloseTo(2, 6)
    expect(t.drawWidth).toBeCloseTo(800, 6)
    expect(t.drawHeight).toBeCloseTo(600, 6)
    expect(t.centerX).toBeCloseTo(400, 6)
    expect(t.centerY).toBeCloseTo(300, 6)
    // no rotation → AABB equals draw size, origin at top-left
    expect(t.drawX).toBeCloseTo(0, 6)
    expect(t.drawY).toBeCloseTo(0, 6)
    expect(t.imageWidth).toBe(400)
    expect(t.imageHeight).toBe(300)
  })

  it('uses the smaller ratio when aspect ratios differ', () => {
    // wide viewport, square-ish source → limited by height
    const t = computeViewTransform({ ...base, sourceWidth: 200, sourceHeight: 300 })
    // 800/200=4, 600/300=2 → baseScale 2
    expect(t.scale).toBeCloseTo(2, 6)
    expect(t.drawWidth).toBeCloseTo(400, 6)
    expect(t.drawHeight).toBeCloseTo(600, 6)
  })

  it('applies zoom multiplicatively', () => {
    const t = computeViewTransform({ ...base, viewZoom: 1.5 })
    expect(t.scale).toBeCloseTo(3, 6)
    expect(t.drawWidth).toBeCloseTo(1200, 6)
  })

  it('offsets the center by the pan', () => {
    const t = computeViewTransform({ ...base, panX: 50, panY: -25 })
    expect(t.centerX).toBeCloseTo(450, 6)
    expect(t.centerY).toBeCloseTo(275, 6)
  })

  it('computes a rotation-aware AABB (90° swaps width/height)', () => {
    const t = computeViewTransform({ ...base, rotation: Math.PI / 2 })
    // draw size stays 800×600, but AABB becomes 600×800 → origin shifts
    expect(t.drawWidth).toBeCloseTo(800, 6)
    expect(t.drawHeight).toBeCloseTo(600, 6)
    expect(t.drawX).toBeCloseTo(400 - 600 / 2, 6)
    expect(t.drawY).toBeCloseTo(300 - 800 / 2, 6)
    expect(t.rotation).toBeCloseTo(Math.PI / 2, 6)
  })
})

/** Apply the forward mobile CSS preview transform (inverse of unapplyMobileCssViewTransform). */
function applyMobileCssViewTransform(
  canvasX: number, canvasY: number,
  centerX: number, centerY: number,
  zoom: number, panX: number, panY: number, rotation: number,
) {
  let lx = canvasX - centerX
  let ly = canvasY - centerY
  lx *= zoom
  ly *= zoom
  const cos = Math.cos(rotation)
  const sin = Math.sin(rotation)
  const rx = lx * cos - ly * sin
  const ry = lx * sin + ly * cos
  return { canvasX: rx + centerX + panX, canvasY: ry + centerY + panY }
}

describe('canvasPointToNormalized', () => {
  it('maps the draw center to (0.5, 0.5) without rotation', () => {
    const t = computeViewTransform({
      cssWidth: 800, cssHeight: 600, sourceWidth: 400, sourceHeight: 300,
      viewZoom: 1, panX: 0, panY: 0, rotation: 0,
    })
    const { normalizedX, normalizedY } = canvasPointToNormalized(t.centerX, t.centerY, t)
    expect(normalizedX).toBeCloseTo(0.5, 6)
    expect(normalizedY).toBeCloseTo(0.5, 6)
  })

  it('round-trips with localToCanvas ∘ normalizedToLocal', () => {
    const t = computeViewTransform({
      cssWidth: 800, cssHeight: 600, sourceWidth: 400, sourceHeight: 300,
      viewZoom: 1.2, panX: 30, panY: -10, rotation: 0.4,
    })
    const samples = [[0, 0], [1, 1], [0.25, 0.75], [0.5, 0.5]]
    for (const [nx, ny] of samples) {
      const { lx, ly } = normalizedToLocal(nx, ny, t)
      const { x, y } = localToCanvas(lx, ly, t)
      const back = canvasPointToNormalized(x, y, t)
      expect(back.normalizedX).toBeCloseTo(nx, 5)
      expect(back.normalizedY).toBeCloseTo(ny, 5)
    }
  })
})

describe('unapplyMobileCssViewTransform', () => {
  it('inverts the forward mobile CSS transform', () => {
    const cx = 400; const cy = 300; const zoom = 1.5; const panX = 20; const panY = -15; const rot = 0.3
    const orig = { canvasX: 350, canvasY: 280 }
    const transformed = applyMobileCssViewTransform(orig.canvasX, orig.canvasY, cx, cy, zoom, panX, panY, rot)
    const back = unapplyMobileCssViewTransform(transformed.canvasX, transformed.canvasY, cx, cy, zoom, panX, panY, rot)
    expect(back.canvasX).toBeCloseTo(orig.canvasX, 5)
    expect(back.canvasY).toBeCloseTo(orig.canvasY, 5)
  })
})

describe('mapClientPointToImage', () => {
  const bounds = { left: 100, top: 50, width: 800, height: 600 }

  it('maps the image center via client coordinates', () => {
    const t = computeViewTransform({
      cssWidth: 800, cssHeight: 600, sourceWidth: 400, sourceHeight: 300,
      viewZoom: 1, panX: 0, panY: 0, rotation: 0,
    })
    const mapped = mapClientPointToImage({
      clientX: bounds.left + t.centerX,
      clientY: bounds.top + t.centerY,
      bounds, transform: t,
    })
    expect(mapped).not.toBeNull()
    expect(mapped!.normalizedX).toBeCloseTo(0.5, 5)
    expect(mapped!.normalizedY).toBeCloseTo(0.5, 5)
    expect(mapped!.imageX).toBeCloseTo(t.imageWidth / 2, 3)
    expect(mapped!.imageY).toBeCloseTo(t.imageHeight / 2, 3)
  })

  it('returns null for points outside the image when clampToBounds is false', () => {
    const t = computeViewTransform({
      cssWidth: 800, cssHeight: 600, sourceWidth: 400, sourceHeight: 300,
      viewZoom: 1, panX: 0, panY: 0, rotation: 0,
    })
    expect(mapClientPointToImage({
      clientX: bounds.left - 10, clientY: bounds.top + t.centerY,
      bounds, transform: t,
    })).toBeNull()
  })

  it('clamps to [0,1] when clampToBounds is true', () => {
    const t = computeViewTransform({
      cssWidth: 800, cssHeight: 600, sourceWidth: 400, sourceHeight: 300,
      viewZoom: 1, panX: 0, panY: 0, rotation: 0,
    })
    const mapped = mapClientPointToImage({
      clientX: bounds.left - 10, clientY: bounds.top + t.centerY,
      bounds, transform: t, clampToBounds: true,
    })
    expect(mapped).not.toBeNull()
    expect(mapped!.normalizedX).toBe(0)
    expect(mapped!.normalizedY).toBeCloseTo(0.5, 5)
  })

  it('returns null for invalid transform or bounds', () => {
    const t = computeViewTransform({
      cssWidth: 800, cssHeight: 600, sourceWidth: 400, sourceHeight: 300,
      viewZoom: 1, panX: 0, panY: 0, rotation: 0,
    })
    expect(mapClientPointToImage({
      clientX: 0, clientY: 0, bounds: { left: 0, top: 0, width: 0, height: 600 }, transform: t,
    })).toBeNull()
    expect(mapClientPointToImage({
      clientX: 0, clientY: 0, bounds, transform: { ...t, drawWidth: 0 },
    })).toBeNull()
  })

  it('applies mobileCssView before mapping to normalized coords', () => {
    const t = computeViewTransform({
      cssWidth: 800, cssHeight: 600, sourceWidth: 400, sourceHeight: 300,
      viewZoom: 1, panX: 0, panY: 0, rotation: 0,
    })
    const zoom = 1.4; const panX = 12; const panY = -8; const rot = 0.25
    const baseCanvasX = t.centerX
    const baseCanvasY = t.centerY
    const screen = applyMobileCssViewTransform(baseCanvasX, baseCanvasY, t.centerX, t.centerY, zoom, panX, panY, rot)
    const mapped = mapClientPointToImage({
      clientX: bounds.left + screen.canvasX,
      clientY: bounds.top + screen.canvasY,
      bounds, transform: t,
      mobileCssView: { centerX: t.centerX, centerY: t.centerY, zoom, panX, panY, rotation: rot },
    })
    expect(mapped).not.toBeNull()
    expect(mapped!.normalizedX).toBeCloseTo(0.5, 4)
    expect(mapped!.normalizedY).toBeCloseTo(0.5, 4)
  })
})
