import type {
  AnonymizeEffectId,
  BatchTaskId,
  ColorAdjustments,
  ColorPresetId,
  CustomImageAsset,
  CustomImageSource,
  GlitchSubEffect,
  NormalizeCodecEngine,
  NormalizeFormat,
  NormalizeSettings,
  PhotoItem,
  ThemeMode,
  ToolMode,
  Zone,
} from '../types'
import type { VideoExportFormatId, VideoExportOption, VideoProcessingPhase } from '../lib/video'
import type { VectorizeParams } from '../lib/vectorize'
import type { MobileMode, MobilePanel, MobileToolCategory } from './types'
import type {
  AdjustToolId,
  CropToolId,
  EffectToolId,
  FaceToolId,
  ZoneToolId,
} from './toolRotation'

export interface MobileBatchState {
  activeBatchTasks: Set<BatchTaskId>
  expandedBatchTasks: Set<BatchTaskId>
  normalizeSettings: NormalizeSettings
  normalizeProgress: { active: boolean; done: number; total: number; etaSeconds: number; currentFile: string }
  normalizeProgressPercent: number
  normalizeSummary: {
    success: number
    failed: number
    elapsedSeconds: number
    inputBytes: number
    outputBytes: number
    canceled: boolean
    overwritten: number
  } | null
  normalizePreviewPhotos: PhotoItem[]
  normResultsCount: number
  isNormalizing: boolean
  isExporting: boolean
  selectedForBatch: Set<string>
  colorAdj: ColorAdjustments
}

export interface AppMobileBindings {
  theme: ThemeMode
  setTheme: (fn: (t: ThemeMode) => ThemeMode) => void
  setAboutOpen: (v: boolean) => void
  loadDemoPhotos: () => void
  isBusy: boolean
  isDragOver: boolean

  photos: PhotoItem[]
  activePhoto: PhotoItem | null
  activePhotoId: string | null
  activeZones: Zone[]
  displayedPhotos: PhotoItem[]
  sidebarView: 'grid' | 'list'
  selectedForBatch: Set<string>
  setSelectedForBatch: React.Dispatch<React.SetStateAction<Set<string>>>

  mobileMode: MobileMode
  setMobileMode: (m: MobileMode) => void
  mobilePanel: MobilePanel
  setMobilePanel: (p: MobilePanel) => void
  galleryBatchSelect: boolean
  setGalleryBatchSelect: (v: boolean) => void

  openUnifiedPicker: () => void
  openVideoPicker: () => void
  selectPhoto: (id: string) => void
  deletePhoto: (id: string) => void
  resetPhotoToOriginal: () => Promise<void>
  undo: () => void
  undoCount: number
  applyZones: () => void
  zonesAnonymized: boolean
  exportActivePhoto: () => void
  exportActiveVideo: () => void
  exportAllLibraryZip: (photoIds?: string[]) => void
  exportAllLibraryIndividual: (photoIds?: string[]) => void
  videoProcessing: boolean
  videoProgress: { current: number; total: number; phase: VideoProcessingPhase } | null
  cancelVideoProcessing: () => void
  processActiveVideo: () => void
  videoExportFormat: VideoExportFormatId
  setVideoExportFormat: (f: VideoExportFormatId) => void
  videoExportOptions: VideoExportOption[]
  videoMaskDrawActive: boolean
  setVideoMaskDrawActive: (v: boolean) => void
  videoMaskShape: 'rectangle' | 'circle' | 'path'
  setVideoMaskShape: (v: 'rectangle' | 'circle' | 'path') => void
  imageMaskDrawActive: boolean
  setImageMaskDrawActive: (v: boolean) => void
  videoMaskRangeSec: number
  setVideoMaskRangeSec: (v: number) => void
  stepActiveVideoFrame: (dir: -1 | 1) => void
  stepEditFrameAdjacent: (dir: -1 | 1) => void
  openCurrentVideoFrameAsSnapshot: () => void
  applySnapshotToSourceVideo: () => void
  jumpToSourceVideoFromSnapshot: () => void
  sourceVideoPhoto: PhotoItem | null
  activeVideoFrameOverrides: { timeSec: number; frameBlob: Blob }[]
  activeVideoTimedZones: import('../lib/video').VideoTimedZone[]
  clearVideoTimedZones: () => void
  activeVideoTime: number
  activeVideoFrameLabel: string | null
  hasPendingVideoEdits: boolean
  videoPipelineCapabilities: ReturnType<typeof import('../lib/video').getVideoPipelineCapabilities>

