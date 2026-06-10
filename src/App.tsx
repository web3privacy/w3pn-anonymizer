import {
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import './App.css'
import './mobile/mobile-redesign.css'
import './desktop/desktop-v2.css'
import { DesktopHomeDefault } from './desktop/DesktopHomeDefault'
import { Icon } from './components/Icon'
import { EffectPickerDialog } from './components/EffectPickerDialog'
import { AdjustToolPanel } from './components/tool-panels/AdjustToolPanel'
import { RangeWithThumb } from './components/RangeWithThumb'
import { DistortToolPanel } from './components/tool-panels/DistortToolPanel'
import { FaceSettingsPanel } from './components/tool-panels/FaceSettingsPanel'
import { ToolSliderRow } from './components/ToolSliderRow'
import './components/tool-panels/tool-panels.css'
import { useHoldRepeat } from './lib/useHoldRepeat'
import { useIsMobile } from './mobile/useIsMobile'
import { usePinchZoom } from './mobile/usePinchZoom'
import { usePhotoSwipeNav } from './mobile/usePhotoSwipeNav'
import { useLockMobileViewport } from './mobile/useLockMobileViewport'
import { useDialogFocusTrap } from './mobile/useDialogFocusTrap'
import { MobileAbout } from './mobile/MobileAbout'
import { MobileLiveMode } from './mobile/MobileLiveMode'
import { MobileShell } from './mobile/MobileShell'
import { MobileToast } from './mobile/MobileToast'
import { MobileImageCanvasControls } from './mobile/MobileImageCanvasControls'
import { MobileDrawMaskPanel } from './mobile/MobileDrawMaskPanel'
import { MobileVideoProgress } from './mobile/MobileVideoProgress'
import type { AppMobileBindings } from './mobile/bindings'
import { bakePhotoToCanvas } from './lib/bake-photo-export'
import {
  DEFAULT_CUSTOM_IMAGE_PRESET_ID,
  customImageFolderForSource,
} from './lib/custom-image-presets'
import { exportCanvasToBlob as exportCanvasToBlobLib } from './lib/export-canvas'
import type { MobileMode, MobilePanel, MobileToolCategory } from './mobile/types'
import { CROP_TOOLS, EFFECT_TOOL_ORDER, FACE_TOOLS, panelForCategory, ZONE_TOOLS } from './mobile/toolRotation'
import type { AdjustToolId, CropToolId, EffectToolId, FaceToolId, ZoneToolId } from './mobile/toolRotation'
import { detectFaces, initializeDetector, resetDetectorStatus, getDetectorStatus, setDetectionProgressCallback, setDetectorLoadProgressCallback, getDetectorLoadProgress, type DetectorLoadProgress } from './lib/detector'
import { ModelLoadStatus } from './components/ModelLoadStatus'
import { CLEAR_DETECT_FIELDS, expandPixelBox, faceOffsetPads, zonesWithFaceOffset } from './lib/face-offset'
import {
  applyDistortPipeline,
  DEFAULT_DISTORT_STRENGTHS,
  distortPipelineKey,
  type DistortEffectId,
} from './lib/distort-effects'
import { EFFECTS, applyColorAdjustments, applyEffectBrush, applyEffectRect, applyGlitchEffect, colorAdjExportKey, getMobileStrengthLabel, isColorAdjNoop, pickEmojiFromSeed, pickRandomEmoji, pickUniqueEmojis, previewEffectBrush } from './lib/effects'
import type { PixelShiftType } from './lib/effects'
import { canvasToBmpBlob, canvasToGifBlob, canvasToTiffBlob, FORMAT_EXT, isLosslessFormat } from './lib/image-encoders'
import { canvasToSvg, canvasToSvgBlob, VECTORIZE_PRESETS, DEFAULT_VECTORIZE_PARAMS, type VectorizeParams, type VectorizePreset } from './lib/vectorize'
import { extractPosterFrame, getSupportedVideoExportOptions, getVideoMetadata, getVideoPipelineCapabilities, mimeTypeToVideoExtension, processVideo, videoZoneStrength, VideoFaceTrackStabilizer, type VideoDistortOptions, type VideoExportFormatId, type VideoFrameOverride, type VideoProcessingPhase, type VideoTimedZone } from './lib/video'
import {
  detectFrameCropFromBlob,
  getCropRectNormalized,
  normalizeSinglePhoto,
  suggestContentAwareCropFromBlob,
} from './lib/normalize'
import type {
  AnonymizeEffectId,
  BatchTaskId,
  ColorAdjustments,
  ColorPresetId,
  CustomImageAsset,
  CustomImageSource,
  DetectorStatus,
  DetectionTarget,
  EffectRenderOptions,
  GlitchSubEffect,
  NormalizedRect,
  NormalizeCodecEngine,
  NormalizeCropMode,
  NormalizeFormat,
  NormalizeResult,
  NormalizeSettings,
  PhotoItem,
  SourceType,
  ThemeMode,
  ToolMode,
  Zone,
} from './types'
import { COLOR_PRESETS, DEFAULT_COLOR_ADJUSTMENTS } from './types'

interface DrawTransform {
  drawX: number
  drawY: number
  drawWidth: number
  drawHeight: number
  imageWidth: number
  imageHeight: number
  scale: number
  rotation?: number
  centerX?: number
  centerY?: number
}

interface PointerMap {
  canvasX: number
  canvasY: number
  imageX: number
  imageY: number
  normalizedX: number
  normalizedY: number
}

type PointerSession =
  | { mode: 'idle' }
  | { mode: 'brush'; lastPointer: PointerMap | null }
  | { mode: 'move-zone'; zoneId: string; offsetX: number; offsetY: number }
  | { mode: 'resize-zone'; zoneId: string }
  | { mode: 'create-zone'; startX: number; startY: number }
  | { mode: 'normalize-crop'; startX: number; startY: number }
  | { mode: 'crop-draw'; startX: number; startY: number }

type InputRecord = {
  file: File
  name: string
  source: PhotoItem['source']
  handle?: FileSystemFileHandle
}

const DEFAULT_TRANSFORM: DrawTransform = {
  drawX: 0, drawY: 0, drawWidth: 0, drawHeight: 0,
  imageWidth: 0, imageHeight: 0, scale: 1,
}

const DEMO_MEDIA = [
  './demo/demo-1.webp',
  './demo/demo-2.webp',
  './demo/demo-3.jpg',
  './demo/demo-4.png',
  './demo/demo-5.png',
  './demo/vitalik-rap.webm',
]

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

const makeNormalizedRect = (startX: number, startY: number, endX: number, endY: number): NormalizedRect => {
  const x = Math.min(startX, endX)
  const y = Math.min(startY, endY)
  return {
    x: clamp(x, 0, 1),
    y: clamp(y, 0, 1),
    width: clamp(Math.abs(endX - startX), 0, 1),
    height: clamp(Math.abs(endY - startY), 0, 1),
  }
}

const createId = () =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

const hashString = (value: string | number | undefined) => {
  const text = String(value ?? 'custom-image')
  let hash = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const pickCustomImageAssetId = (assets: CustomImageAsset[], seed: string | number) => {
  const ready = assets.filter((asset) => asset.imageBitmap)
  if (ready.length === 0) return undefined
  return ready[Math.abs(hashString(seed)) % ready.length]?.id
}

const brushStampSeed = (photoId: string, imageX: number, imageY: number) =>
  `${photoId}:${Math.round(imageX)}:${Math.round(imageY)}`

interface BrushStamp {
  seed: string
  emoji: string
  customImageAssetId?: string
}

import { MOBILE_BREAKPOINT_PX } from './mobile/types'

const MOBILE_THEME_QUERY = `(max-width: ${MOBILE_BREAKPOINT_PX}px)`

const DEFAULT_ADJ_TRANSFORM_PARAMS = {
  dotSize: 8, halftoneContrast: 50, halftoneAngle: 45,
  glitchShift: 15, glitchColorSplit: 8,
  pixelShiftX: 10, pixelShiftY: 5,
  colorShiftHue: 60, colorShiftSat: 50,
}

type VideoDistortSettingsSnapshot = {
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

const EMPTY_VIDEO_DISTORT_SETTINGS: VideoDistortSettingsSnapshot = {
  enabled: [],
  strengths: DEFAULT_DISTORT_STRENGTHS,
  params: { ...DEFAULT_ADJ_TRANSFORM_PARAMS },
  pixelShiftType: 'wave',
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window !== 'undefined' && window.matchMedia(MOBILE_THEME_QUERY).matches) {
    return 'dark'
  }
  const s = localStorage.getItem('anonymizer-theme')
  if (s === 'light' || s === 'dark') return s
  return 'dark'
}

const DEFAULT_NORMALIZE_SETTINGS: NormalizeSettings = {
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

// Map effect ids to Material Symbol icon names
const EFFECT_ICONS: Record<AnonymizeEffectId, string> = {
  blur:         'blur_on',
  pixelate:     'grid_on',
  'zoom-blur':  'motion_blur',
  blackout:     'square',
  emoji:        'mood',
  noise:        'grain',
  glitch:       'auto_fix_high',
  silhouette:   'person',
  contour:      'pentagon',
  thermal:      'thermostat',
  static:       'tv',
  'custom-image': 'image',
}


const localToCanvas = (lx: number, ly: number, t: DrawTransform) => {
  const rot = t.rotation ?? 0
  const cx = t.centerX ?? t.drawX + t.drawWidth / 2
  const cy = t.centerY ?? t.drawY + t.drawHeight / 2
  if (Math.abs(rot) < 0.001) return { x: cx + lx, y: cy + ly }
  const cos = Math.cos(rot)
  const sin = Math.sin(rot)
  return { x: cx + lx * cos - ly * sin, y: cy + lx * sin + ly * cos }
}

const normalizedToLocal = (nx: number, ny: number, t: DrawTransform) => ({
  lx: -t.drawWidth / 2 + nx * t.drawWidth,
  ly: -t.drawHeight / 2 + ny * t.drawHeight,
})

const zoneToCanvasRect = (zone: Zone, t: DrawTransform) => {
  const corners = [
    normalizedToLocal(zone.x, zone.y, t),
    normalizedToLocal(zone.x + zone.width, zone.y, t),
    normalizedToLocal(zone.x, zone.y + zone.height, t),
    normalizedToLocal(zone.x + zone.width, zone.y + zone.height, t),
  ].map(({ lx, ly }) => localToCanvas(lx, ly, t))
  const xs = corners.map((c) => c.x)
  const ys = corners.map((c) => c.y)
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y }
}

const zoneContainsNormalized = (zone: Zone, nx: number, ny: number) =>
  nx >= zone.x && nx <= zone.x + zone.width && ny >= zone.y && ny <= zone.y + zone.height

/** Rotate normalized zone coords 90° (direction 1 = CW, -1 = CCW). */
const rotateZone90 = (zone: Zone, direction: 1 | -1): Zone => {
  const { x, y, width, height } = zone
  const base = direction === 1
    ? { x: y, y: 1 - x - width, width: height, height: width }
    : { x: 1 - y - height, y: x, width: height, height: width }
  const next: Zone = { ...zone, ...base }
  if (
    zone.detectX != null && zone.detectY != null
    && zone.detectWidth != null && zone.detectHeight != null
  ) {
    const dx = zone.detectX
    const dy = zone.detectY
    const dw = zone.detectWidth
    const dh = zone.detectHeight
    if (direction === 1) {
      next.detectX = dy
      next.detectY = 1 - dx - dw
      next.detectWidth = dh
      next.detectHeight = dw
    } else {
      next.detectX = 1 - dy - dh
      next.detectY = dx
      next.detectWidth = dh
      next.detectHeight = dw
    }
  }
  return next
}

const rotateZones90 = (zones: Zone[], direction: 1 | -1): Zone[] =>
  zones.map((z) => rotateZone90(z, direction))

const drawNormalizeCropInView = (
  ctx: CanvasRenderingContext2D,
  rect: NormalizedRect,
  drawWidth: number,
  drawHeight: number,
  isDraft: boolean,
) => {
  const x = -drawWidth / 2 + rect.x * drawWidth
  const y = -drawHeight / 2 + rect.y * drawHeight
  const w = rect.width * drawWidth
  const h = rect.height * drawHeight
  ctx.save()
  ctx.strokeStyle = isDraft ? '#ff7a1a' : '#2f81f7'
  ctx.lineWidth = isDraft ? 2.6 : 2
  ctx.strokeRect(x, y, w, h)
  ctx.restore()
}

const drawZoneInView = (
  ctx: CanvasRenderingContext2D,
  zone: Zone,
  drawWidth: number,
  drawHeight: number,
  selected: boolean,
) => {
  const zx = -drawWidth / 2 + zone.x * drawWidth
  const zy = -drawHeight / 2 + zone.y * drawHeight
  const zw = zone.width * drawWidth
  const zh = zone.height * drawHeight
  ctx.save()
  ctx.strokeStyle = selected ? '#ff7a1a' : '#2f81f7'
  ctx.lineWidth = selected ? 2.5 : 1.8
  ctx.setLineDash(selected ? [] : [])
  ctx.strokeRect(zx, zy, zw, zh)
  if (selected) {
    const hs = 8
    ctx.fillStyle = '#ff7a1a'
    ctx.fillRect(zx + zw - hs / 2, zy + zh - hs / 2, hs, hs)
  }
  ctx.restore()
}

const canvasToBlob = (canvas: HTMLCanvasElement, mimeType: string, quality?: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => { if (!blob) reject(new Error('Canvas export failed')); else resolve(blob) },
      mimeType, quality ?? 0.94,
    )
  })

type PngDepth = 'full' | 'reduced' | 'minimal'

/**
 * Export canvas as PNG with optional color quantization.
 * 'reduced' → 5-bit per channel (32 levels) — visually near-identical, noticeably smaller
 * 'minimal' → 3-bit per channel (8 levels)  — visible banding on gradients, smallest PNG
 */
function quantizeCanvasToBlob(canvas: HTMLCanvasElement, depth: PngDepth): Promise<Blob> {
  if (depth === 'full') return canvasToBlob(canvas, 'image/png')
  const tmp = document.createElement('canvas')
  tmp.width = canvas.width
  tmp.height = canvas.height
  const ctx = tmp.getContext('2d')!
  ctx.drawImage(canvas, 0, 0)
  const imageData = ctx.getImageData(0, 0, tmp.width, tmp.height)
  const d = imageData.data
  const step = depth === 'reduced' ? 8 : 32  // 'reduced'=5-bit, 'minimal'=3-bit
  for (let i = 0; i < d.length; i += 4) {
    d[i]     = Math.min(255, Math.round(d[i]     / step) * step)
    d[i + 1] = Math.min(255, Math.round(d[i + 1] / step) * step)
    d[i + 2] = Math.min(255, Math.round(d[i + 2] / step) * step)
    // alpha channel left unchanged
  }
  ctx.putImageData(imageData, 0, 0)
  return canvasToBlob(tmp, 'image/png')
}

/** Export canvas to blob, handling all supported formats. */
async function exportCanvasToBlob(
  canvas: HTMLCanvasElement,
  format: NormalizeFormat,
  quality: number,
  pngDepth: PngDepth,
): Promise<Blob> {
  switch (format) {
    case 'image/png': return quantizeCanvasToBlob(canvas, pngDepth)
    case 'image/bmp': return canvasToBmpBlob(canvas)
    case 'image/gif': return canvasToGifBlob(canvas)
    case 'image/tiff': return canvasToTiffBlob(canvas)
    default: return canvasToBlob(canvas, format, quality / 100)
  }
}

/**
 * Re-encode a blob through a canvas to strip all embedded metadata
 * (EXIF, GPS coordinates, camera info, timestamps, ICC profiles, etc.).
 * The canvas API only retains raw pixel data — all metadata segments are discarded.
 */
async function stripMetadata(blob: Blob): Promise<Blob> {
  const bmp = await createImageBitmap(blob)
  const canvas = document.createElement('canvas')
  canvas.width = bmp.width
  canvas.height = bmp.height
  canvas.getContext('2d')!.drawImage(bmp, 0, 0)
  bmp.close()
  const mime = blob.type || 'image/jpeg'
  // PNG stays lossless; JPEG/WebP use a high-quality re-encode
  return canvasToBlob(canvas, mime, mime === 'image/png' ? undefined : 0.96)
}

const makeZipSafeName = (name: string, existing: Map<string, number>) => {
  const cleaned = name.replace(/^\/+/, '')
  const seen = existing.get(cleaned) ?? 0
  if (seen === 0) { existing.set(cleaned, 1); return cleaned }
  const dot = cleaned.lastIndexOf('.')
  const base = dot === -1 ? cleaned : cleaned.slice(0, dot)
  const ext = dot === -1 ? '' : cleaned.slice(dot)
  const next = `${base}-${seen + 1}${ext}`
  existing.set(cleaned, seen + 1)
  return next
}

const waitForUi = () => new Promise<void>((resolve) => window.setTimeout(resolve, 0))

const formatVideoTime = (sec: number) => {
  const safe = Math.max(0, Number.isFinite(sec) ? sec : 0)
  const minutes = Math.floor(safe / 60)
  const seconds = Math.floor(safe % 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/** Fractional rect of the object-fit:contain video picture inside .video-media. */
type VideoContentLayout = {
  left: number
  top: number
  width: number
  height: number
}

const measureVideoContentLayout = (
  mediaWidth: number,
  mediaHeight: number,
  videoWidth: number,
  videoHeight: number,
): VideoContentLayout | null => {
  if (mediaWidth <= 0 || mediaHeight <= 0 || videoWidth <= 0 || videoHeight <= 0) return null
  const videoAR = videoWidth / videoHeight
  const mediaAR = mediaWidth / mediaHeight
  let contentW: number
  let contentH: number
  let offsetX: number
  let offsetY: number
  if (mediaAR > videoAR) {
    contentH = mediaHeight
    contentW = contentH * videoAR
    offsetX = (mediaWidth - contentW) / 2
    offsetY = 0
  } else {
    contentW = mediaWidth
    contentH = contentW / videoAR
    offsetX = 0
    offsetY = (mediaHeight - contentH) / 2
  }
  return {
    left: offsetX / mediaWidth,
    top: offsetY / mediaHeight,
    width: contentW / mediaWidth,
    height: contentH / mediaHeight,
  }
}

const videoOverlayLayerStyle = (layout: VideoContentLayout | null): React.CSSProperties | undefined => {
  if (!layout) return undefined
  return {
    left: `${layout.left * 100}%`,
    top: `${layout.top * 100}%`,
    width: `${layout.width * 100}%`,
    height: `${layout.height * 100}%`,
    right: 'auto',
    bottom: 'auto',
  }
}

const syncVideoOverlayCanvasDisplay = (
  overlay: HTMLCanvasElement,
  layout: VideoContentLayout | null,
) => {
  Object.assign(overlay.style, {
    width: '100%',
    height: '100%',
    ...(videoOverlayLayerStyle(layout) ?? {}),
  })
}

const paintVideoPreviewOverlay = (
  overlay: HTMLCanvasElement,
  source: CanvasImageSource,
  sourceW: number,
  sourceH: number,
  layout: VideoContentLayout | null,
) => {
  overlay.width = sourceW
  overlay.height = sourceH
  overlay.getContext('2d')!.drawImage(source, 0, 0)
  syncVideoOverlayCanvasDisplay(overlay, layout)
  overlay.classList.add('visible')
}

const waitForVideoFrame = (video: HTMLVideoElement): Promise<void> =>
  new Promise((resolve) => {
    if (video.seeking) {
      video.addEventListener('seeked', () => resolve(), { once: true })
      return
    }
    // Paused video does not present new frames — rVFC never fires.
    if (video.paused || video.ended) {
      requestAnimationFrame(() => resolve())
      return
    }
    if (typeof video.requestVideoFrameCallback === 'function') {
      video.requestVideoFrameCallback(() => resolve())
      return
    }
    requestAnimationFrame(() => resolve())
  })

/** Progressive video face scan: default 10%, then +4%/s → 14/18/22%. */
const VIDEO_FACE_SCAN_SENSITIVITY_STEP = 4
const VIDEO_FACE_SCAN_MAX_PASSES = 3

const getVideoFaceScanSensitivity = (userSensitivity: number, passIndex: number) =>
  clamp(userSensitivity + passIndex * VIDEO_FACE_SCAN_SENSITIVITY_STEP, 0, 100)

const getVideoDetectSettings = (userSensitivity: number, passIndex: number) => {
  const sensitivity = getVideoFaceScanSensitivity(userSensitivity, passIndex)
  const confidence = 0.7 - (sensitivity / 100) * 0.4
  const thorough = passIndex >= 1
  return { sensitivity, confidence, thorough }
}

type NormalizedFaceRect = { x: number; y: number; width: number; height: number }

const faceRectsSimilar = (a: NormalizedFaceRect, b: NormalizedFaceRect, tolerance = 0.06) =>
  Math.abs(a.x - b.x) <= tolerance
  && Math.abs(a.y - b.y) <= tolerance
  && Math.abs(a.width - b.width) <= tolerance
  && Math.abs(a.height - b.height) <= tolerance

const filterDismissedFaceZones = (zones: Zone[], dismissed: NormalizedFaceRect[]) =>
  zones.filter((zone) => !dismissed.some((rect) => faceRectsSimilar(zone, rect)))

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'tif', 'avif', 'heic', 'heif'])
const VIDEO_EXTENSIONS_SET = new Set(['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', 'ogv'])
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB per image
const MAX_VIDEO_FILE_SIZE = 500 * 1024 * 1024 // 500 MB per video
const MAX_TOTAL_PHOTOS = 2000
const isMediaFile = (f: File) => {
  if (f.size === 0) return false
  const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
  if (f.type?.startsWith('video/') || VIDEO_EXTENSIONS_SET.has(ext)) {
    return f.size <= MAX_VIDEO_FILE_SIZE
  }
  if (f.size > MAX_FILE_SIZE) return false
  if (f.type && f.type.startsWith('image/')) return true
  return IMAGE_EXTENSIONS.has(ext)
}
const isVideoFileCheck = (f: File) => {
  if (f.type?.startsWith('video/')) return true
  const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
  return VIDEO_EXTENSIONS_SET.has(ext)
}

