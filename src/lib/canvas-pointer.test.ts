import { describe, it, expect } from 'vitest'
import {
  computeBrushRadius,
  computeEraserPatchBounds,
  shouldApplyBrushStroke,
  computeBrushSizeFromWheel,
  computeBrushStrengthFromWheel,
  isNearZoneResizeHandle,
} from './canvas-pointer'
import { DEFAULT_TRANSFORM } from './canvas-geometry'

describe('computeBrushRadius', () => {
  it('enforces a minimum radius', () => {
    expect(computeBrushRadius(2, 1)).toBe(4)
  })

  it('scales brush size by inverse zoom', () => {
    expect(computeBrushRadius(40, 2)).toBe(20)
  })

  it('returns minimum when scale is non-positive', () => {
    expect(computeBrushRadius(100, 0)).toBe(4)
  })
})

describe('computeEraserPatchBounds', () => {
  it('clips to canvas edges', () => {
    const b = computeEraserPatchBounds(2, 3, 10, 100, 80)
    expect(b.x0).toBe(0)
    expect(b.y0).toBe(0)
    expect(b.w).toBeGreaterThan(0)
    expect(b.h).toBeGreaterThan(0)
  })

  it('centers patch around pointer when away from edges', () => {
    const b = computeEraserPatchBounds(50, 40, 8, 100, 80)
    expect(b.x0).toBe(42)
    expect(b.y0).toBe(32)
    expect(b.w).toBe(16)
    expect(b.h).toBe(16)
  })
})

describe('shouldApplyBrushStroke', () => {
  it('throttles desktop strokes at 50ms', () => {
    expect(shouldApplyBrushStroke(100, 60, false)).toBe(false)
    expect(shouldApplyBrushStroke(120, 60, false)).toBe(true)
  })

  it('throttles mobile strokes at 80ms', () => {
    expect(shouldApplyBrushStroke(130, 60, true)).toBe(false)
    expect(shouldApplyBrushStroke(150, 60, true)).toBe(true)
  })
})

describe('computeBrushSizeFromWheel', () => {
  it('increases size on scroll up (negative deltaY)', () => {
    expect(computeBrushSizeFromWheel(-100, false, 52)).toBeGreaterThan(52)
  })

  it('clamps to configured bounds', () => {
    expect(computeBrushSizeFromWheel(-10000, false, 52)).toBe(100)
    expect(computeBrushSizeFromWheel(10000, false, 52)).toBe(4)
  })

  it('uses a larger step with ctrl held', () => {
    const normal = computeBrushSizeFromWheel(-100, false, 52)
    const ctrl = computeBrushSizeFromWheel(-100, true, 52)
    expect(ctrl - 52).toBeGreaterThan(normal - 52)
  })
})

describe('computeBrushStrengthFromWheel', () => {
  it('adjusts strength and clamps', () => {
    expect(computeBrushStrengthFromWheel(-100, 0.5)).toBeGreaterThan(0.5)
    expect(computeBrushStrengthFromWheel(10000, 0.5)).toBe(0.01)
    expect(computeBrushStrengthFromWheel(-10000, 0.5)).toBe(1)
  })
})

describe('isNearZoneResizeHandle', () => {
  const t = { ...DEFAULT_TRANSFORM, drawWidth: 100, drawHeight: 100 }

  it('detects clicks near the bottom-right handle', () => {
    const zone = { x: 0, y: 0, width: 0.5, height: 0.5 }
    expect(isNearZoneResizeHandle(50, 50, zone, t, 12)).toBe(true)
  })

  it('rejects clicks far from the handle', () => {
    const zone = { x: 0, y: 0, width: 0.5, height: 0.5 }
    expect(isNearZoneResizeHandle(5, 5, zone, t, 12)).toBe(false)
  })
})