  exportFormat: NormalizeFormat
  setExportFormat: (f: NormalizeFormat) => void
  exportQuality: number
  setExportQuality: (q: number) => void
  previewFileSizeKb: number | null
  previewRendering: boolean
  activeImageSize: { width: number; height: number } | null
  resEditW: number
  resEditH: number
  setResEditW: (v: number) => void
  setResEditH: (v: number) => void
  resizeWorkCanvas: () => void
  mobileExportDraft: {
    width: number
    height: number
    format: NormalizeFormat
    quality: number
  } | null
  beginMobileExportEdit: () => void
  updateMobileExportDraft: (patch: Partial<{
    width: number
    height: number
    format: NormalizeFormat
    quality: number
  }>) => void
  cancelMobileExportEdit: () => void
  commitMobileExportEdit: () => Promise<void>
  vectorizePanelOpen: boolean
  setVectorizePanelOpen: (v: boolean) => void
  vectorizeParams: VectorizeParams
  setVectorizeParams: (params: VectorizeParams) => void
  updateVectorizeParam: <K extends keyof VectorizeParams>(key: K, value: VectorizeParams[K]) => void
  vectorizing: boolean
  svgPreviewSize: number | null
  exportAsSvg: () => Promise<void>

  brushSize: number
  setBrushSize: (v: number) => void
  brushStrength: number
  setBrushStrength: (v: number) => void
  toolMode: ToolMode
  setToolMode: (m: ToolMode) => void
  selectedEffect: AnonymizeEffectId
  setSelectedEffect: (e: AnonymizeEffectId) => void
  customImageSource: CustomImageSource
  setCustomImageSource: (s: CustomImageSource) => void
  customImageAssets: CustomImageAsset[]
  customImagePresetLoading: boolean
  openCustomImagePicker: () => void
  loadCustomImagePreset: (s: CustomImageSource) => Promise<void>
  openEffectPicker: (kind: 'emoji' | 'custom-image') => void
  customImageRandom: boolean
  selectedCustomImageId: string | null
  onToggleCustomRandom: (random: boolean) => void
  onPickCustomImage: (assetId: string) => void
  emojiRandom: boolean
  selectedEmoji: string | null
  onToggleEmojiRandom: (random: boolean) => void
  onPickEmoji: (emoji: string) => void
  /** Confirmed emoji choice (null = random per face). */
  liveFixedEmoji: string | null
  /** Confirmed custom-image asset id (null = random per face). */
  liveFixedCustomImageId: string | null
  /** Anonymization halo around each face, as a fraction of face size (0..2). */
  faceOffset: number
  detectFaceOffset: number
  setDetectFaceOffset: (v: number) => void
  detectSensitivity: number
  setDetectSensitivity: (v: number) => void
  detectThorough: boolean
  setDetectThorough: (v: boolean) => void
  eraserActive: boolean
  autoDetect: boolean
  setAutoDetect: (v: boolean) => void
  setShowBoxes: (v: boolean) => void
  showBoxes: boolean
  detectFacesOnActiveImage: (robust?: boolean) => void
  openDetectSettings: () => void
  removeZoneById: (id: string) => void
  removeSelectedZone: () => void
  clearZones: () => void
  selectedZoneId: string | null

  categoryIndices: Record<MobileToolCategory, number>
  setCategoryIndex: (cat: MobileToolCategory, idx: number) => void
  activeCategory: MobileToolCategory
  setActiveCategory: (cat: MobileToolCategory) => void

