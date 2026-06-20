import { describe, expect, it } from 'vitest'
import { resolveVideoExportSize, VIDEO_MAX_EXPORT_DIMENSION } from './video-export-size'

describe('resolveVideoExportSize', () => {
  it('uses source dimensions when no target is requested', () => {
    expect(resolveVideoExportSize(1920, 1080)).toEqual({ width: 1920, height: 1080 })
  })

  it('normalizes requested dimensions for video encoders', () => {
    expect(resolveVideoExportSize(1920, 1080, { width: 1001, height: 721 })).toEqual({
      width: 1000,
      height: 720,
    })
  })

  it('clamps invalid or oversized dimensions', () => {
    expect(resolveVideoExportSize(1920, 1080, { width: 0, height: 99999 })).toEqual({
      width: 1920,
      height: VIDEO_MAX_EXPORT_DIMENSION,
    })
  })
})
