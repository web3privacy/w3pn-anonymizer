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
import { detectFaces, initializeDetector, resetDetectorStatus, getDetectorStatus, checkDeps, triggerInstall, setForceLocal, setDetectionProgressCallback, getFaceApiBackendName } from './lib/detector'
import type { DepsStatus, InstallResult } from './lib/detector'
import { EFFECTS, applyColorAdjustments, applyEffectBrush, applyEffectRect, applyGlitchEffect, pickRandomEmoji, pickUniqueEmojis, previewEffectBrush } from './lib/effects'
import type { PixelShiftType } from './lib/effects'
import { canvasToBmpBlob, canvasToGifBlob, canvasToTiffBlob, FORMAT_EXT, isLosslessFormat } from './lib/image-encoders'
import { canvasToSvg, canvasToSvgBlob, VECTORIZE_PRESETS, DEFAULT_VECTORIZE_PARAMS, type VectorizeParams, type VectorizePreset } from './lib/vectorize'
import { extractPosterFrame, getSupportedVideoExportOptions, getVideoMetadata, getVideoPipelineCapabilities, mimeTypeToVideoExtension, processVideo, type VideoExportFormatId, type VideoFrameOverride, type VideoProcessingPhase, type VideoTimedZone } from './lib/video'
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
  DetectorStatus,
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

// Material Symbol icon helper
const Icon = ({ name, filled = false, size = 20 }: { name: string; filled?: boolean; size?: number }) => (
  <span
    className={`material-symbols-outlined${filled ? ' ms-filled' : ''}`}
    style={{ fontSize: size }}
    aria-hidden="true"
  >
    {name}
  </span>
)