  rotateCategoryTool: (cat: MobileToolCategory) => void
  selectToolCategory: (cat: MobileToolCategory) => void
  applyFaceTool: (id: FaceToolId) => void
  applyZoneTool: (id: ZoneToolId) => void
  applyCropTool: (id: CropToolId) => void
  applyAdjustTool: (id: AdjustToolId) => void
  applyEffectTool: (id: EffectToolId) => void
  updateSelectedZoneEffect: (id: AnonymizeEffectId) => void

  mobileViewPan: { x: number; y: number }
  setMobileViewPan: (pan: { x: number; y: number }) => void
  mobileViewRotation: number
  mobileViewTransformDirty: boolean
  resetMobileViewTransform: () => void

  batch: MobileBatchState
  toggleBatchTask: (id: BatchTaskId) => void
  toggleExpandBatchTask: (id: BatchTaskId) => void
  updateNormalizeSetting: <K extends keyof NormalizeSettings>(key: K, value: NormalizeSettings[K]) => void
  runNormalizeBatch: () => void
  exportNormalizeZip: () => void
  setNormalizeSummary: React.Dispatch<React.SetStateAction<MobileBatchState['normalizeSummary']>>
  setColorPreset: (id: ColorPresetId) => void
  setColorAdj: React.Dispatch<React.SetStateAction<ColorAdjustments>>
  applyColorAdjToActive: () => void
  setNotice: (msg: string) => void
  setIsNormalizeCropPicking: React.Dispatch<React.SetStateAction<boolean>>
  setNormalizeCropDraft: React.Dispatch<React.SetStateAction<import('../types').NormalizedRect | null>>
  isNormalizeCropPicking: boolean
  activeNormalizeCrop: import('../types').NormalizedRect | null
  applyTemplateFromCurrentCrop: () => void
  detectFrameOnActivePhoto: () => void
  detectContentAwareCropOnActivePhoto: () => void
  pointerSessionRef: React.MutableRefObject<{ mode: string }>

  resetDetectorStatus: () => void
  initializeDetector: () => Promise<unknown>
  setDetector: (s: import('../types').DetectorStatus) => void

  liveDetectEnabled: boolean
  setLiveDetectEnabled: (v: boolean) => void

  mobileViewZoom: number
  setMobileViewZoom: (z: number) => void
  lastDetectFailed: boolean
  detector: import('../types').DetectorStatus
  detectorLoading: boolean
  addLiveMediaToLibrary: (blob: Blob, opts?: { stayInLive?: boolean }) => string | null
  openPhotoInEditor: (photoId: string, opts?: { slide?: boolean }) => void
  stepAdjacentLibraryPhoto: (dir: -1 | 1) => void
  showMobileToast: (message: string, action?: { label: string; onClick: () => void }) => void
  exportLibraryProgress: { done: number; total: number } | null
  exitLiveToWorkspace: () => void
  stepMobileViewZoom: (direction: 1 | -1) => void

  adjTransform: string
  setAdjTransform: (v: string) => void
  adjTransformStrength: number
  setAdjTransformStrength: (v: number) => void
  adjTransformParams: {
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
  setAdjParam: (key: keyof AppMobileBindings['adjTransformParams'], value: number) => void
  adjPixelShiftType: import('../lib/effects').PixelShiftType
  setAdjPixelShiftType: (v: import('../lib/effects').PixelShiftType) => void
  commitAdjTransform: () => void
  resetAdjTransformPreview: () => void
  enabledDistorts: import('../lib/distort-effects').DistortEffectId[]
  toggleDistortEffect: (id: import('../lib/distort-effects').DistortEffectId) => void
  distortStrengthByEffect: Record<import('../lib/distort-effects').DistortEffectId, number>
  setDistortStrength: (id: import('../lib/distort-effects').DistortEffectId, value: number) => void
}

export type { GlitchSubEffect, NormalizeCodecEngine }
