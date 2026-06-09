import type { ColorAdjustments } from '../types'
import { DEFAULT_COLOR_ADJUSTMENTS } from '../types'

/** True when any live filter beyond raw camera is active. */
export function livePipelineHasWork(
  colorAdj: ColorAdjustments,
  distortEnabled: boolean,
  detectEnabled: boolean,
  faceCount: number,
): boolean {
  const colorActive =
    colorAdj.brightness !== DEFAULT_COLOR_ADJUSTMENTS.brightness ||
    colorAdj.contrast !== DEFAULT_COLOR_ADJUSTMENTS.contrast ||
    colorAdj.saturation !== DEFAULT_COLOR_ADJUSTMENTS.saturation ||
    colorAdj.shadows !== DEFAULT_COLOR_ADJUSTMENTS.shadows ||
    colorAdj.highlights !== DEFAULT_COLOR_ADJUSTMENTS.highlights ||
    colorAdj.preset !== DEFAULT_COLOR_ADJUSTMENTS.preset
  return colorActive || distortEnabled || (detectEnabled && faceCount > 0)
}

/** Exponential moving average — stable readout without hiding spikes entirely. */
export function smoothPipelineMs(prev: number | null, next: number, alpha = 0.35): number {
  if (prev == null || prev <= 0) return next
  return Math.round(prev * (1 - alpha) + next * alpha)
}

export function pipelineDisplayMs(
  fullBenchmarkMs: number | null,
  distortPassMs: number | null,
  syncEffectsMs: number | null,
  distortEnabled: boolean,
): number | null {
  if (fullBenchmarkMs != null && fullBenchmarkMs > 0) return fullBenchmarkMs
  if (distortEnabled && distortPassMs != null && distortPassMs > 0) {
    return Math.round(distortPassMs + (syncEffectsMs ?? 0))
  }
  // Per-frame sync alone is mostly draw + blit (~1ms) — wait for full benchmark.
  return null
}
