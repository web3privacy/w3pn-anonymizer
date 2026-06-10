import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type RefObject,
  type SetStateAction,
} from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { saveAs } from 'file-saver'
import { detectFaces } from '../lib/detector'
import { clamp } from '../lib/canvas-geometry'
import { applyColorAdjustments, applyEffectRect, colorAdjExportKey, isColorAdjNoop, pickRandomEmoji, pickUniqueEmojis } from '../lib/effects'
import { applyDistortPipeline, distortPipelineKey, type DistortEffectId } from '../lib/distort-effects'
import { createId } from '../lib/ids'
import { canvasToBlob } from '../lib/export-canvas'
import { useHoldRepeat } from '../lib/useHoldRepeat'
import {
  computeAdjacentFrameTime,
  computePlaybackFrameLabel,
  computeSteppedVideoFrame,
  computeTimedMaskRange,
  formatVideoFrameStamp,
  isDraftZoneTooSmall,
  mapPointerToVideoNormalized,
  normalizeDraftZoneFromDrag,
  resolveVideoDuration,
  resolveVideoFps,
  clampVideoSeekTime,
} from '../lib/video-controller'
import {
  VIDEO_FACE_SCAN_MAX_PASSES,
  faceRectsSimilar,
  filterDismissedFaceZones,
  formatVideoTime,
  getVideoDetectSettings,
  measureVideoContentLayout,
  type NormalizedFaceRect,
  type VideoContentLayout,
} from '../lib/video-layout'
import {
  DEFAULT_ADJ_TRANSFORM_PARAMS,
} from '../lib/editor-constants'
import type { MobilePanel } from '../mobile/types'
import { syncVideoOverlayCanvasDisplay, paintVideoPreviewOverlay, waitForVideoFrame } from '../lib/video-overlay-helpers'
import {
  extractPosterFrame,
  getSupportedVideoExportOptions,
  getVideoMetadata,
  getVideoPipelineCapabilities,
  mimeTypeToVideoExtension,
  processVideo,
  videoZoneStrength,
  VideoFaceTrackStabilizer,
  type VideoDistortOptions,
  type VideoExportFormatId,
  type VideoFrameOverride,
  type VideoProcessingPhase,
  type VideoTimedZone,
} from '../lib/video'
import type {
  AnonymizeEffectId,
  ColorAdjustments,
  CustomImageAsset,
  CustomImageSource,
  EffectRenderOptions,
  PhotoItem,
  SourceType,
  Zone,
} from '../types'

export interface UseVideoControllerOptions {
  activePhoto: PhotoItem | null
  activePhotoId: string | null
  activePhotoRef: RefObject<PhotoItem | null>
  photos: PhotoItem[]
  setPhotos: Dispatch<SetStateAction<PhotoItem[]>>
  originalBlobByPhoto: Record<string, Blob>
  setOriginalBlobByPhoto: Dispatch<SetStateAction<Record<string, Blob>>>
  activeVideoUrl: string | null
  isMobile: boolean
  setMobilePanel: Dispatch<SetStateAction<MobilePanel>>
  mobilePanel: MobilePanel
  setNotice: (message: string) => void
  setIsBusy: (busy: boolean) => void
  setActivePhotoId: Dispatch<SetStateAction<string | null>>
  setActiveDirty: (dirty: boolean) => void
  setZonesByPhoto: Dispatch<SetStateAction<Record<string, Zone[]>>>
  setZonesAnonymized: (value: boolean) => void
  setActiveImageSize: Dispatch<SetStateAction<{ width: number; height: number } | null>>
  setAutoDetect: Dispatch<SetStateAction<boolean>>
  setShowBoxes: Dispatch<SetStateAction<boolean>>
  selectedEffect: AnonymizeEffectId
  selectedEffectRef: MutableRefObject<AnonymizeEffectId>
  brushStrength: number
  brushStrengthRef: MutableRefObject<number>
  emojiRandom: boolean
  selectedEmoji: string | null
  emojiRandomRef: MutableRefObject<boolean>
  selectedEmojiRef: MutableRefObject<string | null>
  customImageRandom: boolean
  selectedCustomImageId: string | null
  customImageRandomRef: MutableRefObject<boolean>
  selectedCustomImageIdRef: MutableRefObject<string | null>
  customImageAssetsRef: MutableRefObject<CustomImageAsset[]>
  customImageSource: CustomImageSource
  colorAdj: ColorAdjustments
  getActiveDistorts: () => DistortEffectId[]
  enabledDistorts: DistortEffectId[]
  distortStrengthByEffect: Record<DistortEffectId, number>
  adjTransformParams: typeof DEFAULT_ADJ_TRANSFORM_PARAMS
  adjPixelShiftType: 'wave' | 'shear' | 'ripple' | 'mirror'
  detectSensitivity: number
  detectFaceOffset: number
  autoDetect: boolean
  detector: import('../types').DetectorStatus
  resolveEmoji: () => string
  resolveCustomImageAssetId: (seed: string | number) => string | undefined
  customEffectOptions: (
    zone?: Zone | null,
    seed?: string | number,
    customImageAssetId?: string,
  ) => EffectRenderOptions
  getWorkCtx: () => CanvasRenderingContext2D | null
  workCanvasRef: RefObject<HTMLCanvasElement | null>
  workCtxRef: MutableRefObject<CanvasRenderingContext2D | null>
  renderCanvasRef: RefObject<() => void>
}

