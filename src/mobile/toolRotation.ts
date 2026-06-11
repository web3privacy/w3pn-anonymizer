import type { AnonymizeEffectId, ToolMode } from '../types'
import type { MobileToolCategory } from './types'

export type FaceToolId = 'detect' | 'show-boxes' | 'remove-selected' | 'clear-all' | 'threshold'
export type ZoneToolId = 'rectangle' | 'brush' | 'eraser'
export type CropToolId = 'crop' | 'rotate-left' | 'rotate-right'
export type AdjustToolId = 'brightness' | 'contrast' | 'saturation'
export type EffectToolId = AnonymizeEffectId

export const FACE_TOOLS: FaceToolId[] = ['detect', 'show-boxes', 'remove-selected', 'clear-all', 'threshold']
export const ZONE_TOOLS: ZoneToolId[] = ['rectangle', 'brush', 'eraser']
export const CROP_TOOLS: CropToolId[] = ['crop', 'rotate-left', 'rotate-right']
export const ADJUST_TOOLS: AdjustToolId[] = ['brightness', 'contrast', 'saturation']

export const EFFECT_TOOL_ORDER: AnonymizeEffectId[] = [
  'pixelate', 'blur', 'blackout', 'emoji', 'custom-image', 'glitch', 'noise', 'ascii',
]

export const CATEGORY_ICONS: Record<MobileToolCategory, string> = {
  face: 'face_retouching_natural',
  gallery: 'photo_library',
  zone: 'brush',
  crop: 'crop',
  adjust: 'tune',
  distort: 'auto_awesome',
  effects: 'blur_on',
  more: 'more_horiz',
}

export const CATEGORY_LABELS: Record<MobileToolCategory, string> = {
  face: 'FACE',
  gallery: 'LIBRARY',
  zone: 'TOOLS',
  crop: 'CROP',
  adjust: 'ADJUST',
  distort: 'DISTORT',
  effects: 'EFFECTS',
  more: 'MORE',
}

export function faceToolLabel(id: FaceToolId): string {
  switch (id) {
    case 'detect': return 'Detect'
    case 'show-boxes': return 'Boxes'
    case 'remove-selected': return 'Remove'
    case 'clear-all': return 'Clear all'
    case 'threshold': return 'Threshold'
  }
}

export function zoneToolLabel(id: ZoneToolId): string {
  switch (id) {
    case 'rectangle': return 'Rectangle'
    case 'brush': return 'Brush'
    case 'eraser': return 'Eraser'
  }
}

export function cropToolLabel(id: CropToolId): string {
  switch (id) {
    case 'crop': return 'Crop'
    case 'rotate-left': return 'Rotate L'
    case 'rotate-right': return 'Rotate R'
  }
}

export function adjustToolLabel(id: AdjustToolId): string {
  switch (id) {
    case 'brightness': return 'Brightness'
    case 'contrast': return 'Contrast'
    case 'saturation': return 'Saturation'
  }
}

export function panelForCategory(cat: MobileToolCategory): import('./types').MobilePanel | null {
  switch (cat) {
    case 'face': return 'tool-face'
    case 'zone': return 'tool-zone'
    case 'crop': return 'tool-crop'
    case 'adjust': return 'tool-adjust'
    case 'distort': return 'tool-distort'
    case 'effects': return 'tool-effects'
    case 'more': return 'tool-more'
    case 'gallery': return 'gallery'
    default: return null
  }
}

export function toolModeForZoneTool(id: ZoneToolId): ToolMode {
  if (id === 'rectangle') return 'zone'
  return 'brush'
}
