import { describe, it, expect } from 'vitest'
import {
  faceOffsetPads,
  expandNormBox,
  expandPixelBox,
  zoneWithFaceOffset,
  liveZoneDisplayRect,
} from './face-offset'
import type { Zone } from '../types'

describe('faceOffsetPads', () => {
  it('maps 0% to no horizontal pad and the fixed vertical bias', () => {
    expect(faceOffsetPads(0)).toEqual({ padX: 0, padY: 0.06 })
  })
  it('maps 100% to the +50% cap per side', () => {
    expect(faceOffsetPads(100)).toEqual({ padX: 0.5, padY: 0.56 })
  })
  it('is linear in between', () => {
    expect(faceOffsetPads(50).padX).toBeCloseTo(0.25, 6)
  })
})

describe('expandNormBox', () => {
  it('expands a centered box symmetrically', () => {
    const r = expandNormBox(0.4, 0.4, 0.2, 0.2, 0.5, 0.5)
    // px = 0.2*0.5 = 0.1 → x0=0.3, x1=0.7
    expect(r.x).toBeCloseTo(0.3, 6)
    expect(r.width).toBeCloseTo(0.4, 6)
  })
  it('clamps to the [0,1] frame', () => {
    const r = expandNormBox(0, 0, 1, 1, 0.5, 0.5)
    expect(r.x).toBe(0)
    expect(r.y).toBe(0)
    expect(r.width).toBe(1)
    expect(r.height).toBe(1)
  })
  it('never produces a degenerate (sub-2%) box', () => {
    const r = expandNormBox(0.5, 0.5, 0, 0, 0, 0)
    expect(r.width).toBeGreaterThanOrEqual(0.02)
    expect(r.height).toBeGreaterThanOrEqual(0.02)
  })
})

describe('expandPixelBox', () => {
  it('normalizes pixel coords then expands', () => {
    const r = expandPixelBox(100, 100, 200, 200, 1000, 1000, 0)
    // 0% offset → padX 0, padY 0.06 of height (0.2) = 0.012
    expect(r.x).toBeCloseTo(0.1, 6)
    expect(r.y).toBeCloseTo(0.1 - 0.012, 6)
  })
})

describe('zoneWithFaceOffset', () => {
  it('returns the zone unchanged when no detect box is present', () => {
    const zone: Zone = { id: 'z1', x: 0.1, y: 0.1, width: 0.2, height: 0.2, effect: 'pixelate', emoji: '' }
    expect(zoneWithFaceOffset(zone, 50)).toBe(zone)
  })
  it('expands from the detect box when present', () => {
    const zone: Zone = {
      id: 'z2', x: 0.1, y: 0.1, width: 0.2, height: 0.2, effect: 'pixelate', emoji: '',
      detectX: 0.4, detectY: 0.4, detectWidth: 0.2, detectHeight: 0.2,
    }
    const out = zoneWithFaceOffset(zone, 100)
    expect(out.id).toBe('z2')
    expect(out.x).toBeCloseTo(0.3, 6)
  })
})

describe('liveZoneDisplayRect', () => {
  it('expands a plain rect with the offset pads', () => {
    const r = liveZoneDisplayRect({ x: 0.4, y: 0.4, width: 0.2, height: 0.2 }, 100)
    expect(r.x).toBeCloseTo(0.3, 6)
  })
})
