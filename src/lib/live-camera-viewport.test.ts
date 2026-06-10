import { describe, it, expect } from 'vitest'
import { targetAspectRatio, computeSourceCrop } from './live-camera-viewport'

describe('targetAspectRatio', () => {
  it('returns null for native (no crop)', () => {
    expect(targetAspectRatio('native')).toBeNull()
  })
  it('returns the numeric ratios', () => {
    expect(targetAspectRatio('1:1')).toBe(1)
    expect(targetAspectRatio('16:9')).toBeCloseTo(16 / 9, 6)
    expect(targetAspectRatio('4:3')).toBeCloseTo(4 / 3, 6)
  })
})

describe('computeSourceCrop', () => {
  it('returns the full frame for native', () => {
    expect(computeSourceCrop(1920, 1080, 'native')).toEqual({ sx: 0, sy: 0, sw: 1920, sh: 1080 })
  })
  it('returns the full frame for invalid dimensions', () => {
    expect(computeSourceCrop(0, 0, '1:1')).toEqual({ sx: 0, sy: 0, sw: 0, sh: 0 })
  })
  it('crops width when source is wider than target (16:9 -> 1:1)', () => {
    const c = computeSourceCrop(1920, 1080, '1:1')
    expect(c.sh).toBe(1080)
    expect(c.sw).toBe(1080)
    expect(c.sx).toBe((1920 - 1080) / 2)
    expect(c.sy).toBe(0)
  })
  it('crops height when source is taller than target', () => {
    const c = computeSourceCrop(1080, 1920, '1:1')
    expect(c.sw).toBe(1080)
    expect(c.sh).toBe(1080)
    expect(c.sy).toBe((1920 - 1080) / 2)
    expect(c.sx).toBe(0)
  })
  it('keeps the crop centered', () => {
    const c = computeSourceCrop(1600, 900, '4:3')
    // target 4/3 ≈ 1.333, src 1.777 > target → crop width
    expect(c.sh).toBe(900)
    expect(c.sw).toBeCloseTo(900 * (4 / 3), 6)
    expect(c.sx).toBeCloseTo((1600 - 900 * (4 / 3)) / 2, 6)
  })
})
