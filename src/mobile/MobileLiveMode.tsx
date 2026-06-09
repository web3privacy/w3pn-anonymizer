import { useCallback, useEffect, useRef, useState } from 'react'
import type { Zone } from '../types'
import { applyLiveTrackSettings, readLiveTrackCapabilities } from '../lib/live-camera-controls'
import { captureLivePhotoBlob, startLiveCameraLoop, type LiveCameraOpts, type LiveZoneInfo } from '../lib/live-camera'
import { Icon } from '../components/Icon'
import type { AppMobileBindings } from './bindings'
import { DEFAULT_LIVE_CAMERA_SETTINGS, type LiveCameraSettings } from './liveCameraTypes'
import { MobileBottomToolbar } from './MobileBottomToolbar'
import { MobileLiveCameraSettings } from './MobileLiveCameraSettings'
import { MobileLiveFaceOverlay } from './MobileLiveFaceOverlay'
import { MobileLiveFloatingControls } from './MobileLiveFloatingControls'
import { MobileToolDrawers } from './MobileToolDrawers'
import { MobileTopBar } from './MobileTopBar'
import { saveLiveCapture } from './liveSessionBuffer'

interface MobileLiveModeProps {
  b: AppMobileBindings
  onOpenLibrary: () => void
  onExitToWorkspace: () => void
  onFallbackUpload: () => void
  onCaptureSaved?: (blob: Blob, type: 'photo' | 'video') => string | null
  onOpenCapturedPhoto?: (photoId: string, opts?: { slide?: boolean }) => void
}