interface DrawTransform {
  drawX: number
  drawY: number
  drawWidth: number
  drawHeight: number
  imageWidth: number
  imageHeight: number
  scale: number
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

const DEMO_IMAGES = [
  './demo/demo-1.webp',
  './demo/demo-2.webp',
  './demo/demo-3.jpg',
  './demo/demo-4.png',
  './demo/demo-5.png',
]

const OPEN_SOURCE_CANDIDATES = [
  { name: 'vladmandic/face-api', url: 'https://github.com/vladmandic/face-api', note: 'Local Tiny Face Detector running entirely in the browser via TensorFlow.js/WebGL.' },
  { name: 'opencv/opencv (YuNet)', url: 'https://github.com/opencv/opencv', note: 'High-accuracy face detection via the optional local Python backend (FastAPI).' },
  { name: 'imagetracer.js', url: 'https://github.com/nicholasgasior/imagetracerjs', note: 'Raster-to-SVG vectorization with configurable presets — fully browser-based.' },
  { name: 'nodeca/pica', url: 'https://github.com/nodeca/pica', note: 'High-quality in-browser image resizing (Lanczos filter, Web Workers).' },
  { name: 'Donaldcwl/browser-image-compression', url: 'https://github.com/Donaldcwl/browser-image-compression', note: 'Worker-based JPEG/WebP compression in batch mode.' },
  { name: 'jwagner/smartcrop.js', url: 'https://github.com/jwagner/smartcrop.js', note: 'Content-aware smart crop suggestion.' },
  { name: '9am/img-halftone', url: 'https://github.com/9am/img-halftone', note: 'Canvas-based halftone pattern effect.' },
  { name: 'Stuk/jszip', url: 'https://github.com/Stuk/jszip', note: 'Client-side ZIP archive creation for batch export.' },
  { name: 'eligrey/FileSaver.js', url: 'https://github.com/eligrey/FileSaver.js', note: 'File download trigger for browsers.' },
  { name: 'Electron', url: 'https://www.electronjs.org', note: 'Desktop app shell for macOS, Windows, and Linux builds.' },
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

const getInitialTheme = (): ThemeMode => {
  const s = localStorage.getItem('anonymizer-theme')
  if (s === 'light' || s === 'dark') return s
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
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
}


const zoneToCanvasRect = (zone: Zone, t: DrawTransform) => ({
  x: t.drawX + zone.x * t.drawWidth,
  y: t.drawY + zone.y * t.drawHeight,
  width: zone.width * t.drawWidth,
  height: zone.height * t.drawHeight,
})

const normalizedRectToCanvasRect = (rect: NormalizedRect, t: DrawTransform) => ({
  x: t.drawX + rect.x * t.drawWidth,
  y: t.drawY + rect.y * t.drawHeight,
  width: rect.width * t.drawWidth,
  height: rect.height * t.drawHeight,
})

const drawNormalizeCropOverlay = (ctx: CanvasRenderingContext2D, rect: NormalizedRect, t: DrawTransform, isDraft: boolean) => {
  const cr = normalizedRectToCanvasRect(rect, t)
  const x = Math.max(t.drawX, cr.x)
  const y = Math.max(t.drawY, cr.y)
  const maxX = Math.min(t.drawX + t.drawWidth, cr.x + cr.width)
  const maxY = Math.min(t.drawY + t.drawHeight, cr.y + cr.height)
  const w = Math.max(1, maxX - x)
  const h = Math.max(1, maxY - y)
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.42)'
  ctx.fillRect(t.drawX, t.drawY, t.drawWidth, y - t.drawY)
  ctx.fillRect(t.drawX, y, x - t.drawX, h)
  ctx.fillRect(x + w, y, t.drawX + t.drawWidth - (x + w), h)
  ctx.fillRect(t.drawX, y + h, t.drawWidth, t.drawY + t.drawHeight - (y + h))
  ctx.strokeStyle = isDraft ? '#f59e0b' : '#64a7ff'
  ctx.lineWidth = isDraft ? 2.6 : 2
  ctx.strokeRect(x, y, w, h)
  ctx.restore()
}

// Outline-only zones: no fill, no label text
const drawZoneOutline = (ctx: CanvasRenderingContext2D, zone: Zone, t: DrawTransform, selected: boolean) => {
  const rect = zoneToCanvasRect(zone, t)
  ctx.save()
  ctx.strokeStyle = selected ? '#ff7a1a' : '#2f81f7'
  ctx.lineWidth = selected ? 2.5 : 1.8
  ctx.setLineDash(selected ? [] : [])
  ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
  // Resize handle square at bottom-right corner (selected only)
  if (selected) {
    const hs = 8
    ctx.fillStyle = '#ff7a1a'
    ctx.fillRect(rect.x + rect.width - hs / 2, rect.y + rect.height - hs / 2, hs, hs)
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

// Closed-eye SVG icon for brand
const EyeClosedIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

function App() {
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null)
  const [zonesByPhoto, setZonesByPhoto] = useState<Record<string, Zone[]>>({})
  const [dirtyByPhoto, setDirtyByPhoto] = useState<Record<string, boolean>>({})
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)
  const [toolMode, setToolMode] = useState<ToolMode>('brush')
  const [selectedEffect, setSelectedEffect] = useState<AnonymizeEffectId>('pixelate')
  const [brushSize, setBrushSize] = useState(52)
  const [brushStrength, setBrushStrength] = useState(0.48)
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)
  const [detector, setDetector] = useState<DetectorStatus>({ mode: 'unavailable', message: 'Initializing...' })
  const [, setDetectorLoading] = useState(true)
  const [depsModalOpen, setDepsModalOpen] = useState(false)
  const [depsStatus, setDepsStatus] = useState<DepsStatus | null>(null)
  const [depsInstalling, setDepsInstalling] = useState(false)
  const [installResult, setInstallResult] = useState<InstallResult | null>(null)
  const [showInstallScript, setShowInstallScript] = useState(false)
  const [autoDetect, setAutoDetect] = useState(true)   // auto-detect faces on photo open
  const [processingLocal, setProcessingLocal] = useState(() => {
    const saved = localStorage.getItem('anonymizer-processing-local')
    const val = saved === null ? true : saved === 'true'
    if (val) setForceLocal(true)
    return val
  })
  const [showBoxes, setShowBoxes] = useState(true)     // show/hide zone outlines
  const [exportFormat, setExportFormat] = useState<NormalizeFormat>('image/jpeg')
  const [exportQuality, setExportQuality] = useState(92)
  const [exportPngDepth, setExportPngDepth] = useState<PngDepth>('full')
  const [previewFileSizeKb, setPreviewFileSizeKb] = useState<number | null>(null)
  const [previewRendering, setPreviewRendering] = useState(false)
  const qualityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // resEditOpen removed — inputs are always visible now
  const [resEditW, setResEditW] = useState(0)
  const [resEditH, setResEditH] = useState(0)
  const [isBusy, setIsBusy] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectionStep, setDetectionStep] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [localProcessingMs, setLocalProcessingMs] = useState<number | null>(null)
  const [lastDetectFailed, setLastDetectFailed] = useState(false)
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
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false)
  const downloadMenuRef = useRef<HTMLDivElement>(null)
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
  const [videoProgress, setVideoProgress] = useState<{ current: number; total: number; phase: VideoProcessingPhase } | null>(null)
  const videoAbortRef = useRef<AbortController | null>(null)
  const videoExportOptions = useMemo(() => getSupportedVideoExportOptions(), [])
  const videoPipelineCapabilities = useMemo(() => getVideoPipelineCapabilities(), [])
  const [videoExportFormat, setVideoExportFormat] = useState<VideoExportFormatId>('webm')
  const [videoFrameOverridesByPhoto, setVideoFrameOverridesByPhoto] = useState<Record<string, VideoFrameOverride[]>>({})
  const [videoTimedZonesByPhoto, setVideoTimedZonesByPhoto] = useState<Record<string, VideoTimedZone[]>>({})
  const [videoMaskDrawActive, setVideoMaskDrawActive] = useState(false)
  const [videoMaskRangeSec, setVideoMaskRangeSec] = useState(3)
  const [activeVideoTime, setActiveVideoTime] = useState(0)
  const [videoDraftZone, setVideoDraftZone] = useState<Zone | null>(null)
  const videoMaskPointerStartRef = useRef<{ x: number; y: number } | null>(null)

  // New UI state
  const [effectFlyoutOpen, setEffectFlyoutOpen] = useState(false)
  const [adjFlyoutOpen, setAdjFlyoutOpen] = useState(false)
  // colorPanelOpen mirrors adjFlyoutOpen — enables live preview in renderCanvas without committing
  const colorPanelOpen = adjFlyoutOpen
  const [folderTreeOpen, setFolderTreeOpen] = useState(false)
  const [currentFolderPrefix, setCurrentFolderPrefix] = useState('')
  // Refs for flyout anchor buttons (to compute fixed position)
  const adjFlyoutBtnRef = useRef<HTMLButtonElement>(null)
  const transformFlyoutBtnRef = useRef<HTMLButtonElement>(null)
  const effectFlyoutBtnRef = useRef<HTMLButtonElement>(null)
  const filenameTipRef = useRef<HTMLSpanElement>(null)
  const [filenameTipPos, setFilenameTipPos] = useState<{ top: number; left: number } | null>(null)
  const [adjFlyoutAnchor, setAdjFlyoutAnchor] = useState<{ top: number; left: number } | null>(null)
  const [transformFlyoutOpen, setTransformFlyoutOpen] = useState(false)
  const [transformFlyoutAnchor, setTransformFlyoutAnchor] = useState<{ top: number; left: number } | null>(null)
  const [effectFlyoutAnchor, setEffectFlyoutAnchor] = useState<{ top: number; left: number } | null>(null)
  const [adjTransform, setAdjTransform] = useState<string>('none')   // none | glitch | halftone | pixel-shift | color-shift
  const [adjTransformStrength, setAdjTransformStrength] = useState(35)
  // Per-effect extra parameters
  const [adjTransformParams, setAdjTransformParams] = useState({
    dotSize: 8, halftoneContrast: 50, halftoneAngle: 45,
    glitchShift: 15, glitchColorSplit: 8,
    pixelShiftX: 10, pixelShiftY: 5,
    colorShiftHue: 60, colorShiftSat: 50,
  })
  const setAdjParam = (key: keyof typeof adjTransformParams, value: number) =>
    setAdjTransformParams((p) => ({ ...p, [key]: value }))
  const [adjPixelShiftType, setAdjPixelShiftType] = useState<'wave' | 'shear' | 'ripple' | 'mirror'>('wave')
  // Error flyout for floppy-save when no file permissions
  const [saveErrorVisible, setSaveErrorVisible] = useState(false)
  const saveErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showSaveError = (msg: string) => {
    setSaveErrorVisible(true)
    if (saveErrorTimerRef.current) clearTimeout(saveErrorTimerRef.current)
    saveErrorTimerRef.current = setTimeout(() => setSaveErrorVisible(false), 3500)
    setNotice(msg)
  }

  // Close flyouts on outside click
  useEffect(() => {
    if (!adjFlyoutOpen && !effectFlyoutOpen && !transformFlyoutOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      const flyouts = document.querySelectorAll('.ts-flyout-portal')
      for (const f of flyouts) { if (f.contains(target)) return }
      if (adjFlyoutBtnRef.current?.contains(target)) return
      if (effectFlyoutBtnRef.current?.contains(target)) return
      if (transformFlyoutBtnRef.current?.contains(target)) return
      setAdjFlyoutOpen(false)
      setEffectFlyoutOpen(false)
      setTransformFlyoutOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [adjFlyoutOpen, effectFlyoutOpen, transformFlyoutOpen])
  // Close download menu on outside click
  useEffect(() => {
    if (!downloadMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (downloadMenuRef.current?.contains(e.target as Node)) return
      setDownloadMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [downloadMenuOpen])

  const [activeBatchTasks, setActiveBatchTasks] = useState<Set<BatchTaskId>>(new Set(['format']))
  const [expandedBatchTasks, setExpandedBatchTasks] = useState<Set<BatchTaskId>>(new Set(['format']))
  const [zonesAnonymized, setZonesAnonymized] = useState(false)

  // brushSizeRef for smooth preview (avoids React re-render latency)
  const brushSizeRef = useRef(52)
  const brushDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const uploadInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
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
  const pointerSessionRef = useRef<PointerSession>({ mode: 'idle' })
  const brushRafRef = useRef<number | null>(null)
  const brushActiveRef = useRef(false)
  const brushLastApplyRef = useRef(0)
  const brushEmojiRef = useRef('')
  const photosRef = useRef<PhotoItem[]>([])
  const normalizeCancelRef = useRef(false)
  const dragCounterRef = useRef(0)
  const sidebarResizingRef = useRef(false)
  const sidebarResizeStartXRef = useRef(0)
  const sidebarResizeStartWRef = useRef(220)
  const colorPreviewCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const qualityPreviewCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const batchPreviewCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const batchPreviewDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const computeBatchPreviewRef = useRef<(() => Promise<void>) | null>(null)
  const transformPreviewCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const transformPreviewDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const transformPreviewGenRef = useRef(0)   // increments each call; used to discard stale async results
  const activeVideoRef = useRef<HTMLVideoElement | null>(null)

  const activePhoto = useMemo(() => photos.find((p) => p.id === activePhotoId) ?? null, [photos, activePhotoId])
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
    setVideoDraftZone(null)
    setActiveVideoTime(0)
    videoMaskPointerStartRef.current = null
  }, [activePhotoId])

  const activeZones = useMemo(() => (activePhotoId ? zonesByPhoto[activePhotoId] ?? [] : []), [zonesByPhoto, activePhotoId])
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
  const hasPendingVideoEdits = activeVideoTimedZones.length > 0 || activeVideoFrameOverrides.length > 0
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

  const setActiveDirty = useCallback((isDirty: boolean) => {
    if (!activePhotoId) return
    setDirtyByPhoto((cur) => ({ ...cur, [activePhotoId]: isDirty }))
    // Clear quality preview so user sees actual edits
    if (isDirty && qualityPreviewCanvasRef.current) { qualityPreviewCanvasRef.current.width = 0 }
  }, [activePhotoId])

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
    const bounds = canvas.getBoundingClientRect()
    const canvasX = clientX - bounds.left
    const canvasY = clientY - bounds.top
    const outsideImage = canvasX < t.drawX || canvasX > t.drawX + t.drawWidth || canvasY < t.drawY || canvasY > t.drawY + t.drawHeight
    if (outsideImage && !clampToBounds) return null
    const normalizedX = clamp((canvasX - t.drawX) / t.drawWidth, 0, 1)
    const normalizedY = clamp((canvasY - t.drawY) / t.drawHeight, 0, 1)
    return { canvasX, canvasY, imageX: normalizedX * t.imageWidth, imageY: normalizedY * t.imageHeight, normalizedX, normalizedY }
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
    ctx.fillStyle = theme === 'dark' ? '#080808' : '#e8e9ec'
    ctx.fillRect(0, 0, cssWidth, cssHeight)

    if (source.width === 0 || source.height === 0 || !activePhoto) {
      transformRef.current = DEFAULT_TRANSFORM
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
      if (tc && tc.width > 0 && (adjFlyoutOpen || transformFlyoutOpen)) {
        drawSource = tc
      // Quality preview shows compressed visual
      } else {
        const qc = qualityPreviewCanvasRef.current
        if (qc && qc.width > 0 && !isLosslessFormat(exportFormat)) {
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

    const scale = Math.min(cssWidth / source.width, cssHeight / source.height)
    const drawWidth = source.width * scale
    const drawHeight = source.height * scale
    const drawX = (cssWidth - drawWidth) / 2
    const drawY = (cssHeight - drawHeight) / 2

    transformRef.current = { drawX, drawY, drawWidth, drawHeight, imageWidth: source.width, imageHeight: source.height, scale }
    ctx.drawImage(drawSource, drawX, drawY, drawWidth, drawHeight)

    // Draw zone outlines (if visible) — hide during color/transform preview to reduce clutter
    const previewing = ((adjFlyoutOpen || transformFlyoutOpen) && adjTransform !== 'none') || (!isColorNoop && colorPanelOpen)
    if (showBoxes && !previewing) {
      activeZones.forEach((zone) => drawZoneOutline(ctx, zone, transformRef.current, zone.id === selectedZoneId))
      if (draftZone) drawZoneOutline(ctx, draftZone, transformRef.current, true)
    }

    // Draw normalize crop overlay when batch panel open
    if (batchPanelOpen) {
      const cropPreview = normalizeCropDraft || activeNormalizeCrop
      if (cropPreview && (normalizeSettings.cropMode !== 'none' || normalizeCropDraft)) {
        drawNormalizeCropOverlay(ctx, cropPreview, transformRef.current, Boolean(normalizeCropDraft || isNormalizeCropPicking))
      }
    }
  }, [
    activePhoto, activeNormalizeCrop, activeZones, adjFlyoutOpen, adjTransform, batchPanelOpen,
    colorAdj, colorPanelOpen, draftZone, exportFormat, isNormalizeCropPicking, transformFlyoutOpen,
    normalizeCropDraft, normalizeSettings.cropMode, selectedZoneId, showBoxes, theme,
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

  const applyBrushAtPointer = useCallback((pointer: PointerMap) => {
    const workCanvas = workCanvasRef.current
    if (!activePhoto || !workCanvas || workCanvas.width === 0) return
    const ctx = getWorkCtx()
    if (!ctx) return
    const t = transformRef.current
    if (t.scale <= 0) return
    const radius = Math.max(4, brushSizeRef.current / t.scale)
    applyEffectBrush(ctx, selectedEffect, pointer.imageX, pointer.imageY, radius, brushStrength, brushEmojiRef.current)
    setActiveDirty(true)
    renderCanvasRef.current()
  }, [activePhoto, brushStrength, getWorkCtx, selectedEffect, setActiveDirty])

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

    previewEffectBrush(
      octx, workCanvas,
      selectedEffect,
      pointer.canvasX, pointer.canvasY,
      sz,
      brushStrength,
      brushEmojiRef.current,
      t.scale, t.drawX, t.drawY,
    )

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
  }, [activePhoto, brushStrength, selectedEffect, toolMode])

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
  void undo  // available as keyboard shortcut via Ctrl+Z if needed

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
          setPhotos((cur) => cur.map((ph) => {
            if (ph.id !== p.id) return ph
            URL.revokeObjectURL(ph.previewUrl)
            return { ...ph, previewUrl: posterUrl, videoWidth: width, videoHeight: height }
          }))
        }).catch(() => { /* poster extraction failed — keep video blob URL as preview */ })
        getVideoMetadata(p.blob).then((meta) => {
          setPhotos((cur) => cur.map((ph) => {
            if (ph.id !== p.id) return ph
            return { ...ph, videoDuration: meta.duration, videoWidth: meta.width, videoHeight: meta.height, videoFps: meta.fps }
          }))
        }).catch(() => {})
      }
    }
    setPhotos((cur) => {
      const next = [...cur, ...incoming]
      if (!activePhotoId && incoming.length > 0) setActivePhotoId(incoming[0].id)
      if (next.length > 700) setSidebarView('list')
      return next
    })
    setSelectedForBatch((cur) => { const next = new Set(cur); incoming.forEach((p) => next.add(p.id)); return next })
    setNormalizeResults({})
    setNormalizePreviewIds([])
    setPhotoListLimit((cur) => Math.max(cur, Math.min(400, cur + incoming.length)))
    setNotice(`Loaded ${incoming.length} photo${incoming.length === 1 ? '' : 's'}.`)
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
      const fetched = await Promise.all(DEMO_IMAGES.map(async (url, i) => {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Demo ${url} failed`)
        const blob = await res.blob()
        const ext = url.split('.').pop() ?? 'jpg'
        const name = `demo-${i + 1}.${ext}`
        const mime = blob.type || (ext === 'webp' ? 'image/webp' : ext === 'png' ? 'image/png' : 'image/jpeg')
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
    if (activePhotoId && (dirtyByPhoto[activePhotoId] ?? false)) {
      await commitWorkCanvasToBlob(activePhotoId)
      setActiveDirty(false)
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
    setEffectFlyoutOpen(false)
    setLocalProcessingMs(null)
    setLastDetectFailed(false)
    setAdjFlyoutOpen(false)
    setTransformFlyoutOpen(false)
    const saved = colorAdjByPhoto[photoId]
    setColorAdj(saved ? { ...saved } : DEFAULT_COLOR_ADJUSTMENTS)
    // Reset export format to photo's native format
    const photo = photos.find((p) => p.id === photoId)
    if (photo) {
      const fmt = photo.mimeType as NormalizeFormat
      if (['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/gif', 'image/tiff'].includes(fmt)) setExportFormat(fmt)
    }
  }, [activePhotoId, colorAdjByPhoto, commitWorkCanvasToBlob, dirtyByPhoto, photos, setActiveDirty])

  // ── Unified picker: opens files OR folder depending on browser support ──
  const openUnifiedPicker = useCallback(async () => {
    const hasFSA = typeof (window as Window & { showOpenFilePicker?: unknown }).showOpenFilePicker === 'function'
    const hasDirPicker = typeof (window as Window & { showDirectoryPicker?: unknown }).showDirectoryPicker === 'function'

    if (hasDirPicker) {
      // Show a quick choice
      const choice = window.confirm('Open a folder? (OK = folder, Cancel = individual files)')
      if (choice) {
        // Open folder with write access
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
        return
      }
    }

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
  const detectFacesOnActiveImage = useCallback(async (robust = false) => {
    if (!activePhoto) return
    if (detectingRef.current) return
    const workCanvas = workCanvasRef.current
    if (!workCanvas || workCanvas.width === 0) return
    detectingRef.current = true
    setIsDetecting(true)
    setLocalProcessingMs(null)
    setDetectionStep('Preparing…')
    setNotice(robust ? 'Running thorough detection…' : 'Detecting faces…')
    setDetectionProgressCallback((step) => setDetectionStep(step))
    const t0 = performance.now()
    try {
      const boxes = await detectFaces(workCanvas, robust)
      const elapsed = Math.round(performance.now() - t0)
      setLocalProcessingMs(elapsed)
      if (boxes.length === 0) {
        setLastDetectFailed(true)
        setNotice(`No faces detected. (${elapsed} ms locally)`)
        return
      }
      setLastDetectFailed(false)
      const emojis = pickUniqueEmojis(boxes.length)
      const zones: Zone[] = boxes.map((b, i) => ({
        id: createId(),
        x: clamp(b.x / workCanvas.width, 0, 1),
        y: clamp(b.y / workCanvas.height, 0, 1),
        width: clamp(b.width / workCanvas.width, 0.02, 1),
        height: clamp(b.height / workCanvas.height, 0.02, 1),
        effect: selectedEffect,
        emoji: emojis[i],
      }))
      setActiveZones(() => zones)
      setSelectedZoneId(zones[0]?.id ?? null)
      const src = getDetectorStatus()
      const detSrc = src?.mode === 'backend'
        ? `via ${(src as { backendDetector?: string }).backendDetector ?? 'backend'}`
        : src?.mode === 'face-api'
          ? `via face-api.js (${getFaceApiBackendName() || 'local'})`
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
  }, [activePhoto, renderCanvas, selectedEffect, setActiveZones])

  const cancelDetection = useCallback(() => {
    detectingRef.current = false
    setIsDetecting(false)
    setDetectionStep('')
    setDetectionProgressCallback(null)
    setNotice('Detection cancelled.')
  }, [])

  const applyZones = useCallback(() => {
    if (!activePhoto || activeZones.length === 0) return
    const workCanvas = workCanvasRef.current
    if (!workCanvas) return
    const ctx = getWorkCtx()
    if (!ctx) return
    activeZones.forEach((z) => applyEffectRect(ctx, z.effect, z.x * workCanvas.width, z.y * workCanvas.height, z.width * workCanvas.width, z.height * workCanvas.height, brushStrength, z.emoji))
    setActiveDirty(true)
    if (activePhotoId) setAppliedByPhoto((cur) => ({ ...cur, [activePhotoId]: true }))
    setZonesAnonymized(true)
    setNotice(`Applied ${activeZones.length} zone${activeZones.length === 1 ? '' : 's'}.`)
    renderCanvas()
  }, [activePhoto, activePhotoId, activeZones, brushStrength, getWorkCtx, renderCanvas, setActiveDirty])

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
    ctx.drawImage(tmp, 0, 0)
    setActiveImageSize({ width: pw, height: ph })
    setResEditW(pw); setResEditH(ph)
    setCropDraft(null)
    setToolMode('brush')
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setNotice('Snapshot attached to source video. Re-run video anonymization to bake it into the render.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setNotice(`Could not attach snapshot to source video: ${msg}`)
    } finally {
      setIsBusy(false)
    }
  }, [activePhoto])

  const jumpToSourceVideoFromSnapshot = useCallback(() => {
    if (!sourceVideoPhoto) return
    void selectPhoto(sourceVideoPhoto.id)
    setNotice(`Returned to source video: ${sourceVideoPhoto.name.split('/').pop()}`)
  }, [selectPhoto, sourceVideoPhoto])

  const mapPointerToVideo = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const video = activeVideoRef.current
    if (!video) return null
    const bounds = video.getBoundingClientRect()
    if (bounds.width <= 0 || bounds.height <= 0) return null
    return {
      x: clamp((event.clientX - bounds.left) / bounds.width, 0, 1),
      y: clamp((event.clientY - bounds.top) / bounds.height, 0, 1),
    }
  }, [])

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
      emoji: pickRandomEmoji(),
    })
  }, [activePhoto, mapPointerToVideo, selectedEffect, videoMaskDrawActive])

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
      zone: { ...zone, id, effect: selectedEffect, emoji: zone.emoji || pickRandomEmoji() },
    }

    setVideoTimedZonesByPhoto((cur) => ({
      ...cur,
      [activePhoto.id]: [...(cur[activePhoto.id] ?? []), timedZone].sort((a, b) => a.startSec - b.startSec),
    }))
    setVideoDraftZone(null)
    setVideoMaskDrawActive(false)
    setNotice(`Timeline mask added for ${formatVideoTime(timedZone.startSec)}–${formatVideoTime(timedZone.endSec)}. Re-run video anonymization to bake it in.`)
  }, [activePhoto, activeVideoTime, selectedEffect, videoDraftZone, videoMaskDrawActive, videoMaskRangeSec])

  const processActiveVideo = useCallback(async () => {
    if (!activePhoto?.isVideo) return
    const selectedContainer = videoExportOptions.find((opt) => opt.id === videoExportFormat)
    if (!selectedContainer?.supported) {
      setNotice(`Video format ${videoExportFormat.toUpperCase()} is not supported in this browser.`)
      return
    }
    const abort = new AbortController()
    videoAbortRef.current = abort
    setVideoProcessing(true)
    setVideoProgress({ current: 0, total: 1, phase: 'analyzing' })
    try {
      const sourceVideoBlob = originalBlobByPhoto[activePhoto.id] ?? activePhoto.blob
      const manualOverrides = videoFrameOverridesByPhoto[activePhoto.id] ?? []
      const timedZones = videoTimedZonesByPhoto[activePhoto.id] ?? []
      const resultBlob = await processVideo(sourceVideoBlob, {
        effect: selectedEffect,
        strength: brushStrength / 100,
        emoji: pickRandomEmoji(),
        forceLocal: processingLocal,
        outputFormat: videoExportFormat,
        frameOverrides: manualOverrides,
        timedZones,
        onPhase: (phase) => setVideoProgress((prev) => ({ current: prev?.current ?? 0, total: prev?.total ?? 1, phase })),
        onProgress: (current, total) => setVideoProgress((prev) => ({ current, total, phase: prev?.phase ?? 'analyzing' })),
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
      ].filter(Boolean).join(' and ')
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
    }
  }, [activePhoto, brushStrength, originalBlobByPhoto, processingLocal, selectedEffect, videoExportFormat, videoExportOptions, videoFrameOverridesByPhoto, videoTimedZonesByPhoto])

  const cancelVideoProcessing = useCallback(() => {
    videoAbortRef.current?.abort()
  }, [])

  const stepActiveVideoFrame = useCallback((direction: -1 | 1) => {
    if (!activePhoto?.isVideo || !activeVideoRef.current) return
    const video = activeVideoRef.current
    const fps = activePhoto.videoFps && activePhoto.videoFps > 0 ? activePhoto.videoFps : 30
    const duration = Number.isFinite(video.duration) && video.duration > 0
      ? video.duration
      : activePhoto.videoDuration ?? 0
    const frameStep = 1 / fps
    const nextTime = clamp(video.currentTime + direction * frameStep, 0, duration > 0 ? duration : Number.MAX_SAFE_INTEGER)

    video.pause()
    video.currentTime = nextTime
    setActiveVideoTime(nextTime)
  }, [activePhoto])

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setIsExporting(true)
    try {
      const zip = new JSZip()
      const usage = new Map<string, number>()
      // Strip metadata from every photo before adding to ZIP
      await Promise.all(photos.map(async (p) => {
        const clean = await stripMetadata(p.blob)
        zip.file(makeZipSafeName(p.name, usage), clean)
      }))
      const blob = await zip.generateAsync({ type: 'blob' })
      saveAs(blob, `anonymized-${new Date().toISOString().slice(0, 10)}.zip`)
      setNotice(`ZIP: ${photos.length} file${photos.length === 1 ? '' : 's'}.`)
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
    setSelectedForBatch(new Set(photos.map((p) => p.id)))
  }, [photos])

  const deselectAllForBatch = useCallback(() => {
    setSelectedForBatch(new Set())
  }, [])

  const runNormalizeBatch = useCallback(async () => {
    if (photos.length === 0) { setNotice('Load photos first.'); return }
    const s = normalizeSettings
    if (s.cropMode === 'template' && !s.templateCropNormalized) { setNotice('Set a crop template first.'); return }
    const batch = selectedForBatch.size > 0
      ? photos.filter((p) => selectedForBatch.has(p.id))
      : photos
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

          // Apply per-photo color adjustments if colors task is active
          if (activeBatchTasks.has('colors')) {
            const photoColorAdj = colorAdjByPhoto[photo.id]
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
              const boxes = await detectFaces(tmp, false)
              if (boxes.length > 0) {
                const effId = s.batchAnonymizeEffect as AnonymizeEffectId
                const strength = s.batchAnonymizeStrength
                const batchEmojis = pickUniqueEmojis(boxes.length)
                boxes.forEach((b, i) => applyEffectRect(tmpCtx, effId, b.x, b.y, b.width, b.height, strength, batchEmojis[i]))
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
  }, [activeBatchTasks, colorAdjByPhoto, normalizeSettings, photos, selectedForBatch])

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
    if (transformPreviewCanvasRef.current) transformPreviewCanvasRef.current.width = 0
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
    if (!wc || wc.width === 0 || adjTransform === 'none') return
    pushUndo()
    const subEffectMap: Record<string, GlitchSubEffect> = {
      'halftone': 'halftone',
      'glitch': 'glitch',
      'pixel-shift': 'pixel-shift',
      'color-shift': 'color-shift',
    }
    try {
      const glitched = await applyGlitchEffect(wc, {
        subEffect: subEffectMap[adjTransform] ?? 'glitch',
        amount: adjTransformStrength,
        seed: Math.floor(Math.random() * 999),
        halftoneDotSize: adjTransformParams.dotSize,
        halftoneShape: 'circle',
        halftoneContrast: adjTransformParams.halftoneContrast,
        halftoneAngle: adjTransformParams.halftoneAngle,
        glitchShift: adjTransformParams.glitchShift,
        glitchColorSplit: adjTransformParams.glitchColorSplit,
        pixelShiftX: adjTransformParams.pixelShiftX,
        pixelShiftY: adjTransformParams.pixelShiftY,
        pixelShiftType: adjPixelShiftType,
        colorShiftHue: adjTransformParams.colorShiftHue,
        colorShiftSat: adjTransformParams.colorShiftSat,
      })
      const ctx = wc.getContext('2d', { willReadFrequently: true })!
      ctx.clearRect(0, 0, wc.width, wc.height)
      ctx.drawImage(glitched, 0, 0)
      setActiveDirty(true)
      setTransformFlyoutOpen(false)
      resetAdjTransformPreview()
      setNotice('Transform applied to photo.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setNotice(`Transform apply failed: ${msg}`)
    }
  }, [adjPixelShiftType, adjTransform, adjTransformParams, adjTransformStrength, pushUndo, resetAdjTransformPreview, setActiveDirty])
  // applyAdjTransformToCanvas is called from toolbar Apply if a transform is pending
  void applyAdjTransformToCanvas

  const computePreviewFileSize = useCallback(() => {
    const wc = workCanvasRef.current
    if (!wc || wc.width === 0 || !activePhoto) {
      setPreviewFileSizeKb(null); setPreviewRendering(false)
      if (qualityPreviewCanvasRef.current) { qualityPreviewCanvasRef.current.width = 0 }
      return
    }
    setPreviewRendering(true)
    if (isLosslessFormat(exportFormat)) {
      exportCanvasToBlob(wc, exportFormat, exportQuality, exportPngDepth).then((blob) => {
        setPreviewFileSizeKb(Math.round(blob.size / 1024))
        if (qualityPreviewCanvasRef.current) { qualityPreviewCanvasRef.current.width = 0 }
        renderCanvasRef.current()
      }).catch(() => {}).finally(() => setPreviewRendering(false))
      return
    }
    const quality = exportQuality / 100
    wc.toBlob((blob) => {
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
    }, exportFormat, quality)
  // renderCanvas intentionally not in deps — use renderCanvasRef to avoid infinite loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePhoto, exportFormat, exportQuality, exportPngDepth])

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchPanelOpen, activeBatchTasks, normalizeSettings, activePhoto, colorAdj])

  // Transform live preview: recompute from workCanvas whenever transform params change in adj flyout
  useEffect(() => {
    const clear = () => {
      if (transformPreviewCanvasRef.current) { transformPreviewCanvasRef.current.width = 0 }
    }
    if ((!adjFlyoutOpen && !transformFlyoutOpen) || adjTransform === 'none') {
      clear(); renderCanvasRef.current(); return
    }
    const wc = workCanvasRef.current
    if (!wc || wc.width === 0) { clear(); return }
    if (transformPreviewDebounceRef.current) clearTimeout(transformPreviewDebounceRef.current)
    const gen = ++transformPreviewGenRef.current  // bump generation for this call
    transformPreviewDebounceRef.current = setTimeout(async () => {
      const subEffectMap: Record<string, GlitchSubEffect> = {
        halftone: 'halftone', glitch: 'glitch',
        'pixel-shift': 'pixel-shift', 'color-shift': 'color-shift',
      }
      try {
        const result = await applyGlitchEffect(wc, {
          subEffect: subEffectMap[adjTransform] ?? 'glitch',
          amount: adjTransformStrength,
          seed: 42,
          halftoneDotSize: adjTransformParams.dotSize,
          halftoneShape: 'circle',
          halftoneContrast: adjTransformParams.halftoneContrast,
          halftoneAngle: adjTransformParams.halftoneAngle,
          glitchShift: adjTransformParams.glitchShift,
          glitchColorSplit: adjTransformParams.glitchColorSplit,
          pixelShiftX: adjTransformParams.pixelShiftX,
          pixelShiftY: adjTransformParams.pixelShiftY,
          pixelShiftType: adjPixelShiftType,
          colorShiftHue: adjTransformParams.colorShiftHue,
          colorShiftSat: adjTransformParams.colorShiftSat,
        })
        // Discard if a newer call started — prevents stale results overwriting fresh ones
        if (gen !== transformPreviewGenRef.current) return
        if (!transformPreviewCanvasRef.current) transformPreviewCanvasRef.current = document.createElement('canvas')
        const tc = transformPreviewCanvasRef.current
        tc.width = result.width; tc.height = result.height
        tc.getContext('2d')!.drawImage(result, 0, 0)
        renderCanvasRef.current()
      } catch { /* ignore */ }
    }, 180)
    return () => { if (transformPreviewDebounceRef.current) clearTimeout(transformPreviewDebounceRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adjFlyoutOpen, transformFlyoutOpen, adjTransform, adjTransformStrength, adjTransformParams, adjPixelShiftType, activePhoto?.id])

  // Recompute preview file size debounced whenever quality/format/depth/photo changes
  useEffect(() => {
    if (qualityDebounceRef.current) clearTimeout(qualityDebounceRef.current)
    setPreviewRendering(true)
    qualityDebounceRef.current = setTimeout(() => { computePreviewFileSize() }, 300)
    return () => { if (qualityDebounceRef.current) clearTimeout(qualityDebounceRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportQuality, exportFormat, exportPngDepth, activePhoto?.id])

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
    const mapped = mapPointerToImage(event.clientX, event.clientY)
    if (!mapped) return
    canvasRef.current?.setPointerCapture(event.pointerId)
    if (toolMode === 'crop') {
      canvasRef.current?.setPointerCapture(event.pointerId)
      pointerSessionRef.current = { mode: 'crop-draw', startX: mapped.normalizedX, startY: mapped.normalizedY }
      setCropDraft({ x: mapped.normalizedX, y: mapped.normalizedY, w: 0.001, h: 0.001 })
      return
    }
    if (toolMode === 'brush') {
      pushUndo()
      brushEmojiRef.current = pickRandomEmoji()
      pointerSessionRef.current = { mode: 'brush', lastPointer: mapped }
      setCursorPoint({ x: mapped.canvasX, y: mapped.canvasY })
      brushLastApplyRef.current = 0
      startBrushLoop()
      applyBrushAtPointer(mapped)
      return
    }
    const t = transformRef.current; const hs = 12
    for (let i = activeZones.length - 1; i >= 0; i--) {
      const zone = activeZones[i]; const rect = zoneToCanvasRect(zone, t)
      if (mapped.canvasX < rect.x || mapped.canvasX > rect.x + rect.width || mapped.canvasY < rect.y || mapped.canvasY > rect.y + rect.height) continue
      setSelectedZoneId(zone.id)
      const nearHandle = Math.abs(mapped.canvasX - (rect.x + rect.width)) <= hs && Math.abs(mapped.canvasY - (rect.y + rect.height)) <= hs
      pointerSessionRef.current = nearHandle
        ? { mode: 'resize-zone', zoneId: zone.id }
        : { mode: 'move-zone', zoneId: zone.id, offsetX: mapped.normalizedX - zone.x, offsetY: mapped.normalizedY - zone.y }
      return
    }
    pointerSessionRef.current = { mode: 'create-zone', startX: mapped.normalizedX, startY: mapped.normalizedY }
    setDraftZone({ id: createId(), x: mapped.normalizedX, y: mapped.normalizedY, width: 0.001, height: 0.001, effect: selectedEffect, emoji: pickRandomEmoji() })
    setSelectedZoneId(null)
  }, [activePhoto, activeZones, applyBrushAtPointer, batchPanelOpen, isNormalizeCropPicking, mapPointerToImage, normalizeSettings.cropMode, pushUndo, selectedEffect, startBrushLoop, toolMode])

  const handleCanvasPointerMove = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    const session = pointerSessionRef.current
    const mapped = mapPointerToImage(event.clientX, event.clientY, session.mode === 'brush')
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
      return
    }

    if (session.mode === 'idle' || !mapped) { renderCanvas(); return }
    if (session.mode === 'brush') {
      if (brushActiveRef.current && mapped) {
        const now = performance.now()
        if (now - brushLastApplyRef.current >= 50) {
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
      setActiveZones((zones) => zones.map((z) => z.id !== session.zoneId ? z : { ...z, x: clamp(mapped.normalizedX - session.offsetX, 0, 1 - z.width), y: clamp(mapped.normalizedY - session.offsetY, 0, 1 - z.height) }))
      renderCanvas(); return
    }
    if (session.mode === 'resize-zone') {
      setActiveZones((zones) => zones.map((z) => z.id !== session.zoneId ? z : { ...z, width: clamp(mapped.normalizedX - z.x, 0.02, 1 - z.x), height: clamp(mapped.normalizedY - z.y, 0.02, 1 - z.y) }))
      renderCanvas()
    }
  }, [applyBrushAtPointer, batchPanelOpen, drawBrushPreview, mapPointerToImage, renderCanvas, setActiveZones, toolMode])

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
      const overlay = overlayCanvasRef.current
      if (overlay) {
        const octx = overlay.getContext('2d')
        if (octx) octx.clearRect(0, 0, overlay.width, overlay.height)
      }
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

  const updateSelectedZoneEffect = useCallback((effect: AnonymizeEffectId) => {
    setSelectedEffect(effect)
    setEffectFlyoutOpen(false)
    const updatedZones = activeZones.map((z) => ({
      ...z, effect,
      emoji: effect === 'emoji' ? z.emoji || pickRandomEmoji() : z.emoji,
    }))
    setActiveZones(() => updatedZones)

    // If zones are already anonymized, reset canvas to original and re-apply with new effect
    if (zonesAnonymized && activePhoto && originalBlobByPhoto[activePhoto.id]) {
      const orig = originalBlobByPhoto[activePhoto.id]
      createImageBitmap(orig).then((bmp) => {
        const wc = workCanvasRef.current!
        if (wc.width !== bmp.width || wc.height !== bmp.height) {
          wc.width = bmp.width; wc.height = bmp.height; workCtxRef.current = null
        }
        const ctx = getWorkCtx()
        if (ctx) { ctx.clearRect(0, 0, wc.width, wc.height); ctx.drawImage(bmp, 0, 0) }
        bmp.close()
        // Apply all zones with the new effect directly
        updatedZones.forEach((z) => applyEffectRect(ctx!, effect, z.x * wc.width, z.y * wc.height, z.width * wc.width, z.height * wc.height, brushStrength, z.emoji))
        setZonesAnonymized(true)
        renderCanvasRef.current()
      }).catch(() => {})
    } else {
      setZonesAnonymized(false)
    }
  }, [activePhoto, activeZones, brushStrength, getWorkCtx, originalBlobByPhoto, setActiveZones, zonesAnonymized])

  // Live re-apply zones when brushStrength changes (while zones are already anonymized)
  const strengthDebounceRef = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    if (!zonesAnonymized || !activePhoto || activeZones.length === 0) return
    const orig = originalBlobByPhoto[activePhoto.id]
    if (!orig) return
    if (strengthDebounceRef.current) clearTimeout(strengthDebounceRef.current)
    strengthDebounceRef.current = setTimeout(() => {
      createImageBitmap(orig).then((bmp) => {
        const wc = workCanvasRef.current!
        if (!wc) return
        if (wc.width !== bmp.width || wc.height !== bmp.height) {
          wc.width = bmp.width; wc.height = bmp.height; workCtxRef.current = null
        }
        const ctx = getWorkCtx()
        if (ctx) {
          ctx.clearRect(0, 0, wc.width, wc.height)
          ctx.drawImage(bmp, 0, 0)
        }
        bmp.close()
        activeZones.forEach((z) =>
          applyEffectRect(ctx!, z.effect, z.x * wc.width, z.y * wc.height, z.width * wc.width, z.height * wc.height, brushStrength, z.emoji),
        )
        renderCanvasRef.current()
      }).catch(() => {})
    }, 150)
    return () => { if (strengthDebounceRef.current) clearTimeout(strengthDebounceRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brushStrength])

  // Sync brushSizeRef when slider changes
  useEffect(() => { brushSizeRef.current = brushSize }, [brushSize])

  // Sync photosRef for cleanup
  useEffect(() => { photosRef.current = photos }, [photos])
  useEffect(() => () => { photosRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl)) }, [])
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('anonymizer-theme', theme) }, [theme])

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
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [clearZones, exportZip, removeSelectedZone, saveActivePhoto, saveAllPhotos, selectedZoneId])

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

  // Detector init
  useEffect(() => {
    let cancelled = false
    setDetectorLoading(true)
    initializeDetector().then((status) => {
      if (!cancelled) { setDetector(status); setDetectorLoading(false) }
    }).catch(() => {
      if (!cancelled) {
        setDetector({ mode: 'unavailable', message: 'Initialization failed.' })
        setDetectorLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  const openDepsModal = useCallback(async () => {
    setInstallResult(null)
    setDepsModalOpen(true)
    try {
      const status = await checkDeps()
      setDepsStatus(status)
    } catch { setDepsStatus(null) }
  }, [])

  const isWindows = typeof navigator !== 'undefined' && /win/i.test(navigator.platform ?? '')

  const INSTALL_SCRIPT_SH = `#!/usr/bin/env bash
# W3PN Anonymizer — Install & start Python backend (macOS / Linux)
# This script runs LOCALLY on your machine. No data is sent anywhere.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)/server"
VENV_DIR="$SCRIPT_DIR/.venv"
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  W3PN Anonymizer — Python backend setup & start      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
# 1. Check Python
if command -v python3 &>/dev/null; then PYTHON=python3
elif command -v python &>/dev/null; then PYTHON=python
else echo "❌ Python not found. Install from https://python.org"; exit 1; fi
PY_VER=$($PYTHON --version); echo "✓ $PY_VER"
# 2. Virtual environment
[ ! -d "$VENV_DIR" ] && { echo "→ Creating venv…"; $PYTHON -m venv "$VENV_DIR"; }
source "$VENV_DIR/bin/activate"
# 3. Install packages: fastapi, uvicorn, opencv, pillow, numpy
echo "→ Installing dependencies…"
pip install --quiet --upgrade pip
pip install --upgrade -r "$SCRIPT_DIR/requirements.txt"
echo "✓ All packages installed"
# 4. Download YuNet face detection model (~400 KB)
MODEL="$SCRIPT_DIR/models/face_detection_yunet_2023mar.onnx"
mkdir -p "$SCRIPT_DIR/models"
[ ! -f "$MODEL" ] && curl -fL "https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx" -o "$MODEL" 2>/dev/null && echo "✓ Model downloaded"
# 5. Start server on http://127.0.0.1:7865
echo ""; echo "✅ Starting server on http://127.0.0.1:7865"; echo "   Press Ctrl+C to stop."; echo ""
cd "$SCRIPT_DIR" && exec python main.py
`

  const INSTALL_SCRIPT_BAT = `@echo off
REM W3PN Anonymizer — Install ^& start Python backend (Windows)
REM This script runs LOCALLY. No data is sent anywhere.
setlocal EnableDelayedExpansion
set "SD=%~dp0server"
echo.
echo  W3PN Anonymizer — Python backend setup
echo.
REM 1. Check Python
where python >nul 2>&1
if errorlevel 1 ( echo Python not found. Install from https://python.org & pause & exit /b 1 )
set PYTHON=python
REM 2. Virtual environment
if not exist "%SD%\\.venv\\" ( echo Creating venv... & %PYTHON% -m venv "%SD%\\.venv" )
call "%SD%\\.venv\\Scripts\\activate.bat"
REM 3. Install packages
echo Installing dependencies...
pip install --quiet --upgrade pip
pip install --upgrade -r "%SD%\\requirements.txt"
echo All packages installed
REM 4. YuNet model
set "MF=%SD%\\models\\face_detection_yunet_2023mar.onnx"
if not exist "%SD%\\models\\" mkdir "%SD%\\models"
if not exist "%MF%" ( powershell -Command "Invoke-WebRequest -Uri 'https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx' -OutFile '%MF%' -UseBasicParsing" )
REM 5. Start server
echo.
echo Starting server on http://127.0.0.1:7865
echo Press Ctrl+C to stop.
echo.
cd "%SD%" & %PYTHON% main.py
endlocal
`

  const downloadInstallScript = useCallback(() => {
    const script = isWindows ? INSTALL_SCRIPT_BAT : INSTALL_SCRIPT_SH
    const filename = isWindows ? 'anonymizer-setup.bat' : 'anonymizer-setup.sh'
    const blob = new Blob([script], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }, [isWindows])

  const runInstall = useCallback(async () => {
    setDepsInstalling(true)
    setInstallResult(null)
    try {
      const result = await triggerInstall()
      if (!result) {
        setInstallResult({ ok: false, returncode: -1, stdout: '', stderr: '', message: 'Server not reachable. Start the Python server first, then try again.' })
        return
      }
      setInstallResult(result)
      const status = await checkDeps()
      setDepsStatus(status)
      if (result.ok) {
        setTimeout(() => {
          initializeDetector().then((s) => { setDetector(s); setNotice(`Backend connected: ${s.message}`) })
        }, 1500)
      }
    } catch { setInstallResult({ ok: false, returncode: -1, stdout: '', stderr: '', message: 'Server not reachable. Start the Python server first, then try again.' }) }
    finally { setDepsInstalling(false) }
  }, [])

  // Load active photo into work canvas; auto-detect if enabled
  useEffect(() => {
    if (!activePhoto) {
      const wc = workCanvasRef.current
      if (wc) { wc.width = 0; wc.height = 0 }
      setActiveImageSize(null); renderCanvas(); return
    }
    let cancelled = false
    setIsBusy(true)
    createImageBitmap(activePhoto.blob).then(async (bmp) => {
      if (cancelled) { bmp.close(); return }
      const wc = workCanvasRef.current!
      if (wc.width !== bmp.width || wc.height !== bmp.height) {
        wc.width = bmp.width; wc.height = bmp.height
        workCtxRef.current = null
      }
      setActiveImageSize({ width: bmp.width, height: bmp.height })
      const ctx = getWorkCtx()
      if (ctx) { ctx.clearRect(0, 0, wc.width, wc.height); ctx.drawImage(bmp, 0, 0) }
      bmp.close()
      renderCanvasRef.current()  // use ref to get latest renderCanvas with current adjFlyoutOpen state
      // Trigger batch preview after canvas is loaded (avoids race with 350ms debounce)
      if (computeBatchPreviewRef.current) computeBatchPreviewRef.current()

      // Auto-detect is triggered by the [autoDetect, detector.mode, activePhoto?.id] effect below
    }).catch(() => setNotice('Failed to load photo.'))
      .finally(() => { if (!cancelled) setIsBusy(false) })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePhoto?.id])  // only re-run when photo switches, not on every render

  useEffect(() => { renderCanvas() }, [renderCanvas, activeZones, selectedZoneId, draftZone, cursorPoint, toolMode, showBoxes])

  // Auto-detect: fires when detector becomes ready, photo changes, or autoDetect toggles ON
  useEffect(() => {
    if (!autoDetect || !activePhoto) return
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
      // Auto-expand when enabling, auto-collapse when disabling
      setExpandedBatchTasks((exp) => {
        const expNext = new Set(exp)
        if (enabling) expNext.add(taskId)
        else expNext.delete(taskId)
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
    if (activePhotoId === photoId) {
      setActivePhotoId(null)
      detectingRef.current = false
      setIsDetecting(false)
      setLocalProcessingMs(null)
      if (videoAbortRef.current) { videoAbortRef.current.abort(); videoAbortRef.current = null }
      setVideoProcessing(false)
    }
  }, [activePhotoId])

  const rotatePhoto = useCallback(async (photoId: string) => {
    const photo = photos.find((p) => p.id === photoId)
    if (!photo) return
    try {
      const img = await createImageBitmap(photo.blob)
      const canvas = document.createElement('canvas')
      canvas.width = img.height
      canvas.height = img.width
      const ctx = canvas.getContext('2d')!
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(Math.PI / 2)
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
        if (activePhotoId === photoId) {
          const wc = workCanvasRef.current
          if (wc) {
            createImageBitmap(blob).then((bmp) => {
              wc.width = bmp.width; wc.height = bmp.height
              wc.getContext('2d')!.drawImage(bmp, 0, 0)
              bmp.close()
            }).catch(() => {})
          }
        }
      }, photo.mimeType || 'image/jpeg', 0.95)
    } catch { setNotice('Rotation failed.') }
  }, [photos, activePhotoId])

  // Compute zone delete button positions from current transform
  const zoneDeletePositions = useMemo(() => {
    if (!showBoxes) return []
    const t = transformRef.current
    if (t.drawWidth === 0) return []
    return activeZones.map((zone) => {
      const rect = zoneToCanvasRect(zone, t)
      // Position the 16×16 delete button just outside the right edge of the zone, at the top
      return { id: zone.id, top: rect.y, left: rect.x + rect.width + 2 }
    })
  // We intentionally re-compute when transform changes via renderCanvas calls
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeZones, showBoxes, activeImageSize, cursorPoint])

  return (
    <div
      className="app-shell"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="topbar">
        <button className="brand" type="button" onClick={() => setAboutOpen(true)} title="About W3PN Anonymizer">
          <span className="brand-eye">
            <EyeClosedIcon />
            <span className="brand-dot-lime" />
          </span>
          <h1>W3PN Anonymizer</h1>
          <span className="brand-chevron"><Icon name="expand_more" size={14} /></span>
        </button>

        <span className="topbar-tagline">
          <span className="download-menu-wrap" ref={downloadMenuRef}>
            <button
              className="topbar-tagline-link download-trigger"
              type="button"
              onClick={() => setDownloadMenuOpen((v) => !v)}
            >downloadable ▾</button>
            {downloadMenuOpen && (
              <div className="download-dropdown">
                <a href="https://github.com/web3privacy/w3pn-anonymizer/releases/latest/download/W3PN-Anonymizer.dmg"
                  className="download-dropdown-item">
                  <Icon name="laptop_mac" size={14} /> Download for macOS
                </a>
                <a href="https://github.com/web3privacy/w3pn-anonymizer/releases/latest/download/W3PN-Anonymizer-Setup.exe"
                  className="download-dropdown-item">
                  <Icon name="desktop_windows" size={14} /> Download for Windows
                </a>
                <a href="https://github.com/web3privacy/w3pn-anonymizer/releases/latest/download/W3PN-Anonymizer.AppImage"
                  className="download-dropdown-item">
                  <Icon name="computer" size={14} /> Download for Linux
                </a>
                <div className="download-dropdown-divider" />
                <a href="https://github.com/web3privacy/w3pn-anonymizer/releases" target="_blank" rel="noreferrer"
                  className="download-dropdown-item" onClick={() => setDownloadMenuOpen(false)}>
                  <Icon name="open_in_new" size={14} /> All releases on GitHub
                </a>
              </div>
            )}
          </span>
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

        {/* Processing mode toggle + badge — grouped tightly */}
        <div className="topbar-processing-group">
          {/* Privacy shield icon */}
          <div className="privacy-shield-wrap">
            <button
              className={`privacy-shield-btn${processingLocal ? ' secure' : ''}`}
              type="button"
              title="Privacy status"
              aria-label="Privacy status"
              onClick={() => setAboutOpen(true)}
            >
              <Icon name={processingLocal ? 'verified_user' : 'shield'} size={14} />
            </button>
            <div className="privacy-shield-tooltip">
              <div className="privacy-shield-title">
                {processingLocal ? '✅ Fully Local' : '⚠️ Hybrid Mode'}
              </div>
              <ul className="privacy-shield-list">
                <li className="ok">No analytics or tracking</li>
                <li className="ok">No third-party fonts or CDNs</li>
                <li className="ok">CSP blocks outbound connections</li>
                <li className="ok">Images stay in browser memory</li>
                <li className={processingLocal ? 'ok' : 'warn'}>
                  {processingLocal ? 'Face detection: browser-only' : 'Face detection: may use server'}
                </li>
              </ul>
            </div>
          </div>

          <span className="topbar-privacy-badge visible">
            {processingLocal ? 'Your data never leaves your device' : 'Data processed by W3PN server, no data saved'}
          </span>

          <div
            className="processing-toggle"
            title={processingLocal
              ? 'Local mode — all processing in your browser. Click to switch to server.'
              : 'Server mode — may use backend for better accuracy. Click for fully local.'}
          >
            <button
              className={`processing-toggle-opt${!processingLocal ? ' active' : ''}`}
              type="button"
              onClick={() => {
                setProcessingLocal(false); setForceLocal(false); localStorage.setItem('anonymizer-processing-local', 'false')
                resetDetectorStatus()
                initializeDetector().then((s) => setDetector(s))
              }}
            >
              <Icon name="cloud" size={11} /> Server
            </button>
            <button
              className={`processing-toggle-opt${processingLocal ? ' active' : ''}`}
              type="button"
              onClick={() => {
                setProcessingLocal(true); setForceLocal(true); localStorage.setItem('anonymizer-processing-local', 'true')
                resetDetectorStatus()
                initializeDetector().then((s) => setDetector(s))
              }}
            >
              <Icon name="lock" size={11} /> Local
            </button>
          </div>
        </div>

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

      {/* hidden file inputs */}
      <input ref={uploadInputRef} type="file" accept="image/*,video/*" multiple onChange={handleUploadInput} hidden />
      <input ref={folderInputRef} type="file" multiple onChange={handleFolderInput} hidden
        // @ts-expect-error webkitdirectory is not in React's type defs
        webkitdirectory="" directory="" />

      {/* ── Workspace — flex row: sidebar | resizer | batch | tool-strip | editor ── */}
      <div className="workspace">

        {/* ── Welcome screen (no photos loaded) ──────────────── */}
        {photos.length === 0 && (
          <div
            className={`welcome-screen${isDragOver ? ' drag-active' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {isDragOver ? (
              <div className="welcome-drag-overlay">
                <Icon name="folder_open" size={52} />
                <span>Drop to add photos or folders</span>
              </div>
            ) : (
              <div className="welcome-content">
                <button className="welcome-upload-btn" type="button" onClick={openUnifiedPicker}>
                  <Icon name="cloud_upload" size={48} />
                  <span className="welcome-upload-title">Upload media</span>
                  <span className="welcome-upload-sub">Drop files, paste from clipboard, or click to browse</span>
                  <span className="welcome-upload-formats">JPG · PNG · WebP · GIF · BMP · MP4 · WebM · and more</span>
                  <span className="welcome-upload-shortcut">
                    <kbd className="kbd">{navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+V</kbd> paste from clipboard
                  </span>
                </button>

                <div className="welcome-features">
                  {[
                    { icon: 'visibility_off', title: 'Face Anonymization', desc: 'Auto-detect and blur, pixelate, or cover faces with emoji' },
                    { icon: 'videocam', title: 'Video Anonymization', desc: 'Frame-by-frame local video processing — MP4, WebM, MOV' },
                    { icon: 'brush', title: 'Brush & Zone Tools', desc: 'Paint over or draw rectangles on any sensitive area' },
                    { icon: 'polyline', title: 'SVG Vectorization', desc: 'Convert images to SVG with live preview and 8 presets' },
                    { icon: 'batch_prediction', title: 'Batch Processing', desc: 'Resize, crop, convert, grade, and anonymize photos in bulk' },
                    { icon: 'lock', title: 'Fully Local', desc: 'No data ever leaves your device — no cloud, no tracking' },
                  ].map((f) => (
                    <button key={f.icon} className="welcome-feature-card" type="button" onClick={() => setAboutOpen(true)}>
                      <Icon name={f.icon} size={20} />
                      <div>
                        <div className="welcome-feature-title">{f.title}</div>
                        <div className="welcome-feature-desc">{f.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
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
                    disabled={photos.length === 0 || isNormalizing || isBusy || selectedForBatch.size === 0}
                    title={selectedForBatch.size === 0 ? 'Select photos first' : `Process ${selectedForBatch.size} selected photos`}
                  >
                    {isNormalizing
                      ? `Processing ${normalizeProgressPercent}%`
                      : `Process ${selectedForBatch.size} photo${selectedForBatch.size !== 1 ? 's' : ''}`}
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

          {/* 1. Auto-detect toggle — color states: green=backend, orange=local, red=failed */}
          <div className="ts-tooltip-wrap" style={{ position: 'relative' }}>
            {(() => {
              const detMode = (detector as { mode?: string }).mode
              const backendOff = detMode !== 'backend' && detMode !== 'mediapipe' && detMode !== 'yunet-wasm'
              const btnClass = lastDetectFailed && autoDetect
                ? ' ts-btn-fail'
                : backendOff ? ' ts-btn-setup' : ''
              return (<>
                <button
                  className={`ts-btn ts-btn-autodetect${autoDetect ? ' active' : ''}${btnClass}`}
                  type="button"
                  onClick={() => {
                    const next = !autoDetect
                    setAutoDetect(next)
                    setShowBoxes(next)
                  }}
                  onDoubleClick={() => openDepsModal()}
                  title={autoDetect ? 'Face detection ON (double-click for settings)' : 'Face detection OFF'}
                >
                  <Icon name="face_retouching_natural" filled={autoDetect} size={18} />
                  {autoDetect && activeZones.length > 0 && (
                    <span className="ts-face-count-inline">{activeZones.length}</span>
                  )}
                </button>
                <span className="ts-tooltip">
                  {lastDetectFailed && autoDetect
                    ? 'No faces found — double-click for settings'
                    : autoDetect
                      ? `Detection: ON${activeZones.length > 0 ? ` · ${activeZones.length} face${activeZones.length !== 1 ? 's' : ''}` : ''}${backendOff ? ' · local mode' : ''}`
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
            <span className="ts-tooltip">{toolMode === 'brush' ? 'Brush (active)' : 'Brush'}</span>
          </div>

          {/* Color Adjustments flyout */}
          {adjFlyoutOpen && adjFlyoutAnchor && createPortal(
            <div
              className="ts-flyout-portal ts-flyout"
              style={{ position: 'fixed', top: adjFlyoutAnchor.top, left: adjFlyoutAnchor.left, zIndex: 9999 }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="ts-flyout-title">Color adjustments</div>
              <div className="color-presets">
                {COLOR_PRESETS.filter((p) => !['faded', 'newspaper', '4-colors'].includes(p.id)).map((p) => (
                  <button key={p.id} type="button" className={`color-preset-btn ${colorAdj.preset === p.id ? 'active' : ''}`} onClick={() => setColorPreset(p.id)}>
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="color-sliders" style={{ marginTop: '0.4rem' }}>
                {([
                  ['brightness', 'Bright'],
                  ['contrast', 'Contrast'],
                  ['saturation', 'Sat'],
                  ['shadows', 'Shadows'],
                  ['highlights', 'High'],
                ] as [keyof ColorAdjustments, string][]).map(([key, label]) => (
                  <div key={key} className="color-slider-row" style={{ gridTemplateColumns: '52px 1fr 28px' }}>
                    <span className="color-slider-label" style={{ fontSize: '0.65rem' }}>{label}</span>
                    <input
                      type="range"
                      className="color-slider-input"
                      min={-100}
                      max={100}
                      value={colorAdj[key] as number}
                      onChange={(e) => setColorAdj((cur) => ({ ...cur, [key]: Number(e.target.value), preset: 'none' }))}
                    />
                    <span className="color-slider-val">{(colorAdj[key] as number) > 0 ? '+' : ''}{colorAdj[key]}</span>
                  </div>
                ))}
              </div>
              <div className="color-actions" style={{ marginTop: '0.4rem' }}>
                <button className="btn btn-sm" type="button" onClick={() => {
                  setColorAdj(DEFAULT_COLOR_ADJUSTMENTS)
                  renderCanvas()
                }} title="Reset color adjustments">Reset</button>
              </div>
            </div>,
            document.body
          )}

          {/* Transform Effects flyout */}
          {transformFlyoutOpen && transformFlyoutAnchor && createPortal(
            <div
              className="ts-flyout-portal ts-flyout"
              style={{ position: 'fixed', top: transformFlyoutAnchor.top, left: transformFlyoutAnchor.left, zIndex: 9999 }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="ts-flyout-title">Transform effects</div>
              <select
                className="field-select"
                style={{ width: '100%', marginBottom: '0.3rem' }}
                value={adjTransform}
                onChange={(e) => setAdjTransform(e.target.value)}
              >
                <option value="none">None</option>
                <option value="halftone">Halftone</option>
                <option value="glitch">Glitch</option>
                <option value="pixel-shift">Pixel shift</option>
                <option value="color-shift">Color shift</option>
              </select>
              {adjTransform === 'halftone' && (<>
                {[['Dot size', 'dotSize', 2, 30] as const, ['Contrast', 'halftoneContrast', 0, 100] as const, ['Angle', 'halftoneAngle', 0, 360] as const].map(([label, key, min, max]) => (
                  <div key={key} className="color-slider-row" style={{ gridTemplateColumns: '60px 1fr 28px' }}>
                    <span className="color-slider-label" style={{ fontSize: '0.62rem' }}>{label}</span>
                    <input type="range" className="color-slider-input" min={min} max={max} value={adjTransformParams[key]} onChange={(e) => setAdjParam(key, Number(e.target.value))} />
                    <span className="color-slider-val">{adjTransformParams[key]}</span>
                  </div>
                ))}
              </>)}
              {adjTransform === 'glitch' && (
                <div className="color-slider-row" style={{ gridTemplateColumns: '60px 1fr 28px' }}>
                  <span className="color-slider-label" style={{ fontSize: '0.62rem' }}>Shift</span>
                  <input type="range" className="color-slider-input" min={1} max={40} value={adjTransformParams.glitchShift} onChange={(e) => setAdjParam('glitchShift', Number(e.target.value))} />
                  <span className="color-slider-val">{adjTransformParams.glitchShift}</span>
                </div>
              )}
              {adjTransform === 'pixel-shift' && (<>
                <div className="color-slider-row" style={{ gridTemplateColumns: '60px 1fr' }}>
                  <span className="color-slider-label" style={{ fontSize: '0.62rem' }}>Type</span>
                  <select className="field-select" style={{ fontSize: '0.66rem', padding: '0.15rem 0.3rem' }} value={adjPixelShiftType} onChange={(e) => setAdjPixelShiftType(e.target.value as PixelShiftType)}>
                    <option value="wave">Wave</option>
                    <option value="shear">Shear</option>
                    <option value="ripple">Ripple</option>
                    <option value="mirror">Mirror</option>
                  </select>
                </div>
                {[['X shift', 'pixelShiftX', 1, 60] as const, ['Y shift', 'pixelShiftY', 1, 60] as const].map(([label, key, min, max]) => (
                  <div key={key} className="color-slider-row" style={{ gridTemplateColumns: '60px 1fr 28px' }}>
                    <span className="color-slider-label" style={{ fontSize: '0.62rem' }}>{label}</span>
                    <input type="range" className="color-slider-input" min={min} max={max} value={adjTransformParams[key]} onChange={(e) => setAdjParam(key, Number(e.target.value))} />
                    <span className="color-slider-val">{adjTransformParams[key]}</span>
                  </div>
                ))}
              </>)}
              {adjTransform === 'color-shift' && (<>
                {[['Hue rotate', 'colorShiftHue', 0, 360] as const, ['Sat boost', 'colorShiftSat', 0, 100] as const].map(([label, key, min, max]) => (
                  <div key={key} className="color-slider-row" style={{ gridTemplateColumns: '60px 1fr 28px' }}>
                    <span className="color-slider-label" style={{ fontSize: '0.62rem' }}>{label}</span>
                    <input type="range" className="color-slider-input" min={min} max={max} value={adjTransformParams[key]} onChange={(e) => setAdjParam(key, Number(e.target.value))} />
                    <span className="color-slider-val">{adjTransformParams[key]}</span>
                  </div>
                ))}
              </>)}
              {adjTransform !== 'none' && (
                <div className="color-slider-row" style={{ gridTemplateColumns: '60px 1fr 28px' }}>
                  <span className="color-slider-label" style={{ fontSize: '0.62rem' }}>Amount</span>
                  <input type="range" className="color-slider-input" min={1} max={80} value={adjTransformStrength} onChange={(e) => setAdjTransformStrength(Number(e.target.value))} />
                  <span className="color-slider-val">{adjTransformStrength}</span>
                </div>
              )}
              <div className="color-actions" style={{ marginTop: '0.4rem' }}>
                <button className="btn btn-sm" type="button" onClick={() => {
                  resetAdjTransformPreview()
                }} title="Reset transform effects">Reset</button>
                <button
                  className="btn btn-sm btn-primary"
                  type="button"
                  onClick={() => { void applyAdjTransformToCanvas() }}
                  disabled={!activePhoto || adjTransform === 'none'}
                  title="Apply transform to photo"
                >
                  Apply
                </button>
              </div>
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
                    onClick={() => updateSelectedZoneEffect(ef.id)}
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

          {/* 7. Brush size slider */}
          <div className="ts-slider-group">
            <span className="ts-slider-label">SIZE</span>
            <input
              className="ts-slider"
              type="range"
              min={4}
              max={100}
              value={Math.min(brushSize, 100)}
              onChange={(e) => { const v = Number(e.target.value); brushSizeRef.current = v; setBrushSize(v) }}
              title={`Brush size: ${brushSize}px`}
            />
            <span className="ts-slider-val">{Math.min(brushSize, 100)}</span>
          </div>

          {/* 8. Strength slider */}
          <div className="ts-slider-group">
            <span className="ts-slider-label">STR</span>
            <input
              className="ts-slider"
              type="range"
              min={1}
              max={100}
              value={Math.round(brushStrength * 100)}
              onChange={(e) => { const v = Number(e.target.value) / 100; setBrushStrength(v) }}
              title={`Strength: ${Math.round(brushStrength * 100)}%`}
            />
            <span className="ts-slider-val">{Math.round(brushStrength * 100)}%</span>
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
                            <button className="btn btn-sm" type="button" onClick={() => { if (!activePhoto) { setNotice('Select a photo first.'); return }; setIsNormalizeCropPicking((v) => !v); setNormalizeCropDraft(null); pointerSessionRef.current = { mode: 'idle' } }} disabled={isNormalizing}>
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
                {!isLosslessFormat(exportFormat) && (
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

                {/* Save to disk + Download — grouped on the right */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.3rem', flexShrink: 0, position: 'relative' }}>
                  {/* Floppy: write to disk — shows error flyout if no file permissions */}
                  <div style={{ position: 'relative' }}>
                    <button
                      className="tb-btn tb-btn-save"
                      type="button"
                      onClick={saveActivePhoto}
                      disabled={isBusy || !activePhoto}
                      title="Save to disk — overwrites original file (requires desktop app mode)"
                      aria-label="Save to disk"
                    >
                      <Icon name="save" size={17} />
                    </button>
                    {saveErrorVisible && (
                      <div style={{
                        position: 'absolute', bottom: 'calc(100% + 6px)', right: 0,
                        background: 'var(--panel-bg)', border: '1px solid var(--danger)',
                        borderRadius: 6, padding: '0.35rem 0.55rem', fontSize: '0.68rem',
                        color: 'var(--danger)', whiteSpace: 'nowrap', zIndex: 200,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
                        pointerEvents: 'none',
                      }}>
                        No permissions — work only in desktop app mode
                      </div>
                    )}
                  </div>
                  {/* Download: export/download anonymized file */}
                  <button
                    className="tb-btn"
                    style={{ background: '#3b5bdb', borderColor: '#3b5bdb', color: '#fff', fontWeight: 600 }}
                    type="button"
                    onClick={activePhoto?.isVideo ? exportActiveVideo : exportActivePhoto}
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
                {processingLocal && (
                  <div className="local-proof-bar">
                    <div className="local-proof-progress" />
                    <span className="local-proof-label">
                      <Icon name="lock" size={10} /> All data stays on your device
                    </span>
                  </div>
                )}
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
            {!isDetecting && localProcessingMs != null && processingLocal && (
              <div className="local-proof-badge">
                <Icon name="verified_user" size={11} /> Processed locally in {localProcessingMs} ms
              </div>
            )}

            {/* Video processing overlay */}
            {videoProcessing && videoProgress && (
              <div className="detecting-overlay" style={{ flexDirection: 'column', gap: '0.6rem' }}>
                <span>🎬</span>
                <span>
                  {videoProgress.phase === 'analyzing'
                    ? 'Analyzing video tracks'
                    : videoProgress.phase === 'preparing'
                      ? 'Preparing frame map'
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
                  <video
                    key={activeVideoUrl}
                    ref={activeVideoRef}
                    src={activeVideoUrl}
                    controls
                    className="video-player"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    onTimeUpdate={(event) => setActiveVideoTime(event.currentTarget.currentTime)}
                    onSeeked={(event) => setActiveVideoTime(event.currentTarget.currentTime)}
                    onLoadedMetadata={(event) => setActiveVideoTime(event.currentTarget.currentTime)}
                  />
                  <div
                    className={`video-mask-layer${videoMaskDrawActive ? ' drawing' : ''}`}
                    onPointerDown={handleVideoMaskPointerDown}
                    onPointerMove={handleVideoMaskPointerMove}
                    onPointerUp={handleVideoMaskPointerUp}
                    onPointerCancel={handleVideoMaskPointerUp}
                  >
                    {[...visibleVideoTimedZones.map((item) => item.zone), ...(videoDraftZone ? [videoDraftZone] : [])].map((zone) => (
                      <div
                        key={zone.id}
                        className={`video-mask-rect${zone.id === 'draft-video-mask' ? ' draft' : ''}`}
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
                <div className="video-controls-bar">
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
                    className="btn btn-primary"
                    type="button"
                    onClick={processActiveVideo}
                    disabled={videoProcessing || isBusy}
                  >
                    <Icon name="auto_awesome" size={16} /> Anonymize Video
                  </button>
                  {hasPendingVideoEdits && (
                    <button
                      className="btn btn-sm"
                      type="button"
                      onClick={processActiveVideo}
                      disabled={videoProcessing || isBusy}
                      title="Bake frame snapshots and timeline masks into the anonymized video"
                    >
                      <Icon name="task_alt" size={14} /> Apply Changes
                    </button>
                  )}
                  {activePhoto.edited && (
                    <button
                      className="btn btn-sm"
                      type="button"
                      onClick={exportActiveVideo}
                      disabled={videoProcessing}
                    >
                      <Icon name="download" size={14} /> Export Video
                    </button>
                  )}
                  <button
                    className="btn btn-sm"
                    type="button"
                    onClick={() => stepActiveVideoFrame(-1)}
                    disabled={videoProcessing || isBusy}
                    title="Step one frame back"
                  >
                    <Icon name="skip_previous" size={14} /> Frame -
                  </button>
                  <button
                    className="btn btn-sm"
                    type="button"
                    onClick={() => stepActiveVideoFrame(1)}
                    disabled={videoProcessing || isBusy}
                    title="Step one frame forward"
                  >
                    <Icon name="skip_next" size={14} /> Frame +
                  </button>
                  <button
                    className="btn btn-sm"
                    type="button"
                    onClick={openCurrentVideoFrameAsSnapshot}
                    disabled={videoProcessing || isBusy}
                    title="Open the current video frame as an editable snapshot"
                  >
                    <Icon name="image" size={14} /> Edit Current Frame
                  </button>
                  <button
                    className={`btn btn-sm${videoMaskDrawActive ? ' active' : ''}`}
                    type="button"
                    onClick={() => setVideoMaskDrawActive((cur) => !cur)}
                    disabled={videoProcessing || isBusy}
                    title="Draw a rectangle over the video and bake it into a time range"
                  >
                    <Icon name="select" size={14} /> Draw Time Mask
                  </button>
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
                  {activeVideoFrameOverrides.length > 0 && (
                    <span className="video-meta-badge" title="Manual frame overrides that will be baked into the next video render">
                      Manual fixes: {activeVideoFrameOverrides.length}
                    </span>
                  )}
                  {activeVideoTimedZones.length > 0 && (
                    <>
                      <span className="video-meta-badge" title="Manual timeline masks that will be baked into the next video render">
                        Time masks: {activeVideoTimedZones.length}
                      </span>
                      <button className="btn btn-sm" type="button" onClick={clearVideoTimedZones} disabled={videoProcessing}>
                        Reset Masks
                      </button>
                    </>
                  )}
                  <span
                    className="video-meta-badge"
                    title={`Timeline worker: ${videoPipelineCapabilities.timelineWorker ? 'yes' : 'no'} · Manual frame pacing: ${videoPipelineCapabilities.manualCanvasFrameCapture ? 'yes' : 'no'} · WebCodecs renderer: ${videoPipelineCapabilities.webCodecsRenderer ? 'available' : 'not available'} · Raw WebCodecs encoder: ${videoPipelineCapabilities.webCodecs ? 'available' : 'not available'}`}
                  >
                    Pipeline: {videoPipelineCapabilities.timelineWorker ? 'worker' : 'main'} · {videoPipelineCapabilities.webCodecsRenderer ? 'WebCodecs render' : 'MediaRecorder'}
                  </span>
                  {activePhoto.videoDuration != null && (
                    <span className="video-meta-badge">
                      {formatVideoTime(activePhoto.videoDuration)}
                      {activePhoto.videoWidth ? ` · ${activePhoto.videoWidth}×${activePhoto.videoHeight}` : ''}
                      {activePhoto.videoFps ? ` · ${Math.round(activePhoto.videoFps)} fps` : ''}
                    </span>
                  )}
                </div>
              </div>
            )}

            <canvas
              ref={canvasRef}
              className={batchPanelOpen && !isNormalizeCropPicking ? 'readonly-canvas' : ''}
              style={activePhoto?.isVideo ? { display: 'none' } : (toolMode === 'crop' ? { cursor: 'crosshair' } : undefined)}
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
            {showBoxes && activeZones.length > 0 && (
              <div className="zone-delete-layer" style={{ pointerEvents: toolMode === 'brush' ? 'none' : undefined }}>
                {zoneDeletePositions.map(({ id, top, left }) => (
                  <button
                    key={id}
                    className="zone-delete-btn"
                    type="button"
                    style={{ top, left }}
                    onClick={(e) => { e.stopPropagation(); removeZoneById(id) }}
                    title="Remove this face box"
                    aria-label="Remove this face box"
                  >
                    ×
                  </button>
                ))}
              </div>
            )}

            {/* Crop draft overlay */}
            {toolMode === 'crop' && cropDraft && cropDraft.w > 0.002 && (() => {
              const t = transformRef.current
              const x = cropDraft.x * t.imageWidth * t.scale + t.drawX
              const y = cropDraft.y * t.imageHeight * t.scale + t.drawY
              const w = cropDraft.w * t.imageWidth * t.scale
              const h = cropDraft.h * t.imageHeight * t.scale
              return (
                <div
                  style={{
                    position: 'absolute', left: x, top: y, width: w, height: h,
                    border: '2px dashed var(--accent)',
                    background: 'rgba(112,255,136,0.08)',
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

            {/* Vectorize panel — flyout from toolbar */}
            {vectorizePanelOpen && activePhoto && !activePhoto.isVideo && (
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

                {vectorizeParams.preset === 'default' && (<>
                  <label className="vectorize-label">Colors: {vectorizeParams.colorCount}</label>
                  <input type="range" min={2} max={64} value={vectorizeParams.colorCount}
                    onChange={(e) => updateVectorizeParam('colorCount', Number(e.target.value))} />

                  <label className="vectorize-label">Smoothing: {vectorizeParams.minPathLength.toFixed(1)}</label>
                  <input type="range" min={0.5} max={10} step={0.5} value={vectorizeParams.minPathLength}
                    onChange={(e) => updateVectorizeParam('minPathLength', Number(e.target.value))} />

                  <label className="vectorize-label">Corner rounding: {vectorizeParams.cornerThreshold.toFixed(1)}</label>
                  <input type="range" min={0} max={2} step={0.1} value={vectorizeParams.cornerThreshold}
                    onChange={(e) => updateVectorizeParam('cornerThreshold', Number(e.target.value))} />
                </>)}

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

            {/* Reset button — top-left (shown when photo has edits) */}
            {activePhoto && (activePhoto.edited || dirtyByPhoto[activePhoto.id] || undoCount > 0) && (
              <button
                className="undo-corner-btn"
                type="button"
                onClick={resetPhotoToOriginal}
                title="Reset photo to original — undo all edits"
              >
                <Icon name="restart_alt" size={14} /> Reset
              </button>
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
            {activePhoto && toolMode !== 'crop' && activeZones.length > 0 && (
              <div className="viewer-corner">
                <button
                  className={`corner-btn${zonesAnonymized ? '' : ' corner-btn-primary'}`}
                  type="button"
                  onClick={applyZones}
                  disabled={isBusy || zonesAnonymized}
                  title={zonesAnonymized ? 'Already applied — change zones or effect to re-apply' : `Apply anonymization to ${activeZones.length} zone${activeZones.length !== 1 ? 's' : ''}`}
                >
                  {zonesAnonymized ? 'Applied ✓' : 'Anonymize'}
                </button>
              </div>
            )}
          </div>
        </div>
        </>)}
      </div>

      {/* ── About modal ───────────────────────────────────── */}
      {/* ── Backend deps modal ───────────────────────────────────────────── */}
      {depsModalOpen && (
        <div className="about-backdrop" onClick={() => setDepsModalOpen(false)}>
          <div className="about-modal deps-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <button className="about-modal-close" type="button" onClick={() => setDepsModalOpen(false)}>✕ Close</button>
            <h2 style={{ margin: '0 0 0.4rem', fontSize: '1.05rem' }}>Face Detection</h2>

            {/* ── Active mode pill ──────────────────────────── */}
            {(() => {
              const dm = (detector as { mode?: string }).mode
              const isGood = dm === 'backend' || dm === 'yunet-wasm' || dm === 'mediapipe'
              return (
                <div style={{ padding: '0.35rem 0.5rem', borderRadius: 6, background: isGood ? 'var(--accent-soft)' : 'rgba(255,169,77,0.08)', border: `1px solid ${isGood ? 'rgba(112,255,136,0.2)' : 'rgba(255,169,77,0.2)'}`, marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: 600 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: isGood ? 'var(--accent)' : 'var(--warn)' }} />
                    {dm === 'backend' ? 'Python backend — highest accuracy'
                      : dm === 'yunet-wasm' ? 'YuNet (WASM) — high accuracy, fully local'
                      : dm === 'mediapipe' ? 'MediaPipe BlazeFace — fast local detection'
                      : 'Browser AI — basic detection'}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '0.1rem', paddingLeft: '1.2rem' }}>
                    {dm === 'backend' ? 'OpenCV YuNet on localhost server.'
                      : dm === 'yunet-wasm' ? 'Same YuNet model as Python backend, running locally via ONNX Runtime WebAssembly. High accuracy, fully offline.'
                      : dm === 'mediapipe' ? 'Google MediaPipe WASM — fast, offline, no GPU needed.'
                      : <>face-api.js fallback.{getFaceApiBackendName() && <> Using: <strong>{getFaceApiBackendName()}</strong></>}</>}
                    {' '}All data stays on your device.
                  </div>
                </div>
              )
            })()}

            {/* ── Enable auto-detect toggle ─────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0', marginBottom: '0.4rem' }}>
              <button
                type="button"
                onClick={() => { setAutoDetect(!autoDetect); setShowBoxes(!autoDetect) }}
                style={{
                  width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                  background: autoDetect ? 'var(--accent)' : 'var(--border)',
                }}
              >
                <span style={{
                  position: 'absolute', top: 2, left: autoDetect ? 18 : 2, width: 16, height: 16, borderRadius: '50%',
                  background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }} />
              </button>
              <span style={{ fontSize: '0.72rem', fontWeight: 500 }}>Auto-detect faces when opening photos</span>
            </div>

            {/* ── Install Python server ────────────────────── */}
            {(detector as { mode?: string }).mode !== 'backend' && (detector as { mode?: string }).mode !== 'yunet-wasm' && (detector as { mode?: string }).mode !== 'mediapipe' && (<>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 0.5rem' }} />
              <div style={{ fontSize: '0.74rem', fontWeight: 600, marginBottom: '0.15rem' }}>Upgrade to Python backend</div>
              <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', margin: '0 0 0.35rem', lineHeight: 1.45 }}>
                The built-in browser AI works, but a local Python server gives <strong>much better accuracy</strong> using{' '}
                <a href="https://github.com/opencv/opencv_zoo/tree/main/models/face_detection_yunet" target="_blank" rel="noreferrer" className="about-link">OpenCV YuNet</a>.
                It runs on your computer at <code style={{ fontSize: '0.6rem' }}>127.0.0.1:7865</code> — no data leaves your machine.
              </p>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.35rem', lineHeight: 1.45 }}>
                <strong>What gets installed:</strong>{' '}
                <a href="https://pypi.org/project/fastapi/" target="_blank" rel="noreferrer" className="about-link">FastAPI</a>,{' '}
                <a href="https://pypi.org/project/uvicorn/" target="_blank" rel="noreferrer" className="about-link">Uvicorn</a>,{' '}
                <a href="https://pypi.org/project/opencv-contrib-python/" target="_blank" rel="noreferrer" className="about-link">OpenCV</a>,{' '}
                <a href="https://pypi.org/project/Pillow/" target="_blank" rel="noreferrer" className="about-link">Pillow</a>,{' '}
                <a href="https://pypi.org/project/numpy/" target="_blank" rel="noreferrer" className="about-link">NumPy</a>{' '}
                — all inside a virtual environment (<code style={{ fontSize: '0.58rem' }}>server/.venv</code>).
                Requires <a href="https://python.org/downloads" target="_blank" rel="noreferrer" className="about-link">Python ≥ 3.9</a>.
              </div>

              {/* Electron — true one-click */}
              {(window as unknown as { electronBackend?: { checkPython: () => Promise<{ cmd: string; version: string } | null>; installDeps: () => Promise<{ ok: boolean; message: string }>; startServer: () => Promise<{ ok: boolean; message: string }> } }).electronBackend ? (
                <button
                  className="deps-install-btn"
                  type="button"
                  disabled={depsInstalling}
                  onClick={async () => {
                    const eb = (window as unknown as { electronBackend: { checkPython: () => Promise<{ cmd: string; version: string } | null>; installDeps: () => Promise<{ ok: boolean; message: string; stderr?: string }>; startServer: () => Promise<{ ok: boolean; message: string }> } }).electronBackend
                    setDepsInstalling(true)
                    setInstallResult(null)
                    try {
                      const py = await eb.checkPython()
                      if (!py) {
                        setInstallResult({ ok: false, returncode: -1, stdout: '', stderr: '', message: 'Python not found. Install Python 3.9+ from python.org first.' })
                        return
                      }
                      setInstallResult({ ok: true, returncode: 0, stdout: '', stderr: '', message: `Found ${py.version}. Installing…` })
                      const inst = await eb.installDeps()
                      if (!inst.ok) { setInstallResult({ ok: false, returncode: 1, stdout: '', stderr: inst.message, message: inst.message }); return }
                      setInstallResult({ ok: true, returncode: 0, stdout: '', stderr: '', message: 'Starting server…' })
                      const srv = await eb.startServer()
                      setInstallResult({ ok: srv.ok, returncode: srv.ok ? 0 : 1, stdout: '', stderr: srv.ok ? '' : srv.message, message: srv.message })
                      if (srv.ok) {
                        setTimeout(() => {
                          initializeDetector().then((s) => { setDetector(s); setNotice(`Backend connected: ${s.message}`); setDepsModalOpen(false) })
                        }, 2000)
                      }
                    } catch (e) {
                      setInstallResult({ ok: false, returncode: -1, stdout: '', stderr: '', message: `${e instanceof Error ? e.message : String(e)}` })
                    } finally { setDepsInstalling(false) }
                  }}
                >
                  <Icon name="play_arrow" size={18} />
                  {depsInstalling ? 'Setting up…' : 'Install & start Python server'}
                </button>
              ) : (
                /* Web — download script */
                <button
                  className="deps-install-btn"
                  type="button"
                  onClick={downloadInstallScript}
                >
                  <Icon name="download" size={18} />
                  Download install script ({isWindows ? '.bat' : '.sh'})
                </button>
              )}

              {/* Script preview toggle */}
              <div style={{ marginTop: '0.25rem', marginBottom: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowInstallScript(!showInstallScript)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.58rem', padding: 0, textDecoration: 'underline' }}
                >
                  {showInstallScript ? 'Hide script source ▲' : 'View full script source ▼'}
                </button>
              </div>
              {showInstallScript && (
                <pre style={{
                  background: 'var(--surface-muted)', border: '1px solid var(--border)',
                  borderRadius: 6, padding: '0.4rem', fontSize: '0.55rem', lineHeight: 1.45,
                  maxHeight: 200, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                  color: 'var(--text-primary)', marginBottom: '0.35rem',
                }}>
                  {isWindows ? INSTALL_SCRIPT_BAT : INSTALL_SCRIPT_SH}
                </pre>
              )}

              {/* Instructions for web users */}
              {!(window as unknown as { electronBackend?: unknown }).electronBackend && (
                <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '0.3rem' }}>
                  <strong>How to use:</strong> Download the script → open it to review → {isWindows
                    ? 'double-click the .bat file to run it'
                    : <>open Terminal, run <code style={{ fontSize: '0.55rem' }}>chmod +x anonymizer-setup.sh && ./anonymizer-setup.sh</code></>
                  }. The script installs everything in a virtual environment and starts the server.
                  This app will auto-detect it.
                </div>
              )}

              {/* If server already reachable, offer direct install */}
              {depsStatus && !depsStatus.all_ok && (
                <button
                  className="deps-install-btn"
                  type="button"
                  onClick={runInstall}
                  disabled={depsInstalling}
                  style={{ background: 'var(--accent)', marginBottom: '0.25rem' }}
                >
                  <Icon name="build" size={18} />
                  {depsInstalling ? 'Installing…' : 'Server running — install missing packages'}
                </button>
              )}
            </>)}

            {/* Deps status (if backend reachable) */}
            {depsStatus && (
              <div style={{ padding: '0.25rem 0.4rem', borderRadius: 6, border: '1px solid var(--border)', marginBottom: '0.3rem', fontSize: '0.62rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--accent)', marginBottom: '0.1rem' }}>Server dependencies:</div>
                {depsStatus.deps.map((d) => (
                  <div key={d.pkg} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <span style={{ color: d.ok ? 'var(--accent)' : 'var(--warn)' }}>{d.ok ? '✓' : '✗'}</span>
                    <span>{d.label}</span>
                    {d.ok && d.version && <span style={{ color: 'var(--text-muted)' }}>{d.version}</span>}
                  </div>
                ))}
                {!depsStatus.all_ok && (
                  <button className="deps-install-btn" type="button" onClick={runInstall} disabled={depsInstalling}
                    style={{ marginTop: '0.25rem', fontSize: '0.65rem', padding: '0.3rem 0.6rem' }}>
                    {depsInstalling ? 'Installing…' : 'Install missing'}
                  </button>
                )}
              </div>
            )}

            {/* Install result */}
            {installResult && (
              <div style={{
                padding: '0.25rem 0.4rem', borderRadius: 5, fontSize: '0.64rem',
                background: installResult.ok ? 'rgba(0,200,80,0.06)' : 'rgba(220,60,60,0.06)',
                border: `1px solid ${installResult.ok ? 'var(--accent)' : 'var(--danger)'}`,
                color: installResult.ok ? 'var(--accent)' : 'var(--danger)',
              }}>
                {installResult.message}
              </div>
            )}
          </div>
        </div>
      )}

      {aboutOpen && (
        <div className="about-backdrop" onClick={() => setAboutOpen(false)}>
          <div className="about-modal" onClick={(e) => e.stopPropagation()}>
            <button className="about-modal-close" type="button" onClick={() => setAboutOpen(false)}>✕ Close</button>
            <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              W3PN Anonymizer
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.6rem', lineHeight: 1.5 }}>
              A community project by{' '}
              <a href="https://www.web3privacy.info" target="_blank" rel="noreferrer" className="about-link">Web3Privacy Now</a>
              {' '}— privacy-first image and video anonymization tool. Everything runs locally in your browser.
            </p>

            <h3 style={{ margin: '0.7rem 0 0.3rem', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Features</h3>
            <ul style={{ margin: '0 0 0.4rem', paddingLeft: '1.1rem' }}>
              {[
                '🎭 14+ anonymization effects — blur, pixelate, blackout, emoji, glitch, thermal, halftone, silhouette, noise, swirl, contour, diamond, and more',
                '✏️ Brush & zone tools — paint or draw rectangles over any region, adjustable size',
                '🤖 Auto face detection — browser-side AI (face-api.js / TensorFlow.js) + optional Python backend (OpenCV YuNet)',
                '🎨 Color adjustments — brightness, contrast, saturation, shadows, highlights, temperature + presets',
                '🌀 Transform effects — halftone, glitch, pixel shift (wave / zoom / shear / ripple / mirror), color shift',
                '🎬 Video anonymization — frame-by-frame local processing with MediaRecorder for MP4, WebM, MOV, and more',
                '📐 Batch processing — resize, crop, format convert, color grade, transforms, auto-anonymize hundreds of photos',
                '📦 Export: JPEG, PNG, WebP, BMP, GIF, TIFF + ZIP for batch downloads',
                '🖼️ SVG vectorization — convert images to SVG with 8 presets, custom parameters, and live preview',
                '📸 Save snapshot — freeze intermediate edits as new photos in the explorer',
                '🖥️ Desktop apps — downloadable for macOS, Windows, and Linux (Electron)',
              ].map((item) => (
                <li key={item} style={{ marginBottom: '0.22rem', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{item}</li>
              ))}
            </ul>

            <h3 style={{ margin: '0.7rem 0 0.3rem', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Privacy & security</h3>
            <ul style={{ margin: '0 0 0.4rem', paddingLeft: '1.1rem' }}>
              {[
                '🔒 100% local by default — all processing runs in your browser, no uploads',
                '🛡️ Local / Server toggle — choose fully local or optional server-assisted detection',
                '📊 CPU timing proof — shows processing time to verify local execution',
                '🚫 No analytics, no cookies, no tracking — zero external network requests',
                '🔤 Self-hosted fonts — Material Symbols served locally, no Google CDN',
                '🌐 Content Security Policy — blocks unintended outbound connections',
              ].map((item) => (
                <li key={item} style={{ marginBottom: '0.22rem', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{item}</li>
              ))}
            </ul>

            <h3 style={{ margin: '0.7rem 0 0.3rem', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Open-source integrations</h3>
            <ul style={{ margin: '0 0 0.4rem', paddingLeft: '1.1rem' }}>
              {OPEN_SOURCE_CANDIDATES.map((item) => (
                <li key={item.name} style={{ marginBottom: '0.25rem', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  <a href={item.url} target="_blank" rel="noreferrer" className="about-link">{item.name}</a>
                  {' — '}{item.note}
                </li>
              ))}
            </ul>

            <div style={{ margin: '0.8rem 0 0', borderTop: '1px solid var(--border)', paddingTop: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <p style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Built with love by the{' '}
                <a href="https://www.web3privacy.info" target="_blank" rel="noreferrer" className="about-link">Web3Privacy Now</a>
                {' '}community. Source code on{' '}
                <a href="https://github.com/web3privacy/w3pn-anonymizer" target="_blank" rel="noreferrer" className="about-link">GitHub</a>.
              </p>
              <button
                className="btn btn-sm"
                type="button"
                onClick={() => { setAboutOpen(false); setFeedbackOpen(true) }}
                style={{ flexShrink: 0, fontSize: '0.7rem' }}
              >
                Give us Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Feedback modal ──────────────────────────────────── */}
      {feedbackOpen && (
        <div className="about-backdrop" onClick={() => setFeedbackOpen(false)}>
          <div className="about-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <button className="about-modal-close" type="button" onClick={() => setFeedbackOpen(false)}>✕ Close</button>
            <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem' }}>Send Feedback</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.6rem', lineHeight: 1.5 }}>
              We'd love to hear from you! Your message will be sent to the W3PN team.
            </p>
            <textarea
              className="feedback-textarea"
              rows={6}
              placeholder="Tell us what you think, report a bug, or suggest a feature…"
              value={feedbackMsg}
              onChange={(e) => setFeedbackMsg(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button className="btn btn-sm" type="button" onClick={() => setFeedbackOpen(false)}>Cancel</button>
              <a
                className="btn btn-sm btn-primary"
                href={`mailto:web3privacynow@protonmail.com?subject=${encodeURIComponent('W3PN Anonymizer Feedback')}&body=${encodeURIComponent(feedbackMsg)}`}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
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