export interface VideoControllerApi {
  videoProcessing: boolean
  setVideoProcessing: Dispatch<SetStateAction<boolean>>
  videoProgress: {
    current: number
    total: number
    phase: VideoProcessingPhase
    renderFrame?: number
    renderTotal?: number
  } | null
  videoAbortRef: MutableRefObject<AbortController | null>
  videoExportOptions: ReturnType<typeof getSupportedVideoExportOptions>
  videoPipelineCapabilities: ReturnType<typeof getVideoPipelineCapabilities>
  videoExportFormat: VideoExportFormatId
  setVideoExportFormat: Dispatch<SetStateAction<VideoExportFormatId>>
  videoFrameOverridesByPhoto: Record<string, VideoFrameOverride[]>
  setVideoFrameOverridesByPhoto: Dispatch<SetStateAction<Record<string, VideoFrameOverride[]>>>
  videoTimedZonesByPhoto: Record<string, VideoTimedZone[]>
  setVideoTimedZonesByPhoto: Dispatch<SetStateAction<Record<string, VideoTimedZone[]>>>
  videoMaskDrawActive: boolean
  setVideoMaskDrawActive: Dispatch<SetStateAction<boolean>>
  videoMaskShape: 'rectangle' | 'circle' | 'path'
  setVideoMaskShape: Dispatch<SetStateAction<'rectangle' | 'circle' | 'path'>>
  videoMaskRangeSec: number
  setVideoMaskRangeSec: Dispatch<SetStateAction<number>>
  activeVideoTime: number
  setActiveVideoTime: Dispatch<SetStateAction<number>>
  activeVideoFrameLabel: string | null
  videoDraftZone: Zone | null
  setVideoDraftZone: Dispatch<SetStateAction<Zone | null>>
  videoExportedDistortKeyByPhoto: Record<string, string>
  videoExportedColorAdjKeyByPhoto: Record<string, string>
  videoDistortPreviewVisible: boolean
  setVideoDistortPreviewVisible: Dispatch<SetStateAction<boolean>>
  activeVideoRef: RefObject<HTMLVideoElement | null>
  videoDistortPreviewCanvasRef: RefObject<HTMLCanvasElement | null>
  videoMediaRef: RefObject<HTMLDivElement | null>
  pendingVideoSeekRef: MutableRefObject<number | null>
  activeVideoTimeRef: MutableRefObject<number>
  videoFaceDetectGenRef: MutableRefObject<number>
  videoFaceScanTimersRef: MutableRefObject<ReturnType<typeof setTimeout>[]>
  videoFrameLabelTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>
  videoPreviewFaceZones: Zone[]
  setVideoPreviewFaceZones: Dispatch<SetStateAction<Zone[]>>
  videoPlaying: boolean
  setVideoPlaying: Dispatch<SetStateAction<boolean>>
  videoContentLayout: VideoContentLayout | null
  setVideoContentLayout: Dispatch<SetStateAction<VideoContentLayout | null>>
  videoReadyTick: number
  setVideoReadyTick: Dispatch<SetStateAction<number>>
  processedVideoEpoch: number
  setProcessedVideoEpoch: Dispatch<SetStateAction<number>>
  activeVideoTimedZones: VideoTimedZone[]
  activeVideoFrameOverrides: VideoFrameOverride[]
  visibleVideoTimedZones: VideoTimedZone[]
  hasPendingVideoEdits: boolean
  videoDismissedAtFrame: NormalizedFaceRect[]
  mapPointerToVideo: (event: ReactPointerEvent<HTMLElement>) => { x: number; y: number } | null
  handleVideoMaskPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void
  handleVideoMaskPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void
  handleVideoMaskPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void
  clearVideoTimedZones: () => void
  processActiveVideo: () => Promise<void>
  cancelVideoProcessing: () => void
  stepActiveVideoFrame: (direction: -1 | 1) => void
  framePrevHold: ReturnType<typeof useHoldRepeat>
  frameNextHold: ReturnType<typeof useHoldRepeat>
  openCurrentVideoFrameAsSnapshot: () => Promise<void>
  stepEditFrameAdjacent: (direction: -1 | 1) => Promise<void>
  exportActiveVideo: () => void
  syncVideoContentLayout: () => void
  refreshVideoFramePreview: () => Promise<void>
  runVideoFaceDetectPass: (passIndex: number, targetTime: number, gen: number) => Promise<void>
  seekActiveVideo: (timeSec: number) => void
  toggleVideoPlayback: () => void
  removeVideoPreviewFaceZone: (zoneId: string) => void
  restoreVideoPreviewFaceZone: (rect: NormalizedFaceRect) => void
  clearVideoDistortPreview: () => void
}