export function MobileLiveMode({
  b,
  onOpenLibrary,
  onExitToWorkspace,
  onFallbackUpload,
  onCaptureSaved,
  onOpenCapturedPhoto,
}: MobileLiveModeProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const videoTrackRef = useRef<MediaStreamTrack | null>(null)
  const loopRef = useRef<{ stop: () => void } | null>(null)
  const cameraRequestRef = useRef(0)
  const mountedRef = useRef(true)
  const startingRef = useRef(false)
  const pipelineMsRef = useRef<HTMLSpanElement>(null)
  const onCaptureSavedRef = useRef(onCaptureSaved)
  onCaptureSavedRef.current = onCaptureSaved

  const onOpenLibraryRef = useRef(onOpenLibrary)
  onOpenLibraryRef.current = onOpenLibrary
  const onExitRef = useRef(onExitToWorkspace)
  onExitRef.current = onExitToWorkspace
  const setAboutOpenRef = useRef(b.setAboutOpen)
  setAboutOpenRef.current = b.setAboutOpen

  const [cameraSettings, setCameraSettings] = useState<LiveCameraSettings>(DEFAULT_LIVE_CAMERA_SETTINGS)
  const [cameraSettingsOpen, setCameraSettingsOpen] = useState(false)
  const [trackCaps, setTrackCaps] = useState(() => readLiveTrackCapabilities(null))
  const [liveFaceCount, setLiveFaceCount] = useState(0)
  // Faces the user opted OUT of anonymizing (by stable track id). Persists
  // across frames so a chosen face stays un-blurred as it moves in the scene.
  const [ignoredFaceIds, setIgnoredFaceIds] = useState<Set<string>>(() => new Set())
  const [capturePreviewUrl, setCapturePreviewUrl] = useState<string | null>(null)
  const [lastCapturePhotoId, setLastCapturePhotoId] = useState<string | null>(null)
  const capturePreviewUrlRef = useRef<string | null>(null)
  const [captureFlash, setCaptureFlash] = useState(false)
  // Latest tracked faces from the loop, kept in a ref to avoid per-frame renders.
  const liveZonesRef = useRef<LiveZoneInfo[]>([])
  const liveSnapshotZonesRef = useRef<Zone[]>([])

  const toggleIgnoreFace = useCallback((id: string) => {
    setIgnoredFaceIds((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const optsRef = useRef<LiveCameraOpts>({
    detectEnabled: b.liveDetectEnabled,
    selectedEffect: b.selectedEffect,
    brushStrength: b.brushStrength,
    colorAdj: b.batch.colorAdj,
    customImages: b.customImageAssets,
    customImageSource: b.customImageSource,
    transform: {
      enabled: b.enabledDistorts,
      strengths: b.distortStrengthByEffect,
      params: { ...b.adjTransformParams },
      pixelShiftType: b.adjPixelShiftType,
    },
    camera: { aspectRatio: DEFAULT_LIVE_CAMERA_SETTINGS.aspectRatio },
    ignoredFaceIds: new Set(),
    ignoredFaceBoxes: [],
    snapshotZones: [],
  })

  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (capturePreviewUrlRef.current) URL.revokeObjectURL(capturePreviewUrlRef.current)
    }
  }, [])

  optsRef.current = {
    detectEnabled: b.liveDetectEnabled,
    selectedEffect: b.selectedEffect,
    brushStrength: b.brushStrength,
    colorAdj: b.batch.colorAdj,
    customImages: b.customImageAssets,
    customImageSource: b.customImageSource,
    fixedEmoji: b.liveFixedEmoji ?? undefined,
    fixedCustomImageId: b.liveFixedCustomImageId ?? undefined,
    faceOffset: b.faceOffset,
    transform: {
      enabled: b.enabledDistorts,
      strengths: b.distortStrengthByEffect,
      params: { ...b.adjTransformParams },
      pixelShiftType: b.adjPixelShiftType,
    },
    camera: { aspectRatio: cameraSettings.aspectRatio },
    ignoredFaceIds,
    ignoredFaceBoxes: liveZonesRef.current
      .filter((z) => ignoredFaceIds.has(z.id))
      .map((z) => ({ x: z.x, y: z.y, width: z.width, height: z.height })),
    snapshotZones: liveSnapshotZonesRef.current,
  }

  const updateFpsDom = useCallback((fps: number) => {
    const el = pipelineMsRef.current
    if (!el) return
    if (fps <= 0) {
      if (!el.hidden) el.hidden = true
      return
    }
    const text = `${fps} FPS`
    if (el.textContent !== text) el.textContent = text
    // Green = smooth, amber = passable, red = laggy.
    el.style.color = fps >= 24 ? '#00ff78' : fps >= 15 ? '#ffb300' : '#e53935'
    if (el.hidden) el.hidden = false
  }, [])

  const loopCallbacksRef = useRef({
    onFaceCount: (count: number) => setLiveFaceCount(count),
    onFps: (fps: number) => { updateFpsDom(fps) },
    onZones: (zones: LiveZoneInfo[]) => { liveZonesRef.current = zones },
    onSnapshotZones: (zones: readonly Zone[]) => { liveSnapshotZonesRef.current = zones.map((z) => ({ ...z })) },
  })
  loopCallbacksRef.current.onFps = updateFpsDom

  const patchCameraSettings = useCallback((patch: Partial<LiveCameraSettings>) => {
    setCameraSettings((cur) => ({ ...cur, ...patch }))
  }, [])

  const facingModeRef = useRef<'environment' | 'user'>('environment')

  const toggleFlash = useCallback(() => {
    setCameraSettings((cur) => ({ ...cur, torch: !cur.torch }))
  }, [])

  const handleAbout = useCallback(() => setAboutOpenRef.current(true), [])
  const handleOpenLibrary = useCallback(() => onOpenLibraryRef.current(), [])
  const handleExit = useCallback(() => onExitRef.current(), [])

  useEffect(() => {
    const track = videoTrackRef.current
    if (!track) return
    void applyLiveTrackSettings(track, {
      torch: cameraSettings.torch,
      exposureCompensation: cameraSettings.exposureCompensation,
      zoom: cameraSettings.zoom,
    })
  }, [cameraSettings.torch, cameraSettings.exposureCompensation, cameraSettings.zoom])

  const stopStream = useCallback(() => {
    loopRef.current?.stop()
    loopRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    videoTrackRef.current = null
    setTrackCaps(readLiveTrackCapabilities(null))
    startingRef.current = false
    setStarting(false)
    updateFpsDom(0)
  }, [updateFpsDom])

  const formatCameraError = useCallback((e: unknown) => {
    if (!window.isSecureContext) {
      return 'Camera requires a secure browser context. Try HTTPS or a trusted local app.'
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      return 'Camera API is not available in this browser.'
    }
    const name = e instanceof DOMException ? e.name : e instanceof Error ? e.name : ''
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
      return 'Camera permission is blocked for this page. Check browser site settings, then tap TRY CAMERA AGAIN.'
    }
    if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
      return 'No camera was found on this device.'
    }
    if (name === 'NotReadableError' || name === 'TrackStartError') {
      return 'The camera is already in use by another app or browser tab.'
    }
    return e instanceof Error ? e.message : 'Camera access failed.'
  }, [])

  const startCamera = useCallback(async () => {
    if (startingRef.current) return
    const requestId = cameraRequestRef.current + 1
    cameraRequestRef.current = requestId
    stopStream()
    startingRef.current = true
    setStarting(true)
    setReady(false)
    setError(null)
    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        throw new DOMException('Camera API unavailable', !window.isSecureContext ? 'SecurityError' : 'NotSupportedError')
      }
      const preferred: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingModeRef.current },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }
      const fallback: MediaStreamConstraints = {
        video: true,
        audio: false,
      }
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia(preferred)
      } catch (firstError) {
        const name = firstError instanceof DOMException ? firstError.name : firstError instanceof Error ? firstError.name : ''
        if (name === 'OverconstrainedError' || name === 'ConstraintNotSatisfiedError' || name === 'NotFoundError') {
          stream = await navigator.mediaDevices.getUserMedia(fallback)
        } else {
          throw firstError
        }
      }
      if (!mountedRef.current || requestId !== cameraRequestRef.current) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }
      streamRef.current = stream
      const track = stream.getVideoTracks()[0] ?? null
      videoTrackRef.current = track
      setTrackCaps(readLiveTrackCapabilities(track))
      if (track) {
        track.onended = () => {
          if (requestId === cameraRequestRef.current && mountedRef.current) {
            setReady(false)
          }
        }
      }
      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        await video.play().catch(() => {})
        if (!mountedRef.current || requestId !== cameraRequestRef.current) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        startingRef.current = false
        setStarting(false)
        setReady(true)
      }
    } catch (e) {
      if (!mountedRef.current || requestId !== cameraRequestRef.current) return
      setError(formatCameraError(e))
      setReady(false)
      startingRef.current = false
      setStarting(false)
      stopStream()
    }
  }, [formatCameraError, stopStream])

  const switchCamera = useCallback(() => {
    facingModeRef.current = facingModeRef.current === 'environment' ? 'user' : 'environment'
    void startCamera()
  }, [startCamera])

  useEffect(() => {
    void startCamera()
    return () => {
      cameraRequestRef.current += 1
      stopStream()
    }
  }, [startCamera, stopStream])

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !ready) return

    loopRef.current?.stop()
    loopRef.current = startLiveCameraLoop(
      video,
      canvas,
      () => optsRef.current,
      {
        onFaceCount: (count) => loopCallbacksRef.current.onFaceCount(count),
        onFps: (fps) => loopCallbacksRef.current.onFps(fps),
        onZones: (zones) => loopCallbacksRef.current.onZones(zones),
        onSnapshotZones: (zones) => loopCallbacksRef.current.onSnapshotZones(zones),
      },
    )

    return () => {
      loopRef.current?.stop()
      loopRef.current = null
      updateFpsDom(0)
    }
  }, [ready, cameraSettings.aspectRatio, updateFpsDom])

  const capturePhoto = useCallback(async () => {
    const video = videoRef.current
    if (!video) return
    setCaptureFlash(true)
    window.setTimeout(() => setCaptureFlash(false), 300)
    const blob = await captureLivePhotoBlob(video, () => optsRef.current)
    if (blob) {
      const url = URL.createObjectURL(blob)
      if (capturePreviewUrlRef.current) URL.revokeObjectURL(capturePreviewUrlRef.current)
      capturePreviewUrlRef.current = url
      setCapturePreviewUrl(url)
      saveLiveCapture(blob, 'photo')
      const photoId = onCaptureSavedRef.current?.(blob, 'photo') ?? null
      if (photoId) setLastCapturePhotoId(photoId)
    }
  }, [])

  const handleVideoSaved = useCallback((blob: Blob, type: 'photo' | 'video') => {
    onCaptureSavedRef.current?.(blob, type)
  }, [])

  const canvasFitClass = cameraSettings.displayFit === 'cover'
    ? 'mobile-live-canvas--cover'
    : 'mobile-live-canvas--contain'

  const topBar = (
    <MobileTopBar
      variant="live"
      onAbout={handleAbout}
      showGalleryButton
      onOpenGallery={handleOpenLibrary}
      onClose={handleExit}
      pipelineMsRef={pipelineMsRef}
    />
  )

  if (error) {
    return (
      <div className="mobile-live">
        {topBar}
        <div className="mobile-live-error">
          <Icon name="videocam_off" size={40} />
          <p>{error}</p>
          <button className="btn btn-primary" type="button" onClick={() => { void startCamera() }} disabled={starting}>
            {starting ? 'STARTING' : 'TRY CAMERA AGAIN'}
          </button>
          <button className="btn btn-primary" type="button" onClick={onFallbackUpload}>SELECT FILES</button>
        </div>
      </div>
    )
  }

  const liveShellClass = cameraSettings.displayFit === 'cover'
    ? 'mobile-live mobile-live--cover'
    : 'mobile-live'

  return (
    <div className={liveShellClass}>
      {topBar}

      <div className={`mobile-live-preview mobile-live-preview--${cameraSettings.displayFit}`}>
        <video ref={videoRef} playsInline muted style={{ display: 'none' }} />
        <canvas ref={canvasRef} className={`mobile-live-canvas ${canvasFitClass}`} />
        {captureFlash && <div className="mobile-live-capture-flash" aria-hidden="true" />}
        {capturePreviewUrl && (
          <button
            type="button"
            className="mobile-live-capture-thumb"
            onClick={() => {
              if (lastCapturePhotoId) onOpenCapturedPhoto?.(lastCapturePhotoId, { slide: true })
            }}
            aria-label="Edit captured photo"
          >
            <img src={capturePreviewUrl} alt="" draggable={false} />
          </button>
        )}
        {b.liveDetectEnabled && (
          <MobileLiveFaceOverlay
            canvasRef={canvasRef}
            zonesRef={liveZonesRef}
            ignoredFaceIds={ignoredFaceIds}
            displayFit={cameraSettings.displayFit}
            faceOffsetPercent={b.detectFaceOffset}
            onToggleFace={toggleIgnoreFace}
          />
        )}
      </div>

      <MobileLiveFloatingControls
        canvasRef={canvasRef}
        onCapturePhoto={capturePhoto}
        onVideoSaved={handleVideoSaved}
        onOpenCameraSettings={() => setCameraSettingsOpen(true)}
        onToggleFlash={toggleFlash}
        flashActive={cameraSettings.torch}
        flashAvailable={trackCaps.torch}
        disabled={!ready}
      />

      <div className="mobile-shell-bottom mobile-live-toolbar-wrap">
        <MobileBottomToolbar b={b} liveMode liveFaceCount={liveFaceCount} />
      </div>

      <MobileToolDrawers b={b} liveMode />

      <MobileLiveCameraSettings
        open={cameraSettingsOpen}
        onClose={() => setCameraSettingsOpen(false)}
        settings={cameraSettings}
        onChange={patchCameraSettings}
        caps={trackCaps}
        onSwitchCamera={switchCamera}
      />
    </div>
  )
}
