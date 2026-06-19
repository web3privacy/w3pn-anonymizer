import { DEFAULT_DISTORT_STRENGTHS, type DistortEffectId } from './distort-effects'
import type { PixelShiftType } from './effects'
import type { AnonymizeEffectId, NormalizeSettings } from '../types'

export const DEMO_MEDIA = [
  './demo/demo-privacy-street.png',
  './demo/demo-document-photo.png',
  './demo/demo-1.webp',
  './demo/demo-3.jpg',
  './demo/demo-5.png',
  './demo/vitalik-rap.webm',
  './demo/demo-voice.m4a',
  './demo/demo-document.txt',
  './demo/demo-document-scan.pdf',
]

export const DEFAULT_ADJ_TRANSFORM_PARAMS = {
  dotSize: 8, halftoneContrast: 50, halftoneAngle: 45,
  glitchShift: 15, glitchColorSplit: 8,
  pixelShiftX: 10, pixelShiftY: 5,
  colorShiftHue: 60, colorShiftSat: 50,
}

export type VideoDistortSettingsSnapshot = {
  enabled: DistortEffectId[]
  strengths: Record<DistortEffectId, number>
  params: {
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
  pixelShiftType: PixelShiftType
}

export const EMPTY_VIDEO_DISTORT_SETTINGS: VideoDistortSettingsSnapshot = {
  enabled: [],
  strengths: DEFAULT_DISTORT_STRENGTHS,
  params: { ...DEFAULT_ADJ_TRANSFORM_PARAMS },
  pixelShiftType: 'wave',
}

export const DEFAULT_NORMALIZE_SETTINGS: NormalizeSettings = {
  outputFormat: 'image/webp', quality: 82,
  resizeMode: 'max-bound', maxWidth: 2400, maxHeight: 2400,
  targetWidth: 1920, targetHeight: 1080,
  codecEngine: 'canvas', batchConcurrency: 2,
  cropMode: 'none', cropUniformPercent: 0,
  cropPercentLeft: 0, cropPercentRight: 0, cropPercentTop: 0, cropPercentBottom: 0,
  cropPixelsLeft: 0, cropPixelsRight: 0, cropPixelsTop: 0, cropPixelsBottom: 0,
  templateCropNormalized: null,
  contentAwareAspectWidth: 16, contentAwareAspectHeight: 9, contentAwareScalePercent: 86,
  overwriteOriginals: false,
  resizeAspectCrop: false, resizeAspectW: 16, resizeAspectH: 9,
  glitchSubEffect: 'halftone', glitchSeed: 42, glitchQuality: 30, glitchAmount: 35,
  halftoneDotSize: 4, halftoneShape: 'circle',
  batchBrightness: 0, batchContrast: 0, batchSaturation: 0, batchPreset: 'none',
  batchAnonymizeEffect: 'blur', batchAnonymizeStrength: 80,
}

/** Map effect ids to Material Symbol icon names. */
export const EFFECT_ICONS: Record<AnonymizeEffectId, string> = {
  blur:         'blur_on',
  pixelate:     'grid_on',
  'zoom-blur':  'motion_blur',
  blackout:     'square',
  emoji:        'mood',
  noise:        'grain',
  glitch:       'auto_fix_high',
  contour:      'pentagon',
  thermal:      'bubble_chart',
  ascii:        'data_array',
  'custom-image': 'image',
}
