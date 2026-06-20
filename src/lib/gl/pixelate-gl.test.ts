import { describe, expect, it } from 'vitest'
import { mapPixelateBlockSize, pixelateStrengthForBlockSize, PIXELATE_FRAG } from './pixelate-gl'

describe('pixelate GL', () => {
  it('shader declares required uniforms', () => {
    expect(PIXELATE_FRAG).toContain('u_block')
    expect(PIXELATE_FRAG).toContain('u_image')
    expect(PIXELATE_FRAG).toContain('u_invW')
  })

  it('maps the default 20px block size in both directions', () => {
    expect(mapPixelateBlockSize(pixelateStrengthForBlockSize(20))).toBe(20)
  })
})
