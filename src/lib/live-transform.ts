import type { PixelShiftType } from './effects'
import type { DistortEffectId, DistortParams } from './distort-effects'

export interface LiveTransformOpts {
  enabled: DistortEffectId[]
  strengths: Record<DistortEffectId, number>
  params: DistortParams
  pixelShiftType: PixelShiftType
}

export type { DistortEffectId } from './distort-effects'

export function liveTransformSubEffect(type: string): import('../types').GlitchSubEffect | null {
  const map: Record<string, import('../types').GlitchSubEffect> = {
    halftone: 'halftone',
    glitch: 'glitch',
    'pixel-shift': 'pixel-shift',
    'color-shift': 'color-shift',
  }
  return map[type] ?? null
}
