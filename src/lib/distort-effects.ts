import { applyGlitchEffect, type PixelShiftType } from './effects'
import { liveTransformSubEffect } from './live-transform'
import type { GlitchSubEffect } from '../types'

export type DistortEffectId = 'halftone' | 'glitch' | 'pixel-shift' | 'color-shift'

export const DISTORT_EFFECT_ORDER: DistortEffectId[] = [
  'halftone',
  'glitch',
  'pixel-shift',
  'color-shift',
]

export const DISTORT_EFFECT_META: Record<DistortEffectId, { label: string; icon: string }> = {
  halftone: { label: 'Halftone', icon: 'grain' },
  glitch: { label: 'Glitch', icon: 'broken_image' },
  'pixel-shift': { label: 'Pixel shift', icon: 'swipe' },
  'color-shift': { label: 'Color shift', icon: 'palette' },
}

export interface DistortParams {
  dotSize: number
  halftoneContrast: number
  halftoneAngle: number
  glitchShift: number
  glitchColorSplit: number
  pixelShiftX: number
  pixelShiftY: number
  colorShiftHue: number
  colorShiftSat: number
}

export const DEFAULT_DISTORT_STRENGTHS: Record<DistortEffectId, number> = {
  halftone: 35,
  glitch: 35,
  'pixel-shift': 35,
  'color-shift': 35,
}

export function distortPipelineKey(
  enabled: DistortEffectId[],
  strengths: Record<DistortEffectId, number>,
  params: DistortParams,
  pixelShiftType: PixelShiftType,
): string {
  return JSON.stringify({ enabled, strengths, params, pixelShiftType })
}

function glitchParamsFor(
  id: DistortEffectId,
  amount: number,
  params: DistortParams,
  pixelShiftType: PixelShiftType,
  seed: number,
) {
  const sub = liveTransformSubEffect(id) as GlitchSubEffect
  return {
    subEffect: sub,
    amount,
    seed,
    halftoneDotSize: params.dotSize,
    halftoneShape: 'circle' as const,
    halftoneContrast: params.halftoneContrast,
    halftoneAngle: params.halftoneAngle,
    glitchShift: params.glitchShift,
    glitchColorSplit: params.glitchColorSplit,
    pixelShiftX: params.pixelShiftX,
    pixelShiftY: params.pixelShiftY,
    pixelShiftType,
    colorShiftHue: params.colorShiftHue,
    colorShiftSat: params.colorShiftSat,
  }
}

export async function applyDistortPipeline(
  src: HTMLCanvasElement,
  enabled: DistortEffectId[],
  strengths: Record<DistortEffectId, number>,
  params: DistortParams,
  pixelShiftType: PixelShiftType,
  seed = 42,
): Promise<HTMLCanvasElement> {
  let current: HTMLCanvasElement = src
  for (const id of DISTORT_EFFECT_ORDER) {
    if (!enabled.includes(id)) continue
    const sub = liveTransformSubEffect(id)
    if (!sub) continue
    current = await applyGlitchEffect(current, glitchParamsFor(id, strengths[id], params, pixelShiftType, seed))
  }
  return current
}
