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
  | 'contour'
  | 'thermal'
  | 'ascii'
  | 'zoom-blur'
  | 'custom-image'

export type CustomImageSource =
  | 'custom'
  | 'ui-faces-human'
  | 'ui-faces-abstract'
  | 'cryptopunks'
  | 'aavegotchi'
  | 'celebrities'

export interface CustomImageAsset {
  id: string
  name: string
  blob: Blob
  objectUrl: string
  imageBitmap?: ImageBitmap
}

/** Character pool the ASCII effect draws from. */
export type AsciiCharset = 'all' | 'numbers' | 'letters' | 'other'

export interface EffectRenderOptions {
  customImages?: CustomImageAsset[]
  customImageSource?: CustomImageSource
  customImageAssetId?: string
  zoneId?: string
  seed?: string | number
  /** ASCII effect: which glyph pool to render from (default 'all'). */
  asciiCharset?: AsciiCharset
}

export interface EffectParamMeta {
  key: string
  label: string
  min: number
  max: number
  default: number
  unit?: string
}

export interface EffectDefinition {
  id: AnonymizeEffectId
  label: string
  description: string
  icon: string  // Material Symbol name
  /** User-facing name for the main "strength" slider (default "Intensity"). */
  strengthLabel?: string
  /** Short (≤5 char) label for the mobile bottom-toolbar strength slider. */
  mobileStrengthLabel?: string
  /** Additional meaningful parameters (beyond the strength slider). */
  params?: EffectParamMeta[]
}

export interface FaceBox {
  x: number
  y: number
  width: number
  height: number
  score?: number
}

/** Privacy detection category (visual targets). */
export type PrivacyDetectionType =
  | 'face'
  | 'person'
  | 'license_plate'
  | 'screen'
  | 'tattoo'
  | 'sign'
  | 'document'
  | 'pii_text'
  | 'object'
  | 'manual_zone'

export type BoundingBox = {
  x: number
  y: number
  width: number
  height: number
}

export type PrivacyDetection = {
  id: string
  type: PrivacyDetectionType
  bbox: BoundingBox
  confidence: number
  sourceModel: string
  frameTime?: number
  color?: string
  /** Raw model class name for generic 'object' detections (e.g. "car", "dog"),
   * or the PII subtype for 'pii_text' detections (e.g. "email", "credit_card"). */
  objectClass?: string
  /** Optional caption (overrides the derived short label) for the preview overlay. */
  label?: string
  locked?: boolean
  hidden?: boolean
}

export type DetectionCategoryConfig = {
  type: PrivacyDetectionType
  label: string
  enabled: boolean
  confidenceThreshold: number
  color: string
  effectId?: AnonymizeEffectId
}

export type DetectorRuntime = 'browser' | 'localhost-backend'

export type DetectorInput = {
  imageBitmap?: ImageBitmap
  canvas?: HTMLCanvasElement
  imageData?: ImageData
  width: number
  height: number
  frameTime?: number
  /** Force multi-pass YuNet tiling (thorough scan). */
  robust?: boolean
  /** Raw YOLO class names to additionally emit as generic 'object' detections. */
  enabledClasses?: string[]
}

export type DetectorOutput = {
  detections: PrivacyDetection[]
  timings?: Record<string, number>
  warnings?: string[]
}

export interface PrivacyDetector {
  id: string
  runtime: DetectorRuntime
  supportedTypes: PrivacyDetectionType[]
  load(): Promise<void>
  detect(
    input: DetectorInput,
    config: DetectionCategoryConfig[],
  ): Promise<DetectorOutput>
  dispose?(): void
}

export type ModelAvailabilityStatus = 'missing' | 'loading' | 'ready' | 'error'

export interface Zone {
  id: string
  x: number
  y: number
  width: number
  height: number
  effect: AnonymizeEffectId
  emoji: string
  customImageAssetId?: string
  maskShape?: 'rectangle' | 'circle' | 'path'
  /** Raw YuNet detection box (normalized); face-offset slider expands from these. */
  detectX?: number
  detectY?: number
  detectWidth?: number
  detectHeight?: number
  detectionType?: PrivacyDetectionType
  /** Raw model class name for generic 'object' detections, or PII subtype for 'pii_text'. */
  objectClass?: string
  /** Tiny overlay caption shown on the preview (faces stay unlabeled). */
  label?: string
  confidence?: number
  sourceModel?: string
  locked?: boolean
  hidden?: boolean
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
  isVideo?: boolean
  videoDuration?: number
  videoWidth?: number
  videoHeight?: number
  videoFps?: number
  derivedFromVideoId?: string
  derivedFromVideoTime?: number
  isAudio?: boolean
  audioDuration?: number
  isDocument?: boolean
  documentKind?: 'pdf' | 'txt' | 'md' | 'docx'
  /**
   * For video items: which tracks to keep on export. 'both' keeps video+audio,
   * 'video' drops the audio, 'audio' treats the clip as audio-only. Defaults to 'both'.
   */
  trackMode?: 'both' | 'video' | 'audio'
}

export interface DetectorStatus {
  mode: 'yunet-wasm' | 'unavailable'
  message: string
}

/** What the detector scans for. Only 'faces' is wired to a local model today. */
export type DetectionTarget = 'faces' | 'plates' | 'documents' | 'text'

export type NormalizeFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/bmp' | 'image/gif' | 'image/tiff'
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
