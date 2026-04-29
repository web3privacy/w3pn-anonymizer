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
import { detectFaces, initializeDetector, getDetectorStatus, checkDeps, triggerInstall } from './lib/detector'
import type { DepsStatus, InstallResult } from './lib/detector'
import { EFFECTS, applyColorAdjustments, applyEffectBrush, applyEffectRect, applyGlitchEffect, pickRandomEmoji, previewEffectBrush } from './lib/effects'
import type { PixelShiftType } from './lib/effects'
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
  '/demo/demo-1.webp',
  '/demo/demo-2.webp',
  '/demo/demo-3.jpg',
  '/demo/demo-4.png',
  '/demo/demo-5.png',
]

const OPEN_SOURCE_CANDIDATES = [
  { name: 'vladmandic/face-api', url: 'https://github.com/vladmandic/face-api', note: 'Local Tiny Face Detector running entirely in the browser via TensorFlow.js/WebGL.' },
  { name: 'opencv/opencv (YuNet)', url: 'https://github.com/opencv/opencv', note: 'High-accuracy face detection via the optional local Python backend (FastAPI).' },
  { name: 'nodeca/pica', url: 'https://github.com/nodeca/pica', note: 'High-quality in-browser image resizing (Lanczos filter, Web Workers).' },
  { name: 'Donaldcwl/browser-image-compression', url: 'https://github.com/Donaldcwl/browser-image-compression', note: 'Worker-based JPEG/WebP compression in batch mode.' },
  { name: 'jwagner/smartcrop.js', url: 'https://github.com/jwagner/smartcrop.js', note: 'Content-aware smart crop suggestion.' },
  { name: '9am/img-halftone', url: 'https://github.com/9am/img-halftone', note: 'Canvas-based halftone pattern effect.' },
  { name: 'Stuk/jszip', url: 'https://github.com/Stuk/jszip', note: 'Client-side ZIP archive creation for batch export.' },
  { name: 'eligrey/FileSaver.js', url: 'https://github.com/eligrey/FileSaver.js', note: 'File download trigger for browsers.' },
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

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'tif', 'avif', 'heic', 'heif'])
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB per file
const MAX_TOTAL_PHOTOS = 2000
const isImageFile = (f: File) => {
  if (f.size > MAX_FILE_SIZE) return false
  if (f.type && f.type.startsWith('image/')) return true
  const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
  return IMAGE_EXTENSIONS.has(ext)
}

