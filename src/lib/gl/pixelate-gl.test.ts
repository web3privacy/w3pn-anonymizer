import { describe, expect, it } from 'vitest'
import { PIXELATE_FRAG } from './pixelate-gl'

describe('pixelate GL', () => {
  it('shader declares required uniforms', () => {
    expect(PIXELATE_FRAG).toContain('u_block')
    expect(PIXELATE_FRAG).toContain('u_image')
    expect(PIXELATE_FRAG).toContain('u_invW')
  })
})
