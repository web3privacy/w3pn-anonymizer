import type { AnonymizeEffectId, ColorAdjustments } from '../types'
import { DEFAULT_COLOR_ADJUSTMENTS } from '../types'
import type { AppMobileBindings } from './bindings'
import type { MobileToolCategory } from './types'

export function isColorAdjActive(adj: ColorAdjustments): boolean {
  return !(
    adj.brightness === DEFAULT_COLOR_ADJUSTMENTS.brightness &&
    adj.contrast === DEFAULT_COLOR_ADJUSTMENTS.contrast &&
    adj.saturation === DEFAULT_COLOR_ADJUSTMENTS.saturation &&
    adj.shadows === DEFAULT_COLOR_ADJUSTMENTS.shadows &&
    adj.highlights === DEFAULT_COLOR_ADJUSTMENTS.highlights &&
    adj.preset === DEFAULT_COLOR_ADJUSTMENTS.preset
  )
}

export function isCategoryEffectActive(
  cat: MobileToolCategory,
  b: AppMobileBindings,
  liveMode: boolean,
): boolean {
  switch (cat) {
    case 'face':
      return liveMode ? b.liveDetectEnabled : b.autoDetect
    case 'adjust':
      return isColorAdjActive(b.batch.colorAdj)
    case 'distort':
      return b.enabledDistorts.length > 0
    case 'effects':
      if (liveMode) return b.liveDetectEnabled
      if (b.activePhoto?.isVideo) return b.autoDetect || b.selectedEffect !== 'pixelate'
      return b.selectedEffect !== 'pixelate' || b.activeZones.length > 0 || b.zonesAnonymized
    case 'zone':
      return !liveMode && (
        b.toolMode === 'brush' ||
        b.toolMode === 'zone' ||
        b.eraserActive ||
        (b.activeZones.length > 0 && !b.autoDetect)
      )
    case 'crop':
      return !liveMode && (b.toolMode === 'crop' || b.cropDraft != null)
    default:
      return false
  }
}

export function isEffectApplied(
  effectId: AnonymizeEffectId,
  b: AppMobileBindings,
  liveMode: boolean,
): boolean {
  if (liveMode) return b.liveDetectEnabled && b.selectedEffect === effectId
  if (b.activePhoto?.isVideo) return b.selectedEffect === effectId
  return b.activeZones.some((z) => z.effect === effectId)
}
