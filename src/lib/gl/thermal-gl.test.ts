import { describe, expect, it } from 'vitest'
import { THERMAL_FRAG } from './thermal-gl'

describe('Color Ball GL', () => {
  it('blends the generated fill back into the source at zone edges', () => {
    expect(THERMAL_FRAG).toContain('edgeDistance')
    expect(THERMAL_FRAG).toContain('smoothstep(0.0, feather, edgeDistance)')
    expect(THERMAL_FRAG).toContain('mix(src.rgb, ballColor, edgeMix)')
  })
})
