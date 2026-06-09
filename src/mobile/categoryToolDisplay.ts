import type { AnonymizeEffectId } from '../types'
import { EFFECTS } from '../lib/effects'
import { DISTORT_EFFECT_META } from '../lib/distort-effects'
import type { AppMobileBindings } from './bindings'
import type { MobileToolCategory } from './types'
import {
  ADJUST_TOOLS,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  CROP_TOOLS,
  cropToolLabel,
  EFFECT_TOOL_ORDER,
  FACE_TOOLS,
  faceToolLabel,
  ZONE_TOOLS,
} from './toolRotation'

export const EFFECT_ICONS: Record<AnonymizeEffectId, string> = {
  blur: 'blur_on',
  pixelate: 'grid_on',
  'zoom-blur': 'motion_blur',
  blackout: 'square',
  emoji: 'mood',
  noise: 'grain',
  glitch: 'auto_fix_high',
  silhouette: 'person',
  contour: 'pentagon',
  thermal: 'thermostat',
  static: 'tv',
  'custom-image': 'image',
}

const ZONE_TOOL_ICONS = {
  rectangle: 'crop_free',
  brush: 'brush',
  eraser: 'ink_eraser',
} as const

const CROP_TOOL_ICONS = {
  crop: 'crop',
  'rotate-left': 'rotate_left',
  'rotate-right': 'rotate_right',
} as const

const ADJUST_TOOL_ICONS = {
  brightness: 'brightness_6',
  contrast: 'contrast',
  saturation: 'palette',
} as const

const EFFECT_LABELS = Object.fromEntries(
  EFFECTS.map((effect) => [effect.id, effect.label.toUpperCase().replace(/\s+/g, '').slice(0, 5)]),
) as Record<AnonymizeEffectId, string>

function pickAt<T>(list: readonly T[], idx: number): T {
  return list[Math.min(Math.max(0, idx), list.length - 1)]
}

export function getCategoryToolDisplay(
  cat: MobileToolCategory,
  b: AppMobileBindings,
): { icon: string; label: string } {
  const idx = b.categoryIndices[cat] ?? 0

  switch (cat) {
    case 'face': {
      const id = pickAt(FACE_TOOLS, idx)
      return { icon: 'face_retouching_natural', label: faceToolLabel(id).toUpperCase() }
    }
    case 'zone': {
      let id = pickAt(ZONE_TOOLS, idx)
      if (b.toolMode === 'brush') {
        id = b.eraserActive ? 'eraser' : 'brush'
      } else if (b.toolMode === 'zone') {
        id = 'rectangle'
      }
      return { icon: ZONE_TOOL_ICONS[id], label: 'BRUSH' }
    }
    case 'crop': {
      let id = pickAt(CROP_TOOLS, idx)
      if (b.toolMode === 'crop') id = 'crop'
      return { icon: CROP_TOOL_ICONS[id], label: cropToolLabel(id).toUpperCase().replace(/\s+/g, '') }
    }
    case 'adjust': {
      const id = pickAt(ADJUST_TOOLS, idx)
      return { icon: ADJUST_TOOL_ICONS[id], label: 'BRIGH' }
    }
    case 'effects': {
      const id = b.selectedEffect
      return {
        icon: EFFECT_ICONS[id] ?? 'blur_on',
        label: EFFECT_LABELS[id] ?? 'FX',
      }
    }
    case 'distort': {
      const first = b.enabledDistorts[0]
      if (first) {
        const meta = DISTORT_EFFECT_META[first]
        return { icon: meta.icon, label: meta.label.toUpperCase().slice(0, 5) }
      }
      return { icon: CATEGORY_ICONS.distort, label: CATEGORY_LABELS.distort }
    }
    case 'gallery':
      return { icon: CATEGORY_ICONS.gallery, label: CATEGORY_LABELS.gallery }
    case 'more':
      return { icon: CATEGORY_ICONS.more, label: CATEGORY_LABELS.more }
    default:
      return { icon: CATEGORY_ICONS[cat], label: CATEGORY_LABELS[cat] }
  }
}

export function effectIconFor(id: AnonymizeEffectId): string {
  return EFFECT_ICONS[id] ?? EFFECT_ICONS[EFFECT_TOOL_ORDER[0]]
}
