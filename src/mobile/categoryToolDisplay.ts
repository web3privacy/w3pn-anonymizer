import type { AnonymizeEffectId } from '../types'
import { EFFECTS } from '../lib/effects'
import { DISTORT_EFFECT_META } from '../lib/distort-effects'
import type { AppMobileBindings } from './bindings'
import type { MobileToolCategory } from './types'
import {
  ADJUST_TOOLS,
  adjustToolLabel,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  CROP_TOOLS,
  cropToolLabel,
  EFFECT_TOOL_ORDER,
  FACE_TOOLS,
  faceToolLabel,
  ZONE_TOOLS,
  zoneToolLabel,
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

const EFFECT_SHORT_LABELS = Object.fromEntries(
  EFFECTS.map((effect) => [effect.id, effect.label.toUpperCase().replace(/\s+/g, '').slice(0, 5)]),
) as Record<AnonymizeEffectId, string>

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


function pickAt<T>(list: readonly T[], idx: number): T {
  return list[Math.min(Math.max(0, idx), list.length - 1)]
}

function activeZoneToolId(b: AppMobileBindings): (typeof ZONE_TOOLS)[number] {
  const idx = b.categoryIndices.zone ?? 0
  let id = pickAt(ZONE_TOOLS, idx)
  if (b.toolMode === 'brush') {
    id = b.eraserActive ? 'eraser' : 'brush'
  } else if (b.toolMode === 'zone') {
    id = 'rectangle'
  }
  return id
}

/** Icon reflects the active sub-tool. */
export function getCategoryToolIcon(cat: MobileToolCategory, b: AppMobileBindings): string {
  const idx = b.categoryIndices[cat] ?? 0

  switch (cat) {
    case 'face':
      return CATEGORY_ICONS.face
    case 'zone':
      return ZONE_TOOL_ICONS[activeZoneToolId(b)]
    case 'crop': {
      let id = pickAt(CROP_TOOLS, idx)
      if (b.toolMode === 'crop') id = 'crop'
      return CROP_TOOL_ICONS[id]
    }
    case 'adjust': {
      const id = pickAt(ADJUST_TOOLS, idx)
      return ADJUST_TOOL_ICONS[id]
    }
    case 'effects':
      return EFFECT_ICONS[b.selectedEffect] ?? CATEGORY_ICONS.effects
    case 'distort': {
      const first = b.enabledDistorts[0]
      if (first) return DISTORT_EFFECT_META[first].icon
      return CATEGORY_ICONS.distort
    }
    default:
      return CATEGORY_ICONS[cat]
  }
}

/** Full name of the active sub-tool (for aria-label / screen readers). */
export function getCategoryToolAriaLabel(cat: MobileToolCategory, b: AppMobileBindings): string {
  const idx = b.categoryIndices[cat] ?? 0

  switch (cat) {
    case 'face': {
      const id = pickAt(FACE_TOOLS, idx)
      return `${CATEGORY_LABELS.face}: ${faceToolLabel(id)}`
    }
    case 'zone': {
      const id = activeZoneToolId(b)
      return `${CATEGORY_LABELS.zone}: ${zoneToolLabel(id)}`
    }
    case 'crop': {
      let id = pickAt(CROP_TOOLS, idx)
      if (b.toolMode === 'crop') id = 'crop'
      return `${CATEGORY_LABELS.crop}: ${cropToolLabel(id)}`
    }
    case 'adjust': {
      const id = pickAt(ADJUST_TOOLS, idx)
      return `${CATEGORY_LABELS.adjust}: ${adjustToolLabel(id)}`
    }
    case 'effects': {
      const meta = EFFECTS.find((e) => e.id === b.selectedEffect)
      return `${CATEGORY_LABELS.effects}: ${meta?.label ?? 'Effect'}`
    }
    case 'distort': {
      const first = b.enabledDistorts[0]
      if (first) {
        return `${CATEGORY_LABELS.distort}: ${DISTORT_EFFECT_META[first].label}`
      }
      return CATEGORY_LABELS.distort
    }
    default:
      return CATEGORY_LABELS[cat]
  }
}

/** Category label: stable default until the user picks a sub-tool (zone / photo effects). */
export function getCategoryToolbarLabel(
  cat: MobileToolCategory,
  b: AppMobileBindings,
  liveMode: boolean,
): string {
  switch (cat) {
    case 'zone': {
      if (!b.zoneToolCustomized) return CATEGORY_LABELS.zone
      const id = activeZoneToolId(b)
      return zoneToolLabel(id).toUpperCase().replace(/\s+/g, '').slice(0, 5)
    }
    case 'effects': {
      if (liveMode || b.activePhoto?.isVideo) return CATEGORY_LABELS.effects
      if (!b.effectToolCustomized) return CATEGORY_LABELS.effects
      return EFFECT_SHORT_LABELS[b.selectedEffect] ?? CATEGORY_LABELS.effects
    }
    default:
      return CATEGORY_LABELS[cat]
  }
}

export function getCategoryToolDisplay(
  cat: MobileToolCategory,
  b: AppMobileBindings,
  liveMode = false,
): { icon: string; label: string; ariaLabel: string } {
  return {
    icon: getCategoryToolIcon(cat, b),
    label: getCategoryToolbarLabel(cat, b, liveMode),
    ariaLabel: getCategoryToolAriaLabel(cat, b),
  }
}

export function effectIconFor(id: AnonymizeEffectId): string {
  return EFFECT_ICONS[id] ?? EFFECT_ICONS[EFFECT_TOOL_ORDER[0]]
}
