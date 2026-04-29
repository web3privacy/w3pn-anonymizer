export type ThemeMode = 'light' | 'dark'

export type SourceType = 'upload' | 'local-folder'

export type ToolMode = 'brush' | 'zone' | 'crop'

export type AnonymizeEffectId =
  | 'blur'
  | 'pixelate'
  | 'blackout'
  | 'emoji'
  | 'noise'
  | 'glitch'
  | 'silhouette'
  | 'contour'
  | 'thermal'
  | 'static'
  | 'zoom-blur'

export interface EffectDefinition {
  id: AnonymizeEffectId
  label: string
  description: string
  icon: string  // Material Symbol name
}

export interface FaceBox {
  x: number
  y: number
  width: number
  height: number
  score?: number
}

export interface Zone {
  id: string
  x: number
  y: number
  width: number
  height: number
  effect: AnonymizeEffectId
  emoji: string
}

export interface PhotoItem {
  id: string
  name: string
  mimeType: string
  blob: Blob
  previewUrl: string
  source: SourceType
  edited: boolean
  fileHandle?: FileSystemFileHandle
}

export interface DetectorStatus {
  mode: 'backend' | 'native' | 'face-api' | 'unavailable'
  message: string
}

export type NormalizeFormat = 'image/jpeg' | 'image/png' | 'image/webp'
export type NormalizeResizeMode = 'keep' | 'max-bound' | 'exact'
export type NormalizeCodecEngine = 'canvas' | 'worker-codec'
export type NormalizeCropMode =
  | 'none'
  | 'uniform-percent'
  | 'sides-percent'
  | 'sides-px'
  | 'template'

export interface NormalizedRect {
  x: number
  y: number
  width: number
  height: number
}

// Batch task system
export type BatchTaskId = 'format' | 'resize' | 'crop' | 'colors' | 'glitch' | 'anonymize'
export type GlitchSubEffect = 'glitch' | 'halftone' | 'pixel-shift' | 'color-shift'

export interface NormalizeSettings {
  outputFormat: NormalizeFormat
  quality: number
  resizeMode: NormalizeResizeMode
  maxWidth: number
  maxHeight: number
  targetWidth: number
  targetHeight: number
  codecEngine: NormalizeCodecEngine
  batchConcurrency: number
  cropMode: NormalizeCropMode
  cropUniformPercent: number
  cropPercentLeft: number
  cropPercentRight: number
  cropPercentTop: number
  cropPercentBottom: number
  cropPixelsLeft: number
  cropPixelsRight: number
  cropPixelsTop: number
  cropPixelsBottom: number
  templateCropNormalized: NormalizedRect | null
  contentAwareAspectWidth: number
  contentAwareAspectHeight: number
  contentAwareScalePercent: number
  overwriteOriginals: boolean
  // Resize aspect crop
  resizeAspectCrop: boolean
  resizeAspectW: number
  resizeAspectH: number
  // Glitch / transform task settings
  glitchSubEffect: GlitchSubEffect
  glitchSeed: number
  glitchQuality: number
  glitchAmount: number
  halftoneDotSize: number
  halftoneShape: 'circle' | 'square' | 'triangle'
  // Batch color adjustment (independent of per-photo colorAdj)
  batchBrightness: number
  batchContrast: number
  batchSaturation: number
  batchPreset: ColorPresetId
  batchAnonymizeEffect: string  // AnonymizeEffectId for batch auto-anonymize task
  batchAnonymizeStrength: number
}

// ── Color adjustments ────────────────────────────────────────────
export type ColorPresetId =
  | 'none'
  | 'bw'
  | 'bw-high-contrast'
  | 'threshold'
  | 'natural-warm'
  | 'faded'
  | 'duotone'
  | 'newspaper'
  | '4-colors'

export interface ColorAdjustments {
  brightness: number   // -100 … +100
  contrast: number     // -100 … +100
  saturation: number   // -100 … +100
  shadows: number      // -100 … +100
  highlights: number   // -100 … +100
  preset: ColorPresetId
}

export const DEFAULT_COLOR_ADJUSTMENTS: ColorAdjustments = {
  brightness: 0, contrast: 0, saturation: 0, shadows: 0, highlights: 0, preset: 'none',
}

export const COLOR_PRESETS: { id: ColorPresetId; label: string; values: Omit<ColorAdjustments, 'preset'> }[] = [
  { id: 'none',            label: 'Original',            values: { brightness: 0,   contrast: 0,   saturation: 0,    shadows: 0,   highlights: 0 } },
  { id: 'bw',              label: 'B&W',                 values: { brightness: 0,   contrast: 5,   saturation: -100, shadows: 0,   highlights: 0 } },
  { id: 'bw-high-contrast',label: 'B&W High contrast',   values: { brightness: 0,   contrast: 60,  saturation: -100, shadows: -30, highlights: 20 } },
  { id: 'threshold',       label: 'Threshold',           values: { brightness: 0,   contrast: 100, saturation: -100, shadows: -100, highlights: 100 } },
  { id: 'natural-warm',    label: 'Natural warm',        values: { brightness: 8,   contrast: 12,  saturation: 15,   shadows: 5,   highlights: -5 } },
  { id: 'faded',           label: 'Faded',               values: { brightness: 10,  contrast: -20, saturation: -20,  shadows: 30,  highlights: -15 } },
  { id: 'duotone',         label: 'Duotone',             values: { brightness: 5,   contrast: 30,  saturation: -70,  shadows: 10,  highlights: -10 } },
  { id: 'newspaper',       label: 'Newspaper',           values: { brightness: 5,   contrast: 80,  saturation: -100, shadows: -20, highlights: 30 } },
  { id: '4-colors',        label: '4 Colors',            values: { brightness: 0,   contrast: 80,  saturation: 50,   shadows: -30, highlights: 30 } },
]

export interface NormalizeResult {
  photoId: string
  outputName: string
  outputMimeType: NormalizeFormat
  blob: Blob
  beforeWidth: number
  beforeHeight: number
  afterWidth: number
  afterHeight: number
  beforeBytes: number
  afterBytes: number
}