const fmtBytes = (b: number) => {
  if (b < 1024 * 100) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
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
  const [autoDetect, setAutoDetect] = useState(true)   // auto-detect faces on photo open
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
  const [isExporting, setIsExporting] = useState(false)
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

  // New UI state
  const [effectFlyoutOpen, setEffectFlyoutOpen] = useState(false)
  const [adjFlyoutOpen, setAdjFlyoutOpen] = useState(false)
  // colorPanelOpen mirrors adjFlyoutOpen — enables live preview in renderCanvas without committing
  const colorPanelOpen = adjFlyoutOpen
  const [folderTreeOpen, setFolderTreeOpen] = useState(false)
  const [currentFolderPrefix, setCurrentFolderPrefix] = useState('')
  // Refs for flyout anchor buttons (to compute fixed position)
  const adjFlyoutBtnRef = useRef<HTMLButtonElement>(null)
  const effectFlyoutBtnRef = useRef<HTMLButtonElement>(null)
  const filenameTipRef = useRef<HTMLSpanElement>(null)
  const [filenameTipPos, setFilenameTipPos] = useState<{ top: number; left: number } | null>(null)
  const [adjFlyoutAnchor, setAdjFlyoutAnchor] = useState<{ top: number; left: number } | null>(null)
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
    if (!adjFlyoutOpen && !effectFlyoutOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      // Close if click is outside a flyout portal div
      const flyouts = document.querySelectorAll('.ts-flyout-portal')
      for (const f of flyouts) { if (f.contains(target)) return }
      // Also don't close if click was on the toggle button itself
      if (adjFlyoutBtnRef.current?.contains(target)) return
      if (effectFlyoutBtnRef.current?.contains(target)) return
      setAdjFlyoutOpen(false)
      setEffectFlyoutOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [adjFlyoutOpen, effectFlyoutOpen])
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

  const activePhoto = useMemo(() => photos.find((p) => p.id === activePhotoId) ?? null, [photos, activePhotoId])
  const activeZones = useMemo(() => (activePhotoId ? zonesByPhoto[activePhotoId] ?? [] : []), [zonesByPhoto, activePhotoId])
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
      // Transform preview (halftone/glitch etc.) from adj flyout
      const tc = transformPreviewCanvasRef.current
      if (tc && tc.width > 0 && adjFlyoutOpen) {
        drawSource = tc
      // Quality preview shows compressed visual
      } else {
        const qc = qualityPreviewCanvasRef.current
        if (qc && qc.width > 0 && exportFormat !== 'image/png') {
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

    // Draw zone outlines (if visible)
    if (showBoxes) {
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
    activePhoto, activeNormalizeCrop, activeZones, adjFlyoutOpen, batchPanelOpen,
    colorAdj, colorPanelOpen, draftZone, exportFormat, isNormalizeCropPicking,
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
    applyEffectBrush(ctx, selectedEffect, pointer.imageX, pointer.imageY, radius, brushStrength, pickRandomEmoji())
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
      pickRandomEmoji(),
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
    const valid = records.filter((r) => isImageFile(r.file))
    if (valid.length === 0) { setNotice('No supported images found (check file types and size limit of 50 MB).'); return }
    // Prevent excessive photo count
    const currentCount = photosRef.current.length
    const remaining = Math.max(0, MAX_TOTAL_PHOTOS - currentCount)
    if (remaining === 0) { setNotice(`Maximum ${MAX_TOTAL_PHOTOS} photos reached.`); return }
    if (valid.length > remaining) { valid.length = remaining; setNotice(`Added ${remaining} photos (max ${MAX_TOTAL_PHOTOS}).`) }
    const incoming: PhotoItem[] = valid.map((r) => ({
      id: createId(), name: r.name, mimeType: r.file.type || 'image/jpeg',
      blob: r.file, previewUrl: URL.createObjectURL(r.file),
      source: r.source, edited: false, fileHandle: r.handle,
    }))
    const originals: Record<string, Blob> = {}
    incoming.forEach((p) => { originals[p.id] = p.blob })
    setOriginalBlobByPhoto((cur) => ({ ...cur, ...originals }))
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
          (en as FileSystemFileEntry).file((f) => { if (isImageFile(f)) files.push(f); res() }, () => res())
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
            if (isImageFile(file)) {
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
          if (isImageFile(file)) {
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
    setAdjFlyoutOpen(false)
    const saved = colorAdjByPhoto[photoId]
    setColorAdj(saved ? { ...saved } : DEFAULT_COLOR_ADJUSTMENTS)
    // Reset export format to photo's native format
    const photo = photos.find((p) => p.id === photoId)
    if (photo) {
      const fmt = photo.mimeType as NormalizeFormat
      if (['image/jpeg', 'image/png', 'image/webp'].includes(fmt)) setExportFormat(fmt)
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
                if (!isImageFile(f)) return
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
        const handles = await picker({ multiple: true, types: [{ description: 'Images', accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.avif'] } }] })
        const records: InputRecord[] = []
        for (const handle of handles) {
          const f = await handle.getFile()
          if (isImageFile(f)) records.push({ file: f, name: f.name, source: 'local-folder', handle })
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

  const detectFacesOnActiveImage = useCallback(async (robust = false) => {
    if (!activePhoto) return
    const workCanvas = workCanvasRef.current
    if (!workCanvas || workCanvas.width === 0) return
    setIsDetecting(true)
    setNotice(robust ? 'Running thorough detection…' : 'Detecting faces…')
    try {
      const boxes = await detectFaces(workCanvas, robust)
      if (boxes.length === 0) {
        setNotice('No faces detected.')
        return
      }
      const zones: Zone[] = boxes.map((b) => ({
        id: createId(),
        x: clamp(b.x / workCanvas.width, 0, 1),
        y: clamp(b.y / workCanvas.height, 0, 1),
        width: clamp(b.width / workCanvas.width, 0.02, 1),
        height: clamp(b.height / workCanvas.height, 0.02, 1),
        effect: selectedEffect,
        emoji: pickRandomEmoji(),
      }))
      setActiveZones(() => zones)
      setSelectedZoneId(zones[0]?.id ?? null)
      const src = getDetectorStatus()
      const detSrc = src?.mode === 'backend' ? `(${(src as { backendDetector?: string }).backendDetector ?? 'backend'})` : src?.mode ?? ''
      setNotice(`Detected ${zones.length} face${zones.length === 1 ? '' : 's'} ${detSrc}.`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setNotice(`Detection error: ${msg}`)
      console.error('Face detection error:', err)
    } finally {
      setIsDetecting(false)
      renderCanvas()
    }
  }, [activePhoto, renderCanvas, selectedEffect, setActiveZones])

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
      const blob = exportFormat === 'image/png'
        ? await quantizeCanvasToBlob(workCanvas, exportPngDepth)
        : await canvasToBlob(workCanvas, exportFormat, exportQuality / 100)
      const baseName = activePhoto.name.split('/').pop() ?? activePhoto.name
      const ext = exportFormat === 'image/jpeg' ? 'jpg' : exportFormat === 'image/webp' ? 'webp' : 'png'
      const outName = baseName.replace(/\.[^.]+$/, '') + `-anon.${ext}`
      saveAs(blob, outName)
      setNotice(`Exported: ${outName}`)
    } catch { setNotice('Export failed.') }
    finally { setIsBusy(false) }
  }, [activePhoto, exportFormat, exportQuality, exportPngDepth])

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
              const coloredBlob = await canvasToBlob(tmp, s.outputFormat)
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
            const glitchedBlob = await canvasToBlob(glitched, s.outputFormat)
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
                boxes.forEach((b) => applyEffectRect(tmpCtx, effId, b.x, b.y, b.width, b.height, strength, pickRandomEmoji()))
              }
            } catch { /* detection failed — skip anonymize for this photo */ }
            const anonBlob = await canvasToBlob(tmp, s.outputFormat)
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

  const applyColorAdjToActive = useCallback(() => {
    const wc = workCanvasRef.current
    if (!wc || wc.width === 0) return
    const ctx = getWorkCtx()
    if (!ctx) return
    applyColorAdjustments(ctx, colorAdj, wc)
    setActiveDirty(true)
    if (activePhotoId) {
      setColorAdjByPhoto((cur) => ({ ...cur, [activePhotoId]: { ...colorAdj } }))
    }
    renderCanvas()
  }, [activePhotoId, colorAdj, getWorkCtx, renderCanvas, setActiveDirty])

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
    renderCanvas()
  }, [adjTransform, adjTransformParams, adjTransformStrength, pushUndo, renderCanvas, setActiveDirty])
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
    if (exportFormat === 'image/png') {
      quantizeCanvasToBlob(wc, exportPngDepth).then((blob) => {
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
    if (!adjFlyoutOpen || adjTransform === 'none') {
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
  }, [adjFlyoutOpen, adjTransform, adjTransformStrength, adjTransformParams, adjPixelShiftType, activePhoto?.id])

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

  const runInstall = useCallback(async () => {
    setDepsInstalling(true)
    setInstallResult(null)
    try {
      const result = await triggerInstall()
      setInstallResult(result)
      const status = await checkDeps()
      setDepsStatus(status)
    } catch { setInstallResult({ ok: false, returncode: -1, stdout: '', stderr: 'Request failed', message: 'Install request failed — is the server running?' }) }
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

      // Auto-detect faces unless we already have zones for this photo
      const alreadyHasZones = (zonesByPhoto[activePhoto.id] ?? []).length > 0
      if (autoDetect && !alreadyHasZones && detector.mode !== 'unavailable') {
        setIsBusy(false)
        if (cancelled) return
        await detectFacesOnActiveImage(true)
      }
    }).catch(() => setNotice('Failed to load photo.'))
      .finally(() => { if (!cancelled) setIsBusy(false) })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePhoto?.id])  // only re-run when photo switches, not on every render

  useEffect(() => { renderCanvas() }, [renderCanvas, activeZones, selectedZoneId, draftZone, cursorPoint, toolMode, showBoxes])

  // Re-run face detection when autoDetect is toggled ON for the current photo
  useEffect(() => {
    if (!autoDetect || !activePhoto) return
    const alreadyHasZones = activeZones.length > 0
    if (!alreadyHasZones && detector.mode !== 'unavailable') {
      detectFacesOnActiveImage(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDetect])

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
    if (activePhotoId === photoId) setActivePhotoId(null)
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
          <a
            href="https://github.com/web3privacy/w3pn-anonymizer"
            target="_blank"
            rel="noreferrer"
            className="topbar-tagline-link"
          >downloadable</a>
          {' · private · no data collected'}
        </span>

        <div className="topbar-gap" />

        {/* Demo button — small, muted */}
        <button
          className="topbar-demo-btn"
          type="button"
          onClick={loadDemoPhotos}
          disabled={isBusy}
          title="Load demo photos"
        >
          Demo
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

      {/* hidden file inputs */}
      <input ref={uploadInputRef} type="file" accept="image/*" multiple onChange={handleUploadInput} hidden />
      <input ref={folderInputRef} type="file" multiple onChange={handleFolderInput} hidden
        // @ts-expect-error webkitdirectory is not in React's type defs
        webkitdirectory="" directory="" />

      {/* ── Workspace — flex row: sidebar | resizer | batch | tool-strip | editor ── */}
      <div className="workspace">
        {/* ── Sidebar ───────────────────────────────────────── */}
        <aside
          className="sidebar"
          style={{
            width: photos.length === 1 && !batchPanelOpen ? 0 : sidebarWidth,
            flexShrink: 0,
            overflow: 'hidden',
            transition: 'width 0.18s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {photos.length === 0 ? (
            /* Empty state — large drop zone */
            <button
              className={`sidebar-dropzone${isDragOver ? ' drag-active' : ''}`}
              type="button"
              onClick={openUnifiedPicker}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <span className="sidebar-dropzone-icon"><Icon name="upload_file" size={36} /></span>
              <span>Drop photos or a folder here</span>
              <span className="sidebar-dropzone-link">Browse files</span>
              <span style={{ fontSize: '0.65rem', opacity: 0.55 }}>
                JPG · PNG · WebP · and more
              </span>
            </button>
          ) : (
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
                      <button className="icon-btn" type="button" onClick={selectAllForBatch} title="Select all"><Icon name="done_all" size={14} /></button>
                      <button className="icon-btn" type="button" onClick={deselectAllForBatch} title="Deselect all"><Icon name="remove_done" size={14} /></button>
                    </>
                  )}
                  <button className={`icon-btn ${sidebarView === 'grid' ? 'active' : ''}`} type="button" onClick={() => setSidebarView('grid')} title="Thumbnails"><Icon name="grid_view" size={14} /></button>
                  <button className={`icon-btn ${sidebarView === 'list' ? 'active' : ''}`} type="button" onClick={() => setSidebarView('list')} title="List"><Icon name="list" size={14} /></button>
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
                          onClick={(e) => { e.stopPropagation(); rotatePhoto(photo.id) }}
                        >
                          <Icon name="rotate_90_degrees_cw" size={13} />
                        </button>
                        <button
                          className="photo-item-action-btn photo-item-action-btn--danger"
                          type="button"
                          title="Remove from list"
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

          {/* 1. Auto-detect toggle — unified: ON=zones visible+active, OFF=zones hidden */}
          <div className="ts-tooltip-wrap" style={{ position: 'relative' }}>
            <button
              className={`ts-btn ts-btn-autodetect${autoDetect ? ' active' : ''}${(detector as { mode?: string }).mode !== 'backend' ? ' ts-btn-warn' : ''}`}
              type="button"
              onClick={() => {
                const next = !autoDetect
                setAutoDetect(next)
                setShowBoxes(next)   // ON → show zones, OFF → hide zones
              }}
              title={autoDetect ? 'Face detection ON — click to disable and hide zones' : 'Face detection OFF — click to enable and show zones'}
            >
              <Icon name="face_retouching_natural" filled={autoDetect} size={18} />
              {autoDetect && activeZones.length > 0 && (
                <span className="ts-face-count-inline">{activeZones.length}</span>
              )}
            </button>
            {/* Orange deps-warning dot — shown when Python backend is not active */}
            {(detector as { mode?: string }).mode !== 'backend' && (
              <button
                className="ts-deps-dot"
                type="button"
                title="Python backend unavailable — click for details and install options"
                onClick={(e) => { e.stopPropagation(); openDepsModal() }}
              />
            )}
            <span className="ts-tooltip">
              {autoDetect
                ? `Detection: ON${activeZones.length > 0 ? ` · ${activeZones.length} face${activeZones.length !== 1 ? 's' : ''}` : ''}`
                : 'Detection: OFF (zones hidden)'}
              {(detector as { mode?: string }).mode !== 'backend' && ' · backend offline'}
            </span>
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
            >
              <Icon name="brush" size={18} />
            </button>
            <span className="ts-tooltip">{toolMode === 'brush' ? 'Brush (active)' : 'Brush'}</span>
          </div>

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
              {/* Transform section */}
              <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.4rem' }}>
                <div style={{ fontSize: '0.64rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Transform</div>
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
              </div>
              <div className="color-actions" style={{ marginTop: '0.4rem' }}>
                <button className="btn btn-sm" type="button" onClick={() => {
                  setColorAdj(DEFAULT_COLOR_ADJUSTMENTS)
                  setAdjTransform('none')
                  setAdjTransformStrength(35)
                  if (transformPreviewCanvasRef.current) transformPreviewCanvasRef.current.width = 0
                  renderCanvas()
                }} title="Reset all color and transform adjustments">Reset all</button>
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
              }}
              disabled={!activePhoto}
              title="Color adjustments"
            >
              <Icon name="tune" size={18} />
            </button>
            <span className="ts-tooltip">Adjustments</span>
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
                          </select>
                        </div>
                        {normalizeSettings.outputFormat !== 'image/png' && (
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
                {exportFormat !== 'image/png' && (
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
                    onClick={exportActivePhoto}
                    disabled={!activePhoto || isBusy}
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
              <div className="detecting-overlay">
                <span>⏳</span>
                <span>Detecting faces…</span>
              </div>
            )}

            <canvas
              ref={canvasRef}
              className={batchPanelOpen && !isNormalizeCropPicking ? 'readonly-canvas' : ''}
              style={toolMode === 'crop' ? { cursor: 'crosshair' } : undefined}
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
      </div>

      {/* ── About modal ───────────────────────────────────── */}
      {/* ── Backend deps modal ───────────────────────────────────────────── */}
      {depsModalOpen && (
        <div className="about-backdrop" onClick={() => setDepsModalOpen(false)}>
          <div className="about-modal deps-modal" onClick={(e) => e.stopPropagation()}>
            <button className="about-modal-close" type="button" onClick={() => setDepsModalOpen(false)}>✕ Close</button>
            <h2 style={{ margin: '0 0 0.3rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: (detector as { mode?: string }).mode === 'backend' ? 'var(--accent)' : 'var(--warn)', flexShrink: 0 }} />
              Python backend — {(detector as { mode?: string }).mode === 'backend' ? 'connected' : 'not connected'}
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.7rem', lineHeight: 1.5 }}>
              {(detector as { mode?: string }).mode === 'backend'
                ? 'The local Python backend is running. Face detection uses OpenCV YuNet — highest accuracy.'
                : 'The app is using browser-based AI (face-api.js) for face detection. For higher accuracy, set up the local Python backend.'}
            </p>

            {/* Current detection mode */}
            <div style={{ fontSize: '0.75rem', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Active detection mode</div>
              {[
                { label: 'Python backend (OpenCV YuNet)', mode: 'backend', best: true },
                { label: 'Native browser FaceDetector', mode: 'native', best: false },
                { label: 'face-api.js (JS fallback)', mode: 'face-api', best: false },
                { label: 'Unavailable', mode: 'unavailable', best: false },
              ].map(({ label, mode, best }) => {
                const active = (detector as { mode?: string }).mode === mode
                return (
                  <div key={mode} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: active ? 1 : 0.35 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: active ? (best ? 'var(--accent)' : 'var(--warn)') : 'var(--border)' }} />
                    <span style={{ color: active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {label}{best && <span style={{ color: 'var(--accent)', marginLeft: 4, fontSize: '0.68rem' }}>recommended</span>}
                    </span>
                  </div>
                )
              })}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.5rem 0 0.75rem' }} />

            {/* Install guide */}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
              How to start the backend
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.7rem' }}>
              {[
                { os: 'macOS / Linux', cmd: './server/install.sh && ./server/start.sh' },
                { os: 'Windows', cmd: 'server\\install.bat && server\\start.bat' },
              ].map(({ os, cmd }) => (
                <div key={os} style={{ fontSize: '0.72rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{os}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
                    <code style={{
                      flex: 1, background: 'var(--input-bg)', border: '1px solid var(--border)',
                      borderRadius: 4, padding: '0.2rem 0.4rem', fontSize: '0.7rem',
                      fontFamily: 'monospace', color: 'var(--text-primary)', wordBreak: 'break-all',
                    }}>{cmd}</code>
                    <button
                      className="tb-btn"
                      type="button"
                      style={{ fontSize: '0.62rem', padding: '0.15rem 0.4rem', flexShrink: 0 }}
                      title="Copy to clipboard"
                      onClick={() => navigator.clipboard?.writeText(cmd)}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Deps check table — only if backend is reachable */}
            {depsStatus ? (
              <>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.5rem 0 0.6rem' }} />
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Dependency status (backend is reachable)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', marginBottom: '0.5rem' }}>
                  {depsStatus.deps.map((d) => (
                    <div key={d.pkg} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: d.ok ? 'var(--accent)' : 'var(--warn)' }} />
                      <span style={{ flex: 1, color: d.ok ? 'var(--text-primary)' : 'var(--warn)' }}>{d.label}</span>
                      {d.ok && <span style={{ color: 'var(--text-muted)' }}>{d.version}</span>}
                      {!d.ok && <span style={{ color: 'var(--warn)', fontWeight: 600 }}>MISSING</span>}
                    </div>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', marginTop: '0.1rem' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: depsStatus.yunet_model_present ? 'var(--accent)' : 'var(--warn)' }} />
                    <span style={{ flex: 1, color: depsStatus.yunet_model_present ? 'var(--text-primary)' : 'var(--warn)' }}>YuNet ONNX model</span>
                    {!depsStatus.yunet_model_present && <span style={{ color: 'var(--warn)', fontWeight: 600 }}>will download on start</span>}
                    {depsStatus.yunet_model_present && <span style={{ color: 'var(--text-muted)' }}>present</span>}
                  </div>
                </div>
                {!depsStatus.all_ok && (
                  <button
                    className="tb-btn"
                    type="button"
                    style={{ background: 'var(--warn)', borderColor: 'var(--warn)', color: '#fff', fontWeight: 600, fontSize: '0.75rem', width: '100%', justifyContent: 'center' }}
                    disabled={depsInstalling}
                    onClick={runInstall}
                  >
                    {depsInstalling ? '⏳ Installing…' : '⚙ Install missing dependencies'}
                  </button>
                )}
                {installResult && (
                  <div style={{
                    marginTop: '0.5rem', padding: '0.3rem 0.5rem', borderRadius: 5, fontSize: '0.7rem',
                    background: installResult.ok ? 'rgba(0,200,80,0.1)' : 'rgba(220,60,60,0.1)',
                    border: `1px solid ${installResult.ok ? 'var(--accent)' : 'var(--danger)'}`,
                    color: installResult.ok ? 'var(--accent)' : 'var(--danger)',
                  }}>
                    {installResult.message}
                    {installResult.ok && <div style={{ marginTop: '0.3rem', color: 'var(--text-muted)' }}>Restart the backend server to apply changes.</div>}
                    {!installResult.ok && installResult.stderr && (
                      <pre style={{ marginTop: '0.3rem', fontSize: '0.62rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 120, overflow: 'auto', color: 'var(--text-muted)' }}>{installResult.stderr}</pre>
                    )}
                  </div>
                )}
              </>
            ) : (depsModalOpen && (detector as { mode?: string }).mode !== 'backend') ? (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Backend not reachable — run the install script above, then start the server.
              </div>
            ) : null}
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
              {' '}— an open-source initiative building privacy tools for everyone.
            </p>

            <h3 style={{ margin: '0.7rem 0 0.3rem', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>What it does</h3>
            <ul style={{ margin: '0 0 0.4rem', paddingLeft: '1.1rem' }}>
              {[
                '🎭 Anonymize faces with blur, pixelate, blackout, emoji, glitch, thermal, and more',
                '✏️ Brush and zone tools — paint or draw rectangles over any area',
                '🤖 Auto face detection (browser AI + optional local Python backend)',
                '🎨 Color adjustments: brightness, contrast, saturation, shadows, highlights + presets',
                '🌀 Transform effects: halftone, glitch, pixel shift (wave / zoom / shear / ripple / mirror), color shift',
                '📐 Batch processing: resize, crop, format conversion, color grading, transforms, auto-anonymize',
                '📦 ZIP export of all processed photos',
                '🌙 Fully local — no photo ever leaves your device, no cloud, no tracking',
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

            <p style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', margin: '0.8rem 0 0', borderTop: '1px solid var(--border)', paddingTop: '0.6rem', lineHeight: 1.5 }}>
              Built with love by the{' '}
              <a href="https://www.web3privacy.info" target="_blank" rel="noreferrer" className="about-link">Web3Privacy Now</a>
              {' '}community. Source code on{' '}
              <a href="https://github.com/web3privacy/w3pn-anonymizer" target="_blank" rel="noreferrer" className="about-link">GitHub</a>.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
