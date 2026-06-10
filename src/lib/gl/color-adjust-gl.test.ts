import { describe, it, expect } from 'vitest'
import { colorAdjustModeAndScale, lutToRGBA, COLOR_ADJUST_FRAG } from './color-adjust-gl'
import { DEFAULT_COLOR_ADJUSTMENTS, type ColorAdjustments } from '../../types'

// effects.ts touches the DOM at module load (scratch canvases), so we build a
// synthetic 256-entry curve here instead of importing buildColorLUT.
const identityLut = (): Uint8ClampedArray => {
  const lut = new Uint8ClampedArray(256)
  for (let v = 0; v < 256; v++) lut[v] = v
  return lut
}

const base: ColorAdjustments = { ...DEFAULT_COLOR_ADJUSTMENTS }

describe('colorAdjustModeAndScale', () => {
  it('uses threshold mode for the threshold preset regardless of saturation', () => {
    expect(colorAdjustModeAndScale({ ...base, preset: 'threshold', saturation: -100 })).toEqual({ mode: 2, satScale: 1 })
  })
  it('uses LUT-only mode when saturation is zero', () => {
    expect(colorAdjustModeAndScale({ ...base, brightness: 20 })).toEqual({ mode: 0, satScale: 1 })
  })
  it('uses saturation mode with a quantized scale matching the CPU fixed-point', () => {
    const sa = 50 / 100
    const expected = Math.round((1 + sa) * 1024) / 1024
    expect(colorAdjustModeAndScale({ ...base, saturation: 50 })).toEqual({ mode: 1, satScale: expected })
  })
})

describe('lutToRGBA', () => {
  it('expands a 256-entry curve into 256x1 RGBA with opaque alpha', () => {
    const lut = identityLut()
    const rgba = lutToRGBA(lut)
    expect(rgba.length).toBe(256 * 4)
    for (let i = 0; i < 256; i++) {
      expect(rgba[i * 4]).toBe(lut[i])
      expect(rgba[i * 4 + 1]).toBe(lut[i])
      expect(rgba[i * 4 + 2]).toBe(lut[i])
      expect(rgba[i * 4 + 3]).toBe(255)
    }
  })
})

describe('COLOR_ADJUST_FRAG', () => {
  it('is a WebGL2 fragment shader using the image + lut samplers', () => {
    expect(COLOR_ADJUST_FRAG).toContain('#version 300 es')
    expect(COLOR_ADJUST_FRAG).toContain('uniform sampler2D u_image')
    expect(COLOR_ADJUST_FRAG).toContain('uniform sampler2D u_lut')
  })
})