const fmtBytes = (b: number) => {
  if (b < 1024 * 100) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

// Live elapsed timer — renders seconds since mount
const ElapsedTimer = () => {
  const [sec, setSec] = useState(0)
  useEffect(() => {
    const t0 = Date.now()
    const iv = setInterval(() => setSec(Math.floor((Date.now() - t0) / 1000)), 500)
    return () => clearInterval(iv)
  }, [])
  return <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{sec}s elapsed</span>
}

function App() {
  const isMobile = useIsMobile()
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null)
  const activePhotoIdRef = useRef<string | null>(null)
  const [zonesByPhoto, setZonesByPhoto] = useState<Record<string, Zone[]>>({})
  const [dirtyByPhoto, setDirtyByPhoto] = useState<Record<string, boolean>>({})
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)
  const [toolMode, setToolMode] = useState<ToolMode>('brush')
  const toolModeRef = useRef<ToolMode>('brush')
  const [selectedEffect, setSelectedEffectState] = useState<AnonymizeEffectId>('pixelate')
  const selectedEffectRef = useRef<AnonymizeEffectId>('pixelate')
  const [lastZoneTool, setLastZoneTool] = useState<'brush' | 'rectangle'>('brush')
  const [customImageSource, setCustomImageSource] = useState<CustomImageSource>('custom')
  const [customImageAssets, setCustomImageAssets] = useState<CustomImageAsset[]>([])
  const [customImagePresetLoading, setCustomImagePresetLoading] = useState(false)
  const customImageAssetsRef = useRef<CustomImageAsset[]>([])
  // Emoji / custom-image picker dialog + chosen-vs-random selection.
  const [effectPickerOpen, setEffectPickerOpen] = useState<'emoji' | 'custom-image' | null>(null)
  const [emojiRandom, setEmojiRandom] = useState(true)
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
  const [customImageRandom, setCustomImageRandom] = useState(true)
  const [selectedCustomImageId, setSelectedCustomImageId] = useState<string | null>(null)
  const emojiRandomRef = useRef(true)
  const selectedEmojiRef = useRef<string | null>(null)
  const customImageRandomRef = useRef(true)
  const selectedCustomImageIdRef = useRef<string | null>(null)
  emojiRandomRef.current = emojiRandom
  selectedEmojiRef.current = selectedEmoji
  selectedEffectRef.current = selectedEffect
  customImageRandomRef.current = customImageRandom
  selectedCustomImageIdRef.current = selectedCustomImageId
  // Resolve the emoji to assign to a zone, honoring the picker selection.
  const resolveEmoji = useCallback(() => (
    !emojiRandomRef.current && selectedEmojiRef.current ? selectedEmojiRef.current : pickRandomEmoji()
  ), [])
  // Resolve the custom-image asset id for a zone, honoring the picker selection.
  const resolveCustomImageAssetId = useCallback((seed: string | number) => (
    !customImageRandomRef.current && selectedCustomImageIdRef.current
      ? selectedCustomImageIdRef.current
      : pickCustomImageAssetId(customImageAssetsRef.current, seed)
  ), [])
  const [brushSize, setBrushSize] = useState(52)
  const [brushStrength, setBrushStrength] = useState(0.48)
  const brushStrengthRef = useRef(brushStrength)
  brushStrengthRef.current = brushStrength
  // Tracks whether the anonymization effect is currently baked onto the work
  // canvas, so offset/strength changes know to re-bake from the original.
  const previewBakedRef = useRef(false)
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)
  const effectiveTheme: ThemeMode = isMobile ? 'dark' : theme
  const [detector, setDetector] = useState<DetectorStatus>({ mode: 'unavailable', message: 'Initializing...' })
  const [detectorLoading, setDetectorLoading] = useState(true)
  const [modelLoadProgress, setModelLoadProgress] = useState<DetectorLoadProgress | null>(() => getDetectorLoadProgress())
  const [autoDetect, setAutoDetect] = useState(true)   // auto-detect faces on photo open
  const [showBoxes, setShowBoxes] = useState(true)     // show/hide zone outlines
  // Editable detection settings (exposed via the detection settings drawer).
  const [detectTarget, setDetectTarget] = useState<DetectionTarget>('faces')
  const [detectSensitivity, setDetectSensitivity] = useState(1) // 0..100 — low default reduces false positives
  const [detectThorough, setDetectThorough] = useState(false)
  // How far the anonymization box is grown around the detected face. The slider
  // reads 0–100 % but maps to a 0…0.5 padding fraction (see faceOffsetPads), so
  // "100 %" = +50 % of the face per side. Default covers the full head.
  const [detectFaceOffset, setDetectFaceOffset] = useState(40) // 0..100 (display)
  // Sensitivity → YuNet confidence threshold (higher sensitivity ⇒ lower bar).
  const detectConfidence = 0.7 - (detectSensitivity / 100) * 0.4
  const detectSettingsRef = useRef({ confidence: detectConfidence, thorough: detectThorough, faceOffset: detectFaceOffset })
  detectSettingsRef.current = { confidence: detectConfidence, thorough: detectThorough, faceOffset: detectFaceOffset }
  const faceOffsetFrac = faceOffsetPads(detectFaceOffset).padX
  const [exportFormat, setExportFormat] = useState<NormalizeFormat>('image/jpeg')
  const [exportQuality, setExportQuality] = useState(92)
  const [exportPngDepth, setExportPngDepth] = useState<PngDepth>('full')
  const [previewFileSizeKb, setPreviewFileSizeKb] = useState<number | null>(null)
  const [previewRendering, setPreviewRendering] = useState(false)
  const qualityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // resEditOpen removed — inputs are always visible now
  const [resEditW, setResEditW] = useState(0)
  const [resEditH, setResEditH] = useState(0)
  const [mobileExportDraft, setMobileExportDraft] = useState<{
    width: number
    height: number
    format: NormalizeFormat
    quality: number
  } | null>(null)
  const mobileExportDraftRef = useRef(mobileExportDraft)
  useEffect(() => { mobileExportDraftRef.current = mobileExportDraft }, [mobileExportDraft])
  const [isBusy, setIsBusy] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectionStep, setDetectionStep] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [localProcessingMs, setLocalProcessingMs] = useState<number | null>(null)
  const [lastDetectFailed, setLastDetectFailed] = useState(false)
  const [zoneToolCustomized, setZoneToolCustomized] = useState(false)
  const [effectToolCustomized, setEffectToolCustomized] = useState(false)
  const [isNormalizing, setIsNormalizing] = useState(false)
  const [notice, setNotice] = useState('Load photos to get started.')
  void notice // kept for setNotice side-effects (error messages, etc.) — not displayed in toolbar
  const [draftZone, setDraftZone] = useState<Zone | null>(null)
  const [cursorPoint, setCursorPoint] = useState<{ x: number; y: number } | null>(null)
  const [normalizeSettings, setNormalizeSettings] = useState<NormalizeSettings>(DEFAULT_NORMALIZE_SETTINGS)
  const [normalizeResults, setNormalizeResults] = useState<Record<string, NormalizeResult>>({})
  const [normalizeProgress, setNormalizeProgress] = useState({
    total: 0, done: 0, currentFile: '', success: 0, failed: 0,
    inputBytes: 0, outputBytes: 0, active: false, startedAt: 0, etaSeconds: 0,
  })
  const [normalizeSummary, setNormalizeSummary] = useState<{
    success: number; failed: number; canceled: boolean
    inputBytes: number; outputBytes: number
    elapsedSeconds: number; overwritten: number
  } | null>(null)
  const [normalizePreviewIds, setNormalizePreviewIds] = useState<string[]>([])
  const [normalizeCropDraft, setNormalizeCropDraft] = useState<NormalizedRect | null>(null)
  const [isNormalizeCropPicking, setIsNormalizeCropPicking] = useState(false)
  const [cropDraft, setCropDraft] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [activeImageSize, setActiveImageSize] = useState<{ width: number; height: number } | null>(null)
  const [sidebarView, setSidebarView] = useState<'grid' | 'list'>('grid')
  const [photoListLimit, setPhotoListLimit] = useState(240)
  const [batchPanelOpen, setBatchPanelOpen] = useState(false)   // replaces normPanelOpen
  const [aboutOpen, setAboutOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [pickerChoiceOpen, setPickerChoiceOpen] = useState(false)
  const [mobileMode, setMobileMode] = useState<MobileMode>('home')
  const [mobileEditorSlideIn, setMobileEditorSlideIn] = useState(false)
  const [desktopLiveOpen, setDesktopLiveOpen] = useState(false)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null)
  const [mobilePanelReturnTo, setMobilePanelReturnTo] = useState<MobilePanel>(null)
  const [mobileEditorReturnTo, setMobileEditorReturnTo] = useState<import('./mobile/types').MobileEditorReturnTo>(null)
  const [galleryBatchSelect, setGalleryBatchSelect] = useState(false)
  const [liveDetectEnabled, setLiveDetectEnabled] = useState(true)
  const [mobileViewZoom, setMobileViewZoom] = useState(1)
  const mobileViewZoomRef = useRef(1)
  const [mobileViewPan, setMobileViewPan] = useState({ x: 0, y: 0 })
  const mobileViewPanRef = useRef({ x: 0, y: 0 })
  const [mobileViewRotation, setMobileViewRotation] = useState(0)
  const mobileViewRotationRef = useRef(0)
  const [mobileViewTransformDirty, setMobileViewTransformDirty] = useState(false)
  /** Bumped when canvas draw transform changes so HTML overlays re-sync with the bitmap. */
  const [canvasLayoutVersion, setCanvasLayoutVersion] = useState(0)
  const [activeCategory, setActiveCategory] = useState<MobileToolCategory>('face')
  const [categoryIndices, setCategoryIndices] = useState<Record<MobileToolCategory, number>>({
    face: 0, gallery: 0, zone: 0, crop: 0, adjust: 0, distort: 0, effects: 0, more: 0,
  })
  const [mobileToast, setMobileToast] = useState<{ message: string; action?: { label: string; onClick: () => void } } | null>(null)
  const [exportLibraryProgress, setExportLibraryProgress] = useState<{ done: number; total: number } | null>(null)
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [folderScanState, setFolderScanState] = useState<{ found: number } | null>(null)
  const [colorAdj, setColorAdj] = useState<ColorAdjustments>(DEFAULT_COLOR_ADJUSTMENTS)
  const [colorAdjByPhoto, setColorAdjByPhoto] = useState<Record<string, ColorAdjustments>>({})
  const [isApplyingAll, setIsApplyingAll] = useState(false)
  void isApplyingAll; void setIsApplyingAll
  const [sidebarWidth, setSidebarWidth] = useState(220)
  const [undoCount, setUndoCount] = useState(0)
  const undoStackRef = useRef<ImageData[]>([])
  const [originalBlobByPhoto, setOriginalBlobByPhoto] = useState<Record<string, Blob>>({})
  const [selectedForBatch, setSelectedForBatch] = useState<Set<string>>(new Set())
  // Track whether the photo has had zones applied (for Anonymize/Reset button)
  const [appliedByPhoto, setAppliedByPhoto] = useState<Record<string, boolean>>({})
  // Video processing state
  const [videoProcessing, setVideoProcessing] = useState(false)
  const [videoProgress, setVideoProgress] = useState<{
    current: number
    total: number
    phase: VideoProcessingPhase
    renderFrame?: number
    renderTotal?: number
  } | null>(null)
  const videoAbortRef = useRef<AbortController | null>(null)
  const videoExportOptions = useMemo(() => getSupportedVideoExportOptions(), [])
  const videoPipelineCapabilities = useMemo(() => getVideoPipelineCapabilities(), [])
  const [videoExportFormat, setVideoExportFormat] = useState<VideoExportFormatId>('webm')
  const [videoFrameOverridesByPhoto, setVideoFrameOverridesByPhoto] = useState<Record<string, VideoFrameOverride[]>>({})
  const [videoTimedZonesByPhoto, setVideoTimedZonesByPhoto] = useState<Record<string, VideoTimedZone[]>>({})
  const [videoMaskDrawActive, setVideoMaskDrawActive] = useState(false)
  const [videoMaskShape, setVideoMaskShape] = useState<'rectangle' | 'circle' | 'path'>('rectangle')
  const [imageMaskDrawActive, setImageMaskDrawActive] = useState(false)
  const [eraserActive, setEraserActive] = useState(false)
  const eraserActiveRef = useRef(false)
  const eraserSourceCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const eraserSourcePhotoIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (imageMaskDrawActive && toolMode !== 'zone' && toolMode !== 'brush') {
      setToolMode('zone')
    }
  }, [imageMaskDrawActive, toolMode])
  useEffect(() => { eraserActiveRef.current = eraserActive }, [eraserActive])
  const [videoMaskRangeSec, setVideoMaskRangeSec] = useState(3)
  const [activeVideoTime, setActiveVideoTime] = useState(0)
  const [activeVideoFrameLabel, setActiveVideoFrameLabel] = useState<string | null>(null)
  const [videoDraftZone, setVideoDraftZone] = useState<Zone | null>(null)
  const videoMaskPointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const videoFrameLabelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // New UI state
  const [effectFlyoutOpen, setEffectFlyoutOpen] = useState(false)
  const [adjFlyoutOpen, setAdjFlyoutOpen] = useState(false)
  const [folderTreeOpen, setFolderTreeOpen] = useState(false)
  const [currentFolderPrefix, setCurrentFolderPrefix] = useState('')
  // Refs for flyout anchor buttons (to compute fixed position)
  const adjFlyoutBtnRef = useRef<HTMLButtonElement>(null)
  const transformFlyoutBtnRef = useRef<HTMLButtonElement>(null)
  const effectFlyoutBtnRef = useRef<HTMLButtonElement>(null)
  const faceFlyoutBtnRef = useRef<HTMLButtonElement>(null)
  const filenameTipRef = useRef<HTMLSpanElement>(null)
  const [filenameTipPos, setFilenameTipPos] = useState<{ top: number; left: number } | null>(null)
  const [adjFlyoutAnchor, setAdjFlyoutAnchor] = useState<{ top: number; left: number } | null>(null)
  const [transformFlyoutOpen, setTransformFlyoutOpen] = useState(false)
  const [transformFlyoutAnchor, setTransformFlyoutAnchor] = useState<{ top: number; left: number } | null>(null)
  // colorPanelOpen / transformPanelOpen enable live preview in renderCanvas without committing
  const colorPanelOpen = adjFlyoutOpen || (isMobile && mobilePanel === 'tool-adjust')
  const transformPanelOpen = transformFlyoutOpen || (isMobile && mobilePanel === 'tool-distort')
  const [effectFlyoutAnchor, setEffectFlyoutAnchor] = useState<{ top: number; left: number } | null>(null)
  const [faceFlyoutOpen, setFaceFlyoutOpen] = useState(false)
  const [faceFlyoutAnchor, setFaceFlyoutAnchor] = useState<{ top: number; left: number } | null>(null)
  const [adjTransform, setAdjTransform] = useState<string>('none')   // none | glitch | halftone | pixel-shift | color-shift
  const [adjTransformStrength, setAdjTransformStrength] = useState(35)
  // Per-effect extra parameters
  const [adjTransformParams, setAdjTransformParams] = useState({ ...DEFAULT_ADJ_TRANSFORM_PARAMS })
  const setAdjParam = (key: keyof typeof adjTransformParams, value: number) =>
    setAdjTransformParams((p) => ({ ...p, [key]: value }))

  const [adjPixelShiftType, setAdjPixelShiftType] = useState<'wave' | 'shear' | 'ripple' | 'mirror'>('wave')
  const [enabledDistorts, setEnabledDistorts] = useState<DistortEffectId[]>([])
  const [distortStrengthByEffect, setDistortStrengthByEffect] = useState(DEFAULT_DISTORT_STRENGTHS)
  const [distortSettingsByVideoId, setDistortSettingsByVideoId] = useState<Record<string, VideoDistortSettingsSnapshot>>({})
  const [videoExportedDistortKeyByPhoto, setVideoExportedDistortKeyByPhoto] = useState<Record<string, string>>({})
  const [videoExportedColorAdjKeyByPhoto, setVideoExportedColorAdjKeyByPhoto] = useState<Record<string, string>>({})
  const [videoDistortPreviewVisible, setVideoDistortPreviewVisible] = useState(false)

  const getActiveDistorts = useCallback((): DistortEffectId[] => {
    if (enabledDistorts.length > 0) return enabledDistorts
    return adjTransform !== 'none' ? [adjTransform as DistortEffectId] : []
  }, [adjTransform, enabledDistorts])

  const toggleDistortEffect = useCallback((id: DistortEffectId) => {
    setEnabledDistorts((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
      setAdjTransform(next.length > 0 ? next[next.length - 1] : 'none')
      return next
    })
  }, [])

  const setDistortStrength = useCallback((id: DistortEffectId, value: number) => {
    setDistortStrengthByEffect((cur) => ({ ...cur, [id]: value }))
    setAdjTransformStrength(value)
  }, [])

  const applyVideoDistortSettings = useCallback((settings: VideoDistortSettingsSnapshot) => {
    setEnabledDistorts(settings.enabled)
    setDistortStrengthByEffect(settings.strengths)
    setAdjTransformParams(settings.params)
    setAdjPixelShiftType(settings.pixelShiftType)
    setAdjTransform(settings.enabled.length > 0 ? settings.enabled[settings.enabled.length - 1] : 'none')
  }, [])

  const snapshotVideoDistortSettings = useCallback((): VideoDistortSettingsSnapshot => ({
    enabled: enabledDistorts,
    strengths: { ...distortStrengthByEffect },
    params: { ...adjTransformParams },
    pixelShiftType: adjPixelShiftType,
  }), [adjTransformParams, adjPixelShiftType, distortStrengthByEffect, enabledDistorts])
  const showSaveError = (msg: string) => {
    setNotice(msg)
  }

  // Close flyouts on outside click
  useEffect(() => {
    if (!adjFlyoutOpen && !effectFlyoutOpen && !transformFlyoutOpen && !faceFlyoutOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      const flyouts = document.querySelectorAll('.ts-flyout-portal')
      for (const f of flyouts) { if (f.contains(target)) return }
      if (adjFlyoutBtnRef.current?.contains(target)) return
      if (effectFlyoutBtnRef.current?.contains(target)) return
      if (transformFlyoutBtnRef.current?.contains(target)) return
      if (faceFlyoutBtnRef.current?.contains(target)) return
      setAdjFlyoutOpen(false)
      setEffectFlyoutOpen(false)
      setTransformFlyoutOpen(false)
      setFaceFlyoutOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [adjFlyoutOpen, effectFlyoutOpen, faceFlyoutOpen, transformFlyoutOpen])

  useEffect(() => {
    if (!transformFlyoutOpen || enabledDistorts.length > 0 || adjTransform === 'none') return
    setEnabledDistorts([adjTransform as DistortEffectId])
  }, [adjTransform, enabledDistorts.length, transformFlyoutOpen])
  const [activeBatchTasks, setActiveBatchTasks] = useState<Set<BatchTaskId>>(new Set(['format']))
  const [expandedBatchTasks, setExpandedBatchTasks] = useState<Set<BatchTaskId>>(new Set(['format']))
  const [zonesAnonymized, setZonesAnonymized] = useState(false)

  // brushSizeRef for smooth preview (avoids React re-render latency)
  const brushSizeRef = useRef(52)
  const brushDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const uploadInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const pickerChoiceDialogRef = useRef<HTMLDivElement>(null)
  const pickerChoiceFolderBtnRef = useRef<HTMLButtonElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const workCanvasRef = useRef<HTMLCanvasElement | null>(null)
  if (!workCanvasRef.current) {
    workCanvasRef.current = document.createElement('canvas')
  }
  const workCtxRef = useRef<CanvasRenderingContext2D | null>(null)
  const renderRafRef = useRef<number | null>(null)
  const transformRef = useRef<DrawTransform>(DEFAULT_TRANSFORM)
  const lastSyncedTransformRef = useRef<DrawTransform>(DEFAULT_TRANSFORM)
  const pointerSessionRef = useRef<PointerSession>({ mode: 'idle' })
  const mobileCanvasEditRef = useRef(false)
  const brushRafRef = useRef<number | null>(null)
  const brushActiveRef = useRef(false)
  const brushLastApplyRef = useRef(0)
  const brushEmojiRef = useRef('')
  const brushStampLockRef = useRef<BrushStamp | null>(null)
  const photosRef = useRef<PhotoItem[]>([])
  const lastAddedPhotoIdRef = useRef<string | null>(null)
  const normalizeCancelRef = useRef(false)
  const dragCounterRef = useRef(0)
  const sidebarResizingRef = useRef(false)
  const sidebarResizeStartXRef = useRef(0)
  const sidebarResizeStartWRef = useRef(220)
  const colorPreviewCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const qualityPreviewCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const previewScaleCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const batchPreviewCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const batchPreviewDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const computeBatchPreviewRef = useRef<(() => Promise<void>) | null>(null)
  const transformPreviewCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const transformPreviewDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const transformPreviewGenRef = useRef(0)   // increments each call; used to discard stale async results
  const activeVideoRef = useRef<HTMLVideoElement | null>(null)
  const videoDistortPreviewCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const videoDistortPreviewGenRef = useRef(0)
  const videoDistortCaptureCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const videoFaceDetectDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const videoFaceDetectGenRef = useRef(0)
  const videoFaceDetectCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const videoPreviewStabilizerRef = useRef(new VideoFaceTrackStabilizer())
  const videoMediaRef = useRef<HTMLDivElement | null>(null)
  const mobilePreviewTransformRef = useRef<HTMLDivElement | null>(null)
  const mobilePinchActiveRef = useRef(false)
  const [mobileGestureActive, setMobileGestureActive] = useState(false)
  const [videoDismissedTick, setVideoDismissedTick] = useState(0)
  const activeVideoTimeRef = useRef(0)
  const pendingVideoSeekRef = useRef<number | null>(null)
  const [videoPreviewFaceZones, setVideoPreviewFaceZones] = useState<Zone[]>([])
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [videoContentLayout, setVideoContentLayout] = useState<VideoContentLayout | null>(null)
  const [videoReadyTick, setVideoReadyTick] = useState(0)
  const [processedVideoEpoch, setProcessedVideoEpoch] = useState(0)
  const videoFaceScanTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const videoPreviewFaceZonesRef = useRef<Zone[]>([])
  const videoDismissedFacesByPhotoRef = useRef<Record<string, Record<number, NormalizedFaceRect[]>>>({})
  const videoContentLayoutRef = useRef<VideoContentLayout | null>(null)
  const videoProcessingRef = useRef(false)

  const activePhoto = useMemo(() => {
    if (!activePhotoId) return null
    return photos.find((p) => p.id === activePhotoId)
      ?? photosRef.current.find((p) => p.id === activePhotoId)
      ?? null
  }, [photos, activePhotoId])
  useEffect(() => { activePhotoIdRef.current = activePhotoId }, [activePhotoId])
  useEffect(() => { activeVideoTimeRef.current = activeVideoTime }, [activeVideoTime])
  videoPreviewFaceZonesRef.current = videoPreviewFaceZones
  videoContentLayoutRef.current = videoContentLayout
  videoProcessingRef.current = videoProcessing
  // Live refs for the async zone re-bake pipeline (stable callback identity).
  const activePhotoRef = useRef(activePhoto)
  activePhotoRef.current = activePhoto
  const zonesByPhotoRef = useRef(zonesByPhoto)
  zonesByPhotoRef.current = zonesByPhoto
  const originalBlobByPhotoRef = useRef(originalBlobByPhoto)
  originalBlobByPhotoRef.current = originalBlobByPhoto
  const sourceVideoPhoto = useMemo(
    () => activePhoto?.derivedFromVideoId ? (photos.find((p) => p.id === activePhoto.derivedFromVideoId) ?? null) : null,
    [activePhoto, photos],
  )

  // Stable blob URL for video playback — avoids leak from inline createObjectURL in render
  const activeVideoUrl = useMemo(() => {
    if (!activePhoto?.isVideo) return null
    return URL.createObjectURL(activePhoto.blob)
  }, [activePhoto?.blob, activePhoto?.isVideo])
  useEffect(() => { return () => { if (activeVideoUrl) URL.revokeObjectURL(activeVideoUrl) } }, [activeVideoUrl])
  useEffect(() => {
    if (videoExportOptions.some((opt) => opt.id === videoExportFormat && opt.supported)) return
    const fallback = videoExportOptions.find((opt) => opt.supported)
    if (fallback) setVideoExportFormat(fallback.id)
  }, [videoExportFormat, videoExportOptions])
  useEffect(() => {
    setVideoMaskDrawActive(false)
    setVideoMaskShape('rectangle')
    setVideoDraftZone(null)
    if (pendingVideoSeekRef.current == null) {
      setActiveVideoTime(0)
    }
    setActiveVideoFrameLabel(null)
    if (videoFrameLabelTimerRef.current) {
      clearTimeout(videoFrameLabelTimerRef.current)
      videoFrameLabelTimerRef.current = null
    }
    videoMaskPointerStartRef.current = null
    setVideoPreviewFaceZones([])
    setVideoPlaying(false)
    setVideoContentLayout(null)
  }, [activePhotoId])

  const syncVideoContentLayout = useCallback(() => {
    const media = videoMediaRef.current
    const video = activeVideoRef.current
    if (!media || !video || video.videoWidth <= 0 || video.videoHeight <= 0) {
      setVideoContentLayout(null)
      return
    }
    const next = measureVideoContentLayout(
      media.clientWidth,
      media.clientHeight,
      video.videoWidth,
      video.videoHeight,
    )
    setVideoContentLayout((cur) => (
      cur && next
      && cur.left === next.left
      && cur.top === next.top
      && cur.width === next.width
      && cur.height === next.height
        ? cur
        : next
    ))
  }, [])

  useEffect(() => {
    if (!activePhoto?.isVideo) {
      setVideoContentLayout(null)
      return
    }
    syncVideoContentLayout()
    const media = videoMediaRef.current
    if (!media) return
    let rafId: number | null = null
    const observer = new ResizeObserver(() => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => { rafId = null; syncVideoContentLayout() })
    })
    observer.observe(media)
    return () => { observer.disconnect(); if (rafId !== null) cancelAnimationFrame(rafId) }
  }, [activePhoto?.id, activePhoto?.isVideo, activeVideoUrl, syncVideoContentLayout])

  useEffect(() => {
    if (!activePhoto?.isVideo) return
    const pending = pendingVideoSeekRef.current
    if (pending == null) return
    pendingVideoSeekRef.current = null
    setActiveVideoTime(pending)
    const video = activeVideoRef.current
    if (!video) return
    const applySeek = () => {
      video.currentTime = pending
      setActiveVideoTime(video.currentTime)
    }
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      applySeek()
    } else {
      video.addEventListener('loadedmetadata', applySeek, { once: true })
    }
  }, [activePhoto?.isVideo, activePhotoId, activeVideoUrl, processedVideoEpoch])

  const activeZones = useMemo(() => (activePhotoId ? zonesByPhoto[activePhotoId] ?? [] : []), [zonesByPhoto, activePhotoId])
  const effectiveZones = useMemo(
    () => zonesWithFaceOffset(activeZones, detectFaceOffset),
    [activeZones, detectFaceOffset],
  )
  const activeVideoTimedZones = useMemo(
    () => activePhotoId ? (videoTimedZonesByPhoto[activePhotoId] ?? []) : [],
    [activePhotoId, videoTimedZonesByPhoto],
  )
  const activeVideoFrameOverrides = useMemo(
    () => activePhotoId ? (videoFrameOverridesByPhoto[activePhotoId] ?? []) : [],
    [activePhotoId, videoFrameOverridesByPhoto],
  )
  const visibleVideoTimedZones = useMemo(
    () => activeVideoTimedZones.filter((item) => activeVideoTime >= item.startSec && activeVideoTime <= item.endSec),
    [activeVideoTime, activeVideoTimedZones],
  )
  const hasPendingVideoEdits = activeVideoTimedZones.length > 0
    || activeVideoFrameOverrides.length > 0
    || (Boolean(activePhoto?.isVideo && activePhotoId)
      && distortPipelineKey(enabledDistorts, distortStrengthByEffect, adjTransformParams, adjPixelShiftType)
        !== (videoExportedDistortKeyByPhoto[activePhotoId ?? ''] ?? ''))
    || (Boolean(activePhoto?.isVideo && activePhotoId)
      && colorAdjExportKey(colorAdj) !== (videoExportedColorAdjKeyByPhoto[activePhotoId ?? ''] ?? ''))
  const normalizePreviewPhotos = useMemo(
    () => normalizePreviewIds.map((id) => photos.find((p) => p.id === id)).filter(Boolean) as PhotoItem[],
    [normalizePreviewIds, photos],
  )
  const displayedPhotos = useMemo(() => photos.slice(0, photoListLimit), [photoListLimit, photos])
  const hasMorePhotosToRender = displayedPhotos.length < photos.length

  const normalizeProgressPercent = normalizeProgress.total > 0
    ? Math.round((normalizeProgress.done / normalizeProgress.total) * 100) : 0
  // crop preview is only relevant when the batch panel is open and crop picking is active
  const activeNormalizeCrop = activeImageSize && batchPanelOpen
    ? getCropRectNormalized(activeImageSize.width, activeImageSize.height, normalizeSettings) : null
  const isApplied = activePhotoId ? (appliedByPhoto[activePhotoId] ?? false) : false
  void isApplied  // kept for future use

  const setActiveZones = useCallback((updater: (zones: Zone[]) => Zone[]) => {
    if (!activePhotoId) return
    setZonesByPhoto((cur) => ({ ...cur, [activePhotoId]: updater(cur[activePhotoId] ?? []) }))
    setZonesAnonymized(false)
  }, [activePhotoId])

  const updateActiveZoneFields = useCallback((updater: (zones: Zone[]) => Zone[]) => {
    if (!activePhotoId) return
    setZonesByPhoto((cur) => ({ ...cur, [activePhotoId]: updater(cur[activePhotoId] ?? []) }))
  }, [activePhotoId])

  const setActiveDirty = useCallback((isDirty: boolean) => {
    if (!activePhotoId) return
    setDirtyByPhoto((cur) => ({ ...cur, [activePhotoId]: isDirty }))
    // Clear quality preview so user sees actual edits
    if (isDirty && qualityPreviewCanvasRef.current) { qualityPreviewCanvasRef.current.width = 0 }
  }, [activePhotoId])

  const customEffectOptions = useCallback((
    zone?: Zone | null,
    seed?: string | number,
    customImageAssetId?: string,
  ): EffectRenderOptions => ({
    customImages: customImageAssets,
    customImageSource,
    customImageAssetId: customImageAssetId ?? zone?.customImageAssetId,
    zoneId: zone?.id,
    seed: seed ?? zone?.id ?? activePhotoId ?? 'custom-image',
  }), [activePhotoId, customImageAssets, customImageSource])

  const resolveBrushStamp = useCallback((pointer: PointerMap): BrushStamp => {
    const photoId = activePhotoIdRef.current ?? 'photo'
    const seed = brushStampSeed(photoId, pointer.imageX, pointer.imageY)
    const emoji = !emojiRandomRef.current && selectedEmojiRef.current
      ? selectedEmojiRef.current
      : pickEmojiFromSeed(seed)
    const customImageAssetId = selectedEffectRef.current === 'custom-image'
      ? resolveCustomImageAssetId(seed)
      : undefined
    return { seed, emoji, customImageAssetId }
  }, [resolveCustomImageAssetId])

  const createCustomImageAssets = useCallback(async (files: File[] | Blob[], names?: string[]) => {
    const accepted = files.filter((file) => file.type.startsWith('image/'))
    if (accepted.length === 0) {
      setNotice('No usable images selected.')
      return []
    }
    const assets = await Promise.all(accepted.map(async (file, index) => {
      const blob = file instanceof File ? file : new Blob([file], { type: file.type || 'image/png' })
      const objectUrl = URL.createObjectURL(blob)
      let imageBitmap: ImageBitmap | undefined
      try {
        imageBitmap = await createImageBitmap(blob)
      } catch {
        URL.revokeObjectURL(objectUrl)
        return null
      }
      return {
        id: createId(),
        name: file instanceof File ? file.name : names?.[index] ?? `custom-image-${index + 1}.png`,
        blob,
        objectUrl,
        imageBitmap,
      } satisfies CustomImageAsset
    }))
    const ready = assets.filter(Boolean) as CustomImageAsset[]
    if (ready.length > 0) {
      setCustomImageAssets((cur) => [...cur, ...ready])
      setNotice(`Loaded ${ready.length} custom image${ready.length === 1 ? '' : 's'}.`)
    }
    return ready
  }, [])

  const openCustomImagePicker = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = () => {
      void createCustomImageAssets(Array.from(input.files ?? [])).then((ready) => {
        if (ready.length > 0) setCustomImageSource('custom')
      })
    }
    input.click()
  }, [createCustomImageAssets])

  const loadCustomImagePreset = useCallback(async (source: CustomImageSource) => {
    setCustomImageSource(source)
    if (source === 'custom') {
      setCustomImageAssets((cur) => {
        cur.forEach((a) => {
          URL.revokeObjectURL(a.objectUrl)
          try { a.imageBitmap?.close() } catch { /* ignore */ }
        })
        return []
      })
      return
    }
    const folder = customImageFolderForSource(source)
    if (!folder) return
    const base = `/custom-images/${folder}`
    setCustomImagePresetLoading(true)
    try {
      setCustomImageAssets((cur) => {
        cur.forEach((a) => {
          URL.revokeObjectURL(a.objectUrl)
          try { a.imageBitmap?.close() } catch { /* ignore */ }
        })
        return []
      })
      const manifestRes = await fetch(`${base}/manifest.json`)
      if (!manifestRes.ok) throw new Error(`HTTP ${manifestRes.status}`)
      const manifest = await manifestRes.json() as { files: string[] }
      const files = manifest.files.slice(0, 100)
      const fetched = await Promise.all(files.map(async (file) => {
        const res = await fetch(`${base}/${file}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const blob = await res.blob()
        return new File([blob], file, { type: blob.type || 'image/png' })
      }))
      const ready = await createCustomImageAssets(fetched)
      if (ready.length === 0) throw new Error('No preset images loaded.')
      setCustomImageSource(source)
    } catch (err) {
      console.warn('Custom image preset failed:', err)
      setNotice('Preset images could not be loaded. Uploaded images remain available.')
    } finally {
      setCustomImagePresetLoading(false)
    }
  }, [createCustomImageAssets])

  // ── Emoji / custom-image picker dialog handlers ──────────────────
  const handleToggleEmojiRandom = useCallback((random: boolean) => {
    setEmojiRandom(random)
    emojiRandomRef.current = random
    if (random) {
      updateActiveZoneFields((zs) => zs.map((z) => (z.effect === 'emoji' ? { ...z, emoji: pickRandomEmoji() } : z)))
    } else if (selectedEmojiRef.current) {
      const emoji = selectedEmojiRef.current
      updateActiveZoneFields((zs) => zs.map((z) => (z.effect === 'emoji' ? { ...z, emoji } : z)))
    }
  }, [updateActiveZoneFields])

  const handlePickEmoji = useCallback((emoji: string) => {
    setEmojiRandom(false)
    setSelectedEmoji(emoji)
    emojiRandomRef.current = false
    selectedEmojiRef.current = emoji
    updateActiveZoneFields((zs) => zs.map((z) => (z.effect === 'emoji' ? { ...z, emoji } : z)))
  }, [updateActiveZoneFields])

  const handleToggleCustomRandom = useCallback((random: boolean) => {
    setCustomImageRandom(random)
    customImageRandomRef.current = random
    updateActiveZoneFields((zs) => zs.map((z) => (z.effect === 'custom-image'
      ? { ...z, customImageAssetId: random ? pickCustomImageAssetId(customImageAssetsRef.current, z.id) : (selectedCustomImageIdRef.current ?? z.customImageAssetId) }
      : z)))
  }, [updateActiveZoneFields])

  const handlePickCustomImage = useCallback((assetId: string) => {
    setCustomImageRandom(false)
    setSelectedCustomImageId(assetId)
    customImageRandomRef.current = false
    selectedCustomImageIdRef.current = assetId
    updateActiveZoneFields((zs) => zs.map((z) => (z.effect === 'custom-image' ? { ...z, customImageAssetId: assetId } : z)))
  }, [updateActiveZoneFields])

  const updateNormalizeSetting = useCallback(<K extends keyof NormalizeSettings>(key: K, value: NormalizeSettings[K]) => {
    setNormalizeSettings((cur) => ({ ...cur, [key]: value }))
  }, [])

  const updateNormalizeCropMode = useCallback((mode: NormalizeCropMode) => {
    setNormalizeSettings((cur) => ({ ...cur, cropMode: mode }))
    setNormalizeCropDraft(null)
    setIsNormalizeCropPicking(false)
    pointerSessionRef.current = { mode: 'idle' }
  }, [])

  const applyCropTemplateRect = useCallback((rect: NormalizedRect, msg: string) => {
    updateNormalizeSetting('templateCropNormalized', rect)
    updateNormalizeCropMode('template')
    setNormalizeCropDraft(null)
    setIsNormalizeCropPicking(false)
    pointerSessionRef.current = { mode: 'idle' }
    setNotice(msg)
  }, [updateNormalizeCropMode, updateNormalizeSetting])

  const applyTemplateFromCurrentCrop = useCallback(() => {
    if (!activeNormalizeCrop) { setNotice('Select a photo first.'); return }
    updateNormalizeSetting('templateCropNormalized', activeNormalizeCrop)
    updateNormalizeCropMode('template')
    setNotice('Crop template set from current preview.')
  }, [activeNormalizeCrop, updateNormalizeCropMode, updateNormalizeSetting])

  const detectFrameOnActivePhoto = useCallback(async () => {
    if (!activePhoto) { setNotice('Select a photo first.'); return }
    setIsBusy(true)
    try {
      const rect = await detectFrameCropFromBlob(activePhoto.blob)
      if (!rect) { setNotice('Auto frame detection found nothing.'); return }
      applyCropTemplateRect(rect, 'Frame detected — template set.')
    } catch { setNotice('Frame detection failed.') }
    finally { setIsBusy(false) }
  }, [activePhoto, applyCropTemplateRect])

  const detectContentAwareCropOnActivePhoto = useCallback(async () => {
    if (!activePhoto) { setNotice('Select a photo first.'); return }
    setIsBusy(true)
    try {
      const rect = await suggestContentAwareCropFromBlob(activePhoto.blob, normalizeSettings)
      if (!rect) { setNotice('Content-aware crop found no region.'); return }
      applyCropTemplateRect(rect, 'Content-aware template set.')
    } catch { setNotice('Content-aware crop failed.') }
    finally { setIsBusy(false) }
  }, [activePhoto, applyCropTemplateRect, normalizeSettings])

  const mapPointerToImage = useCallback((clientX: number, clientY: number, clampToBounds = false): PointerMap | null => {
    const canvas = canvasRef.current
    const t = transformRef.current
    if (!canvas || t.drawWidth <= 0 || t.drawHeight <= 0) return null
    const useMobileCssView = isMobile && activePhotoRef.current && !activePhotoRef.current.isVideo
    const bounds = (useMobileCssView ? viewportRef.current : canvas)?.getBoundingClientRect()
    if (!bounds || bounds.width <= 0 || bounds.height <= 0) return null
    let canvasX = clientX - bounds.left
    let canvasY = clientY - bounds.top
    if (useMobileCssView) {
      const cx = t.centerX ?? bounds.width / 2
      const cy = t.centerY ?? bounds.height / 2
      const zoom = mobileViewZoomRef.current
      const pan = mobileViewPanRef.current
      const rot = mobileViewRotationRef.current
      canvasX -= pan.x
      canvasY -= pan.y
      let lx = canvasX - cx
      let ly = canvasY - cy
      const cos = Math.cos(-rot)
      const sin = Math.sin(-rot)
      const rx = lx * cos - ly * sin
      const ry = lx * sin + ly * cos
      lx = rx / zoom
      ly = ry / zoom
      canvasX = lx + cx
      canvasY = ly + cy
    }
    let normalizedX: number
    let normalizedY: number
    if (t.rotation != null && t.centerX != null && t.centerY != null) {
      const lx = canvasX - t.centerX
      const ly = canvasY - t.centerY
      const cos = Math.cos(-t.rotation)
      const sin = Math.sin(-t.rotation)
      const rx = lx * cos - ly * sin
      const ry = lx * sin + ly * cos
      normalizedX = (rx + t.drawWidth / 2) / t.drawWidth
      normalizedY = (ry + t.drawHeight / 2) / t.drawHeight
    } else {
      normalizedX = (canvasX - t.drawX) / t.drawWidth
      normalizedY = (canvasY - t.drawY) / t.drawHeight
    }
    const outsideImage = normalizedX < 0 || normalizedX > 1 || normalizedY < 0 || normalizedY > 1
    if (outsideImage && !clampToBounds) return null
    normalizedX = clamp(normalizedX, 0, 1)
    normalizedY = clamp(normalizedY, 0, 1)
    return { canvasX, canvasY, imageX: normalizedX * t.imageWidth, imageY: normalizedY * t.imageHeight, normalizedX, normalizedY }
  }, [isMobile])

  const applyMobilePreviewTransform = useCallback(() => {
    const el = mobilePreviewTransformRef.current
    if (!el) return
    const t = transformRef.current
    const cx = t.centerX ?? 0
    const cy = t.centerY ?? 0
    el.style.transformOrigin = `${cx}px ${cy}px`
    el.style.transform = `translate(${mobileViewPanRef.current.x}px, ${mobileViewPanRef.current.y}px) rotate(${mobileViewRotationRef.current}rad) scale(${mobileViewZoomRef.current})`
  }, [])

  const syncOverlayLayout = useCallback(() => {
    const next = transformRef.current
    const prev = lastSyncedTransformRef.current
    if (
      prev.drawWidth === next.drawWidth
      && prev.drawHeight === next.drawHeight
      && prev.drawX === next.drawX
      && prev.drawY === next.drawY
      && prev.centerX === next.centerX
      && prev.centerY === next.centerY
      && (prev.rotation ?? 0) === (next.rotation ?? 0)
      && prev.imageWidth === next.imageWidth
      && prev.imageHeight === next.imageHeight
    ) {
      return
    }
    lastSyncedTransformRef.current = { ...next }
    setCanvasLayoutVersion((v) => v + 1)
  }, [])

  const renderCanvas = useCallback(() => {
    const viewport = viewportRef.current
    const canvas = canvasRef.current
    const source = workCanvasRef.current
    if (!viewport || !canvas || !source) return

    const cssWidth = Math.max(1, Math.floor(viewport.clientWidth))
    const cssHeight = Math.max(1, Math.floor(viewport.clientHeight))
    const dpr = window.devicePixelRatio || 1

    const pxW = Math.floor(cssWidth * dpr)
    const pxH = Math.floor(cssHeight * dpr)

    if (canvas.width !== pxW || canvas.height !== pxH) {
      canvas.width = pxW; canvas.height = pxH
    }
    canvas.style.width = `${cssWidth}px`
    canvas.style.height = `${cssHeight}px`

    const overlay = overlayCanvasRef.current
    if (overlay) {
      if (overlay.width !== pxW || overlay.height !== pxH) {
        overlay.width = pxW; overlay.height = pxH
      }
      overlay.style.width = `${cssWidth}px`
      overlay.style.height = `${cssHeight}px`
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, cssWidth, cssHeight)
    ctx.fillStyle = effectiveTheme === 'dark' ? '#080808' : '#e8e9ec'
    ctx.fillRect(0, 0, cssWidth, cssHeight)

    if (source.width === 0 || source.height === 0 || !activePhoto) {
      transformRef.current = DEFAULT_TRANSFORM
      syncOverlayLayout()
      return
    }

    const isColorNoop =
      colorAdj.brightness === 0 && colorAdj.contrast === 0 && colorAdj.saturation === 0 &&
      colorAdj.shadows === 0 && colorAdj.highlights === 0 && colorAdj.preset === 'none'

    let drawSource: HTMLCanvasElement = source
    // Batch preview canvas takes priority when batch panel is open
    const bc = batchPreviewCanvasRef.current
    if (bc && bc.width > 0 && batchPanelOpen) {
      drawSource = bc
    } else {
      // Transform preview (halftone/glitch etc.) from adj or transform flyout
      const tc = transformPreviewCanvasRef.current
      if (tc && tc.width > 0 && (adjFlyoutOpen || transformPanelOpen)) {
        drawSource = tc
      // Quality preview shows compressed visual
      } else {
        const qc = qualityPreviewCanvasRef.current
        const previewFmt = mobileExportDraft?.format ?? exportFormat
        if (qc && qc.width > 0 && !isLosslessFormat(previewFmt)) {
          drawSource = qc
        }
      }
    }
    // Apply color adjustments on top of whatever source is being drawn
    // (works even when drawSource is a transform preview canvas)
    if (!isColorNoop && colorPanelOpen) {
      if (!colorPreviewCanvasRef.current) colorPreviewCanvasRef.current = document.createElement('canvas')
      const pc = colorPreviewCanvasRef.current
      const base = drawSource  // could be source, transform preview, or quality preview
      if (pc.width !== base.width || pc.height !== base.height) {
        pc.width = base.width; pc.height = base.height
      }
      const pCtx = pc.getContext('2d', { willReadFrequently: true })
      if (pCtx) {
        pCtx.drawImage(base, 0, 0)
        applyColorAdjustments(pCtx, colorAdj, pc)
        drawSource = pc
      }
    }

    const baseScale = Math.min(cssWidth / source.width, cssHeight / source.height)
    const useMobileCssView = isMobile && activePhoto && !activePhoto.isVideo
    const viewZoom = useMobileCssView ? 1 : mobileViewZoomRef.current
    const scale = baseScale * viewZoom
    const drawWidth = source.width * scale
    const drawHeight = source.height * scale
    const pan = useMobileCssView ? { x: 0, y: 0 } : mobileViewPanRef.current
    const viewRot = useMobileCssView ? 0 : mobileViewRotationRef.current
    const centerX = cssWidth / 2 + pan.x
    const centerY = cssHeight / 2 + pan.y
    const absCos = Math.abs(Math.cos(viewRot))
    const absSin = Math.abs(Math.sin(viewRot))
    const aabbW = drawWidth * absCos + drawHeight * absSin
    const aabbH = drawWidth * absSin + drawHeight * absCos
    const drawX = centerX - aabbW / 2
    const drawY = centerY - aabbH / 2

    transformRef.current = {
      drawX, drawY, drawWidth, drawHeight,
      imageWidth: source.width, imageHeight: source.height, scale,
      rotation: viewRot, centerX, centerY,
    }

    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(viewRot)
    ctx.drawImage(drawSource, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)

    const hasDistortPreview = getActiveDistorts().length > 0
    const previewing = ((adjFlyoutOpen || transformPanelOpen) && hasDistortPreview) || (!isColorNoop && colorPanelOpen)
    if (showBoxes && toolMode !== 'crop' && !previewing && !mobileGestureActive) {
      effectiveZones.forEach((zone) => drawZoneInView(ctx, zone, drawWidth, drawHeight, zone.id === selectedZoneId))
      if (draftZone) drawZoneInView(ctx, draftZone, drawWidth, drawHeight, true)
    }

    if (batchPanelOpen) {
      const cropPreview = normalizeCropDraft || activeNormalizeCrop
      if (cropPreview && (normalizeSettings.cropMode !== 'none' || normalizeCropDraft)) {
        drawNormalizeCropInView(
          ctx, cropPreview, drawWidth, drawHeight,
          Boolean(normalizeCropDraft || isNormalizeCropPicking),
        )
      }
    }

    ctx.restore()
    syncOverlayLayout()
    if (useMobileCssView) applyMobilePreviewTransform()

  }, [
    activePhoto, activeNormalizeCrop, effectiveZones, adjFlyoutOpen, adjTransform, batchPanelOpen,
    colorAdj, colorPanelOpen, draftZone, enabledDistorts, exportFormat, getActiveDistorts, isMobile, isNormalizeCropPicking, transformPanelOpen,
    normalizeCropDraft, normalizeSettings.cropMode, selectedZoneId, showBoxes, toolMode, effectiveTheme, mobileViewZoom, mobileViewPan, mobileViewRotation, mobileGestureActive, transformPanelOpen, mobileExportDraft,
    syncOverlayLayout,
    applyMobilePreviewTransform,
  ])

  const renderCanvasRef = useRef(renderCanvas)
  useEffect(() => { renderCanvasRef.current = renderCanvas }, [renderCanvas])

  const getWorkCtx = useCallback((): CanvasRenderingContext2D | null => {
    const wc = workCanvasRef.current
    if (!wc) return null
    if (!workCtxRef.current || workCtxRef.current.canvas !== wc) {
      workCtxRef.current = wc.getContext('2d', { willReadFrequently: true })
    }
    return workCtxRef.current
  }, [])

  const getEraserSourceCanvas = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    if (!activePhoto || activePhoto.isVideo) return null
    const workCanvas = workCanvasRef.current
    if (eraserSourcePhotoIdRef.current === activePhoto.id && eraserSourceCanvasRef.current) {
      const cached = eraserSourceCanvasRef.current
      if (!workCanvas || (cached.width === workCanvas.width && cached.height === workCanvas.height)) {
        return cached
      }
      eraserSourcePhotoIdRef.current = null
      eraserSourceCanvasRef.current = null
    }
    const tryBlob = async (blob: Blob): Promise<HTMLCanvasElement | null> => {
      const bmp = await createImageBitmap(blob)
      if (workCanvas && (bmp.width !== workCanvas.width || bmp.height !== workCanvas.height)) {
        bmp.close()
        return null
      }
      const sourceCanvas = document.createElement('canvas')
      sourceCanvas.width = bmp.width
      sourceCanvas.height = bmp.height
      const sourceCtx = sourceCanvas.getContext('2d')
      if (!sourceCtx) {
        bmp.close()
        return null
      }
      sourceCtx.drawImage(bmp, 0, 0)
      bmp.close()
      return sourceCanvas
    }
    const original = originalBlobByPhoto[activePhoto.id]
    let sourceCanvas = original ? await tryBlob(original).catch(() => null) : null
    if (!sourceCanvas) {
      sourceCanvas = await tryBlob(activePhoto.blob).catch(() => null)
    }
    if (!sourceCanvas) return null
    eraserSourceCanvasRef.current = sourceCanvas
    eraserSourcePhotoIdRef.current = activePhoto.id
    return sourceCanvas
  }, [activePhoto, originalBlobByPhoto])

  const applyOriginalEraserAtPointer = useCallback((pointer: PointerMap) => {
    const workCanvas = workCanvasRef.current
    if (!activePhoto || !workCanvas || workCanvas.width === 0) return
    const ctx = getWorkCtx()
    if (!ctx) return
    const t = transformRef.current
    if (t.scale <= 0) return
    const radius = Math.max(4, brushSizeRef.current / t.scale)

    const drawFromSource = (sourceCanvas: HTMLCanvasElement | null) => {
      if (!sourceCanvas) return
      const x0 = Math.max(0, Math.floor(pointer.imageX - radius))
      const y0 = Math.max(0, Math.floor(pointer.imageY - radius))
      const x1 = Math.min(workCanvas.width, Math.ceil(pointer.imageX + radius))
      const y1 = Math.min(workCanvas.height, Math.ceil(pointer.imageY + radius))
      const w = Math.max(1, x1 - x0)
      const h = Math.max(1, y1 - y0)
      ctx.save()
      ctx.beginPath()
      ctx.arc(pointer.imageX, pointer.imageY, radius, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(sourceCanvas, x0, y0, w, h, x0, y0, w, h)
      ctx.restore()
      setActiveDirty(true)
      renderCanvasRef.current()
    }

    const cached = eraserSourcePhotoIdRef.current === activePhoto.id ? eraserSourceCanvasRef.current : null
    if (cached) {
      drawFromSource(cached)
      return
    }
    void getEraserSourceCanvas().then(drawFromSource).catch(() => setNotice('Eraser source is not ready.'))
  }, [activePhoto, getEraserSourceCanvas, getWorkCtx, setActiveDirty])

  const applyBrushAtPointer = useCallback((pointer: PointerMap) => {
    const workCanvas = workCanvasRef.current
    if (!activePhoto || !workCanvas || workCanvas.width === 0) return
    const ctx = getWorkCtx()
    if (!ctx) return
    const t = transformRef.current
    if (t.scale <= 0) return
    const radius = Math.max(4, brushSizeRef.current / t.scale)
    if (eraserActiveRef.current) {
      applyOriginalEraserAtPointer(pointer)
      return
    }
    const stamp = brushStampLockRef.current ?? resolveBrushStamp(pointer)
    applyEffectBrush(
      ctx,
      selectedEffect,
      pointer.imageX,
      pointer.imageY,
      radius,
      brushStrength,
      stamp.emoji,
      customEffectOptions(null, stamp.seed, stamp.customImageAssetId),
    )
    setActiveDirty(true)
    renderCanvasRef.current()
  }, [activePhoto, applyOriginalEraserAtPointer, brushStrength, customEffectOptions, getWorkCtx, resolveBrushStamp, selectedEffect, setActiveDirty])

  const drawBrushPreview = useCallback((pointer: PointerMap | null) => {
    const overlay = overlayCanvasRef.current
    if (!overlay) return
    const octx = overlay.getContext('2d')
    if (!octx) return

    const dpr = window.devicePixelRatio || 1
    octx.setTransform(dpr, 0, 0, dpr, 0, 0)
    octx.clearRect(0, 0, overlay.width / dpr, overlay.height / dpr)

    if (!pointer || !activePhoto || toolMode !== 'brush') return
    const workCanvas = workCanvasRef.current
    if (!workCanvas || workCanvas.width === 0) return

    const t = transformRef.current
    const sz = brushSizeRef.current

    if (!eraserActiveRef.current) {
      const stamp = pointerSessionRef.current.mode === 'brush' && brushStampLockRef.current
        ? brushStampLockRef.current
        : resolveBrushStamp(pointer)
      previewEffectBrush(
        octx, workCanvas,
        selectedEffect,
        pointer.canvasX, pointer.canvasY,
        sz,
        brushStrength,
        stamp.emoji,
        t,
        customEffectOptions(null, stamp.seed, stamp.customImageAssetId),
      )
    }

    octx.save()
    octx.strokeStyle = 'rgba(255,255,255,0.9)'
    octx.lineWidth = 1.5
    octx.setLineDash([5, 4])
    octx.beginPath()
    octx.arc(pointer.canvasX, pointer.canvasY, sz, 0, Math.PI * 2)
    octx.stroke()
    octx.strokeStyle = 'rgba(0,0,0,0.4)'
    octx.lineWidth = 0.8
    octx.setLineDash([])
    octx.beginPath()
    octx.arc(pointer.canvasX, pointer.canvasY, sz, 0, Math.PI * 2)
    octx.stroke()
    octx.restore()
  }, [activePhoto, brushStrength, customEffectOptions, resolveBrushStamp, selectedEffect, toolMode])

  const pushUndo = useCallback(() => {
    const wc = workCanvasRef.current
    if (!wc || wc.width === 0) return
    const ctx = getWorkCtx()
    if (!ctx) return
    const snap = ctx.getImageData(0, 0, wc.width, wc.height)
    undoStackRef.current = [snap, ...undoStackRef.current].slice(0, 3)
    setUndoCount(undoStackRef.current.length)
  }, [getWorkCtx])

  const undo = useCallback(() => {
    const stack = undoStackRef.current
    if (stack.length === 0) return
    const [snap, ...rest] = stack
    undoStackRef.current = rest
    setUndoCount(rest.length)
    const wc = workCanvasRef.current
    const ctx = getWorkCtx()
    if (!wc || !ctx) return
    ctx.putImageData(snap, 0, 0)
    setActiveDirty(true)
    renderCanvas()
  }, [getWorkCtx, renderCanvas, setActiveDirty])

  const stopBrushLoop = useCallback(() => {
    brushActiveRef.current = false
    if (brushRafRef.current !== null) { cancelAnimationFrame(brushRafRef.current); brushRafRef.current = null }
  }, [])

  const startBrushLoop = useCallback(() => {
    brushActiveRef.current = true
  }, [])

  const addRecords = useCallback((records: InputRecord[]) => {
    const valid = records.filter((r) => isMediaFile(r.file))
    if (valid.length === 0) { setNotice('No supported media found (check file types and size limits).'); return }
    // Prevent excessive photo count
    const currentCount = photosRef.current.length
    const remaining = Math.max(0, MAX_TOTAL_PHOTOS - currentCount)
    if (remaining === 0) { setNotice(`Maximum ${MAX_TOTAL_PHOTOS} photos reached.`); return }
    if (valid.length > remaining) { valid.length = remaining; setNotice(`Added ${remaining} media files (max ${MAX_TOTAL_PHOTOS}).`) }
    const incoming: PhotoItem[] = valid.map((r) => {
      const isVideo = isVideoFileCheck(r.file)
      return {
        id: createId(), name: r.name, mimeType: r.file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
        blob: r.file, previewUrl: URL.createObjectURL(r.file),
        source: r.source, edited: false, fileHandle: r.handle,
        isVideo,
      }
    })
    const originals: Record<string, Blob> = {}
    incoming.forEach((p) => { originals[p.id] = p.blob })
    setOriginalBlobByPhoto((cur) => ({ ...cur, ...originals }))
    // For video files, extract poster frames in the background
    for (const p of incoming) {
      if (p.isVideo) {
        extractPosterFrame(p.blob).then(({ blob: posterBlob, width, height }) => {
          const posterUrl = URL.createObjectURL(posterBlob)
          setPhotos((cur) => {
            const target = cur.find((ph) => ph.id === p.id)
            if (!target) {
              URL.revokeObjectURL(posterUrl)
              return cur
            }
            return cur.map((ph) => {
              if (ph.id !== p.id) return ph
              URL.revokeObjectURL(ph.previewUrl)
              return { ...ph, previewUrl: posterUrl, videoWidth: width, videoHeight: height }
            })
          })
        }).catch(() => { /* poster extraction failed — keep video blob URL as preview */ })
        getVideoMetadata(p.blob).then((meta) => {
          setPhotos((cur) => {
            if (!cur.some((ph) => ph.id === p.id)) return cur
            return cur.map((ph) => {
              if (ph.id !== p.id) return ph
              return { ...ph, videoDuration: meta.duration, videoWidth: meta.width, videoHeight: meta.height, videoFps: meta.fps }
            })
          })
        }).catch(() => {})
      }
    }
    setPhotos((cur) => {
      const next = [...cur, ...incoming]
      photosRef.current = next
      if (!activePhotoId && incoming.length > 0) setActivePhotoId(incoming[0].id)
      if (next.length > 700) setSidebarView('list')
      return next
    })
    if (incoming.length > 0) lastAddedPhotoIdRef.current = incoming[incoming.length - 1].id
    setSelectedForBatch((cur) => { const next = new Set(cur); incoming.forEach((p) => next.add(p.id)); return next })
    setNormalizeResults({})
    setNormalizePreviewIds([])
    setPhotoListLimit((cur) => Math.max(cur, Math.min(400, cur + incoming.length)))
    setNotice(`Loaded ${incoming.length} media file${incoming.length === 1 ? '' : 's'}.`)
  }, [activePhotoId])

  // ── Drag & drop helpers ──────────────────────────────────────────
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounterRef.current++
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounterRef.current--
    if (dragCounterRef.current <= 0) { dragCounterRef.current = 0; setIsDragOver(false) }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault() }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation() // prevent bubbling to parent drop handlers (would double-trigger)
    dragCounterRef.current = 0
    setIsDragOver(false)

    // Use FileSystem Entry API so dropped folders work
    const items = Array.from(e.dataTransfer.items ?? [])
    const entries = items
      .filter((i) => i.kind === 'file')
      .map((i) => i.webkitGetAsEntry?.())
      .filter(Boolean) as FileSystemEntry[]

    if (entries.length === 0) { setNotice('No images found in dropped content.'); return }

    const hasDir = entries.some((en) => en.isDirectory)

    if (!hasDir) {
      // Flat files — fast path
      const files: File[] = []
      await Promise.all(entries.map((en) =>
        new Promise<void>((res) => {
          (en as FileSystemFileEntry).file((f) => { if (isMediaFile(f)) files.push(f); res() }, () => res())
        })
      ))
      if (files.length === 0) { setNotice('No images found in dropped files.'); return }
      addRecords(files.map((f) => ({ file: f, name: f.name, source: 'upload' as const })))
      return
    }

    // Folder(s) — recursive scan with live progress
    setFolderScanState({ found: 0 })
    const records: InputRecord[] = []

    const readDir = async (dir: FileSystemDirectoryEntry, prefix = '') => {
      const reader = dir.createReader()
      for (;;) {
        const batch: FileSystemEntry[] = await new Promise((res, rej) => reader.readEntries(res, rej))
        if (batch.length === 0) break
        for (const entry of batch) {
          if (entry.isFile) {
            const file = await new Promise<File>((res, rej) => (entry as FileSystemFileEntry).file(res, rej))
            if (isMediaFile(file)) {
              records.push({ file, name: `${prefix}${entry.name}`, source: 'upload' as const })
              setFolderScanState({ found: records.length })
            }
          } else if (entry.isDirectory) {
            await readDir(entry as FileSystemDirectoryEntry, `${prefix}${entry.name}/`)
          }
        }
      }
    }

    try {
      for (const entry of entries) {
        if (entry.isDirectory) {
          await readDir(entry as FileSystemDirectoryEntry)
        } else if (entry.isFile) {
          const file = await new Promise<File>((res, rej) => (entry as FileSystemFileEntry).file(res, rej))
          if (isMediaFile(file)) {
            records.push({ file, name: entry.name, source: 'upload' as const })
            setFolderScanState({ found: records.length })
          }
        }
      }
    } catch {
      setFolderScanState(null)
      setNotice('Error reading dropped folder.')
      return
    }

    setFolderScanState(null)
    if (records.length === 0) { setNotice('No images found in dropped folder.'); return }
    addRecords(records)
  }, [addRecords])

  const loadDemoPhotos = useCallback(async () => {
    setIsBusy(true)
    try {
      const fetched = await Promise.all(DEMO_MEDIA.map(async (url, i) => {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Demo ${url} failed`)
        const blob = await res.blob()
        const ext = url.split('.').pop() ?? 'jpg'
        const name = url.split('/').pop() ?? `demo-${i + 1}.${ext}`
        const mime = blob.type || (ext === 'webm' ? 'video/webm' : ext === 'webp' ? 'image/webp' : ext === 'png' ? 'image/png' : 'image/jpeg')
        return { file: new File([blob], name, { type: mime }), name, source: 'upload' as const }
      }))
      addRecords(fetched)
    } catch { setNotice('Failed to load demo photos.') }
    finally { setIsBusy(false) }
  }, [addRecords])

  const commitWorkCanvasToBlob = useCallback(async (photoId: string) => {
    const wc = workCanvasRef.current
    if (!wc || wc.width === 0) return
    const photo = photos.find((p) => p.id === photoId)
    if (!photo) return
    try {
      const blob = await canvasToBlob(wc, photo.mimeType || 'image/jpeg')
      const nextUrl = URL.createObjectURL(blob)
      setPhotos((cur) => cur.map((p) => {
        if (p.id !== photoId) return p
        window.setTimeout(() => URL.revokeObjectURL(p.previewUrl), 0)
        return { ...p, blob, previewUrl: nextUrl, edited: true }
      }))
    } catch (e) { console.warn('Auto-commit failed', e) }
  }, [photos])

  const selectPhoto = useCallback(async (photoId: string) => {
    if (photoId === activePhotoId) return
    detectingRef.current = false
    setIsDetecting(false)
    setDetectionStep('')
    if (activePhotoId && (dirtyByPhoto[activePhotoId] ?? false)) {
      await commitWorkCanvasToBlob(activePhotoId)
      setActiveDirty(false)
    }
    const leavingVideo = photos.find((p) => p.id === activePhotoId)?.isVideo
    if (activePhotoId && leavingVideo) {
      setDistortSettingsByVideoId((cur) => ({
        ...cur,
        [activePhotoId]: snapshotVideoDistortSettings(),
      }))
    }
    setActivePhotoId(photoId)
    setSelectedZoneId(null)
    setDraftZone(null)
    setNormalizeCropDraft(null)
    setIsNormalizeCropPicking(false)
    pointerSessionRef.current = { mode: 'idle' }
    undoStackRef.current = []
    setUndoCount(0)
    setZonesAnonymized(false)
    previewBakedRef.current = false
    setEffectFlyoutOpen(false)
    setLocalProcessingMs(null)
    setLastDetectFailed(false)
    setZoneToolCustomized(false)
    setEffectToolCustomized(false)
    setAdjFlyoutOpen(false)
    setTransformFlyoutOpen(false)
    if (isMobile) {
      setMobileViewZoom(1)
      setMobileViewPan({ x: 0, y: 0 })
      setMobileViewRotation(0)
      mobileViewZoomRef.current = 1
      mobileViewPanRef.current = { x: 0, y: 0 }
      mobileViewRotationRef.current = 0
      setMobileViewTransformDirty(false)
      mobileCanvasEditRef.current = false
    }
    const saved = colorAdjByPhoto[photoId]
    setColorAdj(saved ? { ...saved } : DEFAULT_COLOR_ADJUSTMENTS)
    // Reset export format to photo's native format
    const photo = photos.find((p) => p.id === photoId)
    if (photo) {
      const fmt = photo.mimeType as NormalizeFormat
      if (['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/gif', 'image/tiff'].includes(fmt)) setExportFormat(fmt)
      if (photo.isVideo) {
        applyVideoDistortSettings(distortSettingsByVideoId[photoId] ?? EMPTY_VIDEO_DISTORT_SETTINGS)
        setDetectSensitivity((s) => (s <= 1 ? 10 : s))
      }
    }
  }, [activePhotoId, applyVideoDistortSettings, colorAdjByPhoto, commitWorkCanvasToBlob, dirtyByPhoto, distortSettingsByVideoId, isMobile, photos, setActiveDirty, snapshotVideoDistortSettings])

  const openFolderPicker = useCallback(async () => {
    setIsBusy(true)
    try {
      const picker = (window as Window & { showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker!
      const root = await picker()
      const records: InputRecord[] = []
      const walk = async (dir: FileSystemDirectoryHandle, prefix = '') => {
        const iterable = dir as unknown as {
          entries?: () => AsyncIterable<[string, FileSystemFileHandle | FileSystemDirectoryHandle]>
          values?: () => AsyncIterable<FileSystemFileHandle | FileSystemDirectoryHandle>
        }
        const handle = async (entry: FileSystemFileHandle | FileSystemDirectoryHandle) => {
          if (entry.kind === 'file') {
            const f = await entry.getFile()
            if (!isMediaFile(f)) return
            records.push({ file: f, name: `${prefix}${entry.name}`, source: 'local-folder', handle: entry })
          } else if (entry.kind === 'directory') {
            await walk(entry, `${prefix}${entry.name}/`)
          }
        }
        if (iterable.entries) { for await (const [, e] of iterable.entries()) await handle(e); return }
        if (iterable.values) { for await (const e of iterable.values()) await handle(e) }
      }
      await walk(root)
      addRecords(records)
      setNotice(records.length > 0 ? `Folder loaded (${records.length} photos, disk write enabled).` : 'No photos found.')
    } catch { setNotice('Folder loading cancelled.') }
    finally { setIsBusy(false) }
  }, [addRecords])

  const openFilePicker = useCallback(async () => {
    const hasFSA = typeof (window as Window & { showOpenFilePicker?: unknown }).showOpenFilePicker === 'function'
    if (hasFSA) {
      // Use modern file picker
      try {
        const picker = (window as Window & { showOpenFilePicker?: (o: object) => Promise<FileSystemFileHandle[]> }).showOpenFilePicker!
        const handles = await picker({ multiple: true, types: [{ description: 'Images & Videos', accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.avif'], 'video/*': ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v', '.ogv'] } }] })
        const records: InputRecord[] = []
        for (const handle of handles) {
          const f = await handle.getFile()
          if (isMediaFile(f)) records.push({ file: f, name: f.name, source: 'local-folder', handle })
        }
        addRecords(records)
      } catch { /* cancelled */ }
      return
    }

    // Fallback: plain input
    uploadInputRef.current?.click()
  }, [addRecords])

  // ── Unified picker: opens files OR folder depending on browser support ──
  const openUnifiedPicker = useCallback(async () => {
    const hasDirPicker = typeof (window as Window & { showDirectoryPicker?: unknown }).showDirectoryPicker === 'function'
    if (hasDirPicker && !isMobile) {
      setPickerChoiceOpen(true)
      return
    }
    await openFilePicker()
  }, [isMobile, openFilePicker])

  useDialogFocusTrap(pickerChoiceOpen, pickerChoiceDialogRef, {
    initialFocusRef: pickerChoiceFolderBtnRef,
    onClose: () => setPickerChoiceOpen(false),
  })

  const handleUploadInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    addRecords(files.map((f) => ({ file: f, name: f.name, source: 'upload' as const })))
    e.target.value = ''
  }, [addRecords])

  const handleFolderInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    addRecords(files.map((f) => {
      const rel = (f as File & { webkitRelativePath?: string }).webkitRelativePath
      return { file: f, name: rel && rel.length > 0 ? rel : f.name, source: 'upload' as const }
    }))
    e.target.value = ''
  }, [addRecords])

  const detectingRef = useRef(false)
  const detectGenerationRef = useRef(0)
  const detectFacesOnActiveImage = useCallback(async (robust = false) => {
    if (!activePhoto) return
    // Videos are detected frame-by-frame during processing, never on the (stale)
    // work canvas — otherwise the previous photo's faces leak onto the video.
    if (activePhoto.isVideo) return
    if (detectingRef.current) return
    const photoId = activePhoto.id
    const workCanvas = workCanvasRef.current
    if (!workCanvas || workCanvas.width === 0) return
    const generation = ++detectGenerationRef.current
    detectingRef.current = true
    setIsDetecting(true)
    setLocalProcessingMs(null)
    setDetectionStep('Preparing…')
    setNotice(robust ? 'Running thorough detection…' : 'Detecting faces…')
    setDetectionProgressCallback((step) => setDetectionStep(step))
    const t0 = performance.now()
    try {
      const { confidence, thorough } = detectSettingsRef.current
      const boxes = await detectFaces(workCanvas, robust || thorough, confidence)
      if (generation !== detectGenerationRef.current || activePhotoIdRef.current !== photoId) return
      const elapsed = Math.round(performance.now() - t0)
      setLocalProcessingMs(elapsed)
      if (boxes.length === 0) {
        setLastDetectFailed(false)
        setZonesByPhoto((cur) => ({ ...cur, [photoId]: [] }))
        setSelectedZoneId(null)
        setNotice(`No faces detected. (${elapsed} ms locally)`)
        return
      }
      setLastDetectFailed(false)
      const emojis = pickUniqueEmojis(boxes.length)
      const W = workCanvas.width
      const H = workCanvas.height
      const offsetPct = detectSettingsRef.current.faceOffset
      const zones: Zone[] = boxes.map((b, i) => {
        const detectX = b.x / W
        const detectY = b.y / H
        const detectWidth = b.width / W
        const detectHeight = b.height / H
        const expanded = expandPixelBox(b.x, b.y, b.width, b.height, W, H, offsetPct)
        return {
          id: createId(),
          ...expanded,
          detectX,
          detectY,
          detectWidth,
          detectHeight,
          effect: selectedEffect,
          emoji: emojiRandomRef.current ? emojis[i] : (selectedEmojiRef.current ?? emojis[i]),
        }
      }).map((zone) => ({
        ...zone,
        customImageAssetId: selectedEffect === 'custom-image'
          ? resolveCustomImageAssetId(zone.id)
          : undefined,
      }))
      setZonesByPhoto((cur) => ({ ...cur, [photoId]: zones }))
      setZonesAnonymized(false)
      previewBakedRef.current = false
      if (activePhotoId === photoId) {
        setSelectedZoneId(zones[0]?.id ?? null)
      }
      const src = getDetectorStatus()
      const detSrc = src?.mode === 'yunet-wasm'
        ? 'via local YuNet'
        : src?.mode ?? ''
      setNotice(`Detected ${zones.length} face${zones.length === 1 ? '' : 's'} ${detSrc} — ${elapsed} ms locally.`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setNotice(`Detection error: ${msg}`)
      setDetectionStep(`Error: ${msg}`)
      console.error('Face detection error:', err)
    } finally {
      detectingRef.current = false
      setIsDetecting(false)
      setDetectionStep('')
      setDetectionProgressCallback(null)
      renderCanvas()
    }
  }, [activePhoto, activePhotoId, customImageAssets, renderCanvas, selectedEffect])

  const cancelDetection = useCallback(() => {
    detectingRef.current = false
    detectGenerationRef.current += 1
    setIsDetecting(false)
    setDetectionStep('')
    setDetectionProgressCallback(null)
    setNotice('Detection cancelled.')
  }, [])

  const applyZones = useCallback(async () => {
    if (!activePhoto || activeZones.length === 0) return
    const workCanvas = workCanvasRef.current
    if (!workCanvas) return
    const ctx = getWorkCtx()
    if (!ctx) return
    // Yield to let the browser paint the "processing" UI state before blocking
    // on heavy pixel work (noise/contour can take 200ms+ per zone on mobile).
    await new Promise(requestAnimationFrame)
    for (const z of effectiveZones) {
      applyEffectRect(
        ctx,
        z.effect,
        z.x * workCanvas.width,
        z.y * workCanvas.height,
        z.width * workCanvas.width,
        z.height * workCanvas.height,
        brushStrength,
        z.emoji,
        customEffectOptions(z),
      )
      // Yield between zones so the UI thread can breathe on multi-face images.
      if (effectiveZones.length > 2) await new Promise(requestAnimationFrame)
    }
    previewBakedRef.current = true
    setActiveDirty(true)
    if (activePhotoId) setAppliedByPhoto((cur) => ({ ...cur, [activePhotoId]: true }))
    setZonesAnonymized(true)
    setNotice(`Applied ${effectiveZones.length} zone${effectiveZones.length === 1 ? '' : 's'}.`)
    renderCanvas()
  }, [activePhoto, activePhotoId, effectiveZones, brushStrength, customEffectOptions, getWorkCtx, renderCanvas, setActiveDirty])

  const cancelCropMode = useCallback(() => {
    setCropDraft(null)
    setToolMode('brush')
    toolModeRef.current = 'brush'
    mobileCanvasEditRef.current = false
    pointerSessionRef.current = { mode: 'idle' }
    renderCanvas()
  }, [renderCanvas])

  const cropToSelection = useCallback(() => {
    if (!activePhoto || !cropDraft) return
    const workCanvas = workCanvasRef.current
    if (!workCanvas || workCanvas.width === 0) return
    const { x, y, w, h } = cropDraft
    const px = Math.round(x * workCanvas.width)
    const py = Math.round(y * workCanvas.height)
    const pw = Math.round(w * workCanvas.width)
    const ph = Math.round(h * workCanvas.height)
    if (pw < 2 || ph < 2) return
    pushUndo()
    const tmp = document.createElement('canvas')
    tmp.width = pw; tmp.height = ph
    const tc = tmp.getContext('2d')!
    tc.drawImage(workCanvas, px, py, pw, ph, 0, 0, pw, ph)
    const ctx = workCanvas.getContext('2d', { willReadFrequently: true })!
    workCanvas.width = pw; workCanvas.height = ph
    workCtxRef.current = null
    ctx.drawImage(tmp, 0, 0)
    setActiveImageSize({ width: pw, height: ph })
    setResEditW(pw); setResEditH(ph)
    setCropDraft(null)
    setToolMode('brush')
    toolModeRef.current = 'brush'
    mobileCanvasEditRef.current = false
    setMobileViewZoom(1)
    setMobileViewPan({ x: 0, y: 0 })
    setMobileViewRotation(0)
    mobileViewZoomRef.current = 1
    mobileViewPanRef.current = { x: 0, y: 0 }
    mobileViewRotationRef.current = 0
    setMobileViewTransformDirty(false)
    eraserSourcePhotoIdRef.current = null
    eraserSourceCanvasRef.current = null
    setActiveDirty(true)
    renderCanvas()
    setNotice(`Cropped to ${pw}×${ph}`)
  }, [activePhoto, cropDraft, pushUndo, renderCanvas, setActiveDirty])

  const saveActivePhoto = useCallback(async () => {
    if (!activePhoto) return
    const workCanvas = workCanvasRef.current
    if (!workCanvas || workCanvas.width === 0) return
    setIsBusy(true)
    try {
      const blob = await canvasToBlob(workCanvas, activePhoto.mimeType || 'image/jpeg')
      setPhotos((cur) => cur.map((p) => {
        if (p.id !== activePhoto.id) return p
        const nextUrl = URL.createObjectURL(blob)
        window.setTimeout(() => URL.revokeObjectURL(p.previewUrl), 0)
        return { ...p, blob, previewUrl: nextUrl, edited: true }
      }))
      setActiveDirty(false)
      if (activePhoto.fileHandle) {
        try {
          const w = await activePhoto.fileHandle.createWritable()
          await w.write(blob)
          await w.close()
          setNotice(`Saved: ${activePhoto.name.split('/').pop()}`)
        } catch (writeErr) {
          const msg = writeErr instanceof Error ? writeErr.message : String(writeErr)
          setNotice(`File write failed: ${msg}`)
        }
      } else {
        showSaveError('No permissions — work only in desktop app mode')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setNotice(`Save failed: ${msg}`)
    }
    finally { setIsBusy(false) }
   
  }, [activePhoto, setActiveDirty])

  const resetPhotoToOriginal = useCallback(async () => {
    if (!activePhoto) return
    const orig = originalBlobByPhoto[activePhoto.id]
    if (!orig) { setNotice('No original backup for this photo.'); return }
    setIsBusy(true)
    try {
      if (activePhoto.isVideo) {
        const [poster, meta] = await Promise.all([
          extractPosterFrame(orig).catch(() => null),
          getVideoMetadata(orig).catch(() => null),
        ])
        const nextUrl = poster ? URL.createObjectURL(poster.blob) : activePhoto.previewUrl
        setPhotos((cur) => cur.map((p) => {
          if (p.id !== activePhoto.id) return p
          if (nextUrl !== p.previewUrl) window.setTimeout(() => URL.revokeObjectURL(p.previewUrl), 0)
          return {
            ...p,
            blob: orig,
            previewUrl: nextUrl,
            edited: false,
            mimeType: orig.type || p.mimeType,
            videoDuration: meta?.duration ?? p.videoDuration,
            videoWidth: meta?.width ?? poster?.width ?? p.videoWidth,
            videoHeight: meta?.height ?? poster?.height ?? p.videoHeight,
            videoFps: meta?.fps ?? p.videoFps,
          }
        }))
        setVideoFrameOverridesByPhoto((cur) => { const next = { ...cur }; delete next[activePhoto.id]; return next })
        setVideoTimedZonesByPhoto((cur) => { const next = { ...cur }; delete next[activePhoto.id]; return next })
        setActiveDirty(false)
        undoStackRef.current = []; setUndoCount(0)
        setNotice('Reset video to original.')
        return
      }
      // Reload work canvas directly from original blob
      const bmp = await createImageBitmap(orig)
      const origW = bmp.width, origH = bmp.height
      const wc = workCanvasRef.current!
      if (wc.width !== origW || wc.height !== origH) {
        wc.width = origW; wc.height = origH
        workCtxRef.current = null
      }
      const ctx = getWorkCtx()
      if (ctx) { ctx.clearRect(0, 0, origW, origH); ctx.drawImage(bmp, 0, 0) }
      bmp.close()

      const nextUrl = URL.createObjectURL(orig)
      setPhotos((cur) => cur.map((p) => {
        if (p.id !== activePhoto.id) return p
        window.setTimeout(() => URL.revokeObjectURL(p.previewUrl), 0)
        return { ...p, blob: orig, previewUrl: nextUrl, edited: false }
      }))
      setColorAdj(DEFAULT_COLOR_ADJUSTMENTS)
      setColorAdjByPhoto((cur) => { const next = { ...cur }; delete next[activePhoto.id]; return next })
      setZonesByPhoto((cur) => { const next = { ...cur }; delete next[activePhoto.id]; return next })
      setAppliedByPhoto((cur) => { const next = { ...cur }; delete next[activePhoto.id]; return next })
      setActiveDirty(false)
      undoStackRef.current = []; setUndoCount(0)
      setActiveImageSize({ width: origW, height: origH })
      renderCanvas()
      setNotice('Reset to original.')
    } catch { setNotice('Reset failed.') }
    finally { setIsBusy(false) }
  }, [activePhoto, originalBlobByPhoto, getWorkCtx, renderCanvas, setActiveDirty])

  const exportActivePhoto = useCallback(async () => {
    if (!activePhoto) return
    const workCanvas = workCanvasRef.current
    if (!workCanvas || workCanvas.width === 0) return
    setIsBusy(true)
    try {
      const blob = await exportCanvasToBlob(workCanvas, exportFormat, exportQuality, exportPngDepth)
      const baseName = activePhoto.name.split('/').pop() ?? activePhoto.name
      const ext = FORMAT_EXT[exportFormat] ?? 'png'
      const outName = baseName.replace(/\.[^.]+$/, '') + `-anon.${ext}`
      saveAs(blob, outName)
      setNotice(`Exported: ${outName}`)
    } catch { setNotice('Export failed.') }
    finally { setIsBusy(false) }
  }, [activePhoto, exportFormat, exportQuality, exportPngDepth])

  const [snapshotCount, setSnapshotCount] = useState(0)
  const saveSnapshot = useCallback(async () => {
    if (!activePhoto) return
    const wc = workCanvasRef.current
    if (!wc || wc.width === 0) return
    setIsBusy(true)
    try {
      const blob = await canvasToBlob(wc, 'image/png')
      const baseName = activePhoto.name.replace(/\.[^.]+$/, '')
      const num = snapshotCount + 1
      setSnapshotCount(num)
      const snapName = `${baseName}_snapshot_${num}.png`
      const previewUrl = URL.createObjectURL(blob)
      const newPhoto: PhotoItem = {
        id: createId(), name: snapName, mimeType: 'image/png',
        blob, previewUrl, source: 'upload' satisfies SourceType, edited: false,
      }
      setPhotos((cur) => [...cur, newPhoto])
      setOriginalBlobByPhoto((cur) => ({ ...cur, [newPhoto.id]: blob }))
      setNotice(`Snapshot saved: ${snapName}`)
    } catch { setNotice('Snapshot failed.') }
    finally { setIsBusy(false) }
  }, [activePhoto, snapshotCount])

  const applySnapshotToSourceVideo = useCallback(async () => {
    if (!activePhoto || activePhoto.isVideo || !activePhoto.derivedFromVideoId || activePhoto.derivedFromVideoTime == null) return
    const wc = workCanvasRef.current
    if (!wc || wc.width === 0) {
      setNotice('Edited snapshot is not ready.')
      return
    }
    setIsBusy(true)
    try {
      const blob = await canvasToBlob(wc, 'image/png')
      const nextUrl = URL.createObjectURL(blob)
      setPhotos((cur) => cur.map((p) => {
        if (p.id !== activePhoto.id) return p
        window.setTimeout(() => URL.revokeObjectURL(p.previewUrl), 0)
        return { ...p, blob, previewUrl: nextUrl, edited: true }
      }))
      setVideoFrameOverridesByPhoto((cur) => {
        const sourceId = activePhoto.derivedFromVideoId!
        const current = cur[sourceId] ?? []
        const tolerance = 1 / 30
        const next = current.filter((item) => Math.abs(item.timeSec - activePhoto.derivedFromVideoTime!) > tolerance)
        next.push({ timeSec: activePhoto.derivedFromVideoTime!, frameBlob: blob })
        next.sort((a, b) => a.timeSec - b.timeSec)
        return { ...cur, [sourceId]: next }
      })
      setActiveDirty(false)
      const msg = 'Frame saved to source video.'
      setNotice(msg)
      if (isMobile && activePhoto.derivedFromVideoId) {
        const sourceId = activePhoto.derivedFromVideoId
        void selectPhoto(sourceId)
        setMobileMode('video')
        setMobileToast({ message: msg })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setNotice(`Could not attach snapshot to source video: ${msg}`)
    } finally {
      setIsBusy(false)
    }
  }, [activePhoto, isMobile, selectPhoto, setMobileMode])

  const jumpToSourceVideoFromSnapshot = useCallback(() => {
    if (!sourceVideoPhoto) return
    const frameTime = activePhoto?.derivedFromVideoTime
    if (frameTime != null) pendingVideoSeekRef.current = frameTime
    void selectPhoto(sourceVideoPhoto.id)
    if (isMobile) setMobileMode('video')
    setNotice(`Returned to source video: ${sourceVideoPhoto.name.split('/').pop()}`)
  }, [activePhoto?.derivedFromVideoTime, isMobile, selectPhoto, setMobileMode, sourceVideoPhoto])

  const mapPointerToVideo = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const media = videoMediaRef.current
    const layout = videoContentLayout
    if (!media || !layout) return null
    const bounds = media.getBoundingClientRect()
    if (bounds.width <= 0 || bounds.height <= 0) return null
    const contentLeft = layout.left * bounds.width
    const contentTop = layout.top * bounds.height
    const contentW = layout.width * bounds.width
    const contentH = layout.height * bounds.height
    if (contentW <= 0 || contentH <= 0) return null
    return {
      x: clamp((event.clientX - bounds.left - contentLeft) / contentW, 0, 1),
      y: clamp((event.clientY - bounds.top - contentTop) / contentH, 0, 1),
    }
  }, [videoContentLayout])

  const clearVideoTimedZones = useCallback(() => {
    if (!activePhoto?.isVideo) return
    setVideoTimedZonesByPhoto((cur) => {
      const next = { ...cur }
      delete next[activePhoto.id]
      return next
    })
    setVideoDraftZone(null)
    setVideoMaskDrawActive(false)
    setNotice('Timeline masks cleared for this video.')
  }, [activePhoto])

  const handleVideoMaskPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!videoMaskDrawActive || !activePhoto?.isVideo) return
    const mapped = mapPointerToVideo(event)
    if (!mapped) return
    event.currentTarget.setPointerCapture(event.pointerId)
    videoMaskPointerStartRef.current = mapped
    setVideoDraftZone({
      id: 'draft-video-mask',
      x: mapped.x,
      y: mapped.y,
      width: 0.001,
      height: 0.001,
      effect: selectedEffect,
      emoji: resolveEmoji(),
      maskShape: videoMaskShape,
    })
  }, [activePhoto, mapPointerToVideo, selectedEffect, videoMaskDrawActive, videoMaskShape])

  const handleVideoMaskPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!videoMaskPointerStartRef.current || !videoMaskDrawActive) return
    const mapped = mapPointerToVideo(event)
    if (!mapped) return
    const start = videoMaskPointerStartRef.current
    setVideoDraftZone((cur) => cur ? {
      ...cur,
      x: Math.min(start.x, mapped.x),
      y: Math.min(start.y, mapped.y),
      width: Math.abs(mapped.x - start.x),
      height: Math.abs(mapped.y - start.y),
    } : null)
  }, [mapPointerToVideo, videoMaskDrawActive])

  const handleVideoMaskPointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!activePhoto?.isVideo) return
    if (videoMaskPointerStartRef.current) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    videoMaskPointerStartRef.current = null
    const zone = videoDraftZone
    if (!zone || zone.width < 0.01 || zone.height < 0.01) {
      setVideoDraftZone(null)
      if (videoMaskDrawActive) setNotice('Timeline mask was too small — drag a larger rectangle over the video.')
      return
    }

    const video = activeVideoRef.current
    const duration = video?.duration || activePhoto.videoDuration || 0
    const center = video?.currentTime ?? activeVideoTime
    const halfRange = Math.max(0.1, videoMaskRangeSec / 2)
    const startSec = Math.max(0, center - halfRange)
    const endSec = duration > 0 ? Math.min(duration, center + halfRange) : center + halfRange
    const id = createId()
    const timedZone: VideoTimedZone = {
      id,
      startSec,
      endSec: Math.max(startSec + 0.05, endSec),
      zone: { ...zone, id, effect: selectedEffect, emoji: zone.emoji || pickRandomEmoji(), maskShape: zone.maskShape ?? videoMaskShape },
    }

    setVideoTimedZonesByPhoto((cur) => ({
      ...cur,
      [activePhoto.id]: [...(cur[activePhoto.id] ?? []), timedZone].sort((a, b) => a.startSec - b.startSec),
    }))
    setVideoDraftZone(null)
    setVideoMaskDrawActive(false)
    setNotice(`Timeline mask added for ${formatVideoTime(timedZone.startSec)}–${formatVideoTime(timedZone.endSec)}. Re-run video anonymization to bake it in.`)
  }, [activePhoto, activeVideoTime, selectedEffect, videoDraftZone, videoMaskDrawActive, videoMaskRangeSec, videoMaskShape])

  const processActiveVideo = useCallback(async () => {
    if (!activePhoto?.isVideo) return
    if (videoAbortRef.current) return
    const exportEffect = selectedEffectRef.current
    const exportAssets = customImageAssetsRef.current
    if (exportEffect === 'custom-image' && exportAssets.filter((a) => a.imageBitmap).length === 0) {
      setNotice('Load a custom image library before anonymizing video.')
      return
    }
    const selectedContainer = videoExportOptions.find((opt) => opt.id === videoExportFormat)
    if (!selectedContainer?.supported) {
      setNotice(`Video format ${videoExportFormat.toUpperCase()} is not supported in this browser.`)
      return
    }
    const abort = new AbortController()
    videoAbortRef.current = abort
    setVideoProcessing(true)
    setVideoProgress({ current: 0, total: 1, phase: 'analyzing' })
    if (isMobile) setMobilePanel(null)
    setVideoMaskDrawActive(false)
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => { requestAnimationFrame(() => resolve()) })
    })
    try {
      // Snapshot editor settings after UI settles — same sources as live video preview.
      const effect = selectedEffectRef.current
      const strength = brushStrengthRef.current
      const activeDistorts = getActiveDistorts()
      const exportColorAdj = colorAdj
      const exportDistortStrengths = { ...distortStrengthByEffect }
      const exportDistortParams = { ...adjTransformParams }
      const exportPixelShiftType = adjPixelShiftType
      const sourceVideoBlob = originalBlobByPhoto[activePhoto.id] ?? activePhoto.blob
      const manualOverrides = videoFrameOverridesByPhoto[activePhoto.id] ?? []
      const timedZones = videoTimedZonesByPhoto[activePhoto.id] ?? []
      const videoDistort: VideoDistortOptions | undefined = activeDistorts.length > 0
        ? {
            enabled: activeDistorts,
            strengths: exportDistortStrengths,
            params: exportDistortParams,
            pixelShiftType: exportPixelShiftType,
          }
        : undefined
      const videoColorAdj = !isColorAdjNoop(exportColorAdj) ? exportColorAdj : undefined
      const resultBlob = await processVideo(sourceVideoBlob, {
        effect,
        strength,
        emoji: (!emojiRandomRef.current && selectedEmojiRef.current) ? selectedEmojiRef.current : pickRandomEmoji(),
        fixedEmoji: (!emojiRandomRef.current && selectedEmojiRef.current) ? selectedEmojiRef.current : undefined,
        fixedCustomImageId: (!customImageRandomRef.current && selectedCustomImageIdRef.current)
          ? selectedCustomImageIdRef.current
          : undefined,
        customImages: customImageAssetsRef.current,
        customImageSource,
        outputFormat: videoExportFormat,
        frameOverrides: manualOverrides,
        timedZones,
        colorAdj: videoColorAdj,
        distort: videoDistort,
        onPhase: (phase) => setVideoProgress((prev) => ({
          current: prev?.current ?? 0,
          total: prev?.total ?? 1,
          phase,
          renderFrame: phase === 'finishing' ? prev?.renderFrame : prev?.renderFrame,
          renderTotal: prev?.renderTotal,
        })),
        onRenderFrame: ({ frameIndex, totalFrames }) => setVideoProgress((prev) => ({
          current: prev?.current ?? 0,
          total: prev?.total ?? totalFrames,
          phase: 'rendering',
          renderFrame: frameIndex,
          renderTotal: totalFrames,
        })),
        onProgress: (current, total) => setVideoProgress((prev) => ({
          current,
          total,
          phase: prev?.phase ?? 'analyzing',
          renderFrame: prev?.renderFrame,
          renderTotal: prev?.renderTotal,
        })),
        abortSignal: abort.signal,
      })
      const [poster, meta] = await Promise.all([
        extractPosterFrame(resultBlob).catch(() => null),
        getVideoMetadata(resultBlob).catch(() => null),
      ])
      const nextPreviewUrl = poster ? URL.createObjectURL(poster.blob) : null
      setPhotos((cur) => cur.map((p) => {
        if (p.id !== activePhoto.id) return p
        if (nextPreviewUrl && nextPreviewUrl !== p.previewUrl) URL.revokeObjectURL(p.previewUrl)
        return {
          ...p,
          blob: resultBlob,
          previewUrl: nextPreviewUrl ?? p.previewUrl,
          edited: true,
          mimeType: resultBlob.type || selectedContainer.mimeType || p.mimeType,
          videoDuration: meta?.duration ?? p.videoDuration,
          videoWidth: meta?.width ?? poster?.width ?? p.videoWidth,
          videoHeight: meta?.height ?? poster?.height ?? p.videoHeight,
          videoFps: meta?.fps ?? p.videoFps,
        }
      }))
      const manualSummary = [
        manualOverrides.length > 0 ? `${manualOverrides.length} frame override${manualOverrides.length === 1 ? '' : 's'}` : '',
        timedZones.length > 0 ? `${timedZones.length} timeline mask${timedZones.length === 1 ? '' : 's'}` : '',
        videoColorAdj ? 'color adjust' : '',
        videoDistort ? `${videoDistort.enabled.length} distort effect${videoDistort.enabled.length === 1 ? '' : 's'}` : '',
      ].filter(Boolean).join(' and ')
      setVideoExportedDistortKeyByPhoto((cur) => ({
        ...cur,
        [activePhoto.id]: distortPipelineKey(
          activeDistorts,
          exportDistortStrengths,
          exportDistortParams,
          exportPixelShiftType,
        ),
      }))
      setVideoExportedColorAdjKeyByPhoto((cur) => ({
        ...cur,
        [activePhoto.id]: colorAdjExportKey(exportColorAdj),
      }))
      setActiveVideoTime(0)
      setVideoPreviewFaceZones([])
      setAutoDetect(false)
      setShowBoxes(false)
      setProcessedVideoEpoch((epoch) => epoch + 1)
      setVideoReadyTick((tick) => tick + 1)
      setNotice(`Video processed successfully as ${selectedContainer.label}. ${manualSummary ? `${manualSummary} baked in.` : 'Preview updated.'}`)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setNotice('Video processing cancelled.')
      } else {
        setNotice('Video processing failed.')
        console.error('Video processing error:', err)
      }
    } finally {
      setVideoProcessing(false)
      setVideoProgress(null)
      videoAbortRef.current = null
      if (videoDistortPreviewCanvasRef.current) videoDistortPreviewCanvasRef.current.width = 0
      setVideoDistortPreviewVisible(false)
    }
  }, [activePhoto, adjPixelShiftType, adjTransformParams, colorAdj, customImageSource, distortStrengthByEffect, getActiveDistorts, isMobile, originalBlobByPhoto, videoExportFormat, videoExportOptions, videoFrameOverridesByPhoto, videoTimedZonesByPhoto])

  const cancelVideoProcessing = useCallback(() => {
    videoAbortRef.current?.abort()
  }, [])

  const showVideoFrameLabel = useCallback((currentFrame: number, totalFrames: number) => {
    setActiveVideoFrameLabel(`${currentFrame}/${totalFrames}`)
    if (videoFrameLabelTimerRef.current) clearTimeout(videoFrameLabelTimerRef.current)
    videoFrameLabelTimerRef.current = setTimeout(() => {
      setActiveVideoFrameLabel(null)
      videoFrameLabelTimerRef.current = null
    }, 2000)
  }, [])

  const stepActiveVideoFrame = useCallback((direction: -1 | 1) => {
    if (!activePhoto?.isVideo || !activeVideoRef.current) return
    const video = activeVideoRef.current
    const fps = activePhoto.videoFps && activePhoto.videoFps > 0 ? activePhoto.videoFps : 30
    const activeDuration = Number.isFinite(activePhoto.videoDuration) ? activePhoto.videoDuration ?? 0 : 0
    const duration = Number.isFinite(video.duration) && video.duration > 0
      ? video.duration
      : activeDuration
    const currentFrame = clamp(Math.round(video.currentTime * fps), 0, duration > 0 ? Math.max(0, Math.round(duration * fps) - 1) : Number.MAX_SAFE_INTEGER)
    const totalFrames = duration > 0
      ? Math.max(1, Math.round(duration * fps))
      : Math.max(currentFrame + 2, 1)
    const nextFrame = clamp(currentFrame + direction, 0, totalFrames - 1)
    const nextTime = clamp(nextFrame / fps, 0, duration > 0 ? Math.max(0, duration - 0.001) : Number.MAX_SAFE_INTEGER)

    showVideoFrameLabel(nextFrame + 1, totalFrames)
    video.pause()
    setActiveVideoTime(nextTime)
    const seekDone = () => {
      setActiveVideoTime(video.currentTime)
      showVideoFrameLabel(clamp(Math.round(video.currentTime * fps), 0, totalFrames - 1) + 1, totalFrames)
    }
    let settled = false
    const onSeeked = () => {
      if (settled) return
      settled = true
      video.removeEventListener('seeked', onSeeked)
      seekDone()
    }
    video.addEventListener('seeked', onSeeked, { once: true })
    video.currentTime = nextTime
    window.setTimeout(() => {
      if (settled) return
      settled = true
      video.removeEventListener('seeked', onSeeked)
      seekDone()
    }, 220)
  }, [activePhoto, showVideoFrameLabel])

  const framePrevHold = useHoldRepeat({ onStep: () => stepActiveVideoFrame(-1) })
  const frameNextHold = useHoldRepeat({ onStep: () => stepActiveVideoFrame(1) })

  // Keep the frame counter locked to the real playback position so it tracks
  // both native scrubbing and play/pause (not just manual frame steps).
  useEffect(() => {
    if (!activePhoto?.isVideo) return
    const fps = activePhoto.videoFps && activePhoto.videoFps > 0 ? activePhoto.videoFps : 30
    const duration = Number.isFinite(activePhoto.videoDuration) ? activePhoto.videoDuration ?? 0 : 0
    const totalFrames = duration > 0 ? Math.max(1, Math.round(duration * fps)) : 0
    const frame = clamp(
      Math.round(activeVideoTime * fps),
      0,
      totalFrames > 0 ? totalFrames - 1 : Number.MAX_SAFE_INTEGER,
    ) + 1
    if (videoFrameLabelTimerRef.current) {
      clearTimeout(videoFrameLabelTimerRef.current)
      videoFrameLabelTimerRef.current = null
    }
    setActiveVideoFrameLabel(totalFrames > 0 ? `${frame}/${totalFrames}` : `${frame}`)
  }, [activePhoto, activeVideoTime])

  const openCurrentVideoFrameAsSnapshot = useCallback(async () => {
    if (!activePhoto?.isVideo || !activeVideoRef.current) return
    const video = activeVideoRef.current
    const width = video.videoWidth || activePhoto.videoWidth || 0
    const height = video.videoHeight || activePhoto.videoHeight || 0
    if (width <= 0 || height <= 0) {
      setNotice('Current video frame is not ready yet.')
      return
    }
    setIsBusy(true)
    try {
      const frameCanvas = document.createElement('canvas')
      frameCanvas.width = width
      frameCanvas.height = height
      const frameCtx = frameCanvas.getContext('2d')
      if (!frameCtx) throw new Error('2D context unavailable')
      frameCtx.drawImage(video, 0, 0, width, height)
      const blob = await canvasToBlob(frameCanvas, 'image/png')
      const previewUrl = URL.createObjectURL(blob)
      const baseName = activePhoto.name.replace(/\.[^.]+$/, '')
      const frameStamp = `${Math.floor(video.currentTime / 60)}-${String(Math.floor(video.currentTime % 60)).padStart(2, '0')}-${String(Math.floor((video.currentTime % 1) * 100)).padStart(2, '0')}`
      const snapshotName = `${baseName}-frame-${frameStamp}.png`
      const newPhoto: PhotoItem = {
        id: createId(), name: snapshotName, mimeType: 'image/png',
        blob, previewUrl, source: 'upload' satisfies SourceType, edited: false,
        derivedFromVideoId: activePhoto.id,
        derivedFromVideoTime: video.currentTime,
      }
      setPhotos((cur) => [...cur, newPhoto])
      setOriginalBlobByPhoto((cur) => ({ ...cur, [newPhoto.id]: blob }))
      setActivePhotoId(newPhoto.id)
      setNotice('Current video frame opened as a snapshot for brush edits.')
    } catch (err) {
      setNotice(err instanceof Error ? `Frame snapshot failed: ${err.message}` : 'Frame snapshot failed.')
    } finally {
      setIsBusy(false)
    }
  }, [activePhoto])

  const stepEditFrameAdjacent = useCallback(async (direction: -1 | 1) => {
    if (!activePhoto || activePhoto.isVideo || !activePhoto.derivedFromVideoId || activePhoto.derivedFromVideoTime == null) return
    const source = photos.find((p) => p.id === activePhoto.derivedFromVideoId)
    if (!source) return

      const fps = source.videoFps && source.videoFps > 0 ? source.videoFps : 30
    const duration = Number.isFinite(source.videoDuration) ? source.videoDuration ?? 0 : 0
      const totalFrames = duration > 0
        ? Math.max(1, Math.round(duration * fps))
        : Math.max(Math.round(activePhoto.derivedFromVideoTime * fps) + 2, 1)
      const newTime = clamp(
        activePhoto.derivedFromVideoTime + direction / fps,
        0,
        duration > 0 ? duration : Number.MAX_SAFE_INTEGER,
      )
    if (Math.abs(newTime - activePhoto.derivedFromVideoTime) < 0.001) return

    setIsBusy(true)
    try {
      const sourceBlob = originalBlobByPhoto[source.id] ?? source.blob
      const objectUrl = URL.createObjectURL(sourceBlob)
      const video = document.createElement('video')
      video.muted = true
      video.playsInline = true
      video.preload = 'auto'

      await new Promise<void>((resolve, reject) => {
        const onErr = () => reject(new Error('Video load failed'))
        video.onerror = onErr
        video.onloadedmetadata = () => { video.currentTime = newTime }
        video.onseeked = () => resolve()
        video.src = objectUrl
      })

      const width = video.videoWidth || source.videoWidth || 0
      const height = video.videoHeight || source.videoHeight || 0
      if (width <= 0 || height <= 0) throw new Error('Frame not ready')

      const frameCanvas = document.createElement('canvas')
      frameCanvas.width = width
      frameCanvas.height = height
      const frameCtx = frameCanvas.getContext('2d')
      if (!frameCtx) throw new Error('2D context unavailable')
      frameCtx.drawImage(video, 0, 0, width, height)
      const blob = await canvasToBlob(frameCanvas, 'image/png')
      const nextUrl = URL.createObjectURL(blob)
      const baseName = source.name.replace(/\.[^.]+$/, '')
      const frameStamp = `${Math.floor(newTime / 60)}-${String(Math.floor(newTime % 60)).padStart(2, '0')}-${String(Math.floor((newTime % 1) * 100)).padStart(2, '0')}`
      const snapshotId = activePhoto.id

      setPhotos((cur) => cur.map((p) => {
        if (p.id !== snapshotId) return p
        window.setTimeout(() => URL.revokeObjectURL(p.previewUrl), 0)
        return {
          ...p,
          name: `${baseName}-frame-${frameStamp}.png`,
          blob,
          previewUrl: nextUrl,
          derivedFromVideoTime: newTime,
          edited: false,
        }
      }))
      setOriginalBlobByPhoto((cur) => ({ ...cur, [snapshotId]: blob }))
      setZonesByPhoto((cur) => ({ ...cur, [snapshotId]: [] }))
      setZonesAnonymized(false)
      setActiveDirty(false)

      const wc = workCanvasRef.current
      if (wc) {
        wc.width = width
        wc.height = height
        workCtxRef.current = null
        const wCtx = getWorkCtx()
        if (wCtx) {
          wCtx.clearRect(0, 0, width, height)
          wCtx.drawImage(frameCanvas, 0, 0)
        }
        setActiveImageSize({ width, height })
        renderCanvasRef.current()
      }

      showVideoFrameLabel(clamp(Math.round(newTime * fps), 0, totalFrames - 1) + 1, totalFrames)
      setNotice(`Frame ${formatVideoTime(newTime)}`)
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Frame step failed.')
    } finally {
      setIsBusy(false)
    }
  }, [activePhoto, photos, originalBlobByPhoto, getWorkCtx, showVideoFrameLabel])

  const exportActiveVideo = useCallback(() => {
    if (!activePhoto?.isVideo) return
    const ext = mimeTypeToVideoExtension(activePhoto.mimeType)
    const baseName = activePhoto.name.split('/').pop() ?? activePhoto.name
    const outName = baseName.replace(/\.[^.]+$/, '') + `-anon.${ext}`
    saveAs(activePhoto.blob, outName)
    setNotice(`Exported: ${outName}`)
  }, [activePhoto])

  // Vectorize panel
  const [vectorizePanelOpen, setVectorizePanelOpen] = useState(false)
  const [vectorizeParams, setVectorizeParams] = useState<VectorizeParams>({ ...DEFAULT_VECTORIZE_PARAMS })
  const [svgPreview, setSvgPreview] = useState<string | null>(null)
  const [svgPreviewUrl, setSvgPreviewUrl] = useState<string | null>(null)
  const [svgPreviewSize, setSvgPreviewSize] = useState<number | null>(null)
  const [vectorizing, setVectorizing] = useState(false)
  const vectorizeDebounceRef = useRef<ReturnType<typeof setTimeout>>()
  const vectorizePreviewUrlRef = useRef<string | null>(null)
  const vectorizePreviewSeqRef = useRef(0)

  const runVectorizePreview = useCallback(async (params: VectorizeParams) => {
    const wc = workCanvasRef.current
    if (!wc || wc.width === 0) return
    const seq = ++vectorizePreviewSeqRef.current
    setVectorizing(true)
    try {
      const svg = await canvasToSvg(wc, params)
      if (seq !== vectorizePreviewSeqRef.current) return
      const nextUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
      if (vectorizePreviewUrlRef.current) URL.revokeObjectURL(vectorizePreviewUrlRef.current)
      vectorizePreviewUrlRef.current = nextUrl
      setSvgPreview(svg)
      setSvgPreviewUrl(nextUrl)
      setSvgPreviewSize(new Blob([svg]).size)
    } catch (err) {
      console.warn('SVG vectorization preview failed:', err)
      if (seq !== vectorizePreviewSeqRef.current) return
      if (vectorizePreviewUrlRef.current) {
        URL.revokeObjectURL(vectorizePreviewUrlRef.current)
        vectorizePreviewUrlRef.current = null
      }
      setSvgPreview(null)
      setSvgPreviewUrl(null)
      setSvgPreviewSize(null)
    } finally {
      if (seq === vectorizePreviewSeqRef.current) setVectorizing(false)
    }
  }, [])

  const updateVectorizeParam = useCallback(<K extends keyof VectorizeParams>(key: K, value: VectorizeParams[K]) => {
    setVectorizeParams((prev) => {
      const next = { ...prev, [key]: value }
      if (vectorizeDebounceRef.current) clearTimeout(vectorizeDebounceRef.current)
      vectorizeDebounceRef.current = setTimeout(() => runVectorizePreview(next), 400)
      return next
    })
  }, [runVectorizePreview])

  // Trigger preview when panel opens or preset changes
  useEffect(() => {
    if (vectorizePanelOpen && activePhoto && !activePhoto.isVideo) {
      runVectorizePreview(vectorizeParams)
      return
    }
    if (!vectorizePanelOpen || activePhoto?.isVideo) {
      vectorizePreviewSeqRef.current += 1
      if (vectorizeDebounceRef.current) clearTimeout(vectorizeDebounceRef.current)
      if (vectorizePreviewUrlRef.current) {
        URL.revokeObjectURL(vectorizePreviewUrlRef.current)
        vectorizePreviewUrlRef.current = null
      }
      setSvgPreview(null)
      setSvgPreviewUrl(null)
      setSvgPreviewSize(null)
      setVectorizing(false)
    }
   
  }, [vectorizePanelOpen, activePhoto?.id, activePhoto?.isVideo])

  useEffect(() => () => {
    if (vectorizeDebounceRef.current) clearTimeout(vectorizeDebounceRef.current)
    if (vectorizePreviewUrlRef.current) URL.revokeObjectURL(vectorizePreviewUrlRef.current)
  }, [])

  const exportAsSvg = useCallback(async () => {
    if (!activePhoto) return
    const wc = workCanvasRef.current
    if (!wc || wc.width === 0) return
    setIsBusy(true)
    try {
      const blob = svgPreview
        ? new Blob([svgPreview], { type: 'image/svg+xml' })
        : await canvasToSvgBlob(wc, vectorizeParams)
      const baseName = activePhoto.name.split('/').pop() ?? activePhoto.name
      const outName = baseName.replace(/\.[^.]+$/, '') + '-vector.svg'
      saveAs(blob, outName)
      setNotice(`Exported SVG: ${outName} (${Math.round(blob.size / 1024)} KB)`)
    } catch { setNotice('SVG vectorization failed.') }
    finally { setIsBusy(false) }
  }, [activePhoto, vectorizeParams, svgPreview])

  const exportZip = useCallback(async () => {
    if (photos.length === 0) return
    const images = photos.filter((p) => !p.isVideo)
    const skippedVideos = photos.length - images.length
    if (images.length === 0) {
      setNotice('No photos to export. Use video export for videos.')
      return
    }
    setIsExporting(true)
    try {
      const zip = new JSZip()
      const usage = new Map<string, number>()
      // Strip metadata from images. Videos use the dedicated video export path.
      await Promise.all(images.map(async (p) => {
        const clean = await stripMetadata(p.blob)
        zip.file(makeZipSafeName(p.name, usage), clean)
      }))
      const blob = await zip.generateAsync({ type: 'blob' })
      saveAs(blob, `anonymized-${new Date().toISOString().slice(0, 10)}.zip`)
      setNotice(
        skippedVideos > 0
          ? `ZIP: ${images.length} photo${images.length === 1 ? '' : 's'} · ${skippedVideos} video${skippedVideos === 1 ? '' : 's'} skipped.`
          : `ZIP: ${images.length} photo${images.length === 1 ? '' : 's'}.`,
      )
    } catch { setNotice('ZIP export failed.') }
    finally { setIsExporting(false) }
  }, [photos])

  const cancelNormalizeBatch = useCallback(() => { normalizeCancelRef.current = true }, [])

  const toggleBatchSelect = useCallback((photoId: string) => {
    setSelectedForBatch((cur) => {
      const next = new Set(cur)
      if (next.has(photoId)) next.delete(photoId); else next.add(photoId)
      return next
    })
  }, [])

  const selectAllForBatch = useCallback(() => {
    setSelectedForBatch(new Set(photos.filter((p) => !p.isVideo).map((p) => p.id)))
  }, [photos])

  const deselectAllForBatch = useCallback(() => {
    setSelectedForBatch(new Set())
  }, [])

  const runNormalizeBatch = useCallback(async () => {
    if (photos.length === 0) { setNotice('Load photos first.'); return }
    const s = normalizeSettings
    if (s.cropMode === 'template' && !s.templateCropNormalized) { setNotice('Set a crop template first.'); return }
    const batch = selectedForBatch.size > 0
      ? photos.filter((p) => selectedForBatch.has(p.id) && !p.isVideo)
      : photos.filter((p) => !p.isVideo)
    if (batch.length === 0) { setNotice('No photos selected for batch.'); return }
    const concurrency = Math.max(1, Math.min(8, Math.floor(Number.isFinite(s.batchConcurrency) ? s.batchConcurrency : 1)))
    normalizeCancelRef.current = false
    setIsNormalizing(true)
    const startedAt = Date.now()
    setNormalizeProgress({ total: batch.length, done: 0, currentFile: '', success: 0, failed: 0, inputBytes: 0, outputBytes: 0, active: true, startedAt, etaSeconds: 0 })

    const localResults: Record<string, NormalizeResult> = {}
    const toRevoke: string[] = []
    const updatedMap = new Map<string, PhotoItem>(photos.map((p) => [p.id, p]))
    let success = 0, failed = 0, inputBytes = 0, outputBytes = 0, completed = 0, overwritten = 0, queueIndex = 0

    const processNext = async (workerId: number) => {
      while (!normalizeCancelRef.current) {
        const idx = queueIndex++
        if (idx >= batch.length) return
        const photo = batch[idx]
        setNormalizeProgress((cur) => ({ ...cur, currentFile: `[w${workerId}] ${photo.name}` }))
        try {
          // Only run format/resize/crop steps if format task is active
          const doFormat = activeBatchTasks.has('format') || activeBatchTasks.has('resize') || activeBatchTasks.has('crop')
          let result = doFormat
            ? await normalizeSinglePhoto(photo, s)
            : { photoId: photo.id, outputName: photo.name, outputMimeType: photo.mimeType as NormalizeResult['outputMimeType'], blob: photo.blob, beforeWidth: 0, beforeHeight: 0, afterWidth: 0, afterHeight: 0, beforeBytes: photo.blob.size, afterBytes: photo.blob.size }

          // Apply color adjustments if colors task is active. Per-photo overrides
          // win; otherwise the global batch sliders apply to every photo so an
          // enabled "colors" task always propagates to the output files.
          if (activeBatchTasks.has('colors')) {
            const globalActive = colorAdj.brightness !== 0 || colorAdj.contrast !== 0
              || colorAdj.saturation !== 0 || colorAdj.shadows !== 0
              || colorAdj.highlights !== 0 || colorAdj.preset !== 'none'
            const photoColorAdj = colorAdjByPhoto[photo.id] ?? (globalActive ? colorAdj : null)
            if (photoColorAdj) {
              const bmp = await createImageBitmap(result.blob)
              const tmp = document.createElement('canvas')
              tmp.width = bmp.width; tmp.height = bmp.height
              const tmpCtx = tmp.getContext('2d', { willReadFrequently: true })!
              tmpCtx.drawImage(bmp, 0, 0); bmp.close()
              applyColorAdjustments(tmpCtx, photoColorAdj, tmp)
              const coloredBlob = await exportCanvasToBlob(tmp, s.outputFormat, s.quality, 'full')
              result = { ...result, blob: coloredBlob, afterBytes: coloredBlob.size }
            }
          }

          // Apply glitch/transform if active
          if (activeBatchTasks.has('glitch')) {
            const bmp = await createImageBitmap(result.blob)
            const tmp = document.createElement('canvas')
            tmp.width = bmp.width; tmp.height = bmp.height
            const tmpCtx = tmp.getContext('2d', { willReadFrequently: true })!
            tmpCtx.drawImage(bmp, 0, 0); bmp.close()
            const glitched = await applyGlitchEffect(tmp, {
              subEffect: s.glitchSubEffect,
              amount: s.glitchAmount,
              seed: s.glitchSeed,
              halftoneDotSize: s.halftoneDotSize,
              halftoneShape: s.halftoneShape,
            })
            const glitchedBlob = await exportCanvasToBlob(glitched, s.outputFormat, s.quality, 'full')
            result = { ...result, blob: glitchedBlob, afterBytes: glitchedBlob.size }
          }

          // Auto-anonymize: detect faces and apply selected effect
          if (activeBatchTasks.has('anonymize')) {
            const bmp = await createImageBitmap(result.blob)
            const tmp = document.createElement('canvas')
            tmp.width = bmp.width; tmp.height = bmp.height
            const tmpCtx = tmp.getContext('2d', { willReadFrequently: true })!
            tmpCtx.drawImage(bmp, 0, 0); bmp.close()
            try {
              const { confidence, thorough } = detectSettingsRef.current
              const boxes = await detectFaces(tmp, thorough, confidence)
              if (boxes.length > 0) {
                const effId = s.batchAnonymizeEffect as AnonymizeEffectId
                const strength = s.batchAnonymizeStrength
                const batchEmojis = pickUniqueEmojis(boxes.length)
                boxes.forEach((b, i) => {
                  const zoneId = `${photo.id}-${i}`
                  applyEffectRect(
                    tmpCtx,
                    effId,
                    b.x,
                    b.y,
                    b.width,
                    b.height,
                    strength,
                    batchEmojis[i],
                    effId === 'custom-image' ? {
                      customImages: customImageAssets,
                      customImageSource,
                      zoneId,
                      customImageAssetId: pickCustomImageAssetId(customImageAssets, zoneId),
                    } : undefined,
                  )
                })
              }
            } catch { /* detection failed — skip anonymize for this photo */ }
            const anonBlob = await exportCanvasToBlob(tmp, s.outputFormat, s.quality, 'full')
            result = { ...result, blob: anonBlob, afterBytes: anonBlob.size }
          }

          localResults[photo.id] = result
          success++; inputBytes += result.beforeBytes; outputBytes += result.afterBytes
          const nextUrl = URL.createObjectURL(result.blob)
          toRevoke.push(photo.previewUrl)
          updatedMap.set(photo.id, { ...photo, name: result.outputName, mimeType: result.outputMimeType, blob: result.blob, previewUrl: nextUrl, edited: true })
          setNormalizePreviewIds((cur) => [photo.id, ...cur.filter((id) => id !== photo.id)].slice(0, 9))
          if (photo.fileHandle && s.overwriteOriginals) {
            try { const w = await photo.fileHandle.createWritable(); await w.write(result.blob); await w.close(); overwritten++ }
            catch (err) { console.error('Overwrite failed', photo.name, err) }
          }
        } catch (err) {
          console.error('Normalize failed', photo.name, err)
          failed++; inputBytes += photo.blob.size; updatedMap.set(photo.id, photo)
        } finally {
          completed++
          const elapsed = Math.max(1, (Date.now() - startedAt) / 1000)
          const eta = completed > 0 ? Math.max(0, Math.round((batch.length - completed) / (completed / elapsed))) : 0
          setNormalizeProgress((cur) => ({ ...cur, done: completed, success, failed, inputBytes, outputBytes, etaSeconds: eta }))
          await waitForUi()
        }
      }
    }

    await Promise.all(Array.from({ length: concurrency }, (_, i) => processNext(i + 1)))
    const canceled = normalizeCancelRef.current
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000))
    const updatedPhotos = photos.map((p) => updatedMap.get(p.id) ?? p)
    setNormalizeProgress((cur) => ({ ...cur, active: false, currentFile: canceled ? 'Cancelled.' : '', done: completed, success, failed, inputBytes, outputBytes, etaSeconds: 0 }))
    setIsNormalizing(false)
    if (Object.keys(localResults).length > 0) {
      setNormalizeResults((cur) => ({ ...cur, ...localResults }))
      setPhotos(updatedPhotos)
      toRevoke.forEach((url) => URL.revokeObjectURL(url))
      // Reload work canvas if the active photo was in the batch
      if (activePhotoId && localResults[activePhotoId]) {
        const updated = updatedMap.get(activePhotoId)
        if (updated) {
          createImageBitmap(updated.blob).then((bmp) => {
            const wc = workCanvasRef.current
            if (wc) {
              wc.width = bmp.width; wc.height = bmp.height
              wc.getContext('2d')!.drawImage(bmp, 0, 0)
              bmp.close()
              renderCanvas()
            }
          }).catch(() => {})
        }
      }
    }
    setNormalizeSummary({ success, failed, canceled, inputBytes, outputBytes, elapsedSeconds, overwritten })
    if (canceled) { setNotice(`Cancelled after ${completed}/${batch.length}.`); return }
    if (success === 0) { setNotice('Batch complete — no successes.'); return }
    const saved = inputBytes > 0 ? Math.round((1 - outputBytes / inputBytes) * 100) : 0
    setNotice(`Batch: ${success} done${failed > 0 ? ` · ${failed} errors` : ''}. Saved ~${saved}%`)
  }, [activeBatchTasks, colorAdj, colorAdjByPhoto, normalizeSettings, photos, selectedForBatch])

  const exportNormalizeZip = useCallback(async () => {
    if (Object.keys(normalizeResults).length === 0) { setNotice('Run batch first.'); return }
    setIsExporting(true)
    try {
      const zip = new JSZip()
      const usage = new Map<string, number>()
      Object.values(normalizeResults).forEach((r) => zip.file(makeZipSafeName(r.outputName, usage), r.blob))
      const blob = await zip.generateAsync({ type: 'blob' })
      saveAs(blob, `normalized-${new Date().toISOString().slice(0, 10)}.zip`)
      setNotice(`ZIP: ${Object.keys(normalizeResults).length} normalized.`)
    } catch { setNotice('ZIP export failed.') }
    finally { setIsExporting(false) }
  }, [normalizeResults])

  const setColorPreset = useCallback((presetId: ColorPresetId) => {
    const preset = COLOR_PRESETS.find((p) => p.id === presetId)
    if (!preset) return
    setColorAdj({ ...preset.values, preset: presetId })
  }, [])

  const resetAdjTransformPreview = useCallback(() => {
    setAdjTransform('none')
    setAdjTransformStrength(35)
    setEnabledDistorts([])
    setDistortStrengthByEffect(DEFAULT_DISTORT_STRENGTHS)
    if (transformPreviewCanvasRef.current) transformPreviewCanvasRef.current.width = 0
    if (videoDistortPreviewCanvasRef.current) videoDistortPreviewCanvasRef.current.width = 0
    setVideoDistortPreviewVisible(false)
    renderCanvas()
  }, [renderCanvas])

  const applyColorAdjToActive = useCallback(() => {
    const wc = workCanvasRef.current
    if (!wc || wc.width === 0) return
    const ctx = getWorkCtx()
    if (!ctx) return
    pushUndo()
    applyColorAdjustments(ctx, colorAdj, wc)
    setActiveDirty(true)
    if (activePhotoId) {
      setColorAdjByPhoto((cur) => ({ ...cur, [activePhotoId]: { ...colorAdj } }))
    }
    renderCanvas()
  }, [activePhotoId, colorAdj, getWorkCtx, pushUndo, renderCanvas, setActiveDirty])

  const applyAdjTransformToCanvas = useCallback(async () => {
    const wc = workCanvasRef.current
    const active = getActiveDistorts()
    if (!wc || wc.width === 0 || active.length === 0) return
    pushUndo()
    try {
      const glitched = await applyDistortPipeline(
        wc,
        active,
        distortStrengthByEffect,
        adjTransformParams,
        adjPixelShiftType,
        Math.floor(Math.random() * 999),
      )
      const ctx = wc.getContext('2d', { willReadFrequently: true })!
      ctx.clearRect(0, 0, wc.width, wc.height)
      ctx.drawImage(glitched, 0, 0)
      setActiveDirty(true)
      setTransformFlyoutOpen(false)
      resetAdjTransformPreview()
      setNotice(`Applied ${active.length} distort effect${active.length === 1 ? '' : 's'}.`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setNotice(`Transform apply failed: ${msg}`)
    }
  }, [adjPixelShiftType, adjTransformParams, distortStrengthByEffect, getActiveDistorts, pushUndo, resetAdjTransformPreview, setActiveDirty])
  // applyAdjTransformToCanvas is called from toolbar Apply if a transform is pending
  void applyAdjTransformToCanvas

  const computePreviewFileSize = useCallback(() => {
    const wc = workCanvasRef.current
    if (!wc || wc.width === 0 || !activePhoto) {
      setPreviewFileSizeKb(null); setPreviewRendering(false)
      if (qualityPreviewCanvasRef.current) { qualityPreviewCanvasRef.current.width = 0 }
      return
    }
    const draft = mobileExportDraftRef.current
    const fmt = draft?.format ?? exportFormat
    const qual = draft?.quality ?? exportQuality
    const targetW = draft?.width ?? wc.width
    const targetH = draft?.height ?? wc.height

    let sourceCanvas: HTMLCanvasElement = wc
    if (targetW !== wc.width || targetH !== wc.height) {
      if (!previewScaleCanvasRef.current) previewScaleCanvasRef.current = document.createElement('canvas')
      const sc = previewScaleCanvasRef.current
      sc.width = Math.max(1, Math.round(targetW))
      sc.height = Math.max(1, Math.round(targetH))
      sc.getContext('2d')!.drawImage(wc, 0, 0, sc.width, sc.height)
      sourceCanvas = sc
    }

    setPreviewRendering(true)
    if (isLosslessFormat(fmt)) {
      exportCanvasToBlob(sourceCanvas, fmt, qual, exportPngDepth).then((blob) => {
        setPreviewFileSizeKb(Math.round(blob.size / 1024))
        if (qualityPreviewCanvasRef.current) { qualityPreviewCanvasRef.current.width = 0 }
        renderCanvasRef.current()
      }).catch(() => {}).finally(() => setPreviewRendering(false))
      return
    }
    const quality = qual / 100
    sourceCanvas.toBlob((blob) => {
      if (!blob) { setPreviewRendering(false); return }
      setPreviewFileSizeKb(Math.round(blob.size / 1024))
      createImageBitmap(blob).then((bmp) => {
        if (!qualityPreviewCanvasRef.current) qualityPreviewCanvasRef.current = document.createElement('canvas')
        const qc = qualityPreviewCanvasRef.current
        qc.width = bmp.width; qc.height = bmp.height
        qc.getContext('2d')!.drawImage(bmp, 0, 0)
        bmp.close()
        renderCanvasRef.current()
      }).catch(() => {}).finally(() => setPreviewRendering(false))
    }, fmt, quality)
  // renderCanvas intentionally not in deps — use renderCanvasRef to avoid infinite loop
   
  }, [activePhoto, exportFormat, exportQuality, exportPngDepth, mobileExportDraft])

  // Batch live preview: when batch panel open, apply enabled tasks to a preview canvas
  const computeBatchPreview = useCallback(async () => {
    const wc = workCanvasRef.current
    if (!wc || wc.width === 0 || !activePhoto || !batchPanelOpen) {
      if (batchPreviewCanvasRef.current) { batchPreviewCanvasRef.current.width = 0 }
      return
    }
    if (!batchPreviewCanvasRef.current) batchPreviewCanvasRef.current = document.createElement('canvas')
    const bc = batchPreviewCanvasRef.current
    bc.width = wc.width; bc.height = wc.height
    const bCtx = bc.getContext('2d', { willReadFrequently: true })
    if (!bCtx) return
    bCtx.drawImage(wc, 0, 0)
    // Apply color adjustments if enabled — use live colorAdj for immediate preview
    if (activeBatchTasks.has('colors')) {
      applyColorAdjustments(bCtx, colorAdj, bc)
    }
    // Apply glitch/halftone transform if enabled
    if (activeBatchTasks.has('glitch') && normalizeSettings.glitchSubEffect !== 'color-shift') {
      try {
        const result = await applyGlitchEffect(bc, {
          subEffect: normalizeSettings.glitchSubEffect,
          amount: normalizeSettings.glitchAmount,
          seed: normalizeSettings.glitchSeed,
          halftoneDotSize: normalizeSettings.halftoneDotSize,
          halftoneShape: normalizeSettings.halftoneShape,
        })
        bc.width = result.width; bc.height = result.height
        bc.getContext('2d')!.drawImage(result, 0, 0)
      } catch { /* ignore */ }
    }
    renderCanvasRef.current()   // use ref to avoid dep on renderCanvas
  // renderCanvas intentionally not in deps — use renderCanvasRef
   
  }, [activePhoto, activeBatchTasks, batchPanelOpen, colorAdj, normalizeSettings])

  // Keep ref in sync so photo-loading effect can call it
  useEffect(() => { computeBatchPreviewRef.current = computeBatchPreview }, [computeBatchPreview])

  // Debounced batch preview effect
  useEffect(() => {
    if (!batchPanelOpen) {
      if (batchPreviewCanvasRef.current) { batchPreviewCanvasRef.current.width = 0 }
      renderCanvasRef.current()
      return
    }
    if (batchPreviewDebounceRef.current) clearTimeout(batchPreviewDebounceRef.current)
    batchPreviewDebounceRef.current = setTimeout(() => { computeBatchPreview() }, 350)
    return () => { if (batchPreviewDebounceRef.current) clearTimeout(batchPreviewDebounceRef.current) }
   
  }, [batchPanelOpen, activeBatchTasks, normalizeSettings, activePhoto, colorAdj])

  useEffect(() => {
    if (!activePhotoId || !activePhoto?.isVideo) return
    setDistortSettingsByVideoId((cur) => ({
      ...cur,
      [activePhotoId]: snapshotVideoDistortSettings(),
    }))
  }, [activePhoto?.isVideo, activePhotoId, adjPixelShiftType, adjTransformParams, distortStrengthByEffect, enabledDistorts, snapshotVideoDistortSettings])

  useEffect(() => {
    if (!activePhotoId || !activePhoto?.isVideo) return
    setColorAdjByPhoto((cur) => ({
      ...cur,
      [activePhotoId]: { ...colorAdj },
    }))
  }, [activePhoto?.isVideo, activePhotoId, colorAdj])

  const loadedVideoDistortPhotoRef = useRef<string | null>(null)
  useEffect(() => {
    if (!activePhotoId || !activePhoto?.isVideo) {
      loadedVideoDistortPhotoRef.current = null
      return
    }
    if (loadedVideoDistortPhotoRef.current === activePhotoId) return
    loadedVideoDistortPhotoRef.current = activePhotoId
    applyVideoDistortSettings(distortSettingsByVideoId[activePhotoId] ?? EMPTY_VIDEO_DISTORT_SETTINGS)
  }, [activePhoto?.isVideo, activePhotoId, applyVideoDistortSettings, distortSettingsByVideoId])

  useEffect(() => {
    if (!activePhoto?.isVideo) return
    const overlay = videoDistortPreviewCanvasRef.current
    if (overlay && videoContentLayout) {
      syncVideoOverlayCanvasDisplay(overlay, videoContentLayout)
    }
  }, [activePhoto?.isVideo, videoContentLayout])

  // Re-render video preview immediately when anonymize / adjust / distort settings change.
  const refreshVideoFramePreview = useCallback(async () => {
    if (videoProcessingRef.current) return
    const clearPreview = () => {
      const overlay = videoDistortPreviewCanvasRef.current
      if (overlay) {
        overlay.width = 0
        overlay.classList.remove('visible')
      }
      setVideoDistortPreviewVisible(false)
    }
    const photo = activePhotoRef.current
    if (photo?.isVideo && photo.edited) {
      clearPreview()
      return
    }
    const faceZones = videoPreviewFaceZonesRef.current
    const hasFaceZones = faceZones.length > 0
    const activeDistorts = getActiveDistorts()
    const hasColor = !isColorAdjNoop(colorAdj)
    const hasDistort = activeDistorts.length > 0
    const shouldPreview = Boolean(photo?.isVideo && (hasFaceZones || hasColor || hasDistort))
    if (!shouldPreview) {
      clearPreview()
      return
    }
    const video = activeVideoRef.current
    if (!video || video.videoWidth <= 0 || video.videoHeight <= 0) {
      clearPreview()
      return
    }
    const layout = videoContentLayoutRef.current ?? (
      videoMediaRef.current
        ? measureVideoContentLayout(
          videoMediaRef.current.clientWidth,
          videoMediaRef.current.clientHeight,
          video.videoWidth,
          video.videoHeight,
        )
        : null
    )
    const gen = ++videoDistortPreviewGenRef.current
    const targetTime = activeVideoTimeRef.current
    try {
      await waitForVideoFrame(video)
      if (gen !== videoDistortPreviewGenRef.current) return
      if (Math.abs(video.currentTime - targetTime) > 0.12) return
      if (!videoDistortCaptureCanvasRef.current) {
        videoDistortCaptureCanvasRef.current = document.createElement('canvas')
      }
      const capture = videoDistortCaptureCanvasRef.current
      capture.width = video.videoWidth
      capture.height = video.videoHeight
      const captureCtx = capture.getContext('2d')
      if (!captureCtx) return
      captureCtx.drawImage(video, 0, 0, capture.width, capture.height)
      const effect = selectedEffectRef.current
      if (hasFaceZones) {
        const W = capture.width
        const H = capture.height
        const emojis = emojiRandomRef.current
          ? pickUniqueEmojis(faceZones.length)
          : faceZones.map(() => selectedEmojiRef.current ?? pickRandomEmoji())
        faceZones.forEach((zone, i) => {
          const emoji = emojiRandomRef.current
            ? (zone.emoji || emojis[i] || pickRandomEmoji())
            : (selectedEmojiRef.current ?? zone.emoji ?? emojis[i] ?? pickRandomEmoji())
          try {
            applyEffectRect(
              captureCtx,
              effect,
              zone.x * W,
              zone.y * H,
              zone.width * W,
              zone.height * H,
              videoZoneStrength(zone, brushStrength),
              emoji,
              customEffectOptions({ ...zone, effect }, `${zone.id}-${i}`),
            )
          } catch (err) {
            console.warn('Video face preview effect failed:', err)
          }
        })
      }
      if (hasColor) {
        applyColorAdjustments(captureCtx, colorAdj, capture)
      }
      let result: HTMLCanvasElement = capture
      if (hasDistort) {
        const fps = photo?.videoFps && photo.videoFps > 0 ? photo.videoFps : 30
        const seed = Math.max(0, Math.round(activeVideoTimeRef.current * fps))
        result = await applyDistortPipeline(
          capture,
          activeDistorts,
          distortStrengthByEffect,
          adjTransformParams,
          adjPixelShiftType,
          seed,
        )
      }
      if (gen !== videoDistortPreviewGenRef.current) return
      if (Math.abs(video.currentTime - targetTime) > 0.12) return
      const overlay = videoDistortPreviewCanvasRef.current
      if (!overlay) return
      paintVideoPreviewOverlay(overlay, result, result.width, result.height, layout)
      setVideoDistortPreviewVisible(true)
    } catch (err) {
      console.warn('Video frame preview failed:', err)
      clearPreview()
    }
  }, [
    activeVideoTime,
    adjPixelShiftType,
    adjTransformParams,
    brushStrength,
    colorAdj,
    customEffectOptions,
    distortStrengthByEffect,
    enabledDistorts,
    getActiveDistorts,
  ])

  useEffect(() => {
    if (videoProcessing) return
    void refreshVideoFramePreview()
  }, [
    videoProcessing,
    refreshVideoFramePreview,
    activePhoto?.isVideo,
    activePhoto?.id,
    activeVideoTime,
    videoPreviewFaceZones,
    selectedEffect,
    selectedEmoji,
    emojiRandom,
    selectedCustomImageId,
    customImageRandom,
    customImageSource,
    brushStrength,
    detectFaceOffset,
    mobilePanel,
    autoDetect,
  ])

  // During playback, timeupdate fires ~4×/s — use rVFC so the effect overlay updates every frame.
  useEffect(() => {
    const video = activeVideoRef.current
    const photo = activePhoto
    if (!video || !photo?.isVideo || photo.edited || videoProcessing || !videoPlaying) return

    let cancelled = false
    let callbackId = 0

    const onFrame = (_now: number, metadata: VideoFrameCallbackMetadata) => {
      if (cancelled || video.paused || video.ended) return
      activeVideoTimeRef.current = metadata.mediaTime
      void refreshVideoFramePreview()
      if (typeof video.requestVideoFrameCallback === 'function') {
        callbackId = video.requestVideoFrameCallback(onFrame)
      }
    }

    if (typeof video.requestVideoFrameCallback === 'function') {
      callbackId = video.requestVideoFrameCallback(onFrame)
    }

    return () => {
      cancelled = true
      if (callbackId && typeof video.cancelVideoFrameCallback === 'function') {
        video.cancelVideoFrameCallback(callbackId)
      }
    }
  }, [
    videoPlaying,
    activePhoto?.id,
    activePhoto?.isVideo,
    activePhoto?.edited,
    videoProcessing,
    refreshVideoFramePreview,
  ])

  const setSelectedEffect = useCallback((effect: AnonymizeEffectId) => {
    selectedEffectRef.current = effect
    setSelectedEffectState(effect)
    if (effect === 'custom-image') setBrushStrength(1)
  }, [])

  // Transform live preview: recompute from workCanvas whenever transform params change in adj flyout
  useEffect(() => {
    const clear = () => {
      if (transformPreviewCanvasRef.current) { transformPreviewCanvasRef.current.width = 0 }
    }
    const active = getActiveDistorts()
    if ((!adjFlyoutOpen && !transformPanelOpen) || active.length === 0) {
      clear(); renderCanvasRef.current(); return
    }
    const wc = workCanvasRef.current
    if (!wc || wc.width === 0) { clear(); return }
    if (transformPreviewDebounceRef.current) clearTimeout(transformPreviewDebounceRef.current)
    transformPreviewDebounceRef.current = setTimeout(async () => {
      const gen = ++transformPreviewGenRef.current
      try {
        const result = await applyDistortPipeline(
          wc,
          active,
          distortStrengthByEffect,
          adjTransformParams,
          adjPixelShiftType,
        )
        if (gen !== transformPreviewGenRef.current) return
        if (!transformPreviewCanvasRef.current) transformPreviewCanvasRef.current = document.createElement('canvas')
        const tc = transformPreviewCanvasRef.current
        tc.width = result.width; tc.height = result.height
        tc.getContext('2d')!.drawImage(result, 0, 0)
        renderCanvasRef.current()
      } catch { /* ignore */ }
    }, isMobile && mobilePanel === 'tool-distort' ? 0 : 40)
    return () => { if (transformPreviewDebounceRef.current) clearTimeout(transformPreviewDebounceRef.current) }
   
  }, [adjFlyoutOpen, transformPanelOpen, mobilePanel, getActiveDistorts, distortStrengthByEffect, adjTransformParams, adjPixelShiftType, activePhoto?.id, isMobile])

  const runVideoFaceDetectPass = useCallback(async (passIndex: number, targetTime: number, gen: number) => {
    const video = activeVideoRef.current
    if (!video || video.videoWidth <= 0 || video.videoHeight <= 0) return
    try {
      await waitForVideoFrame(video)
      if (gen !== videoFaceDetectGenRef.current) return
      if (Math.abs(video.currentTime - targetTime) > 0.12) return
      if (!videoFaceDetectCanvasRef.current) {
        videoFaceDetectCanvasRef.current = document.createElement('canvas')
      }
      const capture = videoFaceDetectCanvasRef.current
      capture.width = video.videoWidth
      capture.height = video.videoHeight
      const captureCtx = capture.getContext('2d')
      if (!captureCtx) return
      captureCtx.drawImage(video, 0, 0, capture.width, capture.height)
      const { confidence, thorough } = getVideoDetectSettings(detectSensitivity, passIndex)
      const boxes = await detectFaces(capture, thorough, confidence)
      if (gen !== videoFaceDetectGenRef.current) return
      if (Math.abs(video.currentTime - targetTime) > 0.12) return
      const W = capture.width
      const H = capture.height
      const emojis = pickUniqueEmojis(Math.max(boxes.length, 1))
      let emojiIdx = 0
      const nextEmoji = () => (
        emojiRandomRef.current
          ? emojis[Math.min(emojiIdx++, emojis.length - 1)]
          : (selectedEmojiRef.current ?? emojis[0])
      )
      const stabilized = videoPreviewStabilizerRef.current.update(
        boxes,
        W,
        H,
        targetTime,
        selectedEffect,
        nextEmoji,
      )
      const frameKey = Math.round(targetTime * 1000)
      const dismissed = videoDismissedFacesByPhotoRef.current[activePhotoId ?? '']?.[frameKey] ?? []
      const VIDEO_FACE_PAD = 0.46
      const zones: Zone[] = stabilized.map((base, i) => {
        const innerW = base.width / (1 + 2 * VIDEO_FACE_PAD)
        const innerH = base.height / (1 + 2 * VIDEO_FACE_PAD)
        const padXn = (base.width - innerW) / 2
        const padYn = (base.height - innerH) / 2
        return {
          ...base,
          id: createId(),
          detectX: base.x + padXn,
          detectY: base.y + padYn,
          detectWidth: innerW,
          detectHeight: innerH,
          customImageAssetId: selectedEffect === 'custom-image'
            ? resolveCustomImageAssetId(`${activePhotoId ?? 'video'}-${i}`)
            : undefined,
        }
      })
      setVideoPreviewFaceZones(filterDismissedFaceZones(zones, dismissed))
      void refreshVideoFramePreview()
    } catch {
      if (gen === videoFaceDetectGenRef.current && passIndex === 0) setVideoPreviewFaceZones([])
    }
  }, [activePhotoId, detectSensitivity, refreshVideoFramePreview, resolveCustomImageAssetId, selectedEffect])

  // Video face preview: immediate scan on load/frame change, then +4%/s (10→14→18→22%) on same frame.
  useEffect(() => {
    videoFaceScanTimersRef.current.forEach(clearTimeout)
    videoFaceScanTimersRef.current = []
    if (videoFaceDetectDebounceRef.current) clearTimeout(videoFaceDetectDebounceRef.current)

    if (!activePhoto?.isVideo || !autoDetect || activePhoto.edited || detector.mode === 'unavailable') {
      videoPreviewStabilizerRef.current.reset()
      setVideoPreviewFaceZones([])
      return
    }
    const video = activeVideoRef.current
    if (!video || video.videoWidth <= 0 || video.videoHeight <= 0) {
      return
    }

    const targetTime = activeVideoTimeRef.current
    const frameKey = Math.round(targetTime * 1000)
    const gen = ++videoFaceDetectGenRef.current

    void runVideoFaceDetectPass(0, targetTime, gen)

    for (let passIndex = 1; passIndex <= VIDEO_FACE_SCAN_MAX_PASSES; passIndex += 1) {
      const timer = setTimeout(() => {
        if (gen !== videoFaceDetectGenRef.current) return
        if (Math.round(activeVideoTimeRef.current * 1000) !== frameKey) return
        void runVideoFaceDetectPass(passIndex, targetTime, gen)
      }, passIndex * 1000)
      videoFaceScanTimersRef.current.push(timer)
    }

    return () => {
      videoFaceScanTimersRef.current.forEach(clearTimeout)
      videoFaceScanTimersRef.current = []
    }
  }, [
    activePhoto?.edited,
    activePhoto?.id,
    activePhoto?.isVideo,
    activeVideoTime,
    autoDetect,
    detector.mode,
    detectFaceOffset,
    detectSensitivity,
    processedVideoEpoch,
    runVideoFaceDetectPass,
    selectedEffect,
    videoReadyTick,
  ])

  useEffect(() => {
    videoPreviewStabilizerRef.current.reset()
  }, [activePhotoId])

  const seekActiveVideo = useCallback((timeSec: number) => {
    const video = activeVideoRef.current
    if (!video) return
    const duration = activePhoto?.videoDuration ?? video.duration ?? 0
    const next = clamp(timeSec, 0, Number.isFinite(duration) && duration > 0 ? duration : timeSec)
    video.currentTime = next
    setActiveVideoTime(next)
  }, [activePhoto?.videoDuration])

  const toggleVideoPlayback = useCallback(() => {
    const video = activeVideoRef.current
    if (!video) return
    if (video.paused) void video.play().catch(() => {})
    else video.pause()
  }, [])

  // Recompute preview file size debounced whenever quality/format/depth/photo changes
  useEffect(() => {
    if (qualityDebounceRef.current) clearTimeout(qualityDebounceRef.current)
    setPreviewRendering(true)
    const delay = mobileExportDraft ? 60 : 300
    qualityDebounceRef.current = setTimeout(() => { computePreviewFileSize() }, delay)
    return () => { if (qualityDebounceRef.current) clearTimeout(qualityDebounceRef.current) }
   
  }, [exportQuality, exportFormat, exportPngDepth, activePhoto?.id, mobileExportDraft])

  const beginMobileExportEdit = useCallback(() => {
    const wc = workCanvasRef.current
    const w = activeImageSize?.width ?? wc?.width ?? 0
    const h = activeImageSize?.height ?? wc?.height ?? 0
    if (w <= 0 || h <= 0) return
    setMobileExportDraft({
      width: w,
      height: h,
      format: exportFormat,
      quality: exportQuality,
    })
    window.setTimeout(() => computePreviewFileSize(), 0)
  }, [activeImageSize, computePreviewFileSize, exportFormat, exportQuality])

  const updateMobileExportDraft = useCallback((patch: Partial<NonNullable<typeof mobileExportDraft>>) => {
    setMobileExportDraft((cur) => (cur ? { ...cur, ...patch } : null))
    if (qualityDebounceRef.current) clearTimeout(qualityDebounceRef.current)
    qualityDebounceRef.current = setTimeout(() => { computePreviewFileSize() }, 60)
  }, [computePreviewFileSize])

  const cancelMobileExportEdit = useCallback(() => {
    setMobileExportDraft(null)
    if (qualityPreviewCanvasRef.current) qualityPreviewCanvasRef.current.width = 0
    computePreviewFileSize()
    renderCanvasRef.current()
  }, [computePreviewFileSize])

  const commitMobileExportEdit = useCallback(async () => {
    if (!mobileExportDraft || !activePhoto) return
    const { width, height, format, quality } = mobileExportDraft
    setMobileExportDraft(null)
    setExportFormat(format)
    setExportQuality(quality)
    setResEditW(width)
    setResEditH(height)

    const wc = workCanvasRef.current
    if (wc && wc.width > 0 && (wc.width !== width || wc.height !== height)) {
      setIsBusy(true)
      try {
        const tmp = document.createElement('canvas')
        tmp.width = width
        tmp.height = height
        tmp.getContext('2d')!.drawImage(wc, 0, 0, width, height)
        wc.width = width
        wc.height = height
        workCtxRef.current = null
        const wCtx = getWorkCtx()
        if (wCtx) wCtx.drawImage(tmp, 0, 0)
        setActiveImageSize({ width, height })
        setActiveDirty(true)
      } catch {
        setNotice('Resize failed.')
      } finally {
        setIsBusy(false)
      }
    }

    computePreviewFileSize()
    renderCanvasRef.current()
  }, [activePhoto, computePreviewFileSize, getWorkCtx, mobileExportDraft, setActiveDirty])

  const saveAllPhotos = useCallback(async () => {
    const edited = photos.filter((p) => p.edited || dirtyByPhoto[p.id])
    if (edited.length === 0) { setNotice('No edited photos to save.'); return }
    setIsApplyingAll(true)
    let saved = 0, skipped = 0, errors = 0
    try {
      for (let i = 0; i < edited.length; i++) {
        const photo = edited[i]
        setNotice(`Saving ${i + 1}/${edited.length}: ${photo.name.split('/').pop()}`)
        await waitForUi()
        if (photo.fileHandle) {
          try {
            const cleanBlob = await stripMetadata(photo.blob)
            const w = await photo.fileHandle.createWritable()
            await w.write(cleanBlob)
            await w.close()
            saved++
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            console.error('Write failed', photo.name, err)
            setNotice(`Write failed for ${photo.name.split('/').pop()}: ${msg}`)
            errors++
            await waitForUi()
          }
        } else {
          skipped++
        }
      }
      const parts: string[] = []
      if (saved > 0) parts.push(`${saved} saved to disk`)
      if (skipped > 0) parts.push(`${skipped} in session`)
      if (errors > 0) parts.push(`${errors} failed`)
      setNotice(parts.join(' · '))
    } catch (err) {
      console.error(err)
      setNotice('Save all failed.')
    } finally {
      setIsApplyingAll(false)
    }
  }, [dirtyByPhoto, photos])

  // Resize work canvas to new dimensions via pica (or canvas fallback)
  const resizeWorkCanvas = useCallback(async () => {
    const wc = workCanvasRef.current
    if (!wc || wc.width === 0 || !activePhoto) return
    const w = Number.isFinite(resEditW) ? Math.max(1, Math.min(25000, Math.round(resEditW))) : wc.width
    const h = Number.isFinite(resEditH) ? Math.max(1, Math.min(25000, Math.round(resEditH))) : wc.height
    if (w === wc.width && h === wc.height) return
    setIsBusy(true)
    try {
      // Simple canvas-based resize (pica not directly accessible here)
      const tmp = document.createElement('canvas')
      tmp.width = w; tmp.height = h
      const ctx = tmp.getContext('2d')!
      ctx.drawImage(wc, 0, 0, w, h)
      if (wc.width !== w || wc.height !== h) {
        wc.width = w; wc.height = h
        workCtxRef.current = null
      }
      const wCtx = getWorkCtx()
      if (wCtx) wCtx.drawImage(tmp, 0, 0)
      setActiveImageSize({ width: w, height: h })
      setActiveDirty(true)
      renderCanvas()
      setNotice(`Resized to ${w} × ${h}`)
    } catch { setNotice('Resize failed.') }
    finally { setIsBusy(false) }
  }, [activePhoto, getWorkCtx, renderCanvas, resEditH, resEditW, setActiveDirty])

  // Sidebar resize handlers
  const handleResizerPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    sidebarResizingRef.current = true
    sidebarResizeStartXRef.current = e.clientX
    sidebarResizeStartWRef.current = sidebarWidth
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }, [sidebarWidth])

  const handleResizerPointerMove = useCallback((e: React.PointerEvent) => {
    if (!sidebarResizingRef.current) return
    const delta = e.clientX - sidebarResizeStartXRef.current
    const next = Math.max(160, Math.min(480, sidebarResizeStartWRef.current + delta))
    setSidebarWidth(next)
  }, [])

  const handleResizerPointerUp = useCallback((e: React.PointerEvent) => {
    sidebarResizingRef.current = false
    ;(e.target as Element).releasePointerCapture(e.pointerId)
  }, [])

  const removeSelectedZone = useCallback(() => {
    if (!selectedZoneId) return
    setActiveZones((z) => z.filter((zone) => zone.id !== selectedZoneId))
    setSelectedZoneId(null)
  }, [selectedZoneId, setActiveZones])

  const removeZoneById = useCallback((id: string) => {
    setActiveZones((z) => z.filter((zone) => zone.id !== id))
    setSelectedZoneId((cur) => cur === id ? null : cur)
  }, [setActiveZones])

  const removeVideoPreviewFaceZone = useCallback((zoneId: string) => {
    const zone = videoPreviewFaceZonesRef.current.find((item) => item.id === zoneId)
    if (!zone || !activePhotoId) return
    const frameKey = Math.round(activeVideoTimeRef.current * 1000)
    const byPhoto = videoDismissedFacesByPhotoRef.current
    if (!byPhoto[activePhotoId]) byPhoto[activePhotoId] = {}
    if (!byPhoto[activePhotoId][frameKey]) byPhoto[activePhotoId][frameKey] = []
    byPhoto[activePhotoId][frameKey].push({
      x: zone.x,
      y: zone.y,
      width: zone.width,
      height: zone.height,
    })
    setVideoPreviewFaceZones((zones) => zones.filter((item) => item.id !== zoneId))
    setVideoDismissedTick((tick) => tick + 1)
    void refreshVideoFramePreview()
  }, [activePhotoId, refreshVideoFramePreview])

  const restoreVideoPreviewFaceZone = useCallback((rect: NormalizedFaceRect) => {
    if (!activePhotoId) return
    const frameKey = Math.round(activeVideoTimeRef.current * 1000)
    const byPhoto = videoDismissedFacesByPhotoRef.current
    const list = byPhoto[activePhotoId]?.[frameKey]
    if (!list?.length) return
    byPhoto[activePhotoId][frameKey] = list.filter((item) => !faceRectsSimilar(item, rect))
    setVideoDismissedTick((tick) => tick + 1)
    const gen = ++videoFaceDetectGenRef.current
    void runVideoFaceDetectPass(0, activeVideoTimeRef.current, gen)
  }, [activePhotoId, runVideoFaceDetectPass])

  const clearZones = useCallback(() => { setActiveZones(() => []); setSelectedZoneId(null); setDraftZone(null) }, [setActiveZones])

  const handleCanvasPointerDown = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (batchPanelOpen) {
      if (!activePhoto || normalizeSettings.cropMode !== 'template' || !isNormalizeCropPicking) return
      const mapped = mapPointerToImage(event.clientX, event.clientY)
      if (!mapped) return
      canvasRef.current?.setPointerCapture(event.pointerId)
      pointerSessionRef.current = { mode: 'normalize-crop', startX: mapped.normalizedX, startY: mapped.normalizedY }
      setNormalizeCropDraft(makeNormalizedRect(mapped.normalizedX, mapped.normalizedY, mapped.normalizedX + 0.001, mapped.normalizedY + 0.001))
      return
    }
    if (!activePhoto) return
    if (isMobile && !mobileCanvasEditRef.current && toolMode !== 'crop') return
    const mapped = mapPointerToImage(
      event.clientX,
      event.clientY,
      toolMode === 'crop' || toolMode === 'brush',
    )
    if (!mapped) return
    event.preventDefault()
    canvasRef.current?.setPointerCapture(event.pointerId)
    if (toolMode === 'crop') {
      pointerSessionRef.current = { mode: 'crop-draw', startX: mapped.normalizedX, startY: mapped.normalizedY }
      setCropDraft({ x: mapped.normalizedX, y: mapped.normalizedY, w: 0.001, h: 0.001 })
      return
    }
    if (toolMode === 'brush') {
      pushUndo()
      const stamp = resolveBrushStamp(mapped)
      brushStampLockRef.current = stamp
      brushEmojiRef.current = stamp.emoji
      pointerSessionRef.current = { mode: 'brush', lastPointer: mapped }
      setCursorPoint({ x: mapped.canvasX, y: mapped.canvasY })
      brushLastApplyRef.current = 0
      startBrushLoop()
      applyBrushAtPointer(mapped)
      return
    }
    const t = transformRef.current; const hs = 12
    for (let i = effectiveZones.length - 1; i >= 0; i--) {
      const zone = effectiveZones[i]
      if (!zoneContainsNormalized(zone, mapped.normalizedX, mapped.normalizedY)) continue
      setSelectedZoneId(zone.id)
      const { lx, ly } = normalizedToLocal(zone.x + zone.width, zone.y + zone.height, t)
      const br = localToCanvas(lx, ly, t)
      const nearHandle = Math.hypot(mapped.canvasX - br.x, mapped.canvasY - br.y) <= hs
      pointerSessionRef.current = nearHandle
        ? { mode: 'resize-zone', zoneId: zone.id }
        : { mode: 'move-zone', zoneId: zone.id, offsetX: mapped.normalizedX - zone.x, offsetY: mapped.normalizedY - zone.y }
      return
    }
    pointerSessionRef.current = { mode: 'create-zone', startX: mapped.normalizedX, startY: mapped.normalizedY }
    const zoneId = createId()
    setDraftZone({
      id: zoneId,
      x: mapped.normalizedX,
      y: mapped.normalizedY,
      width: 0.001,
      height: 0.001,
      effect: selectedEffect,
      emoji: resolveEmoji(),
      customImageAssetId: selectedEffect === 'custom-image'
        ? resolveCustomImageAssetId(zoneId)
        : undefined,
    })
    setSelectedZoneId(null)
  }, [activePhoto, effectiveZones, applyBrushAtPointer, activeCategory, batchPanelOpen, customImageAssets, isMobile, isNormalizeCropPicking, mapPointerToImage, normalizeSettings.cropMode, pushUndo, resolveBrushStamp, selectedEffect, startBrushLoop, toolMode])

  const handleCanvasPointerMove = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    const session = pointerSessionRef.current
    const mapped = mapPointerToImage(
      event.clientX,
      event.clientY,
      session.mode === 'brush' || session.mode === 'crop-draw',
    )
    if (mapped) setCursorPoint({ x: mapped.canvasX, y: mapped.canvasY })
    else setCursorPoint(null)

    if (batchPanelOpen) {
      if (session.mode === 'normalize-crop' && mapped) {
        setNormalizeCropDraft(makeNormalizedRect(session.startX, session.startY, mapped.normalizedX, mapped.normalizedY))
        renderCanvas()
      }
      return
    }

    if (toolMode === 'brush') drawBrushPreview(mapped)

    if (session.mode === 'crop-draw' && mapped) {
      setCropDraft({ x: Math.min(session.startX, mapped.normalizedX), y: Math.min(session.startY, mapped.normalizedY), w: Math.abs(mapped.normalizedX - session.startX), h: Math.abs(mapped.normalizedY - session.startY) })
      renderCanvas()
      return
    }

    if (session.mode === 'idle' || !mapped) { renderCanvas(); return }
    if (session.mode === 'brush') {
      if (brushActiveRef.current && mapped) {
        const now = performance.now()
        if (now - brushLastApplyRef.current >= (isMobile ? 80 : 50)) {
          brushLastApplyRef.current = now
          applyBrushAtPointer(mapped)
        }
      }
      return
    }
    if (session.mode === 'create-zone') {
      setDraftZone((cur) => cur ? { ...cur, x: Math.min(session.startX, mapped.normalizedX), y: Math.min(session.startY, mapped.normalizedY), width: Math.abs(mapped.normalizedX - session.startX), height: Math.abs(mapped.normalizedY - session.startY) } : null)
      renderCanvas(); return
    }
    if (session.mode === 'move-zone') {
      setActiveZones((zones) => zones.map((z) => {
        if (z.id !== session.zoneId) return z
        const eff = zonesWithFaceOffset([z], detectFaceOffset)[0]
        return {
          ...z,
          ...CLEAR_DETECT_FIELDS,
          x: clamp(mapped.normalizedX - session.offsetX, 0, 1 - eff.width),
          y: clamp(mapped.normalizedY - session.offsetY, 0, 1 - eff.height),
          width: eff.width,
          height: eff.height,
        }
      }))
      renderCanvas(); return
    }
    if (session.mode === 'resize-zone') {
      setActiveZones((zones) => zones.map((z) => {
        if (z.id !== session.zoneId) return z
        const eff = zonesWithFaceOffset([z], detectFaceOffset)[0]
        return {
          ...z,
          ...CLEAR_DETECT_FIELDS,
          x: eff.x,
          y: eff.y,
          width: clamp(mapped.normalizedX - eff.x, 0.02, 1 - eff.x),
          height: clamp(mapped.normalizedY - eff.y, 0.02, 1 - eff.y),
        }
      }))
      renderCanvas()
    }
  }, [applyBrushAtPointer, batchPanelOpen, detectFaceOffset, drawBrushPreview, mapPointerToImage, renderCanvas, setActiveZones, toolMode])

  const handleCanvasPointerUp = useCallback(() => {
    if (batchPanelOpen) {
      const s = pointerSessionRef.current
      if (s.mode === 'normalize-crop' && normalizeCropDraft && normalizeCropDraft.width >= 0.01 && normalizeCropDraft.height >= 0.01) {
        updateNormalizeSetting('templateCropNormalized', normalizeCropDraft)
        setNotice('Crop template saved.')
      } else if (s.mode === 'normalize-crop') {
        setNotice('Selection too small — try again.')
      }
      setNormalizeCropDraft(null); setIsNormalizeCropPicking(false)
      pointerSessionRef.current = { mode: 'idle' }; renderCanvas(); return
    }
    const s = pointerSessionRef.current
    if (s.mode === 'brush') {
      stopBrushLoop()
      brushStampLockRef.current = null
      const overlay = overlayCanvasRef.current
      if (overlay) {
        const octx = overlay.getContext('2d')
        if (octx) octx.clearRect(0, 0, overlay.width, overlay.height)
      }
    }
    if (s.mode === 'crop-draw') {
      pointerSessionRef.current = { mode: 'idle' }
      renderCanvas()
      return
    }
    if (s.mode === 'create-zone' && draftZone && draftZone.width > 0.01 && draftZone.height > 0.01) {
      const committed = { ...draftZone, id: createId() }
      setActiveZones((zones) => [...zones, committed])
      setSelectedZoneId(committed.id)
    }
    setDraftZone(null); pointerSessionRef.current = { mode: 'idle' }; renderCanvas()
  }, [batchPanelOpen, draftZone, normalizeCropDraft, renderCanvas, setActiveZones, stopBrushLoop, updateNormalizeSetting])

  // Mouse wheel on viewer canvas adjusts brush size; Alt+wheel adjusts strength
  const handleCanvasWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    if (toolMode !== 'brush') return
    e.preventDefault()
    if (e.altKey) {
      // Alt+wheel → adjust Strength (1–100)
      const delta = -e.deltaY * 0.2
      setBrushStrength((s) => clamp(Math.round(s * 100 + delta) / 100, 0.01, 1))
      return
    }
    const delta = e.ctrlKey ? -e.deltaY * 0.5 : -e.deltaY * 0.25
    const next = clamp(Math.round(brushSizeRef.current + delta), 4, 100)
    brushSizeRef.current = next
    // Draw the updated circle immediately without a React re-render
    const canvas = canvasRef.current
    if (canvas) {
      const bounds = canvas.getBoundingClientRect()
      const cx = e.clientX - bounds.left
      const cy = e.clientY - bounds.top
      const overlay = overlayCanvasRef.current
      if (overlay) {
        const octx = overlay.getContext('2d')
        if (octx) {
          const dpr = window.devicePixelRatio || 1
          octx.setTransform(dpr, 0, 0, dpr, 0, 0)
          octx.clearRect(0, 0, overlay.width / dpr, overlay.height / dpr)
          octx.save()
          octx.strokeStyle = 'rgba(255,255,255,0.9)'
          octx.lineWidth = 1.5
          octx.setLineDash([5, 4])
          octx.beginPath()
          octx.arc(cx, cy, next, 0, Math.PI * 2)
          octx.stroke()
          octx.strokeStyle = 'rgba(0,0,0,0.4)'
          octx.lineWidth = 0.8
          octx.setLineDash([])
          octx.beginPath()
          octx.arc(cx, cy, next, 0, Math.PI * 2)
          octx.stroke()
          octx.restore()
        }
      }
    }
    // Debounce the React state update (200ms)
    if (brushDebounceRef.current) clearTimeout(brushDebounceRef.current)
    brushDebounceRef.current = setTimeout(() => { setBrushSize(next) }, 200)
  }, [toolMode])

  // Re-bake the anonymization effect onto the work canvas from the pristine
  // original, using the CURRENT face-offset + strength. Reads live values from
  // refs so the callback identity stays stable (no debounce-reset / stale-offset
  // loops). Returns true when it actually re-baked.
  const reapplyZoneEffectsPreview = useCallback(async (zonesOverride?: Zone[]): Promise<boolean> => {
    const photo = activePhotoRef.current
    if (!photo || photo.isVideo) return false
    const baseZones = zonesOverride ?? (zonesByPhotoRef.current[photo.id] ?? [])
    if (baseZones.length === 0) return false
    const orig = originalBlobByPhotoRef.current[photo.id]
    if (!orig) return false
    const wc = workCanvasRef.current
    if (!wc) return false
    const photoId = photo.id
    const offset = detectSettingsRef.current.faceOffset
    const strength = brushStrengthRef.current

    try {
      const bmp = await createImageBitmap(orig)
      if (activePhotoIdRef.current !== photoId) { bmp.close(); return false }
      if (wc.width !== bmp.width || wc.height !== bmp.height) {
        wc.width = bmp.width; wc.height = bmp.height; workCtxRef.current = null
      }
      const ctx = getWorkCtx()
      if (!ctx) { bmp.close(); return false }
      ctx.clearRect(0, 0, wc.width, wc.height)
      ctx.drawImage(bmp, 0, 0)
      bmp.close()
      const expanded = zonesWithFaceOffset(baseZones, offset)
      expanded.forEach((z) =>
        applyEffectRect(
          ctx,
          z.effect,
          z.x * wc.width,
          z.y * wc.height,
          z.width * wc.width,
          z.height * wc.height,
          strength,
          z.emoji,
          customEffectOptions(z),
        ),
      )
      previewBakedRef.current = true
      // Invalidate the cached quality/compression preview so renderCanvas draws
      // the freshly re-baked work canvas instead of a stale (old-size) preview.
      // Without this, lossy formats (default JPEG) keep showing the previous
      // effect size while only the outline grows with the offset.
      if (qualityPreviewCanvasRef.current) qualityPreviewCanvasRef.current.width = 0
      renderCanvasRef.current()
      return true
    } catch { return false }
  }, [customEffectOptions, getWorkCtx])

  const updateSelectedZoneEffect = useCallback((effect: AnonymizeEffectId) => {
    selectedEffectRef.current = effect
    setSelectedEffectState(effect)
    if (effect === 'custom-image') setBrushStrength(1)
    setEraserActive(false)
    setEffectFlyoutOpen(false)
    setToolMode(lastZoneTool === 'rectangle' ? 'zone' : 'brush')
    if (isMobile && activePhoto && !activePhoto.isVideo) {
      mobileCanvasEditRef.current = true
      setActiveCategory('zone')
      const idx = ZONE_TOOLS.indexOf(lastZoneTool)
      if (idx >= 0) setCategoryIndices((cur) => ({ ...cur, zone: idx }))
    }
    const updatedZones = activeZones.map((z) => ({
      ...z, effect,
      emoji: effect === 'emoji' ? (z.emoji || resolveEmoji()) : z.emoji,
      customImageAssetId: effect === 'custom-image'
        ? z.customImageAssetId ?? resolveCustomImageAssetId(z.id)
        : undefined,
    }))
    if (updatedZones.length === 0) return
    if (activePhotoId) {
      setZonesByPhoto((cur) => ({ ...cur, [activePhotoId]: updatedZones }))
    }
    reapplyZoneEffectsPreview(updatedZones).then((baked) => {
      if (baked) {
        setZonesAnonymized(true)
        setActiveDirty(true)
        if (activePhotoId) setAppliedByPhoto((cur) => ({ ...cur, [activePhotoId]: true }))
      }
    })
  }, [activePhoto, activePhotoId, activeZones, isMobile, lastZoneTool, reapplyZoneEffectsPreview, setActiveDirty])

  const captureEffectPickerSnapshot = useCallback((): import('./mobile/bindings').EffectPickerSnapshot | null => {
    const photo = activePhotoRef.current
    if (!photo || photo.isVideo || !activePhotoId) return null
    const wc = workCanvasRef.current
    const ctx = getWorkCtx()
    let workCanvasSnap: ImageData | null = null
    if (wc && ctx && wc.width > 0 && wc.height > 0) {
      workCanvasSnap = ctx.getImageData(0, 0, wc.width, wc.height)
    }
    return {
      zones: activeZones.map((z) => ({ ...z })),
      zonesAnonymized,
      selectedEffect: selectedEffectRef.current,
      emojiRandom,
      selectedEmoji,
      customImageRandom,
      selectedCustomImageId,
      customImageSource,
      workCanvasSnap,
    }
  }, [
    activePhotoId,
    activeZones,
    customImageRandom,
    customImageSource,
    emojiRandom,
    selectedCustomImageId,
    selectedEmoji,
    zonesAnonymized,
    getWorkCtx,
  ])

  const restoreEffectPickerSnapshot = useCallback(async (snap: import('./mobile/bindings').EffectPickerSnapshot) => {
    const photoId = activePhotoIdRef.current
    if (!photoId) return
    if (snap.customImageSource !== customImageSource) {
      await loadCustomImagePreset(snap.customImageSource)
    }
    setEmojiRandom(snap.emojiRandom)
    emojiRandomRef.current = snap.emojiRandom
    setSelectedEmoji(snap.selectedEmoji)
    selectedEmojiRef.current = snap.selectedEmoji
    setCustomImageRandom(snap.customImageRandom)
    customImageRandomRef.current = snap.customImageRandom
    setSelectedCustomImageId(snap.selectedCustomImageId)
    selectedCustomImageIdRef.current = snap.selectedCustomImageId
    setCustomImageSource(snap.customImageSource)
    selectedEffectRef.current = snap.selectedEffect
    setSelectedEffectState(snap.selectedEffect)
    setZonesByPhoto((cur) => ({ ...cur, [photoId]: snap.zones }))
    setSelectedZoneId(null)
    setZonesAnonymized(snap.zonesAnonymized)
    setAppliedByPhoto((cur) => ({ ...cur, [photoId]: snap.zonesAnonymized }))
    const wc = workCanvasRef.current
    const ctx = getWorkCtx()
    if (snap.workCanvasSnap && wc && ctx) {
      ctx.putImageData(snap.workCanvasSnap, 0, 0)
      previewBakedRef.current = snap.zonesAnonymized
      renderCanvas()
    } else if (snap.zonesAnonymized && snap.zones.length > 0) {
      await reapplyZoneEffectsPreview(snap.zones)
    } else {
      previewBakedRef.current = false
      renderCanvas()
    }
  }, [customImageSource, getWorkCtx, loadCustomImagePreset, reapplyZoneEffectsPreview, renderCanvas])

  // Build a primitive signature of zones so the re-bake effect only fires when
  // the geometry / effect / emoji actually changes — not on every render.
  const zoneBakeSignature = useMemo(
    () => activeZones.map((z) =>
      `${z.id}:${z.effect}:${z.emoji}:${z.customImageAssetId ?? ''}:${z.detectX ?? ''},${z.detectY ?? ''},${z.detectWidth ?? ''},${z.detectHeight ?? ''}:${z.x},${z.y},${z.width},${z.height}`,
    ).join('|'),
    [activeZones],
  )

  // Re-bake zone effects when face-offset / strength / zone geometry changes,
  // but only while a preview is actually baked on the canvas.
  const zonePreviewDebounceRef = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    if (!activePhoto || activePhoto.isVideo || activeZones.length === 0) return
    if (!previewBakedRef.current && !zonesAnonymized) return
    if (!originalBlobByPhoto[activePhoto.id]) return
    if (zonePreviewDebounceRef.current) clearTimeout(zonePreviewDebounceRef.current)
    zonePreviewDebounceRef.current = setTimeout(() => {
      void reapplyZoneEffectsPreview().then((baked) => {
        if (baked) setActiveDirty(true)
      })
    }, isMobile && mobilePanel === 'tool-effects' ? 0 : isMobile ? 120 : 90)
    return () => { if (zonePreviewDebounceRef.current) clearTimeout(zonePreviewDebounceRef.current) }
   
  }, [brushStrength, detectFaceOffset, zoneBakeSignature, activePhoto?.id, zonesAnonymized, isMobile, mobilePanel])

  // Sync brushSizeRef when slider changes
  useEffect(() => { brushSizeRef.current = brushSize }, [brushSize])
  useEffect(() => { toolModeRef.current = toolMode }, [toolMode])

  // Sync photosRef for cleanup
  useEffect(() => { photosRef.current = photos }, [photos])
  useEffect(() => () => { photosRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl)) }, [])
  useEffect(() => { customImageAssetsRef.current = customImageAssets }, [customImageAssets])
  useEffect(() => () => {
    customImageAssetsRef.current.forEach((asset) => {
      URL.revokeObjectURL(asset.objectUrl)
      asset.imageBitmap?.close()
    })
  }, [])
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effectiveTheme)
    if (!isMobile) localStorage.setItem('anonymizer-theme', theme)
  }, [effectiveTheme, isMobile, theme])

  // cmd/ctrl+S — save active photo; Delete/Backspace — remove selected zone
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 's') {
        e.preventDefault()
        saveAllPhotos()
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'e') {
        e.preventDefault()
        exportZip()
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        saveActivePhoto()
        return
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedZoneId) {
        // Only if not focused on an input
        const tag = (e.target as HTMLElement).tagName
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
          removeSelectedZone()
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        clearZones()
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        undo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [clearZones, exportZip, removeSelectedZone, saveActivePhoto, saveAllPhotos, selectedZoneId, undo])

  // Prevent browser zoom (ctrl/cmd+wheel or pinch) so brush-size wheel doesn't zoom the page
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault()
    }
    document.addEventListener('wheel', onWheel, { passive: false })
    return () => document.removeEventListener('wheel', onWheel)
  }, [])

  // cmd/ctrl+V — paste image from clipboard
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return
      const items = Array.from(e.clipboardData.items)
      const imageItems = items.filter((item) => item.type.startsWith('image/'))
      if (imageItems.length === 0) return
      e.preventDefault()
      const files = imageItems.map((item, i) => {
        const blob = item.getAsFile()
        if (!blob) return null
        const ext = item.type.split('/')[1] ?? 'png'
        return new File([blob], `paste-${Date.now()}-${i}.${ext}`, { type: item.type })
      }).filter(Boolean) as File[]
      if (files.length > 0) {
        addRecords(files.map((f) => ({ file: f, name: f.name, source: 'upload' as const })))
        setNotice(`Pasted ${files.length} image${files.length === 1 ? '' : 's'} from clipboard.`)
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [addRecords])

  useEffect(() => () => {
    if (renderRafRef.current !== null) cancelAnimationFrame(renderRafRef.current)
    if (brushRafRef.current !== null) cancelAnimationFrame(brushRafRef.current)
    if (brushDebounceRef.current !== null) clearTimeout(brushDebounceRef.current)
    if (videoFrameLabelTimerRef.current !== null) clearTimeout(videoFrameLabelTimerRef.current)
    videoAbortRef.current?.abort()
    normalizeCancelRef.current = true
    detectGenerationRef.current += 1
  }, [])

  useEffect(() => {
    if (!activePhotoId) return
    const idx = photos.findIndex((p) => p.id === activePhotoId)
    if (idx >= 0 && idx >= photoListLimit) setPhotoListLimit(idx + 40)
  }, [activePhotoId, photoListLimit, photos])

  useEffect(() => {
    if (normalizeSettings.cropMode === 'template') return
    setNormalizeCropDraft(null); setIsNormalizeCropPicking(false); pointerSessionRef.current = { mode: 'idle' }
  }, [normalizeSettings.cropMode])

  const refreshDetector = useCallback(async (forceReset = true): Promise<DetectorStatus> => {
    setDetectorLoading(true)
    try {
      if (forceReset) resetDetectorStatus()
      const status = await Promise.race([
        initializeDetector(),
        new Promise<DetectorStatus>((_, reject) => {
          setTimeout(() => reject(new Error('Detector init timed out')), 45000)
        }),
      ])
      setDetector(status)
      setModelLoadProgress({ loaded: 1, total: 1, phase: 'ready' })
      await new Promise((resolve) => setTimeout(resolve, 400))
      return status
    } catch {
      const failed: DetectorStatus = { mode: 'unavailable', message: 'Initialization failed.' }
      setDetector(failed)
      await new Promise((resolve) => setTimeout(resolve, 600))
      return failed
    } finally {
      setDetectorLoading(false)
      setModelLoadProgress(null)
    }
  }, [])

  // Detector init
  useEffect(() => {
    void refreshDetector(false)
  }, [refreshDetector])

  // Surface model/WASM download progress so the loading state shows X / Y MB.
  useEffect(() => {
    setModelLoadProgress(getDetectorLoadProgress())
    setDetectorLoadProgressCallback((p) => setModelLoadProgress(p))
    return () => setDetectorLoadProgressCallback(null)
  }, [])

  useEffect(() => {
    const retryIfUnavailable = () => {
      if (document.visibilityState === 'hidden') return
      if (detector.mode !== 'unavailable') return
      void refreshDetector(true)
    }
    window.addEventListener('focus', retryIfUnavailable)
    document.addEventListener('visibilitychange', retryIfUnavailable)
    return () => {
      window.removeEventListener('focus', retryIfUnavailable)
      document.removeEventListener('visibilitychange', retryIfUnavailable)
    }
  }, [detector.mode, refreshDetector])

  useEffect(() => {
    if (detector.mode !== 'unavailable') return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const retry = () => {
      if (cancelled || document.visibilityState === 'hidden') return
      void refreshDetector(true).then((status) => {
        if (!cancelled && status.mode === 'unavailable') {
          timer = setTimeout(retry, 2500)
        }
      })
    }

    timer = setTimeout(retry, 1200)
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [detector.mode, refreshDetector])

  // Load active photo into work canvas; auto-detect if enabled
  useEffect(() => {
    if (!activePhoto) {
      const wc = workCanvasRef.current
      if (wc) { wc.width = 0; wc.height = 0 }
      setActiveImageSize(null); renderCanvas(); return
    }
    // Videos are handled by the <video> player, not the work canvas.
    // Attempting createImageBitmap on a video blob throws and spuriously
    // surfaces a "Failed to load photo" error, so skip it here.
    if (activePhoto.isVideo) {
      const wc = workCanvasRef.current
      if (wc) { wc.width = 0; wc.height = 0 }
      setActiveImageSize(null)
      renderCanvas()
      return
    }
    const photoId = activePhoto.id
    let cancelled = false
    setIsBusy(true)
    createImageBitmap(activePhoto.blob).then(async (bmp) => {
      if (cancelled || activePhotoIdRef.current !== photoId) { bmp.close(); return }
      const wc = workCanvasRef.current!
      if (wc.width !== bmp.width || wc.height !== bmp.height) {
        wc.width = bmp.width; wc.height = bmp.height
        workCtxRef.current = null
      }
      setActiveImageSize({ width: bmp.width, height: bmp.height })
      const ctx = getWorkCtx()
      if (ctx) { ctx.clearRect(0, 0, wc.width, wc.height); ctx.drawImage(bmp, 0, 0) }
      bmp.close()
      if (activePhotoIdRef.current !== photoId) return
      renderCanvasRef.current()  // use ref to get latest renderCanvas with current adjFlyoutOpen state
      // Trigger batch preview after canvas is loaded (avoids race with 350ms debounce)
      if (computeBatchPreviewRef.current) computeBatchPreviewRef.current()

      // Auto-detect is triggered by the [autoDetect, detector.mode, activePhoto?.id] effect below
    }).catch(() => setNotice('Failed to load photo.'))
      .finally(() => { if (!cancelled) setIsBusy(false) })
    return () => { cancelled = true }
   
  }, [activePhoto?.id])  // only re-run when photo switches, not on every render

  useEffect(() => { renderCanvas() }, [renderCanvas, effectiveZones, selectedZoneId, draftZone, cursorPoint, toolMode, showBoxes, detectFaceOffset])

  // Auto-detect: fires when detector becomes ready, photo changes, or autoDetect toggles ON
  useEffect(() => {
    if (!autoDetect || !activePhoto) return
    if (activePhoto.edited || activePhoto.isVideo) return
    if (detector.mode === 'unavailable') return
    let cancelled = false

    // Small delay to let the photo-loading effect finish drawing to workCanvas
    const timer = setTimeout(() => {
      if (cancelled) return
      const wc = workCanvasRef.current
      if (!wc || wc.width === 0) return
      const alreadyHasZones = (zonesByPhoto[activePhoto.id] ?? []).length > 0
      if (!alreadyHasZones) {
        detectFacesOnActiveImage(true)
      }
    }, 300)

    return () => { cancelled = true; clearTimeout(timer) }
   
  }, [autoDetect, detector.mode, activePhoto?.id])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    let rafId: number | null = null
    const observer = new ResizeObserver(() => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => { rafId = null; renderCanvasRef.current() })
    })
    observer.observe(viewport)
    return () => { observer.disconnect(); if (rafId !== null) cancelAnimationFrame(rafId) }
  }, [])  

  // Workspace is display:none in live mode — repaint when editor becomes visible.
  useEffect(() => {
    if (!isMobile || mobileMode !== 'editor' || !activePhoto || activePhoto.isVideo) return
    const t = window.setTimeout(() => renderCanvasRef.current?.(), 0)
    return () => clearTimeout(t)
  }, [isMobile, mobileMode, activePhoto?.id, activePhoto?.isVideo])

  const normResultsCount = Object.keys(normalizeResults).length

  // Folder tree derived from photo names
  const folderTree = useMemo(() => {
    const folders = new Map<string, string[]>()
    photos.forEach((p) => {
      const parts = p.name.split('/')
      if (parts.length > 1) {
        const folder = parts.slice(0, -1).join('/')
        const arr = folders.get(folder) ?? []
        arr.push(p.id)
        folders.set(folder, arr)
      }
    })
    return folders
  }, [photos])

  const toggleBatchTask = (taskId: BatchTaskId) => {
    setActiveBatchTasks((cur) => {
      const next = new Set(cur)
      const enabling = !next.has(taskId)
      if (enabling) next.add(taskId)
      else next.delete(taskId)
      setExpandedBatchTasks((exp) => {
        const expNext = new Set(exp)
        if (enabling) expNext.add(taskId)
        return expNext
      })
      return next
    })
  }

  const toggleExpandBatchTask = (taskId: BatchTaskId) => {
    setExpandedBatchTasks((cur) => {
      const next = new Set(cur)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }

  const deletePhoto = useCallback((photoId: string) => {
    const deletingActive = activePhotoId === photoId
    const deletedIndex = photos.findIndex((p) => p.id === photoId)
    const nextActivePhoto = deletingActive && deletedIndex >= 0
      ? photos[deletedIndex + 1] ?? photos[deletedIndex - 1] ?? null
      : null

    setPhotos((cur) => {
      const p = cur.find((x) => x.id === photoId)
      if (p) URL.revokeObjectURL(p.previewUrl)
      return cur.filter((x) => x.id !== photoId)
    })
    setSelectedForBatch((cur) => { const next = new Set(cur); next.delete(photoId); return next })
    setOriginalBlobByPhoto((cur) => { const next = { ...cur }; delete next[photoId]; return next })
    setZonesByPhoto((cur) => { const next = { ...cur }; delete next[photoId]; return next })
    setDirtyByPhoto((cur) => { const next = { ...cur }; delete next[photoId]; return next })
    setColorAdjByPhoto((cur) => { const next = { ...cur }; delete next[photoId]; return next })
    setAppliedByPhoto((cur) => { const next = { ...cur }; delete next[photoId]; return next })
    setVideoFrameOverridesByPhoto((cur) => {
      const next = { ...cur }
      delete next[photoId]
      return next
    })
    if (deletingActive) {
      setActivePhotoId(nextActivePhoto?.id ?? null)
      setSelectedZoneId(null)
      setDraftZone(null)
      setNormalizeCropDraft(null)
      setIsNormalizeCropPicking(false)
      pointerSessionRef.current = { mode: 'idle' }
      undoStackRef.current = []
      setUndoCount(0)
      setZonesAnonymized(false)
      previewBakedRef.current = false
      setEffectFlyoutOpen(false)
      setAdjFlyoutOpen(false)
      setTransformFlyoutOpen(false)
      detectingRef.current = false
      setIsDetecting(false)
      setDetectionStep('')
      setLocalProcessingMs(null)
      setLastDetectFailed(false)
      setActiveDirty(false)
      if (videoAbortRef.current) { videoAbortRef.current.abort(); videoAbortRef.current = null }
      setVideoProcessing(false)
      if (isMobile) {
        setMobileViewZoom(1)
        setMobileViewPan({ x: 0, y: 0 })
        setMobileViewRotation(0)
        mobileViewZoomRef.current = 1
        mobileViewPanRef.current = { x: 0, y: 0 }
        mobileViewRotationRef.current = 0
        setMobileViewTransformDirty(false)
        mobileCanvasEditRef.current = false
      }
      if (nextActivePhoto) {
        const saved = colorAdjByPhoto[nextActivePhoto.id]
        setColorAdj(saved ? { ...saved } : DEFAULT_COLOR_ADJUSTMENTS)
        const fmt = nextActivePhoto.mimeType as NormalizeFormat
        if (!nextActivePhoto.isVideo && ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/gif', 'image/tiff'].includes(fmt)) {
          setExportFormat(fmt)
        }
        if (nextActivePhoto.isVideo) {
          applyVideoDistortSettings(distortSettingsByVideoId[nextActivePhoto.id] ?? EMPTY_VIDEO_DISTORT_SETTINGS)
          setDetectSensitivity((s) => (s <= 1 ? 10 : s))
        }
      }
    }
  }, [activePhotoId, applyVideoDistortSettings, colorAdjByPhoto, distortSettingsByVideoId, isMobile, photos, setActiveDirty])

  const rotatePhoto = useCallback(async (photoId: string, direction: 1 | -1 = 1) => {
    const photo = photos.find((p) => p.id === photoId)
    if (!photo) return
    try {
      const img = await createImageBitmap(photo.blob)
      const canvas = document.createElement('canvas')
      canvas.width = img.height
      canvas.height = img.width
      const ctx = canvas.getContext('2d')!
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((direction * Math.PI) / 2)
      ctx.drawImage(img, -img.width / 2, -img.height / 2)
      img.close()
      canvas.toBlob((blob) => {
        if (!blob) return
        const nextUrl = URL.createObjectURL(blob)
        setPhotos((cur) => cur.map((p) => {
          if (p.id !== photoId) return p
          URL.revokeObjectURL(p.previewUrl)
          return { ...p, blob, previewUrl: nextUrl, edited: true }
        }))
        setOriginalBlobByPhoto((cur) => ({ ...cur, [photoId]: blob }))
        setZonesByPhoto((cur) => ({
          ...cur,
          [photoId]: rotateZones90(cur[photoId] ?? [], direction),
        }))
        if (activePhotoId === photoId) {
          eraserSourcePhotoIdRef.current = null
          eraserSourceCanvasRef.current = null
          setActiveImageSize({ width: canvas.width, height: canvas.height })
          setResEditW(canvas.width)
          setResEditH(canvas.height)
          setMobileViewZoom(1)
          setMobileViewPan({ x: 0, y: 0 })
          setMobileViewRotation(0)
          mobileViewZoomRef.current = 1
          mobileViewPanRef.current = { x: 0, y: 0 }
          mobileViewRotationRef.current = 0
          setMobileViewTransformDirty(false)
          const wc = workCanvasRef.current
          if (wc) {
            createImageBitmap(blob).then((bmp) => {
              wc.width = bmp.width
              wc.height = bmp.height
              workCtxRef.current = null
              wc.getContext('2d')!.drawImage(bmp, 0, 0)
              bmp.close()
              renderCanvasRef.current()
            }).catch(() => {})
          }
        }
      }, photo.mimeType || 'image/jpeg', 0.95)
    } catch { setNotice('Rotation failed.') }
  }, [photos, activePhotoId])

  const zoneOverlayRects = useMemo(() => {
    if (!showBoxes || mobileGestureActive || toolMode === 'crop') return []
    const t = transformRef.current
    if (t.drawWidth === 0) return []
    return effectiveZones.map((zone) => {
      const rect = zoneToCanvasRect(zone, t)
      return { id: zone.id, ...rect }
    })
  }, [effectiveZones, showBoxes, toolMode, activeImageSize, mobileViewZoom, mobileViewPan, mobileViewRotation, canvasLayoutVersion, mobileGestureActive])

  const videoDismissedAtFrame = useMemo(() => {
    if (!activePhotoId) return [] as NormalizedFaceRect[]
    const frameKey = Math.round(activeVideoTime * 1000)
    return videoDismissedFacesByPhotoRef.current[activePhotoId]?.[frameKey] ?? []
  }, [activePhotoId, activeVideoTime, videoDismissedTick])

  const openVideoPicker = useCallback(() => {
    const input = uploadInputRef.current
    if (!input) return
    const prev = input.accept
    input.accept = 'video/*'
    input.click()
    window.setTimeout(() => { input.accept = prev }, 0)
  }, [])

  const setCategoryIndex = useCallback((cat: MobileToolCategory, idx: number) => {
    setCategoryIndices((cur) => ({ ...cur, [cat]: idx }))
  }, [])

  const applyFaceTool = useCallback((id: FaceToolId) => {
    setActiveCategory('face')
    const idx = FACE_TOOLS.indexOf(id)
    if (idx >= 0) setCategoryIndex('face', idx)
    switch (id) {
      case 'detect':
        setAutoDetect(true)
        setShowBoxes(true)
        detectFacesOnActiveImage(true)
        break
      case 'show-boxes':
        setShowBoxes((v) => !v)
        break
      case 'remove-selected':
        removeSelectedZone()
        break
      case 'clear-all':
        clearZones()
        break
      case 'threshold':
        detectFacesOnActiveImage(true)
        break
    }
  }, [clearZones, detectFacesOnActiveImage, removeSelectedZone, setCategoryIndex])

  const applyZoneTool = useCallback((id: ZoneToolId) => {
    setZoneToolCustomized(true)
    setActiveCategory('zone')
    mobileCanvasEditRef.current = true
    const idx = ZONE_TOOLS.indexOf(id)
    if (idx >= 0) setCategoryIndex('zone', idx)
    switch (id) {
      case 'rectangle':
        setLastZoneTool('rectangle')
        setEraserActive(false)
        setToolMode('zone')
        setZonesAnonymized(false)
        break
      case 'brush':
        setLastZoneTool('brush')
        setEraserActive(false)
        setToolMode('brush')
        break
      case 'eraser':
        setEraserActive(true)
        setToolMode('brush')
        break
    }
  }, [setCategoryIndex])

  const applyCropTool = useCallback((id: CropToolId) => {
    setActiveCategory('crop')
    setMobilePanel(null)
    const idx = CROP_TOOLS.indexOf(id)
    if (idx >= 0) setCategoryIndex('crop', idx)
    switch (id) {
      case 'crop':
        mobileCanvasEditRef.current = true
        setCropDraft(null)
        setToolMode('crop')
        toolModeRef.current = 'crop'
        pointerSessionRef.current = { mode: 'idle' }
        setMobileViewZoom(1)
        setMobileViewPan({ x: 0, y: 0 })
        setMobileViewRotation(0)
        mobileViewZoomRef.current = 1
        mobileViewPanRef.current = { x: 0, y: 0 }
        mobileViewRotationRef.current = 0
        setMobileViewTransformDirty(false)
        break
      case 'rotate-left':
        if (activePhotoId) rotatePhoto(activePhotoId, -1)
        break
      case 'rotate-right':
        if (activePhotoId) rotatePhoto(activePhotoId, 1)
        break
    }
  }, [activePhotoId, rotatePhoto, setCategoryIndex])

  const applyAdjustTool = useCallback((id: AdjustToolId) => {
    setMobilePanel('tool-adjust')
    void id
  }, [])

  const applyEffectTool = useCallback((id: EffectToolId) => {
    setEffectToolCustomized(true)
    setActiveCategory('effects')
    const idx = EFFECT_TOOL_ORDER.indexOf(id)
    if (idx >= 0) setCategoryIndex('effects', idx)
    updateSelectedZoneEffect(id)
  }, [setCategoryIndex, updateSelectedZoneEffect])

  const selectToolCategory = useCallback((cat: MobileToolCategory) => {
    setActiveCategory(cat)
    if (cat === 'crop') {
      mobileCanvasEditRef.current = true
    } else if (cat !== 'zone') {
      mobileCanvasEditRef.current = toolMode === 'brush' || toolMode === 'zone' || toolMode === 'crop'
    }
    if (cat === 'gallery') {
      setGalleryBatchSelect(false)
      setMobilePanel('gallery')
      return
    }
    const panel = panelForCategory(cat)
    if (panel) setMobilePanel(panel)
  }, [toolMode])

  const rotateCategoryTool = useCallback((cat: MobileToolCategory) => {
    selectToolCategory(cat)
  }, [selectToolCategory])

  const addLiveMediaToLibrary = useCallback((blob: Blob, opts?: { stayInLive?: boolean }): string | null => {
    const isVideo = blob.type.startsWith('video/')
    const ext = isVideo ? 'webm' : 'jpg'
    const name = `live-capture-${Date.now()}.${ext}`
    const file = new File([blob], name, { type: blob.type || (isVideo ? 'video/webm' : 'image/jpeg') })
    addRecords([{ file, name, source: 'upload' }])
    const id = lastAddedPhotoIdRef.current
    if (id && !isVideo) {
      setPhotos((cur) => cur.map((p) => (p.id === id ? { ...p, edited: true } : p)))
      setAppliedByPhoto((cur) => ({ ...cur, [id]: true }))
      previewBakedRef.current = true
    }
    if (!opts?.stayInLive) {
      setMobileMode('editor')
    }
    return id
  }, [addRecords])

  const openPhotoInEditor = useCallback((photoId: string, opts?: { slide?: boolean; returnTo?: 'live' }) => {
    setMobilePanel(null)
    setMobileEditorReturnTo(opts?.returnTo ?? null)
    if (opts?.slide) {
      setMobileEditorSlideIn(true)
      window.setTimeout(() => setMobileEditorSlideIn(false), 360)
    }
    setMobileMode('editor')
    if (photoId === activePhotoIdRef.current) {
      // Live capture auto-selects the new photo while workspace is hidden — redraw once visible.
      setLastDetectFailed(false)
      setMobileViewZoom(1)
      setMobileViewPan({ x: 0, y: 0 })
      setMobileViewRotation(0)
      mobileViewZoomRef.current = 1
      mobileViewPanRef.current = { x: 0, y: 0 }
      mobileViewRotationRef.current = 0
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          renderCanvasRef.current?.()
          if (autoDetect) {
            const runDetect = () => { void detectFacesOnActiveImage(true) }
            if (typeof window.requestIdleCallback === 'function') {
              window.requestIdleCallback(runDetect, { timeout: 600 })
            } else {
              window.setTimeout(runDetect, 350)
            }
          }
        })
      })
      return
    }
    void selectPhoto(photoId)
  }, [autoDetect, detectFacesOnActiveImage, selectPhoto])

  const returnToLiveFromEditor = useCallback(() => {
    setMobileEditorReturnTo(null)
    setMobilePanel(null)
    setMobileMode('live')
  }, [])

  const stepAdjacentLibraryPhoto = useCallback((dir: -1 | 1) => {
    const library = photos.filter((p) => !p.isVideo)
    const idx = library.findIndex((p) => p.id === activePhotoId)
    if (idx < 0) return
    const next = library[idx + dir]
    if (next) void selectPhoto(next.id)
  }, [activePhotoId, photos, selectPhoto])

  const showMobileToast = useCallback((message: string, action?: { label: string; onClick: () => void }) => {
    setMobileToast({ message, action })
  }, [])

  const exitLiveToWorkspace = useCallback(() => {
    setMobilePanel(null)
    setLastDetectFailed(false)
    const id = lastAddedPhotoIdRef.current ?? photos[photos.length - 1]?.id ?? null
    if (photos.length > 0) {
      setMobileMode('editor')
      if (id) void selectPhoto(id)
    } else {
      setMobileMode('home')
    }
  }, [photos, selectPhoto])

  const exportAllLibraryZip = useCallback(async (photoIds?: string[]) => {
    const selectedIds = photoIds ? new Set(photoIds) : null
    const sourcePhotos = selectedIds ? photos.filter((p) => selectedIds.has(p.id)) : photos
    const images = sourcePhotos.filter((p) => !p.isVideo)
    if (images.length === 0) {
      showMobileToast('No photos in library to export.')
      return
    }
    setIsExporting(true)
    setExportLibraryProgress({ done: 0, total: images.length })
    try {
      const zip = new JSZip()
      const usage = new Map<string, number>()
      let done = 0
      for (const photo of images) {
        setExportLibraryProgress({ done, total: images.length })
        const canvas = await bakePhotoToCanvas({
          photo,
          sourceBlob: originalBlobByPhoto[photo.id] ?? photo.blob,
          zones: zonesWithFaceOffset(zonesByPhoto[photo.id] ?? [], detectFaceOffset),
          colorAdj: colorAdjByPhoto[photo.id],
          brushStrength,
          activeWorkCanvas: photo.id === activePhotoId ? workCanvasRef.current : null,
          isActivePhoto: photo.id === activePhotoId,
          effectOptionsForZone: (zone) => ({
            customImages: customImageAssets,
            customImageSource,
            customImageAssetId: zone.customImageAssetId,
            zoneId: zone.id,
            seed: `${photo.id}:${zone.id}`,
          }),
        })
        const blob = await exportCanvasToBlobLib(canvas, exportFormat, exportQuality, exportPngDepth)
        const baseName = photo.name.split('/').pop() ?? photo.name
        const ext = FORMAT_EXT[exportFormat] ?? 'png'
        const outName = baseName.replace(/\.[^.]+$/, '') + `-anon.${ext}`
        zip.file(makeZipSafeName(outName, usage), blob)
        done += 1
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, `anonymizer-library-${new Date().toISOString().slice(0, 10)}.zip`)
      const skipped = sourcePhotos.length - images.length
      showMobileToast(
        skipped > 0
          ? `Downloaded ${images.length} photos · ${skipped} video${skipped !== 1 ? 's' : ''} skipped`
          : `Downloaded ${images.length} photo${images.length !== 1 ? 's' : ''} as ZIP`,
      )
    } catch {
      showMobileToast('ZIP export failed.')
    } finally {
      setIsExporting(false)
      setExportLibraryProgress(null)
    }
  }, [
    activePhotoId, brushStrength, colorAdjByPhoto, exportFormat, exportPngDepth, exportQuality,
    customImageAssets, customImageSource, originalBlobByPhoto, photos, showMobileToast, zonesByPhoto,
  ])

  const exportAllLibraryIndividual = useCallback(async (photoIds?: string[]) => {
    const selectedIds = photoIds ? new Set(photoIds) : null
    const sourcePhotos = selectedIds ? photos.filter((p) => selectedIds.has(p.id)) : photos
    const images = sourcePhotos.filter((p) => !p.isVideo)
    if (images.length === 0) {
      showMobileToast('No photos in library to export.')
      return
    }
    setIsExporting(true)
    setExportLibraryProgress({ done: 0, total: images.length })
    try {
      let done = 0
      for (const photo of images) {
        setExportLibraryProgress({ done, total: images.length })
        const canvas = await bakePhotoToCanvas({
          photo,
          sourceBlob: originalBlobByPhoto[photo.id] ?? photo.blob,
          zones: zonesWithFaceOffset(zonesByPhoto[photo.id] ?? [], detectFaceOffset),
          colorAdj: colorAdjByPhoto[photo.id],
          brushStrength,
          activeWorkCanvas: photo.id === activePhotoId ? workCanvasRef.current : null,
          isActivePhoto: photo.id === activePhotoId,
          effectOptionsForZone: (zone) => ({
            customImages: customImageAssets,
            customImageSource,
            customImageAssetId: zone.customImageAssetId,
            zoneId: zone.id,
            seed: `${photo.id}:${zone.id}`,
          }),
        })
        const blob = await exportCanvasToBlobLib(canvas, exportFormat, exportQuality, exportPngDepth)
        const baseName = photo.name.split('/').pop() ?? photo.name
        const ext = FORMAT_EXT[exportFormat] ?? 'png'
        const outName = baseName.replace(/\.[^.]+$/, '') + `-anon.${ext}`
        saveAs(blob, outName)
        done += 1
      }
      const skipped = sourcePhotos.length - images.length
      showMobileToast(
        skipped > 0
          ? `Downloaded ${images.length} files · ${skipped} video${skipped !== 1 ? 's' : ''} skipped`
          : `Downloaded ${images.length} file${images.length !== 1 ? 's' : ''}`,
      )
    } catch {
      showMobileToast('Export failed.')
    } finally {
      setIsExporting(false)
      setExportLibraryProgress(null)
    }
  }, [
    activePhotoId, brushStrength, colorAdjByPhoto, exportFormat, exportPngDepth, exportQuality,
    customImageAssets, customImageSource, originalBlobByPhoto, photos, showMobileToast, zonesByPhoto,
  ])

  const selectedBatchImageCount = photos.filter((p) => selectedForBatch.has(p.id) && !p.isVideo).length
  const batchProcessCount = selectedForBatch.size > 0 ? selectedBatchImageCount : photos.filter((p) => !p.isVideo).length

  const updateMobileViewTransformDirty = useCallback(() => {
    const dirty =
      Math.abs(mobileViewZoomRef.current - 1) > 0.01 ||
      Math.abs(mobileViewRotationRef.current) > 0.001 ||
      Math.abs(mobileViewPanRef.current.x) > 0.5 ||
      Math.abs(mobileViewPanRef.current.y) > 0.5
    setMobileViewTransformDirty(dirty)
  }, [])

  const resetMobileViewTransform = useCallback(() => {
    mobileViewZoomRef.current = 1
    mobileViewPanRef.current = { x: 0, y: 0 }
    mobileViewRotationRef.current = 0
    setMobileViewZoom(1)
    setMobileViewPan({ x: 0, y: 0 })
    setMobileViewRotation(0)
    setMobileViewTransformDirty(false)
    renderCanvasRef.current()
  }, [])

  const mobileBindings: AppMobileBindings = {
    theme,
    setTheme,
    setAboutOpen,
    loadDemoPhotos,
    isBusy,
    isDragOver,
    photos,
    activePhoto,
    activePhotoId,
    activeZones,
    videoPreviewFaceCount: videoPreviewFaceZones.length,
    displayedPhotos,
    sidebarView,
    selectedForBatch,
    setSelectedForBatch,
    mobileMode,
    setMobileMode,
    mobilePanel,
    setMobilePanel,
    mobilePanelReturnTo,
    setMobilePanelReturnTo,
    mobileEditorReturnTo,
    returnToLiveFromEditor,
    galleryBatchSelect,
    setGalleryBatchSelect,
    openUnifiedPicker,
    openVideoPicker,
    selectPhoto,
    deletePhoto,
    resetPhotoToOriginal,
    undo,
    undoCount,
    applyZones,
    zonesAnonymized,
    exportActivePhoto,
    exportActiveVideo,
    videoProcessing,
    videoProgress,
    cancelVideoProcessing,
    processActiveVideo,
    videoExportFormat,
    setVideoExportFormat,
    videoExportOptions,
    videoMaskDrawActive,
    setVideoMaskDrawActive,
    videoMaskShape,
    setVideoMaskShape,
    imageMaskDrawActive,
    setImageMaskDrawActive,
    videoMaskRangeSec,
    setVideoMaskRangeSec,
    stepActiveVideoFrame,
    stepEditFrameAdjacent,
    openCurrentVideoFrameAsSnapshot,
    applySnapshotToSourceVideo,
    jumpToSourceVideoFromSnapshot,
    sourceVideoPhoto,
    activeVideoFrameOverrides,
    activeVideoTimedZones,
    clearVideoTimedZones,
    activeVideoTime,
    activeVideoFrameLabel,
    hasPendingVideoEdits,
    videoPipelineCapabilities,
    exportFormat,
    setExportFormat,
    exportQuality,
    setExportQuality,
    previewFileSizeKb,
    previewRendering,
    activeImageSize,
    resEditW,
    resEditH,
    setResEditW,
    setResEditH,
    resizeWorkCanvas,
    mobileExportDraft,
    beginMobileExportEdit,
    updateMobileExportDraft,
    cancelMobileExportEdit,
    commitMobileExportEdit,
    vectorizePanelOpen,
    setVectorizePanelOpen,
    vectorizeParams,
    setVectorizeParams: (params: VectorizeParams) => {
      setVectorizeParams(params)
      void runVectorizePreview(params)
    },
    updateVectorizeParam,
    vectorizing,
    svgPreviewSize,
    exportAsSvg,
    brushSize,
    setBrushSize,
    brushStrength,
    setBrushStrength,
    toolMode,
    setToolMode,
    cropDraft,
    cropToSelection,
    cancelCropMode,
    selectedEffect,
    setSelectedEffect,
    customImageSource,
    setCustomImageSource,
    customImageAssets,
    customImagePresetLoading,
    openCustomImagePicker,
    loadCustomImagePreset,
    openEffectPicker: setEffectPickerOpen,
    emojiRandom,
    selectedEmoji,
    onToggleEmojiRandom: handleToggleEmojiRandom,
    onPickEmoji: handlePickEmoji,
    captureEffectPickerSnapshot,
    restoreEffectPickerSnapshot,
    customImageRandom,
    selectedCustomImageId,
    onToggleCustomRandom: handleToggleCustomRandom,
    onPickCustomImage: handlePickCustomImage,
    liveFixedEmoji: (!emojiRandom && selectedEmoji) ? selectedEmoji : null,
    liveFixedCustomImageId: (!customImageRandom && selectedCustomImageId) ? selectedCustomImageId : null,
    faceOffset: faceOffsetFrac,
    detectFaceOffset,
    setDetectFaceOffset,
    detectSensitivity,
    setDetectSensitivity,
    detectThorough,
    setDetectThorough,
    eraserActive,
    autoDetect,
    setAutoDetect,
    setShowBoxes,
    showBoxes,
    detectFacesOnActiveImage,
    openDetectSettings: () => {
      if (isMobile) return
      const rect = faceFlyoutBtnRef.current?.getBoundingClientRect()
      if (rect) setFaceFlyoutAnchor({ top: rect.top, left: rect.right + 6 })
      setFaceFlyoutOpen(true)
    },
    removeZoneById,
    removeSelectedZone,
    clearZones,
    selectedZoneId,
    categoryIndices,
    zoneToolCustomized,
    effectToolCustomized,
    setEffectToolCustomized,
    setCategoryIndex,
    activeCategory,
    setActiveCategory,
    rotateCategoryTool,
    selectToolCategory,
    applyFaceTool,
    applyZoneTool,
    applyCropTool,
    applyAdjustTool,
    applyEffectTool,
    updateSelectedZoneEffect,
    mobileViewPan,
    setMobileViewPan,
    batch: {
      activeBatchTasks,
      expandedBatchTasks,
      normalizeSettings,
      normalizeProgress,
      normalizeProgressPercent,
      normalizeSummary,
      normalizePreviewPhotos,
      normResultsCount,
      isNormalizing,
      isExporting,
      selectedForBatch,
      colorAdj,
    },
    toggleBatchTask,
    toggleExpandBatchTask,
    updateNormalizeSetting,
    runNormalizeBatch,
    exportNormalizeZip,
    setNormalizeSummary,
    setColorPreset,
    setColorAdj,
    applyColorAdjToActive,
    setNotice,
    setIsNormalizeCropPicking,
    setNormalizeCropDraft,
    isNormalizeCropPicking,
    activeNormalizeCrop,
    applyTemplateFromCurrentCrop,
    detectFrameOnActivePhoto,
    detectContentAwareCropOnActivePhoto,
    pointerSessionRef,
    resetDetectorStatus,
    initializeDetector: () => initializeDetector().then((s) => setDetector(s)),
    setDetector,
    liveDetectEnabled,
    setLiveDetectEnabled,
    mobileViewZoom,
    setMobileViewZoom,
    lastDetectFailed,
    isDetecting,
    detector,
    detectorLoading,
    addLiveMediaToLibrary,
    openPhotoInEditor,
    stepAdjacentLibraryPhoto,
    showMobileToast,
    exportAllLibraryZip,
    exportAllLibraryIndividual,
    exportLibraryProgress,
    exitLiveToWorkspace,
    stepMobileViewZoom: (dir: 1 | -1) => {
      const factor = dir === 1 ? 1.2 : 1 / 1.2
      const next = Math.min(3, Math.max(0.5, mobileViewZoom * factor))
      mobileViewZoomRef.current = next
      setMobileViewZoom(next)
      updateMobileViewTransformDirty()
      renderCanvasRef.current()
    },
    mobileViewRotation,
    mobileViewTransformDirty,
    resetMobileViewTransform,
    adjTransform,
    setAdjTransform,
    adjTransformStrength,
    setAdjTransformStrength,
    adjTransformParams,
    setAdjParam,
    adjPixelShiftType,
    setAdjPixelShiftType,
    commitAdjTransform: () => { void applyAdjTransformToCanvas() },
    resetAdjTransformPreview,
    enabledDistorts,
    toggleDistortEffect,
    distortStrengthByEffect,
    setDistortStrength,
  }

  const showMobileEmbed = isMobile && photos.length > 0 && mobileMode !== 'live'

  useLockMobileViewport(isMobile)
  const hideWorkspace = isMobile && (photos.length === 0 || mobileMode === 'live')

  useEffect(() => {
    mobileViewZoomRef.current = mobileViewZoom
    mobileViewPanRef.current = mobileViewPan
    mobileViewRotationRef.current = mobileViewRotation
    if (isMobile && activePhoto && !activePhoto.isVideo) {
      applyMobilePreviewTransform()
    } else {
      renderCanvasRef.current()
    }
  }, [mobileViewZoom, mobileViewPan, mobileViewRotation, isMobile, activePhoto, applyMobilePreviewTransform])

  const commitMobileViewTransform = useCallback(() => {
    setMobileViewZoom(mobileViewZoomRef.current)
    setMobileViewPan({ ...mobileViewPanRef.current })
    setMobileViewRotation(mobileViewRotationRef.current)
    updateMobileViewTransformDirty()
  }, [updateMobileViewTransformDirty])

  const handleMobileZoomChange = useCallback((z: number) => {
    mobileViewZoomRef.current = z
    if (mobilePinchActiveRef.current) {
      applyMobilePreviewTransform()
      return
    }
    setMobileViewZoom(z)
    updateMobileViewTransformDirty()
    if (isMobile && activePhoto && !activePhoto.isVideo) {
      applyMobilePreviewTransform()
      return
    }
    renderCanvasRef.current()
  }, [activePhoto, applyMobilePreviewTransform, isMobile, updateMobileViewTransformDirty])

  const handleMobilePanChange = useCallback((pan: { x: number; y: number }) => {
    mobileViewPanRef.current = pan
    if (mobilePinchActiveRef.current) {
      applyMobilePreviewTransform()
      return
    }
    setMobileViewPan(pan)
    updateMobileViewTransformDirty()
    if (isMobile && activePhoto && !activePhoto.isVideo) {
      applyMobilePreviewTransform()
      return
    }
    renderCanvasRef.current()
  }, [activePhoto, applyMobilePreviewTransform, isMobile, updateMobileViewTransformDirty])

  const handleMobileRotationChange = useCallback((rot: number) => {
    mobileViewRotationRef.current = rot
    if (mobilePinchActiveRef.current) {
      applyMobilePreviewTransform()
      return
    }
    setMobileViewRotation(rot)
    updateMobileViewTransformDirty()
    if (isMobile && activePhoto && !activePhoto.isVideo) {
      applyMobilePreviewTransform()
      return
    }
    renderCanvasRef.current()
  }, [activePhoto, applyMobilePreviewTransform, isMobile, updateMobileViewTransformDirty])

  usePhotoSwipeNav(viewportRef, {
    enabled: showMobileEmbed && Boolean(activePhoto && !activePhoto.isVideo),
    onSwipeLeft: () => stepAdjacentLibraryPhoto(1),
    onSwipeRight: () => {
      if (mobileEditorReturnTo === 'live') returnToLiveFromEditor()
      else stepAdjacentLibraryPhoto(-1)
    },
    isAllowed: () => (
      pointerSessionRef.current.mode === 'idle'
      && !mobileCanvasEditRef.current
      && mobileViewZoomRef.current <= 1.02
      && Math.hypot(mobileViewPanRef.current.x, mobileViewPanRef.current.y) < 24
    ),
  })

  const mobilePinchEnabled = showMobileEmbed
    && !hideWorkspace
    && Boolean(activePhoto && !activePhoto.isVideo)
    && toolMode !== 'crop'

  usePinchZoom(viewportRef, {
    enabled: mobilePinchEnabled,
    zoom: mobileViewZoom,
    zoomRef: mobileViewZoomRef,
    pan: mobileViewPan,
    panRef: mobileViewPanRef,
    rotation: mobileViewRotation,
    rotationRef: mobileViewRotationRef,
    onZoomChange: handleMobileZoomChange,
    onPanChange: handleMobilePanChange,
    onRotationChange: handleMobileRotationChange,
    onViewTransformChange: updateMobileViewTransformDirty,
    isPanGestureAllowed: () => (
      !mobilePinchActiveRef.current
      && pointerSessionRef.current.mode === 'idle'
      && toolModeRef.current !== 'crop'
    ),
    onPinchStart: () => {
      mobilePinchActiveRef.current = true
      setMobileGestureActive(true)
      videoFaceDetectGenRef.current += 1
      videoFaceScanTimersRef.current.forEach(clearTimeout)
      videoFaceScanTimersRef.current = []
      pointerSessionRef.current = { mode: 'idle' }
      stopBrushLoop()
      setCursorPoint(null)
      const canvas = canvasRef.current
      if (canvas) canvas.style.pointerEvents = 'none'
      const overlay = overlayCanvasRef.current
      if (overlay) {
        const oc = overlay.getContext('2d')
        if (oc) oc.clearRect(0, 0, overlay.width, overlay.height)
      }
    },
    onPinchEnd: () => {
      mobilePinchActiveRef.current = false
      setMobileGestureActive(false)
      const canvas = canvasRef.current
      if (canvas) canvas.style.pointerEvents = ''
      commitMobileViewTransform()
      const photo = activePhotoRef.current
      if (autoDetect && photo && !photo.isVideo && !photo.edited) {
        window.setTimeout(() => {
          if (!mobilePinchActiveRef.current) void detectFacesOnActiveImage(true)
        }, 180)
      } else if (photo?.isVideo && !photo.edited && autoDetect) {
        const gen = ++videoFaceDetectGenRef.current
        void runVideoFaceDetectPass(0, activeVideoTimeRef.current, gen)
      }
    },
    minZoom: 0.5,
    maxZoom: 3,
  })

  return (
    <div
      className={`app-shell${isMobile ? ' app-shell-mobile' : ' app-shell-desktop-v2'}${isMobile && mobileMode === 'live' ? ' app-shell-mobile--live' : ''}${isMobile && mobileMode === 'video' ? ' app-shell-mobile--video' : ''}${isMobile && mobileMode === 'editor' ? ' app-shell-mobile--image' : ''}`}
      translate="no"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* ── Top bar (desktop) — hidden on the empty home screen, which has its
            own minimal header (W3PN logo + "WHAT IS THIS?"). ──────────────── */}
      {!isMobile && photos.length > 0 && (
      <header className="topbar">
        <button className="brand brand--typographic" type="button" onClick={() => setAboutOpen(true)} title="About W3PN Anonymizer">
          <img src="/brand/anonymizer-header.png" alt="ANONYMIZER" className="brand-wordmark-img" />
          <span className="brand-chevron"><Icon name="expand_more" size={14} /></span>
        </button>

        <span className="topbar-tagline">
          <span>open source</span>
          {' · private · no data collected'}
        </span>

        <div className="topbar-gap" />

        {/* Demo button */}
        <button
          className="topbar-demo-btn"
          type="button"
          onClick={loadDemoPhotos}
          disabled={isBusy}
          title="Load demo photos"
        >
          Demo
        </button>

        <button
          className="topbar-live-btn"
          type="button"
          onClick={() => setDesktopLiveOpen(true)}
          disabled={isBusy}
          title="Turn on live camera"
        >
          <Icon name="videocam" size={14} />
          Live mode
        </button>

        {/* GitHub link in topbar */}
        <a
          className="topbar-github-link"
          href="https://github.com/web3privacy/w3pn-anonymizer"
          target="_blank"
          rel="noreferrer"
          title="View source on GitHub"
        >
          GitHub
        </a>

        {/* Icon theme toggle */}
        <button
          className="theme-toggle-icon"
          type="button"
          onClick={() => setTheme((t) => t === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          <Icon name={theme === 'dark' ? 'dark_mode' : 'light_mode'} size={18} />
        </button>
      </header>
      )}

      {/* hidden file inputs */}
      <input ref={uploadInputRef} type="file" accept="image/*,video/*" multiple onChange={handleUploadInput} hidden />
      <input ref={folderInputRef} type="file" multiple onChange={handleFolderInput} hidden
        // @ts-expect-error webkitdirectory is not in React's type defs
        webkitdirectory="" directory="" />

      {pickerChoiceOpen && (
        <div className="picker-choice-backdrop" onClick={() => setPickerChoiceOpen(false)}>
          <div
            ref={pickerChoiceDialogRef}
            className="picker-choice-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="picker-choice-title"
            data-dialog-focus-trap="true"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="about-modal-close" type="button" onClick={() => setPickerChoiceOpen(false)} aria-label="Close">
              <Icon name="close" size={18} />
            </button>
            <h2 id="picker-choice-title" className="picker-choice-title">Add media</h2>
            <p className="picker-choice-desc">
              Choose individual files or open a folder with disk write access for overwrite/export workflows.
            </p>
            <div className="picker-choice-actions">
              <button
                ref={pickerChoiceFolderBtnRef}
                className="btn btn-primary picker-choice-primary"
                type="button"
                disabled={isBusy}
                onClick={() => {
                  setPickerChoiceOpen(false)
                  void openFolderPicker()
                }}
              >
                <Icon name="folder_open" size={15} /> Open folder
              </button>
              <button
                className="btn picker-choice-secondary"
                type="button"
                disabled={isBusy}
                onClick={() => {
                  setPickerChoiceOpen(false)
                  void openFilePicker()
                }}
              >
                <Icon name="upload_file" size={15} /> Select files
              </button>
            </div>
          </div>
        </div>
      )}

      {isMobile && (
        <MobileShell
          b={mobileBindings}
          fmtBytes={fmtBytes}
          setSidebarView={setSidebarView}
          sidebarView={sidebarView}
          toggleBatchSelect={toggleBatchSelect}
          batchProcessCount={batchProcessCount}
          embedEditor={showMobileEmbed}
        />
      )}

      {isMobile && (
        <MobileToast
          message={mobileToast?.message ?? null}
          onDismiss={() => setMobileToast(null)}
          actionLabel={mobileToast?.action?.label}
          onAction={mobileToast?.action?.onClick}
        />
      )}

      {/* ── Workspace — flex row: sidebar | resizer | batch | tool-strip | editor ── */}
      <div
        className={`workspace${showMobileEmbed ? ' workspace-mobile' : ''}${mobileEditorSlideIn ? ' workspace-mobile-slide-enter' : ''}`}
        style={hideWorkspace ? { display: 'none' } : undefined}
      >

        {/* ── Welcome screen (no photos loaded) ──────────────── */}
        {!isMobile && photos.length === 0 && (
          <DesktopHomeDefault
            isDragOver={isDragOver}
            isBusy={isBusy}
            detectorLoading={detectorLoading}
            onAbout={() => setAboutOpen(true)}
            onSelectMedia={openUnifiedPicker}
            onLoadDemo={loadDemoPhotos}
            onLiveCamera={() => setDesktopLiveOpen(true)}
          />
        )}

        {/* ── Sidebar ───────────────────────────────────────── */}
        {photos.length > 0 && (
        <aside
          className="sidebar"
          style={{
            width: photos.length === 1 && !batchPanelOpen ? 0 : sidebarWidth,
            flexShrink: 0,
            overflow: 'hidden',
            transition: 'width 0.18s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {(
            /* Photos loaded — compact top bar + list */
            <>
              <div className="sidebar-topbar">
                <button className="sidebar-add-btn" type="button" onClick={openUnifiedPicker} disabled={isBusy} title="Add more photos or open a folder">
                  + Add files
                </button>
                <button
                  className={`sidebar-batch-btn${batchPanelOpen ? ' active' : ''}`}
                  type="button"
                  onClick={() => setBatchPanelOpen((o) => !o)}
                  title="Batch processing settings"
                >
                  Batch
                </button>
              </div>

              {/* Hierarchical folder tree (when photos have subfolders) */}
              {folderTree.size > 0 && (() => {
                // Compute child folders at currentFolderPrefix depth
                const prefix = currentFolderPrefix ? currentFolderPrefix + '/' : ''
                const childFolderNames = new Set<string>()
                folderTree.forEach((_, folder) => {
                  if (folder.startsWith(prefix)) {
                    const rest = folder.slice(prefix.length)
                    const nextSeg = rest.split('/')[0]
                    if (nextSeg) childFolderNames.add(nextSeg)
                  }
                })
                return (
                  <div className="folder-tree">
                    <button
                      className="folder-tree-toggle"
                      type="button"
                      onClick={() => setFolderTreeOpen((v) => !v)}
                    >
                      <Icon name={folderTreeOpen ? 'folder_open' : 'folder'} size={13} />
                      {currentFolderPrefix ? currentFolderPrefix.split('/').pop() : 'Folders'}
                      <span style={{ marginLeft: 'auto', opacity: 0.5 }}>{folderTreeOpen ? '▲' : '▼'}</span>
                    </button>
                    {folderTreeOpen && (
                      <>
                        {/* Up button when inside a subfolder */}
                        {currentFolderPrefix && (
                          <button
                            className="folder-node folder-node-up"
                            type="button"
                            onClick={() => setCurrentFolderPrefix(currentFolderPrefix.includes('/') ? currentFolderPrefix.slice(0, currentFolderPrefix.lastIndexOf('/')) : '')}
                          >
                            <span className="fn-icon"><Icon name="arrow_upward" size={14} /></span>
                            <span className="fn-name">.. (up)</span>
                          </button>
                        )}
                        {Array.from(childFolderNames).sort().map((seg) => {
                          const fullPath = prefix + seg
                          // Collect all photo ids under this folder (recursively)
                          const ids: string[] = []
                          folderTree.forEach((photoIds, folder) => {
                            if (folder === fullPath || folder.startsWith(fullPath + '/')) ids.push(...photoIds)
                          })
                          // Check if has subfolders
                          const hasSubFolders = Array.from(folderTree.keys()).some((f) => f.startsWith(fullPath + '/'))
                          return (
                            <button
                              key={fullPath}
                              className="folder-node"
                              type="button"
                              title={hasSubFolders ? `Open ${seg}` : `Select ${ids.length} photos in ${seg}`}
                              onClick={() => {
                                if (hasSubFolders) {
                                  setCurrentFolderPrefix(fullPath)
                                } else {
                                  if (batchPanelOpen) {
                                    setSelectedForBatch((cur) => { const next = new Set(cur); ids.forEach((id) => next.add(id)); return next })
                                  } else {
                                    if (ids[0]) selectPhoto(ids[0])
                                  }
                                }
                              }}
                            >
                              <span className="fn-icon"><Icon name={hasSubFolders ? 'folder' : 'folder_open'} size={14} /></span>
                              <span className="fn-name">{seg}</span>
                              <span className="fn-count">{ids.length}</span>
                            </button>
                          )
                        })}
                      </>
                    )}
                  </div>
                )
              })()}

              <div className="sidebar-head">
                <span className="sidebar-head-label">
                  {batchPanelOpen
                    ? `${selectedForBatch.size}/${photos.length} items`
                    : `${photos.length} photo${photos.length === 1 ? '' : 's'}`}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {batchPanelOpen && photos.length > 0 && (
                    <>
                      <button className="icon-btn" type="button" onClick={selectAllForBatch} title="Select all" aria-label="Select all"><Icon name="done_all" size={14} /></button>
                      <button className="icon-btn" type="button" onClick={deselectAllForBatch} title="Deselect all" aria-label="Deselect all"><Icon name="remove_done" size={14} /></button>
                    </>
                  )}
                  <button className={`icon-btn ${sidebarView === 'grid' ? 'active' : ''}`} type="button" onClick={() => setSidebarView('grid')} title="Thumbnails" aria-label="Thumbnails"><Icon name="grid_view" size={14} /></button>
                  <button className={`icon-btn ${sidebarView === 'list' ? 'active' : ''}`} type="button" onClick={() => setSidebarView('list')} title="List" aria-label="List"><Icon name="list" size={14} /></button>
                </div>
              </div>

              <div className={`photo-list ${sidebarView === 'grid' ? 'grid-mode' : ''}`}>
                {displayedPhotos.map((photo) => {
                  const isEdited = photo.edited || dirtyByPhoto[photo.id]
                  return (
                    <div
                      key={photo.id}
                      className={`photo-item ${photo.id === activePhotoId ? 'active' : ''} ${batchPanelOpen && selectedForBatch.has(photo.id) ? 'batch-selected' : ''}`}
                      onClick={() => selectPhoto(photo.id)}
                      title={photo.name}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && selectPhoto(photo.id)}
                    >
                      {batchPanelOpen && (
                        <div
                          className="batch-checkbox"
                          onClick={(e) => { e.stopPropagation(); toggleBatchSelect(photo.id) }}
                          title={selectedForBatch.has(photo.id) ? 'Remove from batch' : 'Add to batch'}
                        >
                          {selectedForBatch.has(photo.id) ? '☑' : '☐'}
                        </div>
                      )}
                      {isEdited && (
                        <div className="photo-edited-badge" title="Edited">✓</div>
                      )}
                      {photo.isVideo && (
                        <div className="photo-video-badge" title="Video">▶</div>
                      )}
                      {sidebarView === 'grid' ? (
                        <img src={photo.previewUrl} alt={photo.name} loading="lazy" />
                      ) : (
                        <img
                          src={photo.previewUrl}
                          alt={photo.name}
                          loading="lazy"
                          className="photo-item-thumb"
                        />
                      )}
                      <div className="photo-item-info">
                        <span className="photo-item-name">{photo.name.split('/').pop()}</span>
                        <span className="photo-item-meta">
                          {(() => {
                            const parts = photo.name.split('/')
                            return parts.length > 1 ? <span className="photo-item-path" title={photo.name}>{parts.slice(0, -1).join('/')}/</span> : null
                          })()}
                        </span>
                      </div>
                      {/* Hover action buttons */}
                      <div className="photo-item-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="photo-item-action-btn"
                          type="button"
                          title="Rotate 90°"
                          aria-label="Rotate 90°"
                          onClick={(e) => { e.stopPropagation(); rotatePhoto(photo.id) }}
                        >
                          <Icon name="rotate_90_degrees_cw" size={13} />
                        </button>
                        <button
                          className="photo-item-action-btn photo-item-action-btn--danger"
                          type="button"
                          title="Remove from list"
                          aria-label="Remove from list"
                          onClick={(e) => { e.stopPropagation(); deletePhoto(photo.id) }}
                        >
                          <Icon name="delete" size={13} />
                        </button>
                      </div>
                    </div>
                  )
                })}
                {hasMorePhotosToRender && (
                  <button type="button" className="load-more-btn" onClick={() => setPhotoListLimit((cur) => Math.min(photos.length, cur + 250))}>
                    + {photos.length - displayedPhotos.length} more
                  </button>
                )}
              </div>

              {/* Batch process bar — visible when batch panel open */}
              {batchPanelOpen && (
                <div className="sidebar-process-bar">
                  <button
                    className="sidebar-process-btn"
                    type="button"
                    onClick={runNormalizeBatch}
                    disabled={photos.length === 0 || isNormalizing || isBusy || selectedBatchImageCount === 0}
                    title={selectedBatchImageCount === 0 ? 'Select photos first' : `Process ${selectedBatchImageCount} selected photos`}
                  >
                    {isNormalizing
                      ? `Processing ${normalizeProgressPercent}%`
                      : `Process ${selectedBatchImageCount} photo${selectedBatchImageCount !== 1 ? 's' : ''}`}
                  </button>
                  {isNormalizing && (
                    <button
                      style={{ background: 'none', border: '1px solid var(--danger)', borderRadius: 5, padding: '0.25rem', fontSize: '0.7rem', color: 'var(--danger)', cursor: 'pointer', font: 'inherit' }}
                      type="button"
                      onClick={cancelNormalizeBatch}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </aside>
        )}

        {photos.length > 0 && (<>
        {/* ── Sidebar resize handle ────────────────────────── */}
        <div
          className="sidebar-resizer"
          style={{ display: photos.length === 1 && !batchPanelOpen ? 'none' : undefined }}
          onPointerDown={handleResizerPointerDown}
          onPointerMove={handleResizerPointerMove}
          onPointerUp={handleResizerPointerUp}
        />

        {/* ── Tool Strip ───────────────────────────────────── */}
        <div className="tool-strip">

          {/* 1. Auto-detect toggle — color states: green=ready, orange=unavailable, red=failed */}
          <div className="ts-tooltip-wrap" style={{ position: 'relative' }}>
            {(() => {
              const detMode = detector.mode
              const detectorOff = detMode !== 'yunet-wasm'
              const btnClass = detectorOff ? ' ts-btn-setup' : ''
              return (<>
                <button
                  ref={faceFlyoutBtnRef}
                  className={`ts-btn ts-btn-autodetect${autoDetect ? ' active' : ''}${faceFlyoutOpen ? ' flyout-open' : ''}${btnClass}`}
                  type="button"
                  onClick={() => {
                    const rect = faceFlyoutBtnRef.current?.getBoundingClientRect()
                    if (rect) setFaceFlyoutAnchor({ top: rect.top, left: rect.right + 6 })
                    setFaceFlyoutOpen((v) => !v)
                    setAdjFlyoutOpen(false)
                    setTransformFlyoutOpen(false)
                    setEffectFlyoutOpen(false)
                  }}
                  onDoubleClick={() => { void refreshDetector(true).then((s) => setNotice(s.message)) }}
                  title="Detection settings (double-click to refresh detector)"
                >
                  <Icon name="face_retouching_natural" filled={autoDetect} size={18} />
                  {autoDetect && !detectorOff && (
                    <span className="ts-face-count-inline">{activeZones.length}</span>
                  )}
                </button>
                <span className="ts-tooltip">
                  {autoDetect
                    ? `Detection: ON · ${activeZones.length} face${activeZones.length !== 1 ? 's' : ''}${detectorOff ? ' · detector unavailable' : ''}`
                    : 'Detection: OFF'}
                </span>
              </>)
            })()}
          </div>

          <div className="ts-sep" />

          {/* 6. Effect (anonymization style) — always active green, moved up */}
          <div className="ts-tooltip-wrap">
            <button
              ref={effectFlyoutBtnRef}
              className="ts-btn active"
              type="button"
              onClick={() => {
                const rect = effectFlyoutBtnRef.current?.getBoundingClientRect()
                if (rect) setEffectFlyoutAnchor({ top: rect.top, left: rect.right + 6 })
                setEffectFlyoutOpen((v) => !v)
                setAdjFlyoutOpen(false)
                setTransformFlyoutOpen(false)
                setFaceFlyoutOpen(false)
              }}
              title={`Effect: ${selectedEffect} — click to change`}
              aria-label={`Effect: ${selectedEffect}`}
            >
              <Icon name={EFFECT_ICONS[selectedEffect]} size={18} />
            </button>
            <span className="ts-tooltip">Effect: {selectedEffect}</span>
          </div>

          <div className="ts-sep" />

          {/* 3. Add zone toggle */}
          <div className="ts-tooltip-wrap">
            <button
              className={`ts-btn${toolMode === 'zone' ? ' active' : ''}`}
              type="button"
              disabled={!activePhoto}
              onClick={() => {
                setToolMode('zone')
                setZonesAnonymized(false)
                setNotice('Draw a box on the photo to add a face zone.')
              }}
              title="Add zone — draw rectangle to select face region"
              aria-label="Add zone"
            >
              <Icon name="crop_free" size={18} />
            </button>
            <span className="ts-tooltip">Add zone</span>
          </div>

          {/* 5. Brush toggle — grouped with add zone (no separator) */}
          <div className="ts-tooltip-wrap">
            <button
              className={`ts-btn${toolMode === 'brush' ? ' active' : ''}`}
              type="button"
              disabled={!activePhoto}
              onClick={() => setToolMode((m) => m === 'brush' ? 'zone' : 'brush')}
              title={toolMode === 'brush' ? 'Brush active — click to switch to zone selection' : 'Brush tool — click to activate'}
              aria-label="Brush tool"
            >
              <Icon name="brush" size={18} />
            </button>
            <span className="ts-tooltip">Brush</span>
          </div>

          {faceFlyoutOpen && faceFlyoutAnchor && createPortal(
            <div
              className="ts-flyout-portal ts-flyout ts-flyout--wide"
              style={{ position: 'fixed', top: faceFlyoutAnchor.top, left: faceFlyoutAnchor.left, zIndex: 9999 }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="ts-flyout-title">Face detection</div>
              <FaceSettingsPanel
                target={detectTarget}
                onTargetChange={setDetectTarget}
                sensitivity={detectSensitivity}
                onSensitivityChange={setDetectSensitivity}
                faceOffset={detectFaceOffset}
                onFaceOffsetChange={setDetectFaceOffset}
                thorough={detectThorough}
                onThoroughChange={setDetectThorough}
                detectEnabled={autoDetect}
                onDetectEnabledChange={(v) => { setAutoDetect(v); setShowBoxes(v) }}
                showBoxes={showBoxes}
                onShowBoxesChange={setShowBoxes}
                detectorReady={detector.mode === 'yunet-wasm'}
                isVideo={Boolean(activePhoto?.isVideo)}
                onDetectNow={() => { void detectFacesOnActiveImage(detectThorough); setFaceFlyoutOpen(false) }}
                compact
              />
            </div>,
            document.body
          )}

          {adjFlyoutOpen && adjFlyoutAnchor && createPortal(
            <div
              className="ts-flyout-portal ts-flyout ts-flyout--wide"
              style={{ position: 'fixed', top: adjFlyoutAnchor.top, left: adjFlyoutAnchor.left, zIndex: 9999 }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="ts-flyout-title">Adjust</div>
              <AdjustToolPanel
                colorAdj={colorAdj}
                onChange={setColorAdj}
                onReset={() => { setColorAdj(DEFAULT_COLOR_ADJUSTMENTS); renderCanvas() }}
                showPresets
                showExtended
              />
            </div>,
            document.body
          )}

          {transformFlyoutOpen && transformFlyoutAnchor && createPortal(
            <div
              className="ts-flyout-portal ts-flyout ts-flyout--wide"
              style={{ position: 'fixed', top: transformFlyoutAnchor.top, left: transformFlyoutAnchor.left, zIndex: 9999 }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="ts-flyout-title">Distort</div>
              <DistortToolPanel
                enabledDistorts={enabledDistorts}
                toggleDistortEffect={toggleDistortEffect}
                distortStrengthByEffect={distortStrengthByEffect}
                setDistortStrength={setDistortStrength}
                adjTransformParams={adjTransformParams}
                setAdjParam={setAdjParam}
                adjPixelShiftType={adjPixelShiftType}
                setAdjPixelShiftType={setAdjPixelShiftType}
                onReset={resetAdjTransformPreview}
                onApply={() => { void applyAdjTransformToCanvas() }}
                canApply={Boolean(activePhoto && enabledDistorts.length > 0)}
              />
            </div>,
            document.body
          )}

          <div className="ts-sep" />

          {/* Crop + Adjustments — grouped together */}
          <div className="ts-tooltip-wrap">
            <button
              className={`ts-btn${toolMode === 'crop' ? ' active' : ''}`}
              type="button"
              disabled={!activePhoto}
              onClick={() => { setToolMode((m) => m === 'crop' ? 'brush' : 'crop'); setCropDraft(null) }}
              title="Crop tool — draw a region and confirm in viewer"
              aria-label="Crop tool"
            >
              <Icon name="crop" size={18} />
            </button>
            <span className="ts-tooltip">Crop</span>
          </div>

          <div className="ts-tooltip-wrap">
            <button
              ref={adjFlyoutBtnRef}
              className={`ts-btn${adjFlyoutOpen ? ' active' : ''}`}
              type="button"
              onClick={() => {
                const rect = adjFlyoutBtnRef.current?.getBoundingClientRect()
                if (rect) setAdjFlyoutAnchor({ top: rect.top, left: rect.right + 6 })
                setAdjFlyoutOpen((v) => !v)
                setEffectFlyoutOpen(false)
                setTransformFlyoutOpen(false)
                setFaceFlyoutOpen(false)
              }}
              disabled={!activePhoto}
              title="Color adjustments"
              aria-label="Color adjustments"
            >
              <Icon name="palette" size={18} />
            </button>
            <span className="ts-tooltip">Colors</span>
          </div>

          <div className="ts-tooltip-wrap">
            <button
              ref={transformFlyoutBtnRef}
              className={`ts-btn${transformFlyoutOpen ? ' active' : ''}`}
              type="button"
              onClick={() => {
                const rect = transformFlyoutBtnRef.current?.getBoundingClientRect()
                if (rect) setTransformFlyoutAnchor({ top: rect.top, left: rect.right + 6 })
                setTransformFlyoutOpen((v) => !v)
                setAdjFlyoutOpen(false)
                setEffectFlyoutOpen(false)
                setFaceFlyoutOpen(false)
              }}
              disabled={!activePhoto}
              title="Transform effects (halftone, glitch, pixel-shift, color-shift)"
              aria-label="Transform effects"
            >
              <Icon name="auto_awesome" size={18} />
            </button>
            <span className="ts-tooltip">Transform</span>
          </div>

          {effectFlyoutOpen && effectFlyoutAnchor && createPortal(
            <div
              className="ts-flyout-portal ts-flyout"
              style={{ position: 'fixed', top: effectFlyoutAnchor.top, left: effectFlyoutAnchor.left, zIndex: 9999 }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="ts-flyout-title">Choose effect</div>
              <div className="ts-effect-grid">
                {EFFECTS.map((ef) => (
                  <button
                    key={ef.id}
                    className={`ts-effect-tile${selectedEffect === ef.id ? ' active' : ''}`}
                    type="button"
                    onClick={() => {
                      updateSelectedZoneEffect(ef.id)
                      if (ef.id === 'emoji' || ef.id === 'custom-image') {
                        setEffectFlyoutOpen(false)
                        setEffectPickerOpen(ef.id)
                        if (ef.id === 'custom-image' && customImageAssets.length === 0) {
                          void loadCustomImagePreset(customImageSource === 'custom' ? DEFAULT_CUSTOM_IMAGE_PRESET_ID : customImageSource)
                        }
                      }
                    }}
                    title={ef.description}
                  >
                    <span className="ts-effect-tile-icon"><Icon name={EFFECT_ICONS[ef.id]} size={18} /></span>
                    <span className="ts-effect-tile-label">{ef.label}</span>
                  </button>
                ))}
              </div>
            </div>,
            document.body
          )}

          <div className="ts-sep" />

          <div className="ts-sliders-fill">
            <div className="ts-slider-group">
              <span className="ts-slider-label">SIZE</span>
              <RangeWithThumb
                orientation="vertical"
                min={4}
                max={100}
                value={Math.min(brushSize, 100)}
                onChange={(v) => { brushSizeRef.current = v; setBrushSize(v) }}
                ariaLabel="Brush size"
              />
            </div>
            <div className="ts-slider-group">
              <span className="ts-slider-label">{getMobileStrengthLabel(selectedEffect)}</span>
              <RangeWithThumb
                orientation="vertical"
                min={1}
                max={100}
                value={Math.min(100, Math.max(1, Math.round(brushStrength * 100)))}
                onChange={(v) => setBrushStrength(v / 100)}
                ariaLabel="Effect strength"
              />
            </div>
          </div>

        </div>

        {/* ── Batch panel — grid col 3 ── */}
        <div className="batch-panel" style={{ width: batchPanelOpen ? 280 : 0 }}>
          {batchPanelOpen && (
            <div className="batch-panel-inner">
            <div className="norm-panel-head" style={{ flexShrink: 0 }}>
              <span>Batch tasks</span>
              <button className="icon-btn" type="button" onClick={() => setBatchPanelOpen(false)}><Icon name="close" size={14} /></button>
            </div>
            <div className="norm-panel-body">

              {/* Summary card */}
              {normalizeSummary && !normalizeProgress.active && (
                <div className="summary-card">
                  <div className="summary-card-header">
                    <span>{normalizeSummary.canceled ? 'Cancelled' : normalizeSummary.failed > 0 ? 'Done (with errors)' : 'Done'}</span>
                    <button className="icon-btn" type="button" onClick={() => setNormalizeSummary(null)}>✕</button>
                  </div>
                  <div className="summary-stats">
                    <div className="summary-stat"><span className="summary-stat-value">{normalizeSummary.success}</span><span className="summary-stat-label">done</span></div>
                    {normalizeSummary.failed > 0 && <div className="summary-stat summary-stat-warn"><span className="summary-stat-value">{normalizeSummary.failed}</span><span className="summary-stat-label">errors</span></div>}
                    <div className="summary-stat"><span className="summary-stat-value">{normalizeSummary.elapsedSeconds < 60 ? `${normalizeSummary.elapsedSeconds}s` : `${Math.floor(normalizeSummary.elapsedSeconds / 60)}m`}</span><span className="summary-stat-label">time</span></div>
                  </div>
                  {normalizeSummary.inputBytes > 0 && (
                    <div className="summary-size-bar">
                      <div className="summary-size-labels"><span>Before: <strong>{fmtBytes(normalizeSummary.inputBytes)}</strong></span><span>After: <strong>{fmtBytes(normalizeSummary.outputBytes)}</strong></span></div>
                      <div className="summary-bar-track"><div className="summary-bar-after" style={{ width: `${Math.min(100, Math.round((normalizeSummary.outputBytes / normalizeSummary.inputBytes) * 100))}%` }} /></div>
                      {normalizeSummary.outputBytes < normalizeSummary.inputBytes
                        ? <div className="summary-saving">Saved <strong>{fmtBytes(normalizeSummary.inputBytes - normalizeSummary.outputBytes)}</strong> ({Math.round((1 - normalizeSummary.outputBytes / normalizeSummary.inputBytes) * 100)}%)</div>
                        : <div className="summary-saving summary-saving-grow">Size grew by {fmtBytes(normalizeSummary.outputBytes - normalizeSummary.inputBytes)}</div>}
                    </div>
                  )}
                  {normResultsCount > 0 && (
                    <button className="btn btn-sm" type="button" onClick={exportNormalizeZip} disabled={isExporting} style={{ marginTop: '0.3rem', width: '100%' }}>
                      Download ZIP ({normResultsCount})
                    </button>
                  )}
                </div>
              )}

              {/* Progress */}
              {normalizeProgress.active && (
                <div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${normalizeProgressPercent}%` }} /></div>
                  <div className="meta-row">
                    <span>{normalizeProgress.done}/{normalizeProgress.total}</span>
                    <span>{normalizeProgress.etaSeconds > 0 ? `ETA ${normalizeProgress.etaSeconds}s` : normalizeProgressPercent + '%'}</span>
                  </div>
                  {normalizeProgress.currentFile && <div className="meta-file" title={normalizeProgress.currentFile}>{normalizeProgress.currentFile}</div>}
                </div>
              )}

              {/* Recent previews */}
              {normalizePreviewPhotos.length > 0 && (
                <div>
                  <div className="section-label">Recent results</div>
                  <div className="norm-preview-grid">
                    {normalizePreviewPhotos.map((p) => (
                      <button key={p.id} type="button" className="norm-preview-thumb" onClick={() => selectPhoto(p.id)}>
                        <img src={p.previewUrl} alt={p.name} loading="lazy" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Task cards ── */}

              {/* Format task */}
              {(() => {
                const taskId: BatchTaskId = 'format'
                const isActive = activeBatchTasks.has(taskId)
                const isExpanded = expandedBatchTasks.has(taskId)
                return (
                  <div className="batch-task-card">
                    <div className="batch-task-header" onClick={() => toggleExpandBatchTask(taskId)}>
                      <input type="checkbox" className="batch-task-checkbox" checked={isActive} onChange={(e) => { e.stopPropagation(); toggleBatchTask(taskId) }} onClick={(e) => e.stopPropagation()} />
                      <span className="batch-task-title"><Icon name="image" size={14} /> Format & Quality</span>
                      <span className={`batch-task-chevron${isExpanded ? ' open' : ''}`}><Icon name="expand_more" size={16} /></span>
                    </div>
                    {isExpanded && isActive && (
                      <div className="batch-task-body">
                        <div>
                          <label className="field-label">Output format</label>
                          <select className="field-select" value={normalizeSettings.outputFormat} onChange={(e) => updateNormalizeSetting('outputFormat', e.target.value as NormalizeFormat)} disabled={isNormalizing}>
                            <option value="image/jpeg">JPG</option>
                            <option value="image/png">PNG</option>
                            <option value="image/webp">WebP</option>
                            <option value="image/bmp">BMP</option>
                            <option value="image/gif">GIF</option>
                            <option value="image/tiff">TIFF</option>
                          </select>
                        </div>
                        {(normalizeSettings.outputFormat === 'image/jpeg' || normalizeSettings.outputFormat === 'image/webp') && (
                          <div>
                            <span className="field-label">Quality</span>
                            <div className="tb-quality-wrap" style={{ marginTop: '0.25rem' }}>
                              <input className="tb-quality-slider" type="range" min={25} max={100} value={normalizeSettings.quality} onChange={(e) => updateNormalizeSetting('quality', Number(e.target.value))} disabled={isNormalizing} />
                              <input className="tb-quality-num" type="number" min={25} max={100} value={normalizeSettings.quality} onChange={(e) => updateNormalizeSetting('quality', Math.min(100, Math.max(25, Number(e.target.value))))} disabled={isNormalizing} />
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>%</span>
                            </div>
                          </div>
                        )}
                        <div className="two-col">
                          <div>
                            <label className="field-label">Codec</label>
                            <select className="field-select" value={normalizeSettings.codecEngine} onChange={(e) => updateNormalizeSetting('codecEngine', e.target.value as NormalizeCodecEngine)} disabled={isNormalizing}>
                              <option value="canvas">Canvas</option>
                              <option value="worker-codec">Worker</option>
                            </select>
                          </div>
                          <div>
                            <label className="field-label">Workers</label>
                            <input className="field-input" type="number" min={1} max={8} value={normalizeSettings.batchConcurrency} onChange={(e) => updateNormalizeSetting('batchConcurrency', Number(e.target.value))} disabled={isNormalizing} />
                          </div>
                        </div>
                        <label className="checkbox-row">
                          <input type="checkbox" checked={normalizeSettings.overwriteOriginals} onChange={(e) => updateNormalizeSetting('overwriteOriginals', e.target.checked)} disabled={isNormalizing} />
                          Overwrite originals
                        </label>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Resize task */}
              {(() => {
                const taskId: BatchTaskId = 'resize'
                const isActive = activeBatchTasks.has(taskId)
                const isExpanded = expandedBatchTasks.has(taskId)
                return (
                  <div className="batch-task-card">
                    <div className="batch-task-header" onClick={() => toggleExpandBatchTask(taskId)}>
                      <input type="checkbox" className="batch-task-checkbox" checked={isActive} onChange={(e) => { e.stopPropagation(); toggleBatchTask(taskId) }} onClick={(e) => e.stopPropagation()} />
                      <span className="batch-task-title"><Icon name="photo_size_select_large" size={14} /> Resize</span>
                      <span className={`batch-task-chevron${isExpanded ? ' open' : ''}`}><Icon name="expand_more" size={16} /></span>
                    </div>
                    {isExpanded && isActive && (
                      <div className="batch-task-body">
                        <select className="field-select" value={normalizeSettings.resizeMode} onChange={(e) => updateNormalizeSetting('resizeMode', e.target.value as NormalizeSettings['resizeMode'])} disabled={isNormalizing}>
                          <option value="keep">Keep original</option>
                          <option value="max-bound">Max W / H</option>
                          <option value="exact">Exact size</option>
                        </select>
                        {normalizeSettings.resizeMode === 'max-bound' && (
                          <div className="two-col">
                            <div><label className="field-label">Max W</label><input className="field-input" type="number" min={1} max={25000} value={normalizeSettings.maxWidth} onChange={(e) => updateNormalizeSetting('maxWidth', Number(e.target.value))} disabled={isNormalizing} /></div>
                            <div><label className="field-label">Max H</label><input className="field-input" type="number" min={1} max={25000} value={normalizeSettings.maxHeight} onChange={(e) => updateNormalizeSetting('maxHeight', Number(e.target.value))} disabled={isNormalizing} /></div>
                          </div>
                        )}
                        {normalizeSettings.resizeMode === 'exact' && (
                          <div className="two-col">
                            <div><label className="field-label">W</label><input className="field-input" type="number" min={1} max={25000} value={normalizeSettings.targetWidth} onChange={(e) => updateNormalizeSetting('targetWidth', Number(e.target.value))} disabled={isNormalizing} /></div>
                            <div><label className="field-label">H</label><input className="field-input" type="number" min={1} max={25000} value={normalizeSettings.targetHeight} onChange={(e) => updateNormalizeSetting('targetHeight', Number(e.target.value))} disabled={isNormalizing} /></div>
                          </div>
                        )}
                        <label className="checkbox-row">
                          <input type="checkbox" checked={normalizeSettings.resizeAspectCrop} onChange={(e) => updateNormalizeSetting('resizeAspectCrop', e.target.checked)} />
                          Auto-crop to aspect ratio
                        </label>
                        {normalizeSettings.resizeAspectCrop && (
                          <div className="two-col">
                            <div><label className="field-label">W ratio</label><input className="field-input" type="number" min={1} max={100} value={normalizeSettings.resizeAspectW} onChange={(e) => updateNormalizeSetting('resizeAspectW', Number(e.target.value))} /></div>
                            <div><label className="field-label">H ratio</label><input className="field-input" type="number" min={1} max={100} value={normalizeSettings.resizeAspectH} onChange={(e) => updateNormalizeSetting('resizeAspectH', Number(e.target.value))} /></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Crop task */}
              {(() => {
                const taskId: BatchTaskId = 'crop'
                const isActive = activeBatchTasks.has(taskId)
                const isExpanded = expandedBatchTasks.has(taskId)
                return (
                  <div className="batch-task-card">
                    <div className="batch-task-header" onClick={() => toggleExpandBatchTask(taskId)}>
                      <input type="checkbox" className="batch-task-checkbox" checked={isActive} onChange={(e) => { e.stopPropagation(); toggleBatchTask(taskId) }} onClick={(e) => e.stopPropagation()} />
                      <span className="batch-task-title"><Icon name="crop" size={14} /> Crop</span>
                      <span className={`batch-task-chevron${isExpanded ? ' open' : ''}`}><Icon name="expand_more" size={16} /></span>
                    </div>
                    {isExpanded && isActive && (
                      <div className="batch-task-body">
                        <select className="field-select" value={normalizeSettings.cropMode} onChange={(e) => updateNormalizeCropMode(e.target.value as NormalizeCropMode)} disabled={isNormalizing}>
                          <option value="none">No crop</option>
                          <option value="uniform-percent">Uniform %</option>
                          <option value="sides-percent">% per side</option>
                          <option value="sides-px">Pixels per side</option>
                          <option value="template">Mouse template</option>
                        </select>
                        {normalizeSettings.cropMode === 'uniform-percent' && (
                          <div>
                            <span className="field-label">Crop: {normalizeSettings.cropUniformPercent.toFixed(1)}%</span>
                            <input className="field-range" type="range" min={0} max={49} step={0.1} value={normalizeSettings.cropUniformPercent} onChange={(e) => updateNormalizeSetting('cropUniformPercent', Number(e.target.value))} />
                          </div>
                        )}
                        {normalizeSettings.cropMode === 'sides-percent' && (
                          <div className="two-col">
                            {(['Left', 'Right', 'Top', 'Bottom'] as const).map((side) => (
                              <div key={side}>
                                <label className="field-label">{side} %</label>
                                <input className="field-input" type="number" min={0} max={99} step={0.1} value={normalizeSettings[`cropPercent${side}` as keyof NormalizeSettings] as number} onChange={(e) => updateNormalizeSetting(`cropPercent${side}` as keyof NormalizeSettings, Number(e.target.value) as never)} />
                              </div>
                            ))}
                          </div>
                        )}
                        {normalizeSettings.cropMode === 'sides-px' && (
                          <div className="two-col">
                            {(['Left', 'Right', 'Top', 'Bottom'] as const).map((side) => (
                              <div key={side}>
                                <label className="field-label">{side} px</label>
                                <input className="field-input" type="number" min={0} step={1} value={normalizeSettings[`cropPixels${side}` as keyof NormalizeSettings] as number} onChange={(e) => updateNormalizeSetting(`cropPixels${side}` as keyof NormalizeSettings, Number(e.target.value) as never)} />
                              </div>
                            ))}
                          </div>
                        )}
                        {normalizeSettings.cropMode === 'template' && (
                          <div className="crop-box">
                            <button className="btn btn-sm" type="button" onClick={() => { if (!activePhoto) { setNotice('Select a photo first.'); return } setIsNormalizeCropPicking((v) => !v); setNormalizeCropDraft(null); pointerSessionRef.current = { mode: 'idle' } }} disabled={isNormalizing}>
                              {isNormalizeCropPicking ? 'Cancel' : 'Draw with mouse'}
                            </button>
                            <div className="btn-row">
                              <button className="btn btn-sm" type="button" onClick={applyTemplateFromCurrentCrop} disabled={isNormalizing || !activeNormalizeCrop}>From preview</button>
                              <button className="btn btn-sm" type="button" onClick={detectFrameOnActivePhoto} disabled={isBusy || isNormalizing}>Auto frame</button>
                              <button className="btn btn-sm" type="button" onClick={detectContentAwareCropOnActivePhoto} disabled={isBusy || isNormalizing}>Smart crop</button>
                            </div>
                            {normalizeSettings.templateCropNormalized && (
                              <p className="tiny-note">x {Math.round(normalizeSettings.templateCropNormalized.x * 100)}% y {Math.round(normalizeSettings.templateCropNormalized.y * 100)}% w {Math.round(normalizeSettings.templateCropNormalized.width * 100)}% h {Math.round(normalizeSettings.templateCropNormalized.height * 100)}%</p>
                            )}
                            <button className="btn btn-sm" type="button" onClick={() => { updateNormalizeSetting('templateCropNormalized', null); setNormalizeCropDraft(null); setIsNormalizeCropPicking(false) }} disabled={isNormalizing}>Reset template</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Colors task */}
              {(() => {
                const taskId: BatchTaskId = 'colors'
                const isActive = activeBatchTasks.has(taskId)
                const isExpanded = expandedBatchTasks.has(taskId)
                return (
                  <div className="batch-task-card">
                    <div className="batch-task-header" onClick={() => toggleExpandBatchTask(taskId)}>
                      <input type="checkbox" className="batch-task-checkbox" checked={isActive} onChange={(e) => { e.stopPropagation(); toggleBatchTask(taskId) }} onClick={(e) => e.stopPropagation()} />
                      <span className="batch-task-title"><Icon name="palette" size={14} /> Adjust colors</span>
                      <span className={`batch-task-chevron${isExpanded ? ' open' : ''}`}><Icon name="expand_more" size={16} /></span>
                    </div>
                    {isExpanded && isActive && (
                      <div className="batch-task-body">
                        <div className="color-presets">
                          {COLOR_PRESETS.filter((p) => !['faded', 'newspaper', '4-colors'].includes(p.id)).map((p) => (
                            <button key={p.id} type="button" className={`color-preset-btn${colorAdj.preset === p.id ? ' active' : ''}`} onClick={() => setColorPreset(p.id)}>{p.label}</button>
                          ))}
                        </div>
                        <div className="color-sliders">
                          {([['brightness', 'Brightness'], ['contrast', 'Contrast'], ['saturation', 'Saturation'], ['shadows', 'Shadows'], ['highlights', 'Highlights']] as [keyof ColorAdjustments, string][]).map(([key, label]) => (
                            <div key={key} className="color-slider-row">
                              <span className="color-slider-label">{label}</span>
                              <input type="range" className="color-slider-input" min={-100} max={100} value={colorAdj[key] as number} onChange={(e) => setColorAdj((cur) => ({ ...cur, [key]: Number(e.target.value), preset: 'none' }))} />
                              <span className="color-slider-val">{(colorAdj[key] as number) > 0 ? '+' : ''}{colorAdj[key]}</span>
                            </div>
                          ))}
                        </div>
                        <div className="color-actions">
                          <button className="btn btn-sm btn-primary" type="button" onClick={applyColorAdjToActive} disabled={!activePhoto}>Apply to photo</button>
                          <button className="btn btn-sm" type="button" onClick={() => setColorAdj(DEFAULT_COLOR_ADJUSTMENTS)}>Reset</button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Glitch & Transform task */}
              {(() => {
                const taskId: BatchTaskId = 'glitch'
                const isActive = activeBatchTasks.has(taskId)
                const isExpanded = expandedBatchTasks.has(taskId)
                return (
                  <div className="batch-task-card">
                    <div className="batch-task-header" onClick={() => toggleExpandBatchTask(taskId)}>
                      <input type="checkbox" className="batch-task-checkbox" checked={isActive} onChange={(e) => { e.stopPropagation(); toggleBatchTask(taskId) }} onClick={(e) => e.stopPropagation()} />
                      <span className="batch-task-title"><Icon name="auto_fix_high" size={14} /> Glitch & Transform</span>
                      <span className={`batch-task-chevron${isExpanded ? ' open' : ''}`}><Icon name="expand_more" size={16} /></span>
                    </div>
                    {isExpanded && isActive && (
                      <div className="batch-task-body">
                        <div>
                          <label className="field-label">Effect type</label>
                          <select className="field-select" value={normalizeSettings.glitchSubEffect} onChange={(e) => updateNormalizeSetting('glitchSubEffect', e.target.value as GlitchSubEffect)}>
                            <option value="halftone">Halftone</option>
                            <option value="pixel-shift">Pixel shift</option>
                            <option value="color-shift">Color shift</option>
                            <option value="glitch">Glitch (RGB)</option>
                          </select>
                        </div>
                        {(normalizeSettings.glitchSubEffect === 'glitch') && (
                          <div>
                            <span className="field-label">Amount: {normalizeSettings.glitchAmount}</span>
                            <input type="range" className="field-range" min={1} max={100} value={normalizeSettings.glitchAmount} onChange={(e) => updateNormalizeSetting('glitchAmount', Number(e.target.value))} />
                            <span className="field-label">Seed: {normalizeSettings.glitchSeed}</span>
                            <input type="range" className="field-range" min={1} max={200} value={normalizeSettings.glitchSeed} onChange={(e) => updateNormalizeSetting('glitchSeed', Number(e.target.value))} />
                          </div>
                        )}
                        {normalizeSettings.glitchSubEffect === 'halftone' && (
                          <div>
                            <span className="field-label">Dot size: {normalizeSettings.halftoneDotSize}px</span>
                            <input type="range" className="field-range" min={2} max={20} value={normalizeSettings.halftoneDotSize} onChange={(e) => updateNormalizeSetting('halftoneDotSize', Number(e.target.value))} />
                            <label className="field-label">Shape</label>
                            <select className="field-select" value={normalizeSettings.halftoneShape} onChange={(e) => updateNormalizeSetting('halftoneShape', e.target.value as NormalizeSettings['halftoneShape'])}>
                              <option value="circle">Circle</option>
                              <option value="square">Square</option>
                              <option value="triangle">Triangle</option>
                            </select>
                          </div>
                        )}
                        {(normalizeSettings.glitchSubEffect === 'pixel-shift' || normalizeSettings.glitchSubEffect === 'color-shift') && (
                          <div>
                            <span className="field-label">Intensity: {normalizeSettings.glitchAmount}</span>
                            <input type="range" className="field-range" min={1} max={60} value={normalizeSettings.glitchAmount} onChange={(e) => updateNormalizeSetting('glitchAmount', Number(e.target.value))} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Anonymize batch task */}
              {(() => {
                const taskId: BatchTaskId = 'anonymize'
                const isActive = activeBatchTasks.has(taskId)
                const isExpanded = expandedBatchTasks.has(taskId)
                return (
                  <div className="batch-task-card">
                    <div className="batch-task-header" onClick={() => toggleExpandBatchTask(taskId)}>
                      <input type="checkbox" className="batch-task-checkbox" checked={isActive} onChange={(e) => { e.stopPropagation(); toggleBatchTask(taskId) }} onClick={(e) => e.stopPropagation()} />
                      <span className="batch-task-title"><Icon name="face_retouching_natural" size={14} /> Auto-Anonymize</span>
                      <span className={`batch-task-chevron${isExpanded ? ' open' : ''}`}><Icon name="expand_more" size={16} /></span>
                    </div>
                    {isExpanded && isActive && (
                      <div className="batch-task-body">
                        <div>
                          <label className="field-label">Effect</label>
                          <select className="field-select" value={normalizeSettings.batchAnonymizeEffect} onChange={(e) => updateNormalizeSetting('batchAnonymizeEffect', e.target.value)} disabled={isNormalizing}>
                            {EFFECTS.map((ef) => (
                              <option key={ef.id} value={ef.id}>{ef.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <span className="field-label">Strength: {normalizeSettings.batchAnonymizeStrength}%</span>
                          <div className="tb-quality-wrap" style={{ marginTop: '0.25rem' }}>
                            <input className="tb-quality-slider" type="range" min={10} max={100} value={normalizeSettings.batchAnonymizeStrength} onChange={(e) => updateNormalizeSetting('batchAnonymizeStrength', Number(e.target.value))} disabled={isNormalizing} />
                            <input className="tb-quality-num" type="number" min={10} max={100} value={normalizeSettings.batchAnonymizeStrength} onChange={(e) => updateNormalizeSetting('batchAnonymizeStrength', Math.min(100, Math.max(10, Number(e.target.value))))} disabled={isNormalizing} />
                          </div>
                        </div>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                          Detects faces automatically and applies the selected effect to all found zones.
                        </p>
                      </div>
                    )}
                  </div>
                )
              })()}

            </div>
            </div>
          )}
        </div>

        {/* ── Editor area ─────────────────────────────────── */}
        <div className="editor-area">

          {/* ── Action toolbar — Tools Bar ──────────────────── */}
          <div className="action-toolbar">
            {activePhoto ? (
              <>
                {/* Filename chip — portal tooltip so it escapes overflow-y:hidden toolbar */}
                <span
                  ref={filenameTipRef}
                  className="tb-filename"
                  onMouseEnter={() => {
                    const r = filenameTipRef.current?.getBoundingClientRect()
                    if (r) setFilenameTipPos({ top: r.bottom + 6, left: r.left })
                  }}
                  onMouseLeave={() => setFilenameTipPos(null)}
                >
                  {activePhoto.name.split('/').pop()}
                </span>
                {filenameTipPos && createPortal(
                  <div style={{
                    position: 'fixed', top: filenameTipPos.top, left: filenameTipPos.left,
                    background: 'var(--panel-bg)', border: '1px solid var(--border)',
                    borderRadius: 5, padding: '0.3rem 0.55rem', fontSize: '0.7rem',
                    color: 'var(--text-secondary)', whiteSpace: 'normal', wordBreak: 'break-all',
                    maxWidth: 380, zIndex: 9999, boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                    pointerEvents: 'none',
                  }}>
                    {activePhoto.name}
                  </div>,
                  document.body
                )}

                <div className="tb-sep" />

                {/* Resolution — always-editable inline inputs, resize on blur/Enter */}
                {/* Accent outline only when value differs from actual image size */}
                <div className="tb-res-edit">
                  <input
                    className={`tb-res-input${resEditW > 0 && resEditW !== (activeImageSize?.width ?? 0) ? ' tb-res-input--dirty' : ''}`}
                    type="number"
                    value={resEditW > 0 ? resEditW : (activeImageSize?.width ?? 0)}
                    min={1}
                    max={25000}
                    title="Width — press Enter or Tab to resize"
                    onChange={(e) => setResEditW(Number(e.target.value))}
                    onFocus={() => { setResEditW(activeImageSize?.width ?? 0); setResEditH(activeImageSize?.height ?? 0) }}
                    onBlur={() => { if (resEditW > 0 && resEditH > 0) resizeWorkCanvas() }}
                    onKeyDown={(e) => { if (e.key === 'Enter') resizeWorkCanvas() }}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>×</span>
                  <input
                    className={`tb-res-input${resEditH > 0 && resEditH !== (activeImageSize?.height ?? 0) ? ' tb-res-input--dirty' : ''}`}
                    type="number"
                    value={resEditH > 0 ? resEditH : (activeImageSize?.height ?? 0)}
                    min={1}
                    max={25000}
                    title="Height — press Enter or Tab to resize"
                    onChange={(e) => setResEditH(Number(e.target.value))}
                    onFocus={() => { setResEditW(activeImageSize?.width ?? 0); setResEditH(activeImageSize?.height ?? 0) }}
                    onBlur={() => { if (resEditW > 0 && resEditH > 0) resizeWorkCanvas() }}
                    onKeyDown={(e) => { if (e.key === 'Enter') resizeWorkCanvas() }}
                  />
                </div>

                <div className="tb-sep" />

                {/* Format */}
                <select
                  className="tb-select"
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as NormalizeFormat)}
                  title="Export format"
                >
                  <option value="image/jpeg">JPG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WebP</option>
                  <option value="image/bmp">BMP</option>
                  <option value="image/gif">GIF</option>
                  <option value="image/tiff">TIFF</option>
                  {svgPreview && <option value="image/svg+xml">SVG (vector)</option>}
                </select>

                {/* PNG depth selector — quantization reduces file size at the cost of color precision */}
                {exportFormat === 'image/png' && (
                  <select
                    className="tb-select"
                    value={exportPngDepth}
                    onChange={(e) => setExportPngDepth(e.target.value as PngDepth)}
                    title="PNG color depth — reducing colors makes the file smaller while keeping lossless encoding"
                  >
                    <option value="full">32-bit (full)</option>
                    <option value="reduced">24-bit (smaller)</option>
                    <option value="minimal">16-bit (smallest)</option>
                  </select>
                )}

                {/* Quality slider+number — only for lossy formats */}
                {exportFormat !== ('image/svg+xml' as NormalizeFormat) && !isLosslessFormat(exportFormat) && (
                  <div className="tb-quality-wrap">
                    <input
                      className="tb-quality-slider"
                      type="range"
                      min={1}
                      max={100}
                      value={exportQuality}
                      onChange={(e) => setExportQuality(Number(e.target.value))}
                      title={`Quality: ${exportQuality}%`}
                    />
                    <input
                      className="tb-quality-num"
                      type="number"
                      min={1}
                      max={100}
                      value={exportQuality}
                      onChange={(e) => setExportQuality(Math.min(100, Math.max(1, Number(e.target.value))))}
                      title="Quality (1–100)"
                    />
                  </div>
                )}

                {/* File size indicator */}
                {previewFileSizeKb !== null && (
                  <span className="tb-filesize" title="Estimated export file size">
                    ~{previewFileSizeKb} KB
                  </span>
                )}

                {/* SVG vectorize toggle */}
                {activePhoto && !activePhoto.isVideo && (
                  <button
                    className={`tb-btn${vectorizePanelOpen ? ' active' : ''}`}
                    type="button"
                    onClick={() => setVectorizePanelOpen((v) => !v)}
                    title="Vectorize image to SVG"
                    style={{ fontSize: '0.62rem' }}
                  >
                    <Icon name="polyline" size={13} /> Vectorize
                  </button>
                )}

                {activePhoto && !activePhoto.isVideo && sourceVideoPhoto && (
                  <>
                    <button
                      className="tb-btn"
                      type="button"
                      onClick={applySnapshotToSourceVideo}
                      disabled={isBusy}
                      title="Attach the current edited frame back to its source video for the next video render"
                    >
                      <Icon name="movie_edit" size={13} /> Apply Frame To Video
                    </button>
                    <button
                      className="tb-btn"
                      type="button"
                      onClick={jumpToSourceVideoFromSnapshot}
                      disabled={isBusy}
                      title="Jump back to the source video for this frame snapshot"
                    >
                      <Icon name="videocam" size={13} /> Open Source Video
                    </button>
                  </>
                )}

                {/* Download — anonymized file (local, no server / disk write) */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.3rem', flexShrink: 0, position: 'relative' }}>
                  <button
                    className="tb-btn"
                    style={{ background: '#3b5bdb', borderColor: '#3b5bdb', color: '#fff', fontWeight: 600 }}
                    type="button"
                    onClick={activePhoto?.isVideo
                      ? exportActiveVideo
                      : (exportFormat === ('image/svg+xml' as NormalizeFormat) ? exportAsSvg : exportActivePhoto)}
                    disabled={!activePhoto || isBusy || videoProcessing}
                    title="Download anonymized copy"
                  >
                    <Icon name="download" size={15} /> Download
                  </button>
                </div>
              </>
            ) : (
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                {photos.length === 0 ? 'Load photos to get started' : 'Select a photo'}
              </span>
            )}
          </div>

          {/* ── Canvas viewer ──────────────────────────────── */}
          <div
            className={[
              'viewer',
              showMobileEmbed ? 'viewer-mobile-pinch' : '',
              showMobileEmbed && toolMode === 'crop' ? 'viewer-crop-mode' : '',
              batchPanelOpen && !isNormalizeCropPicking ? 'viewer-readonly' : '',
              isNormalizeCropPicking ? 'viewer-crop-picking' : '',
              isDragOver ? 'drag-over' : '',
            ].filter(Boolean).join(' ')}
            ref={viewportRef}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Empty state / drop hint */}
            {!activePhoto && photos.length === 0 && !isDragOver && (
              <div className="drop-hint">
                <div className="drop-hint-icon"><Icon name="image" size={52} /></div>
                <div className="drop-hint-text">
                  Drop photos here<br />or use the explorer on the left
                </div>
                <div className="drop-hint-shortcut">
                  <kbd className="kbd">⌘V</kbd> paste from clipboard
                </div>
              </div>
            )}

            {/* Drag-over overlay */}
            {isDragOver && (
              <div className="drag-over-hint">
                <div className="drag-over-icon"><Icon name="folder_open" size={48} /></div>
                <div className="drag-over-text">Drop to add photos or folders</div>
              </div>
            )}

            {/* Folder scan progress overlay */}
            {folderScanState && (
              <div className="drag-over-hint">
                <div className="drag-over-icon" style={{ animation: 'spin 1.2s linear infinite' }}>
                  <Icon name="folder_open" size={48} />
                </div>
                <div className="drag-over-text">Scanning folder…</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                  {folderScanState.found} image{folderScanState.found !== 1 ? 's' : ''} found
                </div>
              </div>
            )}

            {/* Detecting overlay */}
            {isDetecting && (
              <div className="detecting-overlay" style={{ flexDirection: 'column', gap: '0.3rem', minWidth: 260, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>⏳</span>
                  <span>Detecting faces…</span>
                  <ElapsedTimer />
                </div>
                {activePhoto && (
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', maxWidth: 230, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activePhoto.name.split('/').pop()}
                  </span>
                )}
                {detectionStep && (
                  <span style={{ fontSize: '0.58rem', color: 'var(--accent)', opacity: 0.9 }}>{detectionStep}</span>
                )}
                <div className="local-proof-bar">
                  <div className="local-proof-progress" />
                  <span className="local-proof-label">
                    <Icon name="lock" size={10} /> All data stays on your device
                  </span>
                </div>
                <button
                  className="btn btn-sm"
                  type="button"
                  onClick={cancelDetection}
                  style={{ marginTop: '0.15rem', fontSize: '0.6rem', padding: '0.15rem 0.5rem' }}
                >
                  Stop
                </button>
              </div>
            )}
            {/* Local processing proof badge */}
            {!isDetecting && localProcessingMs != null && (
              <div className="local-proof-badge">
                <Icon name="verified_user" size={11} /> Processed locally in {localProcessingMs} ms
              </div>
            )}

            {/* Video processing overlay — desktop only; mobile sits under action row */}
            {videoProcessing && videoProgress && !isMobile && (
              <div className="detecting-overlay video-processing-overlay" style={{ flexDirection: 'column', gap: '0.6rem' }}>
                <span>🎬</span>
                <span>
                  {videoProgress.phase === 'analyzing'
                    ? 'Analyzing face tracks'
                    : videoProgress.phase === 'preparing'
                      ? 'Preparing frame map'
                      : videoProgress.phase === 'finishing'
                        ? 'Finalizing export'
                        : videoProgress.renderFrame != null && videoProgress.renderTotal
                          ? `Rendering frame ${videoProgress.renderFrame}/${videoProgress.renderTotal}`
                          : 'Rendering video'}… {videoProgress.current}/{videoProgress.total}
                </span>
                <div style={{ width: '60%', maxWidth: 300, height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${(videoProgress.current / videoProgress.total) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: 3, transition: 'width 0.1s' }} />
                </div>
                <button className="btn btn-sm" type="button" onClick={cancelVideoProcessing} style={{ marginTop: '0.3rem' }}>
                  Cancel
                </button>
              </div>
            )}

            {/* Video player — shown instead of canvas when a video is selected */}
            {activePhoto?.isVideo && activeVideoUrl && (
              <div className="video-player-wrap">
                <div className="video-stage">
                  <div className="video-media" ref={videoMediaRef}>
                    <video
                      key={`${activePhoto.id}-${processedVideoEpoch}-${activeVideoUrl}`}
                      ref={activeVideoRef}
                      src={activeVideoUrl}
                      className="video-player"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      onTimeUpdate={(event) => setActiveVideoTime(event.currentTarget.currentTime)}
                      onSeeked={(event) => setActiveVideoTime(event.currentTarget.currentTime)}
                      onLoadedMetadata={(event) => {
                        setActiveVideoTime(event.currentTarget.currentTime)
                        syncVideoContentLayout()
                        setVideoReadyTick((t) => t + 1)
                      }}
                      onLoadedData={() => setVideoReadyTick((t) => t + 1)}
                      onPlay={() => setVideoPlaying(true)}
                      onPause={() => setVideoPlaying(false)}
                      onEnded={() => setVideoPlaying(false)}
                    />
                    <canvas
                      ref={videoDistortPreviewCanvasRef}
                      className={`video-distort-preview${videoDistortPreviewVisible ? ' visible' : ''}`}
                      style={videoOverlayLayerStyle(videoContentLayout)}
                      aria-hidden="true"
                    />
                    <div
                      className={`video-mask-layer${videoMaskDrawActive ? ' drawing' : ''}`}
                      style={videoOverlayLayerStyle(videoContentLayout)}
                      onPointerDown={handleVideoMaskPointerDown}
                      onPointerMove={handleVideoMaskPointerMove}
                      onPointerUp={handleVideoMaskPointerUp}
                      onPointerCancel={handleVideoMaskPointerUp}
                    >
                      {showBoxes && !activePhoto.edited && !mobileGestureActive && videoPreviewFaceZones.map((zone) => (
                        <button
                          key={zone.id}
                          type="button"
                          className="video-face-rect"
                          style={{
                            left: `${zone.x * 100}%`,
                            top: `${zone.y * 100}%`,
                            width: `${zone.width * 100}%`,
                            height: `${zone.height * 100}%`,
                          }}
                          onClick={(event) => {
                            event.stopPropagation()
                            removeVideoPreviewFaceZone(zone.id)
                          }}
                          title="Exclude this face from anonymization"
                          aria-label="Exclude this face from anonymization"
                        >
                          <span className="video-face-rect-dismiss zone-delete-btn" aria-hidden="true">
                            <Icon name="close" size={12} />
                          </span>
                        </button>
                      ))}
                      {showBoxes && !activePhoto.edited && !mobileGestureActive && videoDismissedAtFrame.map((rect, index) => (
                        <button
                          key={`dismissed-${index}-${Math.round(rect.x * 1000)}`}
                          type="button"
                          className="video-face-rect video-face-rect--dismissed"
                          style={{
                            left: `${rect.x * 100}%`,
                            top: `${rect.y * 100}%`,
                            width: `${rect.width * 100}%`,
                            height: `${rect.height * 100}%`,
                          }}
                          onClick={(event) => {
                            event.stopPropagation()
                            restoreVideoPreviewFaceZone(rect)
                          }}
                          title="Restore anonymization for this face"
                          aria-label="Restore anonymization for this face"
                        >
                          <span className="video-face-rect-restore zone-delete-btn" aria-hidden="true">
                            <Icon name="add" size={12} />
                          </span>
                        </button>
                      ))}
                      {[...visibleVideoTimedZones.map((item) => item.zone), ...(videoDraftZone ? [videoDraftZone] : [])].map((zone) => (
                        <div
                          key={zone.id}
                          className={`video-mask-rect video-mask-rect--${zone.maskShape ?? 'rectangle'}${zone.id === 'draft-video-mask' ? ' draft' : ''}`}
                          style={{
                            left: `${zone.x * 100}%`,
                            top: `${zone.y * 100}%`,
                            width: `${zone.width * 100}%`,
                            height: `${zone.height * 100}%`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  {isMobile && (
                    <div className="mobile-video-bottom-controls">
                      <div className="mobile-video-bottom-controls__action">
                        {!videoProcessing && (
                          <div className="video-action-row mobile-canvas-bottom-bar mobile-canvas-bottom-bar--video mobile-canvas-bottom-bar--inline">
                            <button
                              type="button"
                              className="mobile-zoom-side-btn"
                              {...framePrevHold}
                              disabled={isBusy}
                              aria-label="Previous frame"
                            >
                              <Icon name="skip_previous" size={16} />
                            </button>
                            <div className="mobile-canvas-action-cluster">
                              {activeVideoFrameLabel && (
                                <div className="mobile-video-frame-indicator" aria-live="polite">
                                  {activeVideoFrameLabel}
                                </div>
                              )}
                              <button
                                type="button"
                                className={`mobile-canvas-secondary-btn${videoMaskDrawActive ? ' active' : ''}`}
                                onClick={() => setVideoMaskDrawActive((cur) => !cur)}
                                disabled={isBusy}
                              >
                                DRAW MASK
                              </button>
                              <button
                                type="button"
                                className="mobile-anonymize-btn"
                                onClick={processActiveVideo}
                                disabled={isBusy}
                              >
                                {autoDetect ? 'ANONYMIZE' : 'PROCESS'}
                              </button>
                              <button
                                type="button"
                                className="mobile-canvas-secondary-btn"
                                onClick={openCurrentVideoFrameAsSnapshot}
                                disabled={isBusy}
                              >
                                EDIT FRAME
                              </button>
                            </div>
                            <button
                              type="button"
                              className="mobile-zoom-side-btn"
                              {...frameNextHold}
                              disabled={isBusy}
                              aria-label="Next frame"
                            >
                              <Icon name="skip_next" size={16} />
                            </button>
                          </div>
                        )}
                        {videoProcessing && videoProgress && (
                          <MobileVideoProgress
                            phase={videoProgress.phase}
                            current={videoProgress.current}
                            total={videoProgress.total}
                            renderFrame={videoProgress.renderFrame}
                            renderTotal={videoProgress.renderTotal}
                            onCancel={cancelVideoProcessing}
                          />
                        )}
                      </div>
                      <div className={`mobile-video-bottom-controls__mask${videoMaskDrawActive && !videoProcessing ? '' : ' mobile-video-bottom-controls__mask--reserved'}`}>
                        {!videoProcessing && videoMaskDrawActive && <MobileDrawMaskPanel b={mobileBindings} />}
                      </div>
                    </div>
                  )}
                  {!videoProcessing && (
                  <>
                  <div className={`video-controls-bar${isMobile ? ' video-controls-bar--hidden-mobile' : ''}`}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <span>Export</span>
                      <select
                        className="field-select"
                        value={videoExportFormat}
                        onChange={(e) => setVideoExportFormat(e.target.value as VideoExportFormatId)}
                        disabled={videoProcessing || isBusy}
                        style={{ minWidth: 110 }}
                      >
                        {videoExportOptions.map((opt) => (
                          <option key={opt.id} value={opt.id} disabled={!opt.supported}>
                            {opt.label}{opt.supported ? '' : ' — unavailable'}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      className="btn btn-sm"
                      type="button"
                      {...framePrevHold}
                      disabled={videoProcessing || isBusy}
                      title="Step one frame back (hold to scrub)"
                      aria-label="Step one frame back"
                    >
                      <Icon name="skip_previous" size={16} />
                    </button>
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={processActiveVideo}
                      disabled={videoProcessing || isBusy}
                      style={{ margin: '0 16px' }}
                    >
                      <Icon name="auto_awesome" size={16} /> {hasPendingVideoEdits ? 'Apply & Anonymize' : 'Anonymize'}
                    </button>
                    <button
                      className={`btn btn-sm${videoMaskDrawActive ? ' active' : ''}`}
                      type="button"
                      onClick={() => setVideoMaskDrawActive((cur) => !cur)}
                      disabled={videoProcessing || isBusy}
                      title="Draw a rectangle over the video and bake it into a time range"
                    >
                      <Icon name="select" size={14} /> Draw Mask
                    </button>
                    <button
                      className="btn btn-sm"
                      type="button"
                      onClick={openCurrentVideoFrameAsSnapshot}
                      disabled={videoProcessing || isBusy}
                      title="Open the current video frame as an editable snapshot"
                    >
                      <Icon name="image" size={14} /> Edit Frame
                    </button>
                    <button
                      className="btn btn-sm"
                      type="button"
                      {...frameNextHold}
                      disabled={videoProcessing || isBusy}
                      title="Step one frame forward (hold to scrub)"
                      aria-label="Step one frame forward"
                    >
                      <Icon name="skip_next" size={16} />
                    </button>
                    {videoMaskDrawActive && (
                      <label className="video-mask-range-label">
                        <span>Range</span>
                        <input
                          type="number"
                          min={0.2}
                          max={30}
                          step={0.5}
                          value={videoMaskRangeSec}
                          onChange={(event) => setVideoMaskRangeSec(clamp(Number(event.target.value) || 0.2, 0.2, 30))}
                          disabled={videoProcessing || isBusy}
                        />
                        <span>s</span>
                      </label>
                    )}
                    {activeVideoTimedZones.length > 0 && (
                      <button className="btn btn-sm" type="button" onClick={clearVideoTimedZones} disabled={videoProcessing} title="Remove all timeline masks">
                        <Icon name="layers_clear" size={14} /> Reset Masks
                      </button>
                    )}
                    {activePhoto.videoDuration != null && (
                      <span className="video-meta-badge">
                        {formatVideoTime(activePhoto.videoDuration)}
                        {activePhoto.videoWidth ? ` · ${activePhoto.videoWidth}×${activePhoto.videoHeight}` : ''}
                        {activePhoto.videoFps ? ` · ${Math.round(activePhoto.videoFps)} fps` : ''}
                      </span>
                    )}
                  </div>
                  <div className="video-timeline-row">
                    <button
                      type="button"
                      className="btn btn-sm video-timeline-play"
                      onClick={toggleVideoPlayback}
                      disabled={videoProcessing || isBusy}
                      aria-label={videoPlaying ? 'Pause video' : 'Play video'}
                    >
                      <Icon name={videoPlaying ? 'pause' : 'play_arrow'} size={18} />
                    </button>
                    <div className="video-timeline-track-wrap">
                      <input
                        type="range"
                        className="video-timeline-scrubber"
                        min={0}
                        max={activePhoto.videoDuration ?? activeVideoRef.current?.duration ?? 0}
                        step={0.001}
                        value={activeVideoTime}
                        disabled={videoProcessing || isBusy}
                        aria-label="Video timeline"
                        onChange={(event) => seekActiveVideo(parseFloat(event.target.value))}
                      />
                      {activeVideoFrameOverrides.length > 0 && Number.isFinite(activePhoto.videoDuration) && (activePhoto.videoDuration ?? 0) > 0 && (
                        <div className="video-frame-marker-layer" aria-hidden="true">
                          {activeVideoFrameOverrides.map((item) => (
                            <span
                              key={`${item.timeSec}`}
                              className="video-frame-marker"
                              style={{ left: `${clamp((item.timeSec / (activePhoto.videoDuration ?? 1)) * 100, 0, 100)}%` }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="video-timeline-time">
                      {formatVideoTime(activeVideoTime)}
                      {activePhoto.videoDuration != null ? ` / ${formatVideoTime(activePhoto.videoDuration)}` : ''}
                    </span>
                  </div>
                  </>
                  )}
                </div>
              </div>
            )}

            <div
              ref={mobilePreviewTransformRef}
              className={isMobile && activePhoto && !activePhoto.isVideo ? 'mobile-preview-transform' : undefined}
            >
              <canvas
                ref={canvasRef}
                className={batchPanelOpen && !isNormalizeCropPicking ? 'readonly-canvas' : ''}
                style={activePhoto?.isVideo ? { display: 'none' } : (toolMode === 'crop' ? { cursor: 'crosshair', touchAction: 'none' } : undefined)}
                onPointerDown={handleCanvasPointerDown}
                onPointerMove={handleCanvasPointerMove}
                onPointerUp={handleCanvasPointerUp}
                onPointerCancel={handleCanvasPointerUp}
                onWheel={handleCanvasWheel}
                onPointerLeave={() => {
                  handleCanvasPointerUp()
                  setCursorPoint(null)
                  const overlay = overlayCanvasRef.current
                  if (overlay) { const oc = overlay.getContext('2d'); if (oc) oc.clearRect(0, 0, overlay.width, overlay.height) }
                }}
              />
              {/* Brush preview overlay */}
              <canvas ref={overlayCanvasRef} className="brush-preview-overlay" />

              {/* Zone × delete buttons overlay */}
              {showBoxes && toolMode !== 'crop' && !activePhoto?.isVideo && zoneOverlayRects.length > 0 && (
                <div className="zone-delete-layer" style={{ pointerEvents: toolMode === 'brush' ? 'none' : undefined }}>
                  {zoneOverlayRects.map(({ id, x, y, width, height }) => (
                    <button
                      key={id}
                      className="zone-overlay-hit"
                      type="button"
                      style={{ left: x, top: y, width, height }}
                      onClick={(e) => { e.stopPropagation(); removeZoneById(id) }}
                      title="Remove this face box"
                      aria-label="Remove this face box"
                    >
                      <span className="zone-delete-btn zone-overlay-hit-icon" aria-hidden="true">
                        <Icon name="close" size={12} />
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {toolMode === 'crop' && isMobile && (
                <div className="mobile-crop-hint" aria-live="polite">
                  Drag to select the crop area
                </div>
              )}

              {/* Crop draft overlay */}
              {toolMode === 'crop' && cropDraft && cropDraft.w > 0.0005 && cropDraft.h > 0.0005 && (() => {
                const t = transformRef.current
                const rect = zoneToCanvasRect({
                  id: 'crop',
                  x: cropDraft.x,
                  y: cropDraft.y,
                  width: cropDraft.w,
                  height: cropDraft.h,
                  effect: 'blur',
                  emoji: '',
                }, t)
                return (
                  <div
                    className="mobile-crop-selection"
                    style={{
                      position: 'absolute', left: rect.x, top: rect.y, width: rect.width, height: rect.height,
                      pointerEvents: 'none', boxSizing: 'border-box',
                    }}
                  />
                )
              })()}

              {/* SVG vectorize preview overlay */}
              {vectorizePanelOpen && svgPreviewUrl && (() => {
                const t = transformRef.current
                const hasFrame = t.drawWidth > 0 && t.drawHeight > 0
                return (
                  <div
                    className="svg-preview-overlay"
                    style={hasFrame ? { left: t.drawX, top: t.drawY, width: t.drawWidth, height: t.drawHeight } : undefined}
                  >
                    <img src={svgPreviewUrl} alt="SVG vectorized preview" />
                  </div>
                )
              })()}
            </div>

            {/* Vectorize panel — flyout from toolbar */}
            {vectorizePanelOpen && activePhoto && !activePhoto.isVideo && !isMobile && (
              <div className="vectorize-panel">
                <div className="vectorize-panel-header">
                  <span style={{ fontWeight: 600, fontSize: '0.72rem' }}>Vectorize to SVG</span>
                  {vectorizing && <span className="vectorize-spinner">⏳</span>}
                  {svgPreviewSize != null && !vectorizing && (
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>~{Math.round(svgPreviewSize / 1024)} KB</span>
                  )}
                </div>

                <label className="vectorize-label">Preset</label>
                <select
                  className="field-select"
                  value={vectorizeParams.preset}
                  onChange={(e) => {
                    const preset = e.target.value as VectorizePreset
                    const next = { ...vectorizeParams, preset }
                    setVectorizeParams(next)
                    runVectorizePreview(next)
                  }}
                >
                  {VECTORIZE_PRESETS.map((p) => (
                    <option key={p.id} value={p.id} title={p.desc}>{p.label}</option>
                  ))}
                </select>

                {vectorizeParams.preset === 'default' && (
                  <div className="tool-panel-sliders">
                    <ToolSliderRow
                      label="Colors"
                      min={2}
                      max={64}
                      value={vectorizeParams.colorCount}
                      onChange={(v) => updateVectorizeParam('colorCount', v)}
                    />
                    <ToolSliderRow
                      label="Smooth"
                      min={0.5}
                      max={10}
                      step={0.5}
                      value={vectorizeParams.minPathLength}
                      format={(v) => v.toFixed(1)}
                      onChange={(v) => updateVectorizeParam('minPathLength', v)}
                    />
                    <ToolSliderRow
                      label="Corners"
                      min={0}
                      max={2}
                      step={0.1}
                      value={vectorizeParams.cornerThreshold}
                      format={(v) => v.toFixed(1)}
                      onChange={(v) => updateVectorizeParam('cornerThreshold', v)}
                    />
                  </div>
                )}

                {vectorizing && (
                  <div className="vectorize-progress">
                    <div className="vectorize-progress-bar" />
                  </div>
                )}

                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={exportAsSvg}
                  disabled={isBusy || vectorizing}
                  style={{ marginTop: '0.4rem', width: '100%' }}
                >
                  <Icon name="download" size={14} /> Download SVG
                </button>
              </div>
            )}

            {/* Save snapshot — bottom-left (shown when photo has edits, not for video) */}
            {activePhoto && !activePhoto.isVideo && (dirtyByPhoto[activePhoto.id] || zonesAnonymized) && !batchPanelOpen && (
              <button
                className="snapshot-corner-btn"
                type="button"
                onClick={saveSnapshot}
                disabled={isBusy}
                title="Save a snapshot of the current state as a new image in the explorer"
              >
                <Icon name="add_a_photo" size={13} /> Save snapshot
              </button>
            )}

            {/* Quality preview progress — bottom-left mini bar */}
            {previewRendering && (
              <div className="preview-progress-bar">
                <div className="preview-progress-track">
                  <div className="preview-progress-fill" />
                </div>
                <span className="preview-progress-label">Rendering preview…</span>
              </div>
            )}

            {/* Undo + Reset — top-left (shown when photo has edits) */}
            {activePhoto && (activePhoto.edited || dirtyByPhoto[activePhoto.id] || undoCount > 0) && (
              <div className="undo-corner-group">
                {undoCount > 0 && (
                  <button
                    className="undo-corner-btn"
                    type="button"
                    onClick={undo}
                    title="Undo last edit"
                  >
                    <Icon name="undo" size={14} /> Undo
                  </button>
                )}
                <button
                  className="undo-corner-btn"
                  type="button"
                  onClick={resetPhotoToOriginal}
                  title="Reset photo to original — undo all edits"
                >
                  <Icon name="restart_alt" size={14} /> Reset
                </button>
              </div>
            )}

            {/* Bottom-right: Crop confirm OR Anonymize button */}
            {activePhoto && toolMode === 'crop' && (
              <div className="viewer-corner">
                <button
                  className="corner-btn corner-btn-primary"
                  type="button"
                  onClick={cropToSelection}
                  disabled={isBusy || !cropDraft || (cropDraft.w < 0.002 && cropDraft.h < 0.002)}
                  title="Confirm crop selection"
                >
                  <Icon name="crop" size={13} /> Crop
                </button>
              </div>
            )}
            {activePhoto && toolMode !== 'crop' && activeZones.length > 0 && !zonesAnonymized && (
              <div className="viewer-corner">
                <button
                  className="corner-btn corner-btn-primary"
                  type="button"
                  onClick={applyZones}
                  disabled={isBusy}
                  title={`Apply anonymization to ${activeZones.length} zone${activeZones.length !== 1 ? 's' : ''}`}
                >
                  Anonymize
                </button>
              </div>
            )}
          </div>

          {showMobileEmbed && activePhoto && !activePhoto.isVideo && (
            <MobileImageCanvasControls b={mobileBindings} />
          )}

        </div>
        </>)}
      </div>

      {aboutOpen && (
        <MobileAbout
          open={aboutOpen}
          onClose={() => setAboutOpen(false)}
          onFeedback={() => { setFeedbackOpen(true) }}
        />
      )}

      <EffectPickerDialog
        open={effectPickerOpen != null && !((isMobile || desktopLiveOpen) && (effectPickerOpen === 'emoji' || effectPickerOpen === 'custom-image'))}
        kind={effectPickerOpen}
        onClose={() => setEffectPickerOpen(null)}
        emojiRandom={emojiRandom}
        selectedEmoji={selectedEmoji}
        onToggleEmojiRandom={handleToggleEmojiRandom}
        onPickEmoji={handlePickEmoji}
        customImageRandom={customImageRandom}
        customImageSource={customImageSource}
        customImageAssets={customImageAssets}
        customImagePresetLoading={customImagePresetLoading}
        selectedCustomImageId={selectedCustomImageId}
        onToggleCustomRandom={handleToggleCustomRandom}
        onChangeCustomSource={(source) => { void loadCustomImagePreset(source) }}
        onPickCustomImage={handlePickCustomImage}
        onUploadCustomImages={openCustomImagePicker}
      />

      <ModelLoadStatus
        active={detectorLoading}
        progress={modelLoadProgress}
        variant={
          (isMobile && photos.length === 0 && mobileMode !== 'live') || (!isMobile && photos.length === 0)
            ? 'overlay'
            : 'toast'
        }
      />

      {!isMobile && desktopLiveOpen && (
        <div className="desktop-live-overlay">
          <MobileLiveMode
            b={mobileBindings}
            onOpenLibrary={() => { setDesktopLiveOpen(false); openUnifiedPicker() }}
            onOpenCapturedPhoto={(id) => {
              setDesktopLiveOpen(false)
              mobileBindings.openPhotoInEditor(id)
            }}
            onExitToWorkspace={() => setDesktopLiveOpen(false)}
            onFallbackUpload={openUnifiedPicker}
            onCaptureSaved={(blob) => mobileBindings.addLiveMediaToLibrary(blob, { stayInLive: true })}
          />
        </div>
      )}

      {/* ── Feedback modal (overlays the About screen) ──────────── */}
      {feedbackOpen && (
        <div className="feedback-backdrop" onClick={() => setFeedbackOpen(false)}>
          <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
            <button className="about-modal-close" type="button" onClick={() => setFeedbackOpen(false)} aria-label="Close">
              <Icon name="close" size={18} />
            </button>
            <h2 className="feedback-modal-title">Send Feedback</h2>
            <p className="feedback-modal-desc">
              We'd love to hear from you! Your message will be sent to the W3PN team.
            </p>
            <textarea
              className="feedback-textarea"
              rows={6}
              placeholder="Tell us what you think, report a bug, or suggest a feature…"
              value={feedbackMsg}
              onChange={(e) => setFeedbackMsg(e.target.value)}
            />
            <div className="feedback-modal-actions">
              <button className="btn btn-sm" type="button" onClick={() => setFeedbackOpen(false)}>Cancel</button>
              <a
                className="btn btn-sm btn-primary feedback-modal-send"
                href={`mailto:web3privacynow@protonmail.com?subject=${encodeURIComponent('W3PN Anonymizer Feedback')}&body=${encodeURIComponent(feedbackMsg)}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => { setFeedbackOpen(false); setFeedbackMsg(''); setNotice('Opening mail client…') }}
              >
                <Icon name="send" size={13} /> Send
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