export function useVideoController(options: UseVideoControllerOptions): VideoControllerApi {
  const {
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
    autoDetect,
    detector,
    resolveEmoji,
    resolveCustomImageAssetId,
    customEffectOptions,
    getWorkCtx,
    workCanvasRef,
    workCtxRef,
    renderCanvasRef,
  } = options

  const [videoProcessing, setVideoProcessing] = useState(false)
  const [videoProgress, setVideoProgress] = useState<VideoControllerApi['videoProgress']>(null)
  const videoAbortRef = useRef<AbortController | null>(null)
  const videoExportOptions = useMemo(() => getSupportedVideoExportOptions(), [])
  const videoPipelineCapabilities = useMemo(() => getVideoPipelineCapabilities(), [])
  const [videoExportFormat, setVideoExportFormat] = useState<VideoExportFormatId>('webm')
  const [videoFrameOverridesByPhoto, setVideoFrameOverridesByPhoto] = useState<Record<string, VideoFrameOverride[]>>({})
  const [videoTimedZonesByPhoto, setVideoTimedZonesByPhoto] = useState<Record<string, VideoTimedZone[]>>({})
  const [videoMaskDrawActive, setVideoMaskDrawActive] = useState(false)
  const [videoMaskShape, setVideoMaskShape] = useState<'rectangle' | 'circle' | 'path'>('rectangle')
  const [videoMaskRangeSec, setVideoMaskRangeSec] = useState(3)
  const [activeVideoTime, setActiveVideoTime] = useState(0)
  const [activeVideoFrameLabel, setActiveVideoFrameLabel] = useState<string | null>(null)
  const [videoDraftZone, setVideoDraftZone] = useState<Zone | null>(null)
  const videoMaskPointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const videoFrameLabelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [videoExportedDistortKeyByPhoto, setVideoExportedDistortKeyByPhoto] = useState<Record<string, string>>({})
  const [videoExportedColorAdjKeyByPhoto, setVideoExportedColorAdjKeyByPhoto] = useState<Record<string, string>>({})
  const [videoDistortPreviewVisible, setVideoDistortPreviewVisible] = useState(false)
  const activeVideoRef = useRef<HTMLVideoElement | null>(null)
  const videoDistortPreviewCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const videoDistortPreviewGenRef = useRef(0)
  const videoDistortCaptureCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const videoFaceDetectDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const videoFaceDetectGenRef = useRef(0)
  const videoFaceDetectCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const videoPreviewStabilizerRef = useRef(new VideoFaceTrackStabilizer())
  const videoMediaRef = useRef<HTMLDivElement | null>(null)
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

  useEffect(() => { activeVideoTimeRef.current = activeVideoTime }, [activeVideoTime])
  videoPreviewFaceZonesRef.current = videoPreviewFaceZones
  videoContentLayoutRef.current = videoContentLayout
  videoProcessingRef.current = videoProcessing

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

  const videoDismissedAtFrame = useMemo(() => {
    if (!activePhotoId) return [] as NormalizedFaceRect[]
    const frameKey = Math.round(activeVideoTime * 1000)
    return videoDismissedFacesByPhotoRef.current[activePhotoId]?.[frameKey] ?? []
  }, [activePhotoId, activeVideoTime, videoDismissedTick])

  const mapPointerToVideo = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const media = videoMediaRef.current
    const layout = videoContentLayout
    if (!media || !layout) return null
    const bounds = media.getBoundingClientRect()
    return mapPointerToVideoNormalized(event.clientX, event.clientY, bounds, layout)
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
  }, [activePhoto, setNotice])

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
  }, [activePhoto, mapPointerToVideo, selectedEffect, videoMaskDrawActive, videoMaskShape, resolveEmoji])

  const handleVideoMaskPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!videoMaskPointerStartRef.current || !videoMaskDrawActive) return
    const mapped = mapPointerToVideo(event)
    if (!mapped) return
    const start = videoMaskPointerStartRef.current
    setVideoDraftZone((cur) => cur ? { ...cur, ...normalizeDraftZoneFromDrag(start, mapped) } : null)
  }, [mapPointerToVideo, videoMaskDrawActive])

  const handleVideoMaskPointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!activePhoto?.isVideo) return
    if (videoMaskPointerStartRef.current) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    videoMaskPointerStartRef.current = null
    const zone = videoDraftZone
    if (!zone || isDraftZoneTooSmall(zone.width, zone.height)) {
      setVideoDraftZone(null)
      if (videoMaskDrawActive) setNotice('Timeline mask was too small — drag a larger rectangle over the video.')
      return
    }

    const video = activeVideoRef.current
    const duration = resolveVideoDuration(activePhoto.videoDuration, video?.duration)
    const center = video?.currentTime ?? activeVideoTime
    const { startSec, endSec } = computeTimedMaskRange(center, videoMaskRangeSec, duration)
    const id = createId()
    const timedZone: VideoTimedZone = {
      id,
      startSec,
      endSec,
      zone: { ...zone, id, effect: selectedEffect, emoji: zone.emoji || pickRandomEmoji(), maskShape: zone.maskShape ?? videoMaskShape },
    }

    setVideoTimedZonesByPhoto((cur) => ({
      ...cur,
      [activePhoto.id]: [...(cur[activePhoto.id] ?? []), timedZone].sort((a, b) => a.startSec - b.startSec),
    }))
    setVideoDraftZone(null)
    setVideoMaskDrawActive(false)
    setNotice(`Timeline mask added for ${formatVideoTime(timedZone.startSec)}–${formatVideoTime(timedZone.endSec)}. Re-run video anonymization to bake it in.`)
  }, [activePhoto, activeVideoTime, selectedEffect, videoDraftZone, videoMaskDrawActive, videoMaskRangeSec, videoMaskShape, setNotice])

  const clearVideoDistortPreview = useCallback(() => {
    if (videoDistortPreviewCanvasRef.current) videoDistortPreviewCanvasRef.current.width = 0
    setVideoDistortPreviewVisible(false)
  }, [])

  const processActiveVideo = useCallback(async () => {
    if (!activePhoto?.isVideo) return
    if (videoAbortRef.current) return
    const exportEffect = selectedEffectRef.current
    const exportAssets = customImageAssetsRef.current ?? []
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
      const effect = selectedEffectRef.current
      const strength = brushStrengthRef.current
      const activeDistorts = getActiveDistorts()
      const exportColorAdj = colorAdj
      const exportDistortStrengths = { ...distortStrengthByEffect } as Record<DistortEffectId, number>
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
        strength: brushStrengthRef.current ?? strength,
        emoji: (!emojiRandomRef.current && selectedEmojiRef.current) ? selectedEmojiRef.current : pickRandomEmoji(),
        fixedEmoji: (!emojiRandomRef.current && selectedEmojiRef.current) ? selectedEmojiRef.current : undefined,
        fixedCustomImageId: (!customImageRandomRef.current && selectedCustomImageIdRef.current)
          ? selectedCustomImageIdRef.current
          : undefined,
        customImages: customImageAssetsRef.current ?? undefined,
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
      clearVideoDistortPreview()
    }
  }, [
    activePhoto,
    adjPixelShiftType,
    adjTransformParams,
    clearVideoDistortPreview,
    colorAdj,
    customImageAssetsRef,
    customImageRandomRef,
    customImageSource,
    distortStrengthByEffect,
    emojiRandomRef,
    getActiveDistorts,
    isMobile,
    originalBlobByPhoto,
    selectedCustomImageIdRef,
    selectedEffectRef,
    selectedEmojiRef,
    setAutoDetect,
    setMobilePanel,
    setNotice,
    setPhotos,
    setShowBoxes,
    videoExportFormat,
    videoExportOptions,
    videoFrameOverridesByPhoto,
    videoTimedZonesByPhoto,
    brushStrengthRef,
  ])

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
    const fps = resolveVideoFps(activePhoto.videoFps)
    const duration = resolveVideoDuration(activePhoto.videoDuration, video.duration)
    const { nextTime, totalFrames, displayFrame } = computeSteppedVideoFrame(video.currentTime, direction, fps, duration)

    showVideoFrameLabel(displayFrame, totalFrames)
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

  useEffect(() => {
    if (!activePhoto?.isVideo) return
    const fps = resolveVideoFps(activePhoto.videoFps)
    const duration = Number.isFinite(activePhoto.videoDuration) ? activePhoto.videoDuration ?? 0 : 0
    if (videoFrameLabelTimerRef.current) {
      clearTimeout(videoFrameLabelTimerRef.current)
      videoFrameLabelTimerRef.current = null
    }
    setActiveVideoFrameLabel(computePlaybackFrameLabel(activeVideoTime, fps, duration))
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
      const snapshotName = `${baseName}-frame-${formatVideoFrameStamp(video.currentTime)}.png`
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
  }, [activePhoto, setActivePhotoId, setIsBusy, setNotice, setOriginalBlobByPhoto, setPhotos])

  const stepEditFrameAdjacent = useCallback(async (direction: -1 | 1) => {
    if (!activePhoto || activePhoto.isVideo || !activePhoto.derivedFromVideoId || activePhoto.derivedFromVideoTime == null) return
    const source = photos.find((p) => p.id === activePhoto.derivedFromVideoId)
    if (!source) return

    const fps = resolveVideoFps(source.videoFps)
    const duration = Number.isFinite(source.videoDuration) ? source.videoDuration ?? 0 : 0
    const { newTime, totalFrames, frameIndex } = computeAdjacentFrameTime(
      activePhoto.derivedFromVideoTime,
      direction,
      fps,
      duration,
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
      const snapshotId = activePhoto.id

      setPhotos((cur) => cur.map((p) => {
        if (p.id !== snapshotId) return p
        window.setTimeout(() => URL.revokeObjectURL(p.previewUrl), 0)
        return {
          ...p,
          name: `${baseName}-frame-${formatVideoFrameStamp(newTime)}.png`,
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
        renderCanvasRef.current?.()
      }

      showVideoFrameLabel(frameIndex + 1, totalFrames)
      setNotice(`Frame ${formatVideoTime(newTime)}`)
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Frame step failed.')
    } finally {
      setIsBusy(false)
    }
  }, [
    activePhoto,
    getWorkCtx,
    originalBlobByPhoto,
    photos,
    renderCanvasRef,
    setActiveDirty,
    setActiveImageSize,
    setIsBusy,
    setNotice,
    setOriginalBlobByPhoto,
    setPhotos,
    setZonesAnonymized,
    setZonesByPhoto,
    showVideoFrameLabel,
    workCanvasRef,
    workCtxRef,
  ])

  const exportActiveVideo = useCallback(() => {
    if (!activePhoto?.isVideo) return
    const ext = mimeTypeToVideoExtension(activePhoto.mimeType)
    const baseName = activePhoto.name.split('/').pop() ?? activePhoto.name
    const outName = baseName.replace(/\.[^.]+$/, '') + `-anon.${ext}`
    saveAs(activePhoto.blob, outName)
    setNotice(`Exported: ${outName}`)
  }, [activePhoto, setNotice])

  useEffect(() => {
    if (!activePhoto?.isVideo) return
    const overlay = videoDistortPreviewCanvasRef.current
    if (overlay && videoContentLayout) {
      syncVideoOverlayCanvasDisplay(overlay, videoContentLayout)
    }
  }, [activePhoto?.isVideo, videoContentLayout])

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
              videoZoneStrength(zone, brushStrengthRef.current ?? 0),
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
        const fps = resolveVideoFps(photo?.videoFps)
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
    activePhotoRef,
    adjPixelShiftType,
    adjTransformParams,
    brushStrengthRef,
    colorAdj,
    customEffectOptions,
    distortStrengthByEffect,
    emojiRandomRef,
    getActiveDistorts,
    selectedEffectRef,
    selectedEmojiRef,
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
  }, [activePhotoId, detectSensitivity, refreshVideoFramePreview, resolveCustomImageAssetId, selectedEffect, emojiRandomRef, selectedEmojiRef])

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
    const next = clampVideoSeekTime(timeSec, activePhoto?.videoDuration ?? video.duration)
    video.currentTime = next
    setActiveVideoTime(next)
  }, [activePhoto?.videoDuration])

  const toggleVideoPlayback = useCallback(() => {
    const video = activeVideoRef.current
    if (!video) return
    if (video.paused) void video.play().catch(() => {})
    else video.pause()
  }, [])

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

  useEffect(() => () => {
    if (videoFrameLabelTimerRef.current) clearTimeout(videoFrameLabelTimerRef.current)
    videoFaceScanTimersRef.current.forEach(clearTimeout)
    videoAbortRef.current?.abort()
  }, [])

  return {
    videoProcessing,
    setVideoProcessing,
    videoProgress,
    videoAbortRef,
    videoExportOptions,
    videoPipelineCapabilities,
    videoExportFormat,
    setVideoExportFormat,
    videoFrameOverridesByPhoto,
    setVideoFrameOverridesByPhoto,
    videoTimedZonesByPhoto,
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
    setVideoDraftZone,
    videoExportedDistortKeyByPhoto,
    videoExportedColorAdjKeyByPhoto,
    videoDistortPreviewVisible,
    setVideoDistortPreviewVisible,
    activeVideoRef,
    videoDistortPreviewCanvasRef,
    videoMediaRef,
    pendingVideoSeekRef,
    activeVideoTimeRef,
    videoFaceDetectGenRef,
    videoFaceScanTimersRef,
    videoFrameLabelTimerRef,
    videoPreviewFaceZones,
    setVideoPreviewFaceZones,
    videoPlaying,
    setVideoPlaying,
    videoContentLayout,
    setVideoContentLayout,
    videoReadyTick,
    setVideoReadyTick,
    processedVideoEpoch,
    setProcessedVideoEpoch,
    activeVideoTimedZones,
    activeVideoFrameOverrides,
    visibleVideoTimedZones,
    hasPendingVideoEdits,
    videoDismissedAtFrame,
    mapPointerToVideo,
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
    refreshVideoFramePreview,
    runVideoFaceDetectPass,
    seekActiveVideo,
    toggleVideoPlayback,
    removeVideoPreviewFaceZone,
    restoreVideoPreviewFaceZone,
    clearVideoDistortPreview,
  }
}
