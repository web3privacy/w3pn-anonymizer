import { describe, it, expect } from 'vitest'
import { paramsToOptions, DEFAULT_VECTORIZE_PARAMS, type VectorizeParams } from './vectorize'

const base: VectorizeParams = { ...DEFAULT_VECTORIZE_PARAMS }

describe('paramsToOptions', () => {
  it('maps named presets to ImageTracer preset strings', () => {
    expect(paramsToOptions({ ...base, preset: 'posterized' })).toBe('posterized2')
    expect(paramsToOptions({ ...base, preset: 'artistic' })).toBe('artistic1')
    expect(paramsToOptions({ ...base, preset: 'sharp' })).toBe('sharp')
    expect(paramsToOptions({ ...base, preset: 'curvy' })).toBe('curvy')
    expect(paramsToOptions({ ...base, preset: 'grayscale' })).toBe('grayscale')
  })

  it('returns a tuned options object for the smoothed preset', () => {
    const opts = paramsToOptions({ ...base, preset: 'smoothed' }) as Record<string, number>
    expect(opts.blurradius).toBe(2)
    expect(opts.numberofcolors).toBe(12)
  })

  it('derives an options object from numeric params for default preset', () => {
    const opts = paramsToOptions({
      preset: 'default',
      colorCount: 24,
      minPathLength: 3,
      cornerThreshold: 1.5,
    }) as Record<string, number>
    expect(opts.numberofcolors).toBe(24)
    expect(opts.ltres).toBe(1.5)
    expect(opts.qtres).toBe(1.5)
    expect(opts.pathomit).toBe(12) // round(3 * 4)
  })
})
