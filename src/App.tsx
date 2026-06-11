import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import './App.css'
import './mobile/mobile-redesign.css'
import './desktop/desktop-v2.css'
import { DesktopHomeDefault } from './desktop/DesktopHomeDefault'
import { DesktopTopBar } from './desktop/DesktopTopBar'
import { CanvasViewer } from './desktop/CanvasViewer'
import { EditorActionToolbar } from './desktop/EditorActionToolbar'
import { EditorBatchPanel } from './desktop/EditorBatchPanel'
import { EditorSidebar } from './desktop/EditorSidebar'
import { EditorToolStrip } from './desktop/EditorToolStrip'
import { EffectPickerDialog } from './components/EffectPickerDialog'
import { AudioModeViewer } from './components/AudioModeViewer'
import { decodeAudioBlob, getAudioContext } from './lib/audio/audioUtils'
import { renderProcessedAudioBuffer } from './lib/audio/audioPipeline'
import {
  encodeAudioBuffer,
  supportedAudioExportFormats,
  anonymizedAudioFilename,
  type AudioExportFormatId,
} from './lib/audio/audioExport'
import { VideoTrackModeSelect } from './components/VideoTrackModeSelect'
import { DocumentMode } from './components/document/DocumentMode'
import { FeedbackModal } from './components/FeedbackModal'
import { PickerChoiceDialog } from './components/PickerChoiceDialog'
import { useUndoStack } from './hooks/useUndoStack'
import { useCanvasPointer, type BrushStamp } from './hooks/useCanvasPointer'
import { useDetector } from './hooks/useDetector'
import { useVectorize } from './hooks/useVectorize'
import { useVideoController } from './hooks/useVideoController'
import { useBatchNormalize } from './hooks/useBatchNormalize'
import { usePhotoLibrary } from './hooks/usePhotoLibrary'
import type { InputRecord } from './lib/photo-library'
import { useThemeMode } from './hooks/useThemeMode'
import {
  type DrawTransform,
  DEFAULT_TRANSFORM,
  zoneToCanvasRect,
  rotateZones90,
  computeViewTransform,
  mapClientPointToImage,
  type PointerMap,
} from './lib/canvas-geometry'
import { drawZoneInView, drawNormalizeCropInView } from './lib/canvas-overlays'
import { isMediaFile, fmtBytes, makeZipSafeName } from './lib/media-files'
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
import type { AppMobileBindings, MobileBatchState } from './mobile/bindings'
import { buildMobileBindings } from './mobile/buildMobileBindings'
import { MobileBindingsProvider } from './mobile/MobileBindingsProvider'
import { customImageFolderForSource } from './lib/custom-image-presets'
import { canvasToBlob, exportCanvasToBlob, stripMetadata, type PngDepth } from './lib/export-canvas'
import { createId, pickCustomImageAssetId, brushStampSeed } from './lib/ids'
import type { MobileMode, MobilePanel, MobileToolCategory } from './mobile/types'
import { CROP_TOOLS, EFFECT_TOOL_ORDER, FACE_TOOLS, panelForCategory, ZONE_TOOLS } from './mobile/toolRotation'
import type { AdjustToolId, CropToolId, EffectToolId, FaceToolId, ZoneToolId } from './mobile/toolRotation'
import { usePrivacyDetectionConfig } from './hooks/usePrivacyDetectionConfig'
import { probeAllYoloModels } from './lib/privacyDetectionPipeline'
import { privacyDetectionsToZones } from './lib/detections/adapters'
import { detectFaces } from './lib/detector'
import { formatDetectionSummary, usesExtendedPrivacyDetection, applyFaceConfidenceToConfig } from './lib/detections/run-image-detection'
import { faceBoxToPrivacyDetection } from './lib/detections/adapters'
import { getCategoryConfig } from './lib/detection-config'
import { dedupeOverlappingDetections } from './lib/detectors/detectorUtils'
import { detectPiiViaOcr, isPiiTextEnabled } from './lib/detectors/ocrPiiDetector'
import { runPrivacyDetectionOnSource } from './lib/privacyDetectionPipeline'
import type { PrivacyDetection } from './types'
import { initializeDetector, resetDetectorStatus, setDetectionProgressCallback } from './lib/detector'
import { ModelLoadStatus } from './components/ModelLoadStatus'
import { BackgroundAssetLoader } from './components/BackgroundAssetLoader'
import { startAssetPrefetch, prefetchGroupsForConfig } from './lib/asset-prefetch'
import { faceOffsetPads, zonesWithFaceOffset } from './lib/face-offset'
import {
  applyDistortPipeline,
  DEFAULT_DISTORT_STRENGTHS,
  type DistortEffectId,
} from './lib/distort-effects'
import { applyColorAdjustments, applyEffectRect, applyGlitchEffect, isColorAdjNoop, pickEmojiFromSeed, pickRandomEmoji, pickUniqueEmojis, setAsciiCharsetDefault } from './lib/effects'
import { selectBaseDrawSource, shouldShowZoneOverlays, viewerBackgroundColor } from './lib/canvas-render'
import {
  DEFAULT_ADJ_TRANSFORM_PARAMS,
  DEFAULT_NORMALIZE_SETTINGS,
  EMPTY_VIDEO_DISTORT_SETTINGS,
  type VideoDistortSettingsSnapshot,
} from './lib/editor-constants'
import { isLosslessFormat } from './lib/image-encoders'
import { type VectorizeParams } from './lib/vectorize'
import {
  detectFrameCropFromBlob,
  getCropRectNormalized,
  suggestContentAwareCropFromBlob,
} from './lib/normalize'
import type {
  AnonymizeEffectId,
  AsciiCharset,
  BatchTaskId,
  ColorAdjustments,
  ColorPresetId,
  CustomImageAsset,
  CustomImageSource,
  EffectRenderOptions,
  NormalizedRect,
  NormalizeCropMode,
  NormalizeFormat,
  NormalizeResult,
  NormalizeSettings,
  PhotoItem,
  SourceType,
  ToolMode,
  Zone,
  ModelAvailabilityStatus,
} from './types'
import { COLOR_PRESETS, DEFAULT_COLOR_ADJUSTMENTS } from './types'

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
  // ASCII glyph pool (all / numbers / a-z / exotic). Mirrored to a module-level
  // default in effects.ts so live/video/batch render paths pick it up too.
  const [asciiCharset, setAsciiCharsetState] = useState<AsciiCharset>('all')
  const setAsciiCharset = useCallback((charset: AsciiCharset) => {
    setAsciiCharsetDefault(charset)
    setAsciiCharsetState(charset)
  }, [])
  const [customImageAssets, setCustomImageAssets] = useState<CustomImageAsset[]>([])
  const [customImagePresetLoading, setCustomImagePresetLoading] = useState(false)
  const customImageAssetsRef = useRef<CustomImageAsset[]>([])
  // Emoji / custom-image picker dialog + chosen-vs-random selection.
  const [effectPickerOpen, setEffectPickerOpen] = useState<'emoji' | 'custom-image' | 'ascii' | null>(null)
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
  const detectingRef = useRef(false)
  const { theme, setTheme, effectiveTheme } = useThemeMode(isMobile)
  const { detector, setDetector, detectorLoading, modelLoadProgress, refreshDetector } = useDetector()
  const [autoDetect, setAutoDetect] = useState(true)   // auto-detect faces on photo open
  const [showBoxes, setShowBoxes] = useState(true)     // show/hide zone outlines
  const {
    detectionConfig,
    setCategoryEnabled,
    setCategoryThreshold,
    showDetectionLabels,
    setShowDetectionLabels,
    lastDetectionCounts,
    setLastDetectionCounts,
    modelStatus,
    setModelStatus,
    audioSettings,
    setAudioSettings,
    enabledClasses,
    setEnabledClasses,
    toggleDetectionClass,
  } = usePrivacyDetectionConfig()

  useEffect(() => {
    void probeAllYoloModels().then((yolo) => {
      setModelStatus((prev) => ({ ...prev, ...yolo }))
    })
  }, [setModelStatus])

  useEffect(() => {
    const yunetStatus: ModelAvailabilityStatus =
      detector.mode === 'yunet-wasm'
        ? 'ready'
        : detectorLoading
          ? 'loading'
          : 'missing'
    setModelStatus((prev) => ({ ...prev, 'yunet-face': yunetStatus }))
  }, [detector.mode, detectorLoading, setModelStatus])

  const [detectSensitivity, setDetectSensitivity] = useState(10) // 0..100 — small default headroom catches a few more faces
  const [videoAudioPanelOpen, setVideoAudioPanelOpen] = useState(false) // collapsible audio tools in the video editor
  // How far the anonymization box is grown around the detected face. The slider
  // reads 0–100 % but maps to a 0…0.5 padding fraction (see faceOffsetPads), so
  // "100 %" = +50 % of the face per side. Default covers the full head.
  const [detectFaceOffset, setDetectFaceOffset] = useState(40) // 0..100 (display)
  // Sensitivity → YuNet confidence threshold (higher sensitivity ⇒ lower bar).
  const detectConfidence = 0.7 - (detectSensitivity / 100) * 0.4
  const detectSettingsRef = useRef({ confidence: detectConfidence, thorough: false, faceOffset: detectFaceOffset, detectionConfig, modelStatus, enabledClasses })
  detectSettingsRef.current = { confidence: detectConfidence, thorough: false, faceOffset: detectFaceOffset, detectionConfig, modelStatus, enabledClasses }
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
  const batchPanelOpenRef = useRef(false)
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
  const showMobileToast = useCallback((message: string, action?: { label: string; onClick: () => void }) => {
    setMobileToast({ message, action })
  }, [])
  const [exportLibraryProgress, setExportLibraryProgress] = useState<{ done: number; total: number } | null>(null)
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const [feedbackSubject, setFeedbackSubject] = useState('')
  const [colorAdj, setColorAdj] = useState<ColorAdjustments>(DEFAULT_COLOR_ADJUSTMENTS)
  const [colorAdjByPhoto, setColorAdjByPhoto] = useState<Record<string, ColorAdjustments>>({})
  const [isApplyingAll, setIsApplyingAll] = useState(false)
  void isApplyingAll; void setIsApplyingAll
  const [sidebarWidth, setSidebarWidth] = useState(220)
  const [originalBlobByPhoto, setOriginalBlobByPhoto] = useState<Record<string, Blob>>({})
  const [selectedForBatch, setSelectedForBatch] = useState<Set<string>>(new Set())
  // Track whether the photo has had zones applied (for Anonymize/Reset button)
  const [appliedByPhoto, setAppliedByPhoto] = useState<Record<string, boolean>>({})
  const [imageMaskDrawActive, setImageMaskDrawActive] = useState(false)
  const [eraserActive, setEraserActive] = useState(false)
  const eraserActiveRef = useRef(false)

  useEffect(() => {
    if (imageMaskDrawActive && toolMode !== 'zone' && toolMode !== 'brush') {
      setToolMode('zone')
    }
  }, [imageMaskDrawActive, toolMode])
  useEffect(() => { eraserActiveRef.current = eraserActive }, [eraserActive])

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
  const setAdjParam = useCallback((key: keyof typeof DEFAULT_ADJ_TRANSFORM_PARAMS, value: number) =>
    setAdjTransformParams((p) => ({ ...p, [key]: value })), [])

  const [adjPixelShiftType, setAdjPixelShiftType] = useState<'wave' | 'shear' | 'ripple' | 'mirror'>('wave')
  const [enabledDistorts, setEnabledDistorts] = useState<DistortEffectId[]>([])
  const [distortStrengthByEffect, setDistortStrengthByEffect] = useState(DEFAULT_DISTORT_STRENGTHS)
  const [distortSettingsByVideoId, setDistortSettingsByVideoId] = useState<Record<string, VideoDistortSettingsSnapshot>>({})

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
  const mobileCanvasEditRef = useRef(false)
  const photosRef = useRef<PhotoItem[]>([])
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
  const mobilePreviewTransformRef = useRef<HTMLDivElement | null>(null)
  const mobilePinchActiveRef = useRef(false)
  const [mobileGestureActive, setMobileGestureActive] = useState(false)

  const activePhoto = useMemo(() => {
    if (!activePhotoId) return null
    return photos.find((p) => p.id === activePhotoId)
      ?? photosRef.current.find((p) => p.id === activePhotoId)
      ?? null
  }, [photos, activePhotoId])
  useEffect(() => { activePhotoIdRef.current = activePhotoId }, [activePhotoId])
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

  const activeZones = useMemo(() => (activePhotoId ? zonesByPhoto[activePhotoId] ?? [] : []), [zonesByPhoto, activePhotoId])
  const effectiveZones = useMemo(
    () => zonesWithFaceOffset(activeZones, detectFaceOffset),
    [activeZones, detectFaceOffset],
  )
  const normalizePreviewPhotos = useMemo(
    () => normalizePreviewIds.map((id) => photos.find((p) => p.id === id)).filter(Boolean) as PhotoItem[],
    [normalizePreviewIds, photos],
  )
  // When a subfolder is selected in the desktop folder tree, scope the visible
  // library to just that folder's contents (recursively). Root-level files and
  // an empty prefix show everything.
  const folderFilteredPhotos = useMemo(() => {
    if (!currentFolderPrefix) return photos
    const prefix = currentFolderPrefix + '/'
    return photos.filter((p) => p.name.startsWith(prefix))
  }, [photos, currentFolderPrefix])
  const displayedPhotos = useMemo(
    () => folderFilteredPhotos.slice(0, photoListLimit),
    [photoListLimit, folderFilteredPhotos],
  )
  const hasMorePhotosToRender = displayedPhotos.length < folderFilteredPhotos.length

  const normalizeProgressPercent = normalizeProgress.total > 0
    ? Math.round((normalizeProgress.done / normalizeProgress.total) * 100) : 0
  // crop preview is only relevant when the batch panel is open and crop picking is active
  const activeNormalizeCrop = activeImageSize && batchPanelOpen
    ? getCropRectNormalized(activeImageSize.width, activeImageSize.height, normalizeSettings) : null
  const isApplied = activePhotoId ? (appliedByPhoto[activePhotoId] ?? false) : false
  void isApplied  // kept for future use

  // Library items that already carry anonymization: processed media (edited) or
  // images with applied masks. Drives the green "anonymized" outline in the gallery.
  const anonymizedPhotoIds = useMemo(() => {
    const ids = new Set<string>()
    for (const p of photos) {
      if (p.edited || appliedByPhoto[p.id]) ids.add(p.id)
    }
    return ids
  }, [photos, appliedByPhoto])

  // Persist an anonymized audio/document result back into its library item so the
  // gallery (green outline) and full-library export reflect the latest state.
  const commitAnonymizedToLibrary = useCallback((photoId: string, blob: Blob, mimeType?: string) => {
    setPhotos((cur) => cur.map((p) => (
      p.id === photoId ? { ...p, blob, edited: true, mimeType: mimeType ?? blob.type ?? p.mimeType } : p
    )))
  }, [setPhotos])

  // Audio download (desktop action toolbar — unified with the photo editor's
  // Download button + format selector). Standalone audio always renders the
  // distorted voice, so the export bakes the current voice-mask settings.
  const [audioExportFormatId, setAudioExportFormatId] = useState<AudioExportFormatId>('wav')
  const [audioExporting, setAudioExporting] = useState(false)
  const audioExportFormats = useMemo(() => supportedAudioExportFormats(), [])
  const exportActiveAudio = useCallback(async (formatId?: AudioExportFormatId) => {
    if (!activePhoto?.isAudio) return
    if (formatId && formatId !== audioExportFormatId) setAudioExportFormatId(formatId)
    setAudioExporting(true)
    try {
      const id = formatId ?? audioExportFormatId
      const format = audioExportFormats.find((f) => f.id === id) ?? audioExportFormats[0]
      const sourceBlob = originalBlobByPhoto[activePhoto.id] ?? activePhoto.blob
      const buffer = await decodeAudioBlob(sourceBlob)
      const distort = audioSettings.mode !== 'remove_audio' && audioSettings.mode !== 'keep_original'
      const out = distort
        ? await renderProcessedAudioBuffer(getAudioContext(), buffer, audioSettings)
        : buffer
      const blob = await encodeAudioBuffer(out, format)
      saveAs(blob, anonymizedAudioFilename(activePhoto.name, format.ext))
      if (distort) commitAnonymizedToLibrary(activePhoto.id, blob, blob.type || 'audio/wav')
    } catch {
      setNotice('Audio export failed.')
    } finally {
      setAudioExporting(false)
    }
  }, [activePhoto, audioExportFormatId, audioExportFormats, audioSettings, commitAnonymizedToLibrary, originalBlobByPhoto, setNotice])

  // Which tracks of the active video to keep/edit (Video+audio / Audio only / Video only).
  const videoTrackMode: 'both' | 'video' | 'audio' = activePhoto?.isVideo
    ? (activePhoto.trackMode ?? 'both')
    : 'both'
  const setVideoTrackMode = useCallback((mode: 'both' | 'video' | 'audio') => {
    const id = activePhotoId
    if (!id) return
    setPhotos((cur) => cur.map((p) => (p.id === id ? { ...p, trackMode: mode } : p)))
    // Keep the export's audio handling in sync with the chosen tracks.
    if (mode === 'video') setAudioSettings((s) => ({ ...s, mode: 'remove_audio' }))
    // Both / Audio-only must leave the removed state so the audio is editable
    // again (audio-only switches to the full audio editor for the track).
    else setAudioSettings((s) => (s.mode === 'remove_audio' ? { ...s, mode: 'keep_original' } : s))
  }, [activePhotoId, setPhotos, setAudioSettings])

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
    asciiCharset,
  }), [activePhotoId, customImageAssets, customImageSource, asciiCharset])

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
    const boundsEl = useMobileCssView ? viewportRef.current : canvas
    const bounds = boundsEl?.getBoundingClientRect()
    if (!bounds || bounds.width <= 0 || bounds.height <= 0) return null
    return mapClientPointToImage({
      clientX, clientY,
      bounds: { left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height },
      transform: t,
      clampToBounds,
      mobileCssView: useMobileCssView ? {
        centerX: t.centerX ?? bounds.width / 2,
        centerY: t.centerY ?? bounds.height / 2,
        zoom: mobileViewZoomRef.current,
        panX: mobileViewPanRef.current.x,
        panY: mobileViewPanRef.current.y,
        rotation: mobileViewRotationRef.current,
      } : undefined,
    })
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
    ctx.fillStyle = viewerBackgroundColor(effectiveTheme)
    ctx.fillRect(0, 0, cssWidth, cssHeight)

    if (source.width === 0 || source.height === 0 || !activePhoto) {
      transformRef.current = DEFAULT_TRANSFORM
      syncOverlayLayout()
      return
    }

    const isColorNoop = isColorAdjNoop(colorAdj)

    let drawSource = selectBaseDrawSource({
      source,
      batchPreview: batchPreviewCanvasRef.current,
      batchPanelOpen,
      transformPreview: transformPreviewCanvasRef.current,
      adjFlyoutOpen,
      transformPanelOpen,
      qualityPreview: qualityPreviewCanvasRef.current,
      previewFormat: mobileExportDraft?.format ?? exportFormat,
    })
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

    const useMobileCssView = isMobile && activePhoto && !activePhoto.isVideo
    const viewZoom = useMobileCssView ? 1 : mobileViewZoomRef.current
    const pan = useMobileCssView ? { x: 0, y: 0 } : mobileViewPanRef.current
    const viewRot = useMobileCssView ? 0 : mobileViewRotationRef.current
    const t = computeViewTransform({
      cssWidth, cssHeight,
      sourceWidth: source.width, sourceHeight: source.height,
      viewZoom, panX: pan.x, panY: pan.y, rotation: viewRot,
    })
    transformRef.current = t
    const { drawWidth, drawHeight, centerX, centerY } = t

    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(viewRot)
    ctx.drawImage(drawSource, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)

    const hasDistortPreview = getActiveDistorts().length > 0
    if (shouldShowZoneOverlays({
      showBoxes, toolMode, adjFlyoutOpen, transformPanelOpen, hasDistortPreview,
      colorPanelOpen, isColorNoop, mobileGestureActive,
    })) {
      effectiveZones.forEach((zone) => drawZoneInView(ctx, zone, drawWidth, drawHeight, zone.id === selectedZoneId, { showLabel: showDetectionLabels }))
      if (draftZone) drawZoneInView(ctx, draftZone, drawWidth, drawHeight, true, { showLabel: showDetectionLabels })
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
    normalizeCropDraft, normalizeSettings.cropMode, selectedZoneId, showBoxes, showDetectionLabels, toolMode, effectiveTheme, mobileViewZoom, mobileViewPan, mobileViewRotation, mobileGestureActive, mobileExportDraft,
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

  const video = useVideoController({
    activePhoto,
    activePhotoId,
    activePhotoRef,
    photos,
    setPhotos,
    originalBlobByPhoto,
    setOriginalBlobByPhoto,
    activeVideoUrl,
    isMobile,
    setMobilePanel,
    mobilePanel,
    setNotice,
    setIsBusy,
    setActivePhotoId,
    setActiveDirty,
    setZonesByPhoto,
    setZonesAnonymized,
    setActiveImageSize,
    setAutoDetect,
    setShowBoxes,
    selectedEffect,
    selectedEffectRef,
    brushStrength,
    brushStrengthRef,
    emojiRandom,
    selectedEmoji,
    emojiRandomRef,
    selectedEmojiRef,
    customImageRandom,
    selectedCustomImageId,
    customImageRandomRef,
    selectedCustomImageIdRef,
    customImageAssetsRef,
    customImageSource,
    colorAdj,
    getActiveDistorts,
    enabledDistorts,
    distortStrengthByEffect,
    adjTransformParams,
    adjPixelShiftType,
    detectSensitivity,
    detectFaceOffset,
    detectionConfig,
    modelStatus,
    enabledClasses,
    autoDetect,
    detector,
    audioSettings,
    resolveEmoji,
    resolveCustomImageAssetId,
    customEffectOptions,
    getWorkCtx,
    workCanvasRef,
    workCtxRef,
    renderCanvasRef,
  })

  const {
    videoProcessing,
    setVideoProcessing,
    videoProgress,
    videoAbortRef,
    videoExportOptions,
    videoPipelineCapabilities,
    videoExportFormat,
    setVideoExportFormat,
    setVideoFrameOverridesByPhoto,
    setVideoTimedZonesByPhoto,
    videoMaskDrawActive,
    setVideoMaskDrawActive,
    videoMaskShape,
    setVideoMaskShape,
    videoMaskRangeSec,
    setVideoMaskRangeSec,
    activeVideoTime,
    setActiveVideoTime,
    activeVideoFrameLabel,
    videoDraftZone,
    videoDistortPreviewVisible,
    activeVideoRef,
    videoDistortPreviewCanvasRef,
    videoMediaRef,
    pendingVideoSeekRef,
    activeVideoTimeRef,
    videoFaceDetectGenRef,
    videoFaceScanTimersRef,
    videoPreviewFaceZones,
    videoPlaying,
    setVideoPlaying,
    videoContentLayout,
    processedVideoEpoch,
    setVideoReadyTick,
    activeVideoTimedZones,
    activeVideoFrameOverrides,
    visibleVideoTimedZones,
    hasPendingVideoEdits,
    videoDismissedAtFrame,
    handleVideoMaskPointerDown,
    handleVideoMaskPointerMove,
    handleVideoMaskPointerUp,
    clearVideoTimedZones,
    processActiveVideo,
    cancelVideoProcessing,
    stepActiveVideoFrame,
    framePrevHold,
    frameNextHold,
    openCurrentVideoFrameAsSnapshot,
    stepEditFrameAdjacent,
    exportActiveVideo,
    syncVideoContentLayout,
    runVideoFaceDetectPass,
    seekActiveVideo,
    toggleVideoPlayback,
    removeVideoPreviewFaceZone,
    restoreVideoPreviewFaceZone,
    clearVideoDistortPreview,
  } = video

  const { undoCount, pushUndo, undo, resetUndo } = useUndoStack({
    workCanvasRef,
    getWorkCtx,
    renderCanvas,
    setActiveDirty,
  })

  const {
    pointerSessionRef,
    handleCanvasPointerDown,
    handleCanvasPointerMove,
    handleCanvasPointerUp,
    handleCanvasWheel,
    stopBrushLoop,
    clearEraserSourceCache,
    cleanupBrushTimers,
  } = useCanvasPointer({
    canvasRef,
    overlayCanvasRef,
    workCanvasRef,
    transformRef,
    brushSizeRef,
    brushDebounceRef,
    eraserActiveRef,
    renderCanvasRef,
    mobileCanvasEditRef,
    activePhoto,
    toolMode,
    batchPanelOpen,
    isMobile,
    isNormalizeCropPicking,
    normalizeSettingsCropMode: normalizeSettings.cropMode,
    normalizeCropDraft,
    draftZone,
    effectiveZones,
    detectFaceOffset,
    selectedEffect,
    brushStrength,
    originalBlobByPhoto,
    getWorkCtx,
    mapPointerToImage,
    resolveBrushStamp,
    resolveEmoji,
    resolveCustomImageAssetId,
    customEffectOptions,
    renderCanvas,
    setActiveDirty,
    setNotice,
    pushUndo,
    setActiveZones,
    setSelectedZoneId,
    setDraftZone,
    setCropDraft,
    setNormalizeCropDraft,
    setIsNormalizeCropPicking,
    updateNormalizeSetting,
    setBrushSize,
    setBrushStrength,
  })

  const {
    isDragOver,
    folderScanState,
    lastAddedPhotoIdRef,
    addRecords,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    loadDemoPhotos,
    selectPhoto,
    saveActivePhoto,
    saveAllPhotos,
    resetPhotoToOriginal,
    exportActivePhoto,
    deletePhoto,
    exportAllLibraryZip,
    exportAllLibraryIndividual,
  } = usePhotoLibrary({
    isMobile,
    photos,
    photosRef,
    activePhoto,
    activePhotoId,
    dirtyByPhoto,
    originalBlobByPhoto,
    colorAdjByPhoto,
    zonesByPhoto,
    distortSettingsByVideoId,
    exportFormat,
    exportQuality,
    exportPngDepth,
    brushStrength,
    detectFaceOffset,
    customImageAssets,
    customImageSource,
    workCanvasRef,
    workCtxRef,
    dragCounterRef,
    pointerSessionRef,
    detectingRef,
    previewBakedRef,
    videoAbortRef,
    mobileViewZoomRef,
    mobileViewPanRef,
    mobileViewRotationRef,
    mobileCanvasEditRef,
    setPhotos,
    setActivePhotoId,
    setOriginalBlobByPhoto,
    setSelectedForBatch,
    setNormalizeResults,
    setNormalizePreviewIds,
    setPhotoListLimit,
    setSidebarView,
    setNotice,
    setIsBusy,
    setIsApplyingAll,
    setIsExporting,
    setExportLibraryProgress,
    setActiveDirty,
    setIsDetecting,
    setDetectionStep,
    setDistortSettingsByVideoId,
    setSelectedZoneId,
    setDraftZone,
    setNormalizeCropDraft,
    setIsNormalizeCropPicking,
    setZonesAnonymized,
    setEffectFlyoutOpen,
    setAdjFlyoutOpen,
    setTransformFlyoutOpen,
    setLocalProcessingMs,
    setLastDetectFailed,
    setZoneToolCustomized,
    setEffectToolCustomized,
    setColorAdj,
    setColorAdjByPhoto,
    setZonesByPhoto,
    setDirtyByPhoto,
    setAppliedByPhoto,
    setVideoFrameOverridesByPhoto,
    setVideoTimedZonesByPhoto,
    setExportFormat,
    setDetectSensitivity,
    setVideoProcessing,
    setMobileViewZoom,
    setMobileViewPan,
    setMobileViewRotation,
    setMobileViewTransformDirty,
    setActiveImageSize,
    showSaveError,
    showMobileToast,
    getWorkCtx,
    renderCanvas,
    resetUndo,
    snapshotVideoDistortSettings,
    applyVideoDistortSettings,
  })

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
        const handles = await picker({ multiple: true, types: [{ description: 'Media & documents', accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.avif'], 'video/*': ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v', '.ogv'], 'audio/*': ['.wav', '.mp3', '.m4a', '.aac', '.ogg', '.flac', '.weba', '.webm'], 'application/pdf': ['.pdf'], 'text/plain': ['.txt'], 'text/markdown': ['.md', '.markdown'] } }] })
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
    setNotice(robust ? 'Running thorough detection…' : 'Detecting…')
    setDetectionProgressCallback((step) => setDetectionStep(step))
    const t0 = performance.now()
    try {
      const { confidence, thorough, faceOffset, detectionConfig: detectConfig, enabledClasses: detectClasses } = detectSettingsRef.current
      const runRobust = robust ?? thorough
      const effectiveConfig = applyFaceConfidenceToConfig(detectConfig, confidence)
      const W = workCanvas.width
      const H = workCanvas.height

      const detectionsToZones = (detections: PrivacyDetection[]): Zone[] => {
        const emojis = pickUniqueEmojis(detections.length)
        return privacyDetectionsToZones(detections, {
          config: detectConfig,
          globalEffect: selectedEffect,
          emojis,
          faceOffsetPercent: faceOffset,
          imageW: W,
          imageH: H,
          createZoneId: createId,
        }).map((zone) => ({
          ...zone,
          emoji: emojiRandomRef.current ? zone.emoji : (selectedEmojiRef.current ?? zone.emoji),
          customImageAssetId: selectedEffect === 'custom-image'
            ? resolveCustomImageAssetId(zone.id)
            : undefined,
        }))
      }

      const applyDetections = (detections: PrivacyDetection[]) => {
        if (generation !== detectGenerationRef.current || activePhotoIdRef.current !== photoId) return
        const zones = detectionsToZones(detections)
        setZonesByPhoto((cur) => ({ ...cur, [photoId]: zones }))
        setZonesAnonymized(false)
        previewBakedRef.current = false
        if (activePhotoId === photoId) setSelectedZoneId(zones[0]?.id ?? null)
        renderCanvas()
      }

      let detections: PrivacyDetection[] = []
      let usedPipeline = false

      // Phase 1 — YuNet faces first so boxes appear while YOLO/OCR still run.
      const faceEnabled = getCategoryConfig(effectiveConfig, 'face')?.enabled ?? true
      if (faceEnabled) {
        setDetectionStep('Detecting faces…')
        const boxes = await detectFaces(workCanvas, runRobust, confidence)
        if (generation !== detectGenerationRef.current || activePhotoIdRef.current !== photoId) return
        detections = boxes.map((b) => faceBoxToPrivacyDetection(b, W, H))
        if (detections.length > 0) applyDetections(detections)
      }

      // Phase 2 — optional YOLO targets + OCR (skip re-running YuNet).
      const configNoFace = effectiveConfig.map((c) =>
        c.type === 'face' ? { ...c, enabled: false } : c,
      )
      const needsYolo = usesExtendedPrivacyDetection(configNoFace, modelStatus, detectClasses)
      const needsOcr = isPiiTextEnabled(effectiveConfig)

      if (needsYolo || needsOcr) {
        setDetectionStep(needsOcr ? 'Scanning objects & sensitive text…' : 'Scanning objects…')
        if (needsYolo) {
          const result = await runPrivacyDetectionOnSource(
            workCanvas, configNoFace, undefined, runRobust, detectClasses,
          )
          if (generation !== detectGenerationRef.current || activePhotoIdRef.current !== photoId) return
          detections = dedupeOverlappingDetections([...detections, ...result.detections], 0.55)
          usedPipeline = true
        }
        if (needsOcr) {
          const piiThreshold = getCategoryConfig(effectiveConfig, 'pii_text')?.confidenceThreshold ?? 0.5
          const piiDetections = await detectPiiViaOcr(workCanvas, piiThreshold)
          if (generation !== detectGenerationRef.current || activePhotoIdRef.current !== photoId) return
          if (piiDetections.length > 0) {
            detections = dedupeOverlappingDetections([...detections, ...piiDetections], 0.55)
            usedPipeline = true
          }
        }
      }

      const elapsed = Math.round(performance.now() - t0)
      setLocalProcessingMs(elapsed)
      const counts: Partial<Record<string, number>> = {}
      for (const d of detections) counts[d.type] = (counts[d.type] ?? 0) + 1
      setLastDetectionCounts(counts)

      if (detections.length === 0) {
        setLastDetectFailed(false)
        setZonesByPhoto((cur) => ({ ...cur, [photoId]: [] }))
        setSelectedZoneId(null)
        setNotice(formatDetectionSummary(counts, elapsed, usedPipeline))
        return
      }
      setLastDetectFailed(false)
      applyDetections(detections)
      setNotice(formatDetectionSummary(counts, elapsed, usedPipeline))
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
  }, [activePhoto, activePhotoId, customImageAssets, modelStatus, renderCanvas, selectedEffect, setLastDetectionCounts])

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
    // Snapshot the pre-anonymization canvas so the user can undo "Anonymize".
    pushUndo()
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
  }, [activePhoto, activePhotoId, effectiveZones, brushStrength, customEffectOptions, getWorkCtx, pushUndo, renderCanvas, setActiveDirty])

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
    clearEraserSourceCache()
    setActiveDirty(true)
    renderCanvas()
    setNotice(`Cropped to ${pw}×${ph}`)
  }, [activePhoto, cropDraft, pushUndo, renderCanvas, setActiveDirty])

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


  // Vectorize panel (SVG live preview + export) — see useVectorize
  const {
    vectorizePanelOpen,
    setVectorizePanelOpen,
    vectorizePreviewActive,
    vectorizeParams,
    setVectorizeParams,
    svgPreview,
    svgPreviewUrl,
    svgPreviewSize,
    vectorizing,
    runVectorizePreview,
    updateVectorizeParam,
    exportAsSvg,
    applyVectorizePreview,
    clearVectorizePreview,
  } = useVectorize({ workCanvasRef, activePhoto, setIsBusy, setNotice })

  const commitVectorizePreview = useCallback(async () => {
    pushUndo()
    const applied = await applyVectorizePreview()
    if (!applied) return
    setActiveDirty(true)
    if (activePhotoId) setAppliedByPhoto((cur) => ({ ...cur, [activePhotoId]: true }))
    setVectorizePanelOpen(false)
    renderCanvas()
    setNotice('Vectorize applied.')
  }, [
    activePhotoId,
    applyVectorizePreview,
    pushUndo,
    renderCanvas,
    setActiveDirty,
    setVectorizePanelOpen,
    setNotice,
  ])

  const handleResetPhotoToOriginal = useCallback(async () => {
    clearVectorizePreview()
    setVectorizePanelOpen(false)
    await resetPhotoToOriginal()
  }, [clearVectorizePreview, resetPhotoToOriginal, setVectorizePanelOpen])

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

  const { runNormalizeBatch, cancelNormalizeBatch } = useBatchNormalize({
    photos,
    selectedForBatch,
    normalizeSettings,
    activeBatchTasks,
    colorAdj,
    colorAdjByPhoto,
    customImageAssets,
    customImageSource,
    activePhotoId,
    workCanvasRef,
    renderCanvas,
    detectSettingsRef,
    setNotice,
    setIsNormalizing,
    setNormalizeProgress,
    setNormalizeResults,
    setPhotos,
    setNormalizePreviewIds,
    setNormalizeSummary,
  })

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
    clearVideoDistortPreview()
    renderCanvas()
  }, [clearVideoDistortPreview, renderCanvas])

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

  useEffect(() => { batchPanelOpenRef.current = batchPanelOpen }, [batchPanelOpen])

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
    // Batch preview always starts from the un-anonymized original so opening the
    // batch panel never shows zone effects baked onto the work canvas.
    const orig = originalBlobByPhotoRef.current[activePhoto.id]
    if (orig) {
      try {
        const bmp = await createImageBitmap(orig)
        if (activePhotoIdRef.current !== activePhoto.id) { bmp.close(); return }
        bCtx.clearRect(0, 0, bc.width, bc.height)
        bCtx.drawImage(bmp, 0, 0)
        bmp.close()
      } catch {
        bCtx.drawImage(wc, 0, 0)
      }
    } else {
      bCtx.drawImage(wc, 0, 0)
    }
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

  // Re-bake the anonymization effect onto the work canvas from the pristine
  // original, using the CURRENT face-offset + strength. Reads live values from
  // refs so the callback identity stays stable (no debounce-reset / stale-offset
  // loops). Returns true when it actually re-baked.
  const reapplyZoneEffectsPreview = useCallback(async (zonesOverride?: Zone[]): Promise<boolean> => {
    if (batchPanelOpenRef.current) return false
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

  const setSelectedEffect = useCallback((effect: AnonymizeEffectId) => {
    selectedEffectRef.current = effect
    setSelectedEffectState(effect)
    if (effect === 'custom-image') setBrushStrength(1)
  }, [])

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
    if (batchPanelOpen) return
    if (!previewBakedRef.current && !zonesAnonymized) return
    if (!originalBlobByPhoto[activePhoto.id]) return
    if (zonePreviewDebounceRef.current) clearTimeout(zonePreviewDebounceRef.current)
    zonePreviewDebounceRef.current = setTimeout(() => {
      void reapplyZoneEffectsPreview().then((baked) => {
        if (baked) setActiveDirty(true)
      })
    }, isMobile && mobilePanel === 'tool-effects' ? 0 : isMobile ? 120 : 90)
    return () => { if (zonePreviewDebounceRef.current) clearTimeout(zonePreviewDebounceRef.current) }
   
  }, [brushStrength, detectFaceOffset, zoneBakeSignature, activePhoto?.id, zonesAnonymized, isMobile, mobilePanel, asciiCharset, batchPanelOpen])

  // Sync brushSizeRef when slider changes
  useEffect(() => { brushSizeRef.current = brushSize }, [brushSize])

  // Unified brush-size setter: updates the ref synchronously (so the brush
  // preview never lags a frame) AND React state. Used by both the desktop
  // slider and the mobile toolbar slider for consistent behavior.
  const handleBrushSizeChange = useCallback((v: number) => {
    brushSizeRef.current = v
    setBrushSize(v)
  }, [])
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
    cleanupBrushTimers()
    videoAbortRef.current?.abort()
    detectGenerationRef.current += 1
  }, [cleanupBrushTimers])

  useEffect(() => {
    if (!activePhotoId) return
    const idx = photos.findIndex((p) => p.id === activePhotoId)
    if (idx >= 0 && idx >= photoListLimit) setPhotoListLimit(idx + 40)
  }, [activePhotoId, photoListLimit, photos])

  useEffect(() => {
    if (normalizeSettings.cropMode === 'template') return
    setNormalizeCropDraft(null); setIsNormalizeCropPicking(false); pointerSessionRef.current = { mode: 'idle' }
  }, [normalizeSettings.cropMode])

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
    if (activePhoto.isVideo || activePhoto.isAudio || activePhoto.isDocument) {
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

  useEffect(() => { renderCanvas() }, [renderCanvas, effectiveZones, selectedZoneId, draftZone, toolMode, showBoxes, detectFaceOffset])

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
        detectFacesOnActiveImage(false)
      }
    }, 300)

    return () => { cancelled = true; clearTimeout(timer) }
   
  }, [autoDetect, detector.mode, activePhoto?.id])

  // Live re-detection: changing a detection setting (sensitivity, an enabled
  // target/class, or a model finishing loading) immediately re-runs detection so
  // the preview always reflects the current settings — no manual "detect" button.
  const detectSignature = useMemo(() => {
    const cats = detectionConfig
      .filter((c) => c.enabled)
      .map((c) => `${c.type}:${c.confidenceThreshold.toFixed(2)}`)
      .join(',')
    const classes = [...enabledClasses].sort().join(',')
    const ready = Object.entries(modelStatus)
      .filter(([, s]) => s === 'ready')
      .map(([id]) => id)
      .sort()
      .join(',')
    return `${detectSensitivity}|${cats}|${classes}|${ready}`
  }, [detectSensitivity, detectionConfig, enabledClasses, modelStatus])

  const prevDetectSigRef = useRef<string | null>(null)
  useEffect(() => {
    if (!autoDetect || !activePhoto || activePhoto.isVideo || activePhoto.edited) {
      prevDetectSigRef.current = detectSignature
      return
    }
    if (detector.mode === 'unavailable') return
    // The first observation for a freshly opened photo is covered by the
    // auto-detect-on-open effect; only react to genuine later changes.
    if (prevDetectSigRef.current === null || prevDetectSigRef.current === detectSignature) {
      prevDetectSigRef.current = detectSignature
      return
    }
    prevDetectSigRef.current = detectSignature
    const t = setTimeout(() => { void detectFacesOnActiveImage(false) }, 280)
    return () => clearTimeout(t)
  }, [detectSignature, autoDetect, activePhoto, detector.mode, detectFacesOnActiveImage])

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
          clearEraserSourceCache()
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
        detectFacesOnActiveImage(false)
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
        detectFacesOnActiveImage(false)
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
            const runDetect = () => { void detectFacesOnActiveImage(false) }
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

  const mobileSetVectorizeParams = useCallback((params: VectorizeParams) => {
    setVectorizeParams(params)
    void runVectorizePreview(params)
  }, [setVectorizeParams, runVectorizePreview])

  const mobileOpenDetectSettings = useCallback(() => {
    if (isMobile) return
    const rect = faceFlyoutBtnRef.current?.getBoundingClientRect()
    if (rect) setFaceFlyoutAnchor({ top: rect.top, left: rect.right + 6 })
    setFaceFlyoutOpen(true)
  }, [isMobile])

  const mobileInitializeDetector = useCallback(
    () => initializeDetector().then((s) => setDetector(s)),
    [initializeDetector, setDetector],
  )

  // Warm the HTTP cache for heavy optional models while the user is idle on the
  // home / hypno screen — but only for the targets that are actually enabled.
  // A default session (faces + plates + sensitive text) warms just the plate
  // model + OCR engine; broader COCO / custom models stream in only once the
  // user opts into those extra targets. Re-runs when the enabled set changes.
  const enabledTargetsKey = useMemo(
    () => detectionConfig.filter((c) => c.enabled).map((c) => c.type).sort().join(','),
    [detectionConfig],
  )
  const detectionConfigRef = useRef(detectionConfig)
  detectionConfigRef.current = detectionConfig
  useEffect(() => {
    const groups = prefetchGroupsForConfig(detectionConfigRef.current)
    if (groups.length === 0) return
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
    }
    const trigger = () => startAssetPrefetch(groups)
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(trigger, { timeout: 4000 })
      return () => (w as unknown as { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback?.(id)
    }
    const t = setTimeout(trigger, 2500)
    return () => clearTimeout(t)
  }, [enabledTargetsKey])

  const mobileStepMobileViewZoom = useCallback((dir: 1 | -1) => {
    const factor = dir === 1 ? 1.2 : 1 / 1.2
    const next = Math.min(3, Math.max(0.5, mobileViewZoom * factor))
    mobileViewZoomRef.current = next
    setMobileViewZoom(next)
    updateMobileViewTransformDirty()
    renderCanvasRef.current()
  }, [mobileViewZoom, updateMobileViewTransformDirty])

  const mobileCommitAdjTransform = useCallback(() => {
    void applyAdjTransformToCanvas()
  }, [applyAdjTransformToCanvas])

  const mobileBatch = useMemo((): MobileBatchState => ({
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
  }), [
    activeBatchTasks, expandedBatchTasks, normalizeSettings, normalizeProgress,
    normalizeProgressPercent, normalizeSummary, normalizePreviewPhotos,
    normResultsCount, isNormalizing, isExporting, selectedForBatch, colorAdj,
  ])

  const mobileBindings = useMemo((): AppMobileBindings => buildMobileBindings({
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
    anonymizedPhotoIds,
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
    resetPhotoToOriginal: handleResetPhotoToOriginal,
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
    vectorizePreviewActive,
    vectorizeParams,
    setVectorizeParams: mobileSetVectorizeParams,
    updateVectorizeParam,
    vectorizing,
    svgPreviewSize,
    exportAsSvg,
    applyVectorizePreview: commitVectorizePreview,
    brushSize,
    setBrushSize: handleBrushSizeChange,
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
    asciiCharset,
    setAsciiCharset,
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
    detectionConfig,
    setCategoryEnabled,
    setCategoryThreshold,
    modelStatus,
    enabledClasses,
    setEnabledClasses,
    toggleDetectionClass,
    lastDetectionCounts,
    showDetectionLabels,
    setShowDetectionLabels,
    audioSettings,
    setAudioSettings,
    eraserActive,
    autoDetect,
    setAutoDetect,
    setShowBoxes,
    showBoxes,
    detectFacesOnActiveImage,
    openDetectSettings: mobileOpenDetectSettings,
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
    batch: mobileBatch,
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
    initializeDetector: mobileInitializeDetector,
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
    stepMobileViewZoom: mobileStepMobileViewZoom,
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
    commitAdjTransform: mobileCommitAdjTransform,
    resetAdjTransformPreview,
    enabledDistorts,
    toggleDistortEffect,
    distortStrengthByEffect,
    setDistortStrength,
  }), [
    mobileBatch,
    theme, isBusy, isDragOver, photos, activePhoto, activePhotoId, activeZones,
    videoPreviewFaceZones, displayedPhotos, anonymizedPhotoIds, sidebarView, selectedForBatch,
    mobileMode, mobilePanel, mobilePanelReturnTo, mobileEditorReturnTo, galleryBatchSelect,
    videoProcessing, videoProgress, videoExportFormat, videoExportOptions,
    videoMaskDrawActive, videoMaskShape, imageMaskDrawActive, videoMaskRangeSec,
    sourceVideoPhoto, activeVideoFrameOverrides, activeVideoTimedZones, activeVideoTime,
    activeVideoFrameLabel, hasPendingVideoEdits, videoPipelineCapabilities,
    exportFormat, exportQuality, previewFileSizeKb, previewRendering, activeImageSize,
    resEditW, resEditH, mobileExportDraft, vectorizePanelOpen, vectorizeParams, vectorizing,
    svgPreviewSize, brushSize, brushStrength, toolMode, cropDraft, selectedEffect,
    customImageSource, customImageAssets, customImagePresetLoading, emojiRandom, selectedEmoji,
    customImageRandom, selectedCustomImageId, faceOffsetFrac, detectFaceOffset,
    detectSensitivity, detectionConfig, modelStatus, lastDetectionCounts,
    showDetectionLabels, audioSettings, eraserActive, autoDetect, showBoxes, selectedZoneId,
    categoryIndices, zoneToolCustomized, effectToolCustomized, activeCategory, mobileViewPan,
    mobileViewRotation, mobileViewTransformDirty, isNormalizeCropPicking, activeNormalizeCrop,
    liveDetectEnabled, mobileViewZoom, lastDetectFailed, isDetecting, detector, detectorLoading,
    exportLibraryProgress, adjTransform, adjTransformStrength, adjTransformParams,
    adjPixelShiftType, enabledDistorts, distortStrengthByEffect, undoCount, zonesAnonymized,
    setTheme, setAboutOpen, loadDemoPhotos, setSelectedForBatch, setMobileMode, setMobilePanel,
    setMobilePanelReturnTo, returnToLiveFromEditor, setGalleryBatchSelect, openUnifiedPicker,
    openVideoPicker, selectPhoto, deletePhoto, handleResetPhotoToOriginal, undo, applyZones,
    exportActivePhoto, exportActiveVideo, exportAllLibraryZip, exportAllLibraryIndividual,
    cancelVideoProcessing, processActiveVideo, setVideoExportFormat, setVideoMaskDrawActive,
    setVideoMaskShape, setImageMaskDrawActive, setVideoMaskRangeSec, stepActiveVideoFrame,
    stepEditFrameAdjacent, openCurrentVideoFrameAsSnapshot, applySnapshotToSourceVideo,
    jumpToSourceVideoFromSnapshot, clearVideoTimedZones, setExportFormat, setExportQuality,
    setResEditW, setResEditH, resizeWorkCanvas, beginMobileExportEdit, updateMobileExportDraft,
    cancelMobileExportEdit, commitMobileExportEdit, setVectorizePanelOpen, mobileSetVectorizeParams,
    updateVectorizeParam, exportAsSvg, handleBrushSizeChange, setBrushStrength, setToolMode,
    cropToSelection, cancelCropMode, setSelectedEffect, setCustomImageSource, asciiCharset, setAsciiCharset, openCustomImagePicker,
    loadCustomImagePreset, setEffectPickerOpen, handleToggleEmojiRandom, handlePickEmoji,
    captureEffectPickerSnapshot, restoreEffectPickerSnapshot, handleToggleCustomRandom,
    handlePickCustomImage, setDetectFaceOffset, setDetectSensitivity,
    setCategoryEnabled, setCategoryThreshold, setShowDetectionLabels, setAudioSettings,
    enabledClasses, setEnabledClasses, toggleDetectionClass,
    setAutoDetect, setShowBoxes, detectFacesOnActiveImage, mobileOpenDetectSettings,
    removeZoneById, removeSelectedZone, clearZones, setEffectToolCustomized, setCategoryIndex,
    setActiveCategory, rotateCategoryTool, selectToolCategory, applyFaceTool, applyZoneTool,
    applyCropTool, applyAdjustTool, applyEffectTool, updateSelectedZoneEffect, setMobileViewPan,
    toggleBatchTask, toggleExpandBatchTask, updateNormalizeSetting, runNormalizeBatch,
    exportNormalizeZip, setNormalizeSummary, setColorPreset, setColorAdj, applyColorAdjToActive,
    setNotice, setIsNormalizeCropPicking, setNormalizeCropDraft, applyTemplateFromCurrentCrop,
    detectFrameOnActivePhoto, detectContentAwareCropOnActivePhoto, pointerSessionRef,
    resetDetectorStatus, mobileInitializeDetector, setDetector, setLiveDetectEnabled,
    addLiveMediaToLibrary, openPhotoInEditor, stepAdjacentLibraryPhoto, showMobileToast,
    exitLiveToWorkspace, mobileStepMobileViewZoom, resetMobileViewTransform, setAdjTransform,
    setAdjTransformStrength, setAdjParam, setAdjPixelShiftType, mobileCommitAdjTransform,
    resetAdjTransformPreview, toggleDistortEffect, setDistortStrength,
  ])

  const showMobileEmbed = isMobile && photos.length > 0 && mobileMode !== 'live'

  useLockMobileViewport(isMobile)
  const hideWorkspace = isMobile && (photos.length === 0 || mobileMode === 'live' || mobileMode === 'document' || mobileMode === 'audio')
  // The home default screen (no media loaded) renders its own inline model
  // preloader, so the global dialog/toast loaders are suppressed there.
  const onHomeDefaultScreen = (isMobile && photos.length === 0 && mobileMode !== 'live') || (!isMobile && photos.length === 0)

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
          if (!mobilePinchActiveRef.current) void detectFacesOnActiveImage(false)
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
    <MobileBindingsProvider value={mobileBindings}>
    <div
      className={`app-shell${isMobile ? ' app-shell-mobile' : ' app-shell-desktop-v2'}${isMobile && mobileMode === 'live' ? ' app-shell-mobile--live' : ''}${isMobile && mobileMode === 'video' ? ' app-shell-mobile--video' : ''}${isMobile && mobileMode === 'audio' ? ' app-shell-mobile--audio' : ''}${isMobile && mobileMode === 'editor' ? ' app-shell-mobile--image' : ''}${!isMobile && activePhoto?.isVideo ? ' app-shell-desktop-v2--video' : ''}${!isMobile && activePhoto?.isAudio ? ' app-shell-desktop-v2--audio' : ''}${!isMobile && activePhoto?.isDocument ? ' app-shell-desktop-v2--document' : ''}${isMobile && activePhoto?.isDocument ? ' app-shell-mobile--document' : ''}`}
      translate="no"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* ── Top bar (desktop) — hidden on the empty home screen, which has its
            own minimal header (W3PN logo + "WHAT IS THIS?"). ──────────────── */}
      {!isMobile && photos.length > 0 && (
        <DesktopTopBar
          theme={theme}
          busy={isBusy}
          onAbout={() => setAboutOpen(true)}
          onLoadDemo={loadDemoPhotos}
          onLiveCamera={() => setDesktopLiveOpen(true)}
          onToggleTheme={() => setTheme((t) => t === 'dark' ? 'light' : 'dark')}
        />
      )}

      {/* hidden file inputs */}
      <input ref={uploadInputRef} type="file" accept="image/*,video/*,audio/*,.pdf,.txt,.md,.markdown,application/pdf,text/plain,text/markdown" multiple onChange={handleUploadInput} hidden />
      <input ref={folderInputRef} type="file" multiple onChange={handleFolderInput} hidden
        // @ts-expect-error webkitdirectory is not in React's type defs
        webkitdirectory="" directory="" />

      {pickerChoiceOpen && (
        <PickerChoiceDialog
          dialogRef={pickerChoiceDialogRef}
          folderBtnRef={pickerChoiceFolderBtnRef}
          busy={isBusy}
          onClose={() => setPickerChoiceOpen(false)}
          onOpenFolder={() => { setPickerChoiceOpen(false); void openFolderPicker() }}
          onOpenFiles={() => { setPickerChoiceOpen(false); void openFilePicker() }}
        />
      )}

      {isMobile && (
        <MobileShell
          fmtBytes={fmtBytes}
          setSidebarView={setSidebarView}
          sidebarView={sidebarView}
          toggleBatchSelect={toggleBatchSelect}
          batchProcessCount={batchProcessCount}
          embedEditor={showMobileEmbed}
          documentViewer={activePhoto?.isDocument ? (
            <DocumentMode
              activePhoto={activePhoto}
              onCommitAnonymized={(blob, mimeType) => commitAnonymizedToLibrary(activePhoto.id, blob, mimeType)}
            />
          ) : null}
          audioViewer={activePhoto?.isAudio ? (
            <AudioModeViewer
              activePhoto={activePhoto}
              settings={audioSettings}
              onChangeSettings={setAudioSettings}
              originalBlob={originalBlobByPhoto[activePhoto.id]}
              onCommitAnonymized={(blob, mimeType) => commitAnonymizedToLibrary(activePhoto.id, blob, mimeType)}
              isMobileLayout
            />
          ) : null}
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
          <EditorSidebar
            photos={photos}
            displayedPhotos={displayedPhotos}
            activePhotoId={activePhotoId}
            dirtyByPhoto={dirtyByPhoto}
            anonymizedPhotoIds={anonymizedPhotoIds}
            sidebarWidth={sidebarWidth}
            sidebarView={sidebarView}
            setSidebarView={setSidebarView}
            batchPanelOpen={batchPanelOpen}
            setBatchPanelOpen={setBatchPanelOpen}
            busy={isBusy}
            onAddFiles={openUnifiedPicker}
            folderTree={folderTree}
            currentFolderPrefix={currentFolderPrefix}
            setCurrentFolderPrefix={setCurrentFolderPrefix}
            folderTreeOpen={folderTreeOpen}
            setFolderTreeOpen={setFolderTreeOpen}
            selectedForBatch={selectedForBatch}
            setSelectedForBatch={setSelectedForBatch}
            selectPhoto={selectPhoto}
            selectAllForBatch={selectAllForBatch}
            deselectAllForBatch={deselectAllForBatch}
            toggleBatchSelect={toggleBatchSelect}
            rotatePhoto={rotatePhoto}
            deletePhoto={deletePhoto}
            hasMorePhotosToRender={hasMorePhotosToRender}
            setPhotoListLimit={setPhotoListLimit}
            runNormalizeBatch={runNormalizeBatch}
            isNormalizing={isNormalizing}
            selectedBatchImageCount={selectedBatchImageCount}
            normalizeProgressPercent={normalizeProgressPercent}
            cancelNormalizeBatch={cancelNormalizeBatch}
          />
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

        {!activePhoto?.isAudio && !activePhoto?.isDocument
          && !(activePhoto?.isVideo && videoTrackMode === 'audio') && (
        <EditorToolStrip
          detector={detector}
          faceFlyoutBtnRef={faceFlyoutBtnRef}
          autoDetect={autoDetect}
          faceFlyoutOpen={faceFlyoutOpen}
          setFaceFlyoutAnchor={setFaceFlyoutAnchor}
          faceFlyoutAnchor={faceFlyoutAnchor}
          setFaceFlyoutOpen={setFaceFlyoutOpen}
          setAdjFlyoutOpen={setAdjFlyoutOpen}
          setTransformFlyoutOpen={setTransformFlyoutOpen}
          setEffectFlyoutOpen={setEffectFlyoutOpen}
          refreshDetector={refreshDetector}
          setNotice={setNotice}
          activeZones={activeZones}
          effectFlyoutBtnRef={effectFlyoutBtnRef}
          effectFlyoutOpen={effectFlyoutOpen}
          selectedEffect={selectedEffect}
          setEffectFlyoutAnchor={setEffectFlyoutAnchor}
          effectFlyoutAnchor={effectFlyoutAnchor}
          toolMode={toolMode}
          activePhoto={activePhoto}
          setToolMode={setToolMode}
          setZonesAnonymized={setZonesAnonymized}
          detectionConfig={detectionConfig}
          modelStatus={modelStatus}
          enabledClasses={enabledClasses}
          setEnabledClasses={setEnabledClasses}
          toggleDetectionClass={toggleDetectionClass}
          setCategoryEnabled={setCategoryEnabled}
          detectSensitivity={detectSensitivity}
          setDetectSensitivity={setDetectSensitivity}
          detectFaceOffset={detectFaceOffset}
          setDetectFaceOffset={setDetectFaceOffset}
          setAutoDetect={setAutoDetect}
          showBoxes={showBoxes}
          setShowBoxes={setShowBoxes}
          adjFlyoutOpen={adjFlyoutOpen}
          adjFlyoutAnchor={adjFlyoutAnchor}
          adjFlyoutBtnRef={adjFlyoutBtnRef}
          setAdjFlyoutAnchor={setAdjFlyoutAnchor}
          colorAdj={colorAdj}
          setColorAdj={setColorAdj}
          renderCanvas={renderCanvas}
          transformFlyoutOpen={transformFlyoutOpen}
          transformFlyoutAnchor={transformFlyoutAnchor}
          transformFlyoutBtnRef={transformFlyoutBtnRef}
          setTransformFlyoutAnchor={setTransformFlyoutAnchor}
          enabledDistorts={enabledDistorts}
          toggleDistortEffect={toggleDistortEffect}
          distortStrengthByEffect={distortStrengthByEffect}
          setDistortStrength={setDistortStrength}
          adjTransformParams={adjTransformParams}
          setAdjParam={setAdjParam}
          adjPixelShiftType={adjPixelShiftType}
          setAdjPixelShiftType={setAdjPixelShiftType}
          resetAdjTransformPreview={resetAdjTransformPreview}
          applyAdjTransformToCanvas={() => { void applyAdjTransformToCanvas() }}
          setCropDraft={setCropDraft}
          updateSelectedZoneEffect={updateSelectedZoneEffect}
          setEffectPickerOpen={setEffectPickerOpen}
          customImageAssets={customImageAssets}
          loadCustomImagePreset={(src) => { void loadCustomImagePreset(src) }}
          customImageSource={customImageSource}
          brushSize={brushSize}
          handleBrushSizeChange={handleBrushSizeChange}
          brushStrength={brushStrength}
          setBrushStrength={setBrushStrength}
        />
        )}

        <EditorBatchPanel
          batchPanelOpen={batchPanelOpen}
          setBatchPanelOpen={setBatchPanelOpen}
          normalizeSummary={normalizeSummary}
          setNormalizeSummary={setNormalizeSummary}
          normalizeProgress={normalizeProgress}
          normalizeProgressPercent={normalizeProgressPercent}
          normResultsCount={normResultsCount}
          exportNormalizeZip={exportNormalizeZip}
          isExporting={isExporting}
          normalizePreviewPhotos={normalizePreviewPhotos}
          selectPhoto={selectPhoto}
          activeBatchTasks={activeBatchTasks}
          expandedBatchTasks={expandedBatchTasks}
          toggleExpandBatchTask={toggleExpandBatchTask}
          toggleBatchTask={toggleBatchTask}
          normalizeSettings={normalizeSettings}
          updateNormalizeSetting={updateNormalizeSetting}
          isNormalizing={isNormalizing}
          updateNormalizeCropMode={updateNormalizeCropMode}
          activePhoto={activePhoto}
          setNotice={setNotice}
          setIsNormalizeCropPicking={setIsNormalizeCropPicking}
          setNormalizeCropDraft={setNormalizeCropDraft}
          pointerSessionRef={pointerSessionRef}
          isNormalizeCropPicking={isNormalizeCropPicking}
          applyTemplateFromCurrentCrop={applyTemplateFromCurrentCrop}
          activeNormalizeCrop={activeNormalizeCrop}
          detectFrameOnActivePhoto={() => { void detectFrameOnActivePhoto() }}
          isBusy={isBusy}
          detectContentAwareCropOnActivePhoto={() => { void detectContentAwareCropOnActivePhoto() }}
          colorAdj={colorAdj}
          setColorAdj={setColorAdj}
          setColorPreset={setColorPreset}
          applyColorAdjToActive={applyColorAdjToActive}
        />

        {/* ── Editor area ─────────────────────────────────── */}
        <div className="editor-area">

          {/* ── Action toolbar — Tools Bar ──────────────────── */}
          {!activePhoto?.isDocument && (
          <EditorActionToolbar
            activePhoto={activePhoto}
            photosCount={photos.length}
            resEditW={resEditW}
            resEditH={resEditH}
            setResEditW={setResEditW}
            setResEditH={setResEditH}
            activeImageSize={activeImageSize}
            onResize={resizeWorkCanvas}
            exportFormat={exportFormat}
            setExportFormat={setExportFormat}
            hasSvgPreview={!!svgPreview}
            exportPngDepth={exportPngDepth}
            setExportPngDepth={setExportPngDepth}
            exportQuality={exportQuality}
            setExportQuality={setExportQuality}
            previewFileSizeKb={previewFileSizeKb}
            vectorizePanelOpen={vectorizePanelOpen}
            onToggleVectorize={() => setVectorizePanelOpen((v) => !v)}
            hasSourceVideo={!!sourceVideoPhoto}
            onApplyFrameToVideo={applySnapshotToSourceVideo}
            onOpenSourceVideo={jumpToSourceVideoFromSnapshot}
            busy={isBusy}
            videoProcessing={videoProcessing}
            videoExportFormat={videoExportFormat}
            videoExportOptions={videoExportOptions}
            setVideoExportFormat={setVideoExportFormat}
            onExportVideo={exportActiveVideo}
            onExportSvg={exportAsSvg}
            onExportPhoto={exportActivePhoto}
            audioExportFormats={audioExportFormats}
            audioExportFormatId={audioExportFormatId}
            setAudioExportFormatId={(id) => setAudioExportFormatId(id as AudioExportFormatId)}
            onExportAudio={(id) => { void exportActiveAudio(id as AudioExportFormatId | undefined) }}
            audioExporting={audioExporting}
          />
          )}

          {activePhoto?.isVideo && (
            <div className="video-audio-panel">
              <VideoTrackModeSelect mode={videoTrackMode} onChange={setVideoTrackMode} />
              {videoTrackMode === 'both' && (
                <>
                  <button
                    type="button"
                    className={`video-audio-toggle${videoAudioPanelOpen ? ' open' : ''}`}
                    onClick={() => setVideoAudioPanelOpen((o) => !o)}
                    aria-expanded={videoAudioPanelOpen}
                  >
                    <span>{videoAudioPanelOpen ? 'Hide audio tools' : 'Audio tools'}</span>
                    <span className="video-audio-toggle-chevron" aria-hidden="true">
                      {videoAudioPanelOpen ? '×' : '▾'}
                    </span>
                  </button>
                  {videoAudioPanelOpen && (
                    <AudioModeViewer
                      activePhoto={activePhoto}
                      settings={audioSettings}
                      onChangeSettings={setAudioSettings}
                      originalBlob={originalBlobByPhoto[activePhoto.id]}
                      isVideo
                    />
                  )}
                </>
              )}
            </div>
          )}

          {activePhoto?.isDocument && !isMobile ? (
            <DocumentMode
              activePhoto={activePhoto}
              onCommitAnonymized={(blob, mimeType) => commitAnonymizedToLibrary(activePhoto.id, blob, mimeType)}
            />
          ) : activePhoto?.isAudio && !isMobile ? (
            <AudioModeViewer
              activePhoto={activePhoto}
              settings={audioSettings}
              onChangeSettings={setAudioSettings}
              originalBlob={originalBlobByPhoto[activePhoto.id]}
              onCommitAnonymized={(blob, mimeType) => commitAnonymizedToLibrary(activePhoto.id, blob, mimeType)}
              hideInlineExport
            />
          ) : activePhoto?.isVideo && videoTrackMode === 'audio' ? (
            <AudioModeViewer
              activePhoto={activePhoto}
              settings={audioSettings}
              onChangeSettings={setAudioSettings}
              originalBlob={originalBlobByPhoto[activePhoto.id]}
            />
          ) : (
          <CanvasViewer
            showMobileEmbed={showMobileEmbed}
            toolMode={toolMode}
            batchPanelOpen={batchPanelOpen}
            isNormalizeCropPicking={isNormalizeCropPicking}
            isDragOver={isDragOver}
            isMobile={isMobile}
            isBusy={isBusy}
            isDetecting={isDetecting}
            detectionStep={detectionStep}
            localProcessingMs={localProcessingMs}
            videoProcessing={videoProcessing}
            videoProgress={videoProgress}
            previewRendering={previewRendering}
            showBoxes={showBoxes}
            autoDetect={autoDetect}
            mobileGestureActive={mobileGestureActive}
            vectorizePanelOpen={vectorizePanelOpen}
            vectorizePreviewActive={vectorizePreviewActive}
            vectorizing={vectorizing}
            zonesAnonymized={zonesAnonymized}
            undoCount={undoCount}
            videoMaskDrawActive={videoMaskDrawActive}
            videoPlaying={videoPlaying}
            videoDistortPreviewVisible={videoDistortPreviewVisible}
            activePhoto={activePhoto}
            photosCount={photos.length}
            activeZones={activeZones}
            dirtyByPhoto={dirtyByPhoto}
            folderScanState={folderScanState}
            cropDraft={cropDraft}
            zoneOverlayRects={zoneOverlayRects}
            svgPreviewUrl={svgPreviewUrl}
            svgPreviewSize={svgPreviewSize}
            vectorizeParams={vectorizeParams}
            activeVideoUrl={activeVideoUrl}
            processedVideoEpoch={processedVideoEpoch}
            videoContentLayout={videoContentLayout}
            videoPreviewFaceZones={videoPreviewFaceZones}
            videoDismissedAtFrame={videoDismissedAtFrame}
            visibleVideoTimedZones={visibleVideoTimedZones}
            videoDraftZone={videoDraftZone}
            activeVideoFrameLabel={activeVideoFrameLabel}
            activeVideoTime={activeVideoTime}
            activeVideoFrameOverrides={activeVideoFrameOverrides}
            viewportRef={viewportRef}
            canvasRef={canvasRef}
            overlayCanvasRef={overlayCanvasRef}
            mobilePreviewTransformRef={mobilePreviewTransformRef}
            videoMediaRef={videoMediaRef}
            activeVideoRef={activeVideoRef}
            videoDistortPreviewCanvasRef={videoDistortPreviewCanvasRef}
            transformRef={transformRef}
            framePrevHold={framePrevHold}
            frameNextHold={frameNextHold}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onCancelDetection={cancelDetection}
            onCancelVideoProcessing={cancelVideoProcessing}
            onSetActiveVideoTime={setActiveVideoTime}
            onSyncVideoContentLayout={syncVideoContentLayout}
            onSetVideoReadyTick={setVideoReadyTick}
            onSetVideoPlaying={setVideoPlaying}
            onVideoMaskPointerDown={handleVideoMaskPointerDown}
            onVideoMaskPointerMove={handleVideoMaskPointerMove}
            onVideoMaskPointerUp={handleVideoMaskPointerUp}
            onRemoveVideoPreviewFaceZone={removeVideoPreviewFaceZone}
            onRestoreVideoPreviewFaceZone={restoreVideoPreviewFaceZone}
            onSetVideoMaskDrawActive={setVideoMaskDrawActive}
            onProcessActiveVideo={() => { void processActiveVideo() }}
            onOpenCurrentVideoFrameAsSnapshot={() => { void openCurrentVideoFrameAsSnapshot() }}
            onToggleVideoPlayback={toggleVideoPlayback}
            onSeekActiveVideo={seekActiveVideo}
            onCanvasPointerDown={handleCanvasPointerDown}
            onCanvasPointerMove={handleCanvasPointerMove}
            onCanvasPointerUp={handleCanvasPointerUp}
            onCanvasWheel={handleCanvasWheel}
            onRemoveZoneById={removeZoneById}
            onSetVectorizeParams={setVectorizeParams}
            onRunVectorizePreview={runVectorizePreview}
            onUpdateVectorizeParam={updateVectorizeParam}
            onExportAsSvg={exportAsSvg}
            onApplyVectorizePreview={() => { void commitVectorizePreview() }}
            onSaveSnapshot={() => { void saveSnapshot() }}
            onUndo={undo}
            onResetPhotoToOriginal={() => { void handleResetPhotoToOriginal() }}
            onCropToSelection={cropToSelection}
            onApplyZones={() => { void applyZones() }}
          />
          )}

          {showMobileEmbed && activePhoto && !activePhoto.isVideo && !activePhoto.isAudio && !activePhoto.isDocument && (
            <MobileImageCanvasControls />
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
        open={effectPickerOpen != null && !((isMobile || desktopLiveOpen) && (effectPickerOpen === 'emoji' || effectPickerOpen === 'custom-image' || effectPickerOpen === 'ascii'))}
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
        asciiCharset={asciiCharset}
        onChangeAsciiCharset={setAsciiCharset}
      />

      {/* The home default screen has its own integrated, inline preloader, so we
          skip the dialog overlay + corner pill there (they only show while a
          session is active / media is loaded). */}
      {!onHomeDefaultScreen && (
        <ModelLoadStatus
          active={detectorLoading}
          progress={modelLoadProgress}
          variant="toast"
        />
      )}

      {!onHomeDefaultScreen && <BackgroundAssetLoader />}

      {/* Headless test seam: surfaces the latest detection counts for e2e checks. */}
      <div data-testid="detection-counts" data-counts={JSON.stringify(lastDetectionCounts ?? {})} hidden />

      {!isMobile && desktopLiveOpen && (
        <div className="desktop-live-overlay">
          <MobileLiveMode
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
        <FeedbackModal
          subject={feedbackSubject}
          message={feedbackMsg}
          onChangeSubject={setFeedbackSubject}
          onChangeMessage={setFeedbackMsg}
          onClose={() => setFeedbackOpen(false)}
          onSent={() => {
            setFeedbackOpen(false)
            setFeedbackMsg('')
            setFeedbackSubject('')
            setNotice('Opening mail client…')
          }}
        />
      )}
    </div>
    </MobileBindingsProvider>
  )
}

export default App
