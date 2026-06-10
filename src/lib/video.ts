import { detectFaces } from './detector'
import {
  applyDistortPipeline,
  type DistortEffectId,
  type DistortParams,
} from './distort-effects'
import { applyColorAdjustments, applyEffectRect, isColorAdjNoop, pickRandomEmoji, type PixelShiftType } from './effects'
import type { EffectRenderOptions } from '../types'
import type { AnonymizeEffectId, ColorAdjustments, CustomImageAsset, CustomImageSource, Zone } from '../types'
import fixWebmDuration from 'webm-duration-fix'
import { Muxer as Mp4Muxer, ArrayBufferTarget as Mp4ArrayBufferTarget } from 'mp4-muxer'
import { Muxer as WebmMuxer, ArrayBufferTarget as WebmArrayBufferTarget } from 'webm-muxer'

export interface VideoDistortOptions {
  enabled: DistortEffectId[]
  strengths: Record<DistortEffectId, number>
  params: DistortParams
  pixelShiftType: PixelShiftType
}

export interface VideoProcessingOptions {
  effect: AnonymizeEffectId
  strength: number
  emoji: string
  /** When set, every detected face uses this exact emoji instead of random unique ones. */
  fixedEmoji?: string
  /** When set, every custom-image zone uses this asset instead of random picks. */
  fixedCustomImageId?: string
  customImages?: CustomImageAsset[]
  customImageSource?: CustomImageSource
  outputFormat?: VideoExportFormatId
  frameOverrides?: VideoFrameOverride[]
  timedZones?: VideoTimedZone[]
  /** Global color adjustments applied after anonymization on non-override frames. */
  colorAdj?: ColorAdjustments
  /** Global distort filter applied after color adjustments on non-override frames. */
  distort?: VideoDistortOptions
  onProgress?: (current: number, total: number) => void
  onPhase?: (phase: VideoProcessingPhase) => void
  onRenderFrame?: (info: { frameIndex: number; totalFrames: number; canvas: HTMLCanvasElement; mediaTime: number }) => void
  abortSignal?: AbortSignal
}

export interface VideoMetadata {
  width: number
  height: number
  duration: number
  fps: number
}

export interface VideoFrameOverride {
  timeSec: number
  frameBlob: Blob
}

export interface VideoTimedZone {
  id: string
  startSec: number
  endSec: number
  zone: Zone
}

export type VideoProcessingPhase = 'analyzing' | 'preparing' | 'rendering' | 'finishing'

export type VideoExportFormatId = 'mp4' | 'webm' | 'mov' | 'avi' | 'mpeg' | 'mkv' | 'ogv'

export interface VideoExportOption {
  id: VideoExportFormatId
  label: string
  ext: string
  mimeType: string | null
  supported: boolean
}

export interface VideoPipelineCapabilities {
  mediaRecorder: boolean
  manualCanvasFrameCapture: boolean
  requestVideoFrameCallback: boolean
  timelineWorker: boolean
  offscreenCanvas: boolean
  webCodecs: boolean
  webCodecsRenderer: boolean
}

interface VideoExportConfig {
  id: VideoExportFormatId
  label: string
  ext: string
  mimeCandidates: string[]
}

type CaptureVideoElement = HTMLVideoElement & {
  captureStream?: () => MediaStream
  mozCaptureStream?: () => MediaStream
}

type ManualCanvasCaptureTrack = MediaStreamTrack & {
  requestFrame?: () => void
}

const VIDEO_EXPORT_CONFIGS: VideoExportConfig[] = [
  { id: 'mp4', label: 'MP4', ext: 'mp4', mimeCandidates: ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4'] },
  { id: 'webm', label: 'WebM', ext: 'webm', mimeCandidates: ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'] },
  { id: 'mov', label: 'MOV', ext: 'mov', mimeCandidates: ['video/quicktime', 'video/mp4'] },
  { id: 'avi', label: 'AVI', ext: 'avi', mimeCandidates: ['video/x-msvideo', 'video/avi'] },
  { id: 'mpeg', label: 'MPEG', ext: 'mpeg', mimeCandidates: ['video/mpeg'] },
  { id: 'mkv', label: 'MKV', ext: 'mkv', mimeCandidates: ['video/x-matroska;codecs=avc1,opus', 'video/x-matroska'] },
  { id: 'ogv', label: 'OGV', ext: 'ogv', mimeCandidates: ['video/ogg;codecs=theora,vorbis', 'video/ogg'] },
]

const FALLBACK_FPS = 30
const VIDEO_BITRATE = 6_000_000
const AUDIO_BITRATE = 128_000
const DETECT_MAX_DIM = 1280
const TRACK_KEEPALIVE_SEC = 0.4
const TRACK_SMOOTHING = 0.34
const VIDEO_ZONE_PADDING = 0.46
const VIDEO_DETECTION_PREROLL_SEC = 0.16
const VIDEO_MIN_FACE_SCORE = 0.58
const VIDEO_MAX_FACE_REL_AREA = 0.14
const VIDEO_TRACK_CONFIRM_HITS = 2
const VIDEO_MIN_EFFECT_STRENGTH = 0.92

export const VIDEO_RUNTIME_LIMITS = {
  acceptedExtensions: ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', 'ogv'] as const,
  maxUploadBytes: 500 * 1024 * 1024,
  /** Hard cap for anonymization pipeline (10 minutes). */
  maxDurationSec: 600,
  detectMaxDimension: DETECT_MAX_DIM,
  defaultFps: FALLBACK_FPS,
  estimatedFpsRange: { min: 10, max: 60 },
  videoBitrate: VIDEO_BITRATE,
  audioBitrate: AUDIO_BITRATE,
} as const

interface WebCodecsHost {
  VideoEncoder?: {
    isConfigSupported(config: VideoEncoderConfig): Promise<{ supported: boolean }>
    new (init: {
      output: (chunk: EncodedVideoChunk, metadata?: EncodedVideoChunkMetadata) => void
      error: (error: DOMException) => void
    }): VideoEncoderInstance
  }
  AudioEncoder?: {
    isConfigSupported(config: AudioEncoderConfig): Promise<{ supported: boolean }>
    new (init: {
      output: (chunk: EncodedAudioChunk, metadata?: EncodedAudioChunkMetadata) => void
      error: (error: DOMException) => void
    }): AudioEncoderInstance
  }
  VideoFrame?: new (source: CanvasImageSource, init: { timestamp: number; duration?: number }) => {
    close(): void
  }
  MediaStreamTrackProcessor?: new (init: { track: MediaStreamTrack }) => {
    readable: ReadableStream<AudioData>
  }
}

interface VideoEncoderInstance {
  configure(config: VideoEncoderConfig): void
  encode(frame: { close(): void }, options?: { keyFrame?: boolean }): void
  flush(): Promise<void>
  close(): void
}

interface AudioEncoderInstance {
  configure(config: AudioEncoderConfig): void
  encode(data: AudioData): void
  flush(): Promise<void>
  close(): void
}

function getWebCodecsHost(): WebCodecsHost {
  return window as unknown as WebCodecsHost
}

interface VideoTrackState {
  id: string
  zone: Zone
  vx: number
  vy: number
  lastSeenTime: number
  lastPredictTime: number
  missed: number
  /** Consecutive detection matches — tracks need 2+ before export. */
  hitStreak: number
  confirmed: boolean
}

interface VideoTrackKeyframe {
  timeSec: number
  zones: Zone[]
}

function getCaptureStream(video: CaptureVideoElement): MediaStream | null {
  if (typeof video.captureStream === 'function') return video.captureStream()
  if (typeof video.mozCaptureStream === 'function') return video.mozCaptureStream()
  return null
}

function createCanvasStream(
  canvas: HTMLCanvasElement,
  fps: number,
): { stream: MediaStream; videoTrack: MediaStreamTrack; requestFrame: (() => void) | null } {
  const manualStream = canvas.captureStream(0)
  const manualTrack = manualStream.getVideoTracks()[0] as ManualCanvasCaptureTrack | undefined
  if (manualTrack && typeof manualTrack.requestFrame === 'function') {
    return {
      stream: manualStream,
      videoTrack: manualTrack,
      requestFrame: () => manualTrack.requestFrame?.(),
    }
  }

  manualStream.getTracks().forEach((track) => track.stop())
  const stream = canvas.captureStream(fps)
  const videoTrack = stream.getVideoTracks()[0]
  if (!videoTrack) throw new Error('Could not capture processed video track.')
  return { stream, videoTrack, requestFrame: null }
}

type MuxContainer = 'webm' | 'mp4'

interface FrameEncoderFormat {
  container: MuxContainer
  encoderCodec: string
  muxVideoCodec: 'V_VP9' | 'V_VP8' | 'avc'
  mimeType: string
}

interface FrameMuxerSink {
  addVideoChunk: (chunk: EncodedVideoChunk, meta?: EncodedVideoChunkMetadata) => void
  addAudioChunk: (chunk: EncodedAudioChunk, meta?: EncodedAudioChunkMetadata) => void
  finalize: () => void
  getBuffer: () => ArrayBuffer
  audioCodec: 'opus' | 'aac'
}

const FALLBACK_FRAME_CACHE_BUDGET_BYTES = 320 * 1024 * 1024

function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function sleepUntil(targetMs: number): Promise<void> {
  let now = performance.now()
  while (now < targetMs) {
    await sleepMs(Math.min(8, targetMs - now))
    now = performance.now()
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Failed to encode canvas frame.'))
    }, type, quality)
  })
}

async function isVideoEncoderConfigSupported(config: VideoEncoderConfig): Promise<boolean> {
  const host = getWebCodecsHost()
  if (typeof host.VideoEncoder?.isConfigSupported !== 'function') return false
  try {
    const result = await host.VideoEncoder.isConfigSupported(config)
    return result.supported === true
  } catch {
    return false
  }
}

async function pickFrameEncoderFormat(
  preferred: VideoExportFormatId | undefined,
  width: number,
  height: number,
  fps: number,
): Promise<FrameEncoderFormat | null> {
  const candidates: Array<{ ids?: VideoExportFormatId[]; format: FrameEncoderFormat }> = [
    {
      ids: ['mp4', 'mov', 'mkv', 'avi', 'mpeg'],
      format: { container: 'mp4', encoderCodec: 'avc1.42E01E', muxVideoCodec: 'avc', mimeType: 'video/mp4' },
    },
    {
      ids: ['webm', 'ogv'],
      format: { container: 'webm', encoderCodec: 'vp09.00.10.08', muxVideoCodec: 'V_VP9', mimeType: 'video/webm' },
    },
    {
      format: { container: 'webm', encoderCodec: 'vp8', muxVideoCodec: 'V_VP8', mimeType: 'video/webm' },
    },
  ]

  const ordered = preferred
    ? [
        ...candidates.filter((item) => item.ids?.includes(preferred)),
        ...candidates.filter((item) => !item.ids?.includes(preferred)),
      ]
    : candidates

  for (const { format } of ordered) {
    const supported = await isVideoEncoderConfigSupported({
      codec: format.encoderCodec,
      width,
      height,
      bitrate: VIDEO_BITRATE,
      framerate: fps,
    })
    if (supported) {
      if (preferred === 'mov') return { ...format, mimeType: 'video/quicktime' }
      if (preferred === 'ogv') return { ...format, mimeType: 'video/ogg' }
      return format
    }
  }
  return null
}

function createFrameMuxer(format: FrameEncoderFormat, width: number, height: number, fps: number): FrameMuxerSink {
  if (format.container === 'mp4') {
    const target = new Mp4ArrayBufferTarget()
    const muxer = new Mp4Muxer({
      target,
      video: { codec: 'avc', width, height },
      audio: { codec: 'aac', numberOfChannels: 2, sampleRate: 48_000 },
      fastStart: 'in-memory',
      // Encoded chunks from WebCodecs often use document-relative timestamps, not 0-based media time.
      firstTimestampBehavior: 'cross-track-offset',
    })
    return {
      addVideoChunk: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
      addAudioChunk: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
      finalize: () => muxer.finalize(),
      getBuffer: () => target.buffer,
      audioCodec: 'aac',
    }
  }

  const target = new WebmArrayBufferTarget()
  const muxer = new WebmMuxer({
    target,
    video: { codec: format.muxVideoCodec, width, height, frameRate: fps },
    audio: { codec: 'A_OPUS', numberOfChannels: 2, sampleRate: 48_000 },
    firstTimestampBehavior: 'offset',
  })
  return {
    addVideoChunk: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    addAudioChunk: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
    finalize: () => muxer.finalize(),
    getBuffer: () => target.buffer,
    audioCodec: 'opus',
  }
}

async function encodeAudioTrackFromSource(
  sourceUrl: string,
  sink: FrameMuxerSink,
  abortSignal?: AbortSignal,
): Promise<void> {
  const host = getWebCodecsHost()
  if (typeof host.AudioEncoder !== 'function' || typeof host.MediaStreamTrackProcessor !== 'function') return

  const audioVideo = document.createElement('video') as CaptureVideoElement
  audioVideo.preload = 'auto'
  audioVideo.src = sourceUrl
  audioVideo.playsInline = true
  audioVideo.muted = false
  audioVideo.volume = 0
  audioVideo.crossOrigin = 'anonymous'
  audioVideo.style.position = 'fixed'
  audioVideo.style.left = '-99999px'
  audioVideo.style.top = '0'
  audioVideo.style.width = '1px'
  audioVideo.style.height = '1px'
  document.body.appendChild(audioVideo)

  try {
    await waitForVideoEvent(audioVideo, 'loadeddata')
    const stream = getCaptureStream(audioVideo)
    const audioTrack = stream?.getAudioTracks()[0]
    if (!audioTrack) return

    const encoderConfig = sink.audioCodec === 'aac'
      ? { codec: 'mp4a.40.2', sampleRate: 48_000, numberOfChannels: 2, bitrate: AUDIO_BITRATE }
      : { codec: 'opus', sampleRate: 48_000, numberOfChannels: 2, bitrate: AUDIO_BITRATE }

    const support = await host.AudioEncoder!.isConfigSupported(encoderConfig)
    if (!support.supported) return

    let encoderError: DOMException | null = null
    const audioEncoder = new host.AudioEncoder!({
      output: (chunk, meta) => sink.addAudioChunk(chunk, meta),
      error: (error) => { encoderError = error },
    })
    audioEncoder.configure(encoderConfig)

    const processor = new host.MediaStreamTrackProcessor!({ track: audioTrack })
    const reader = processor.readable.getReader()
    await waitForSeek(audioVideo, 0)
    const playPromise = audioVideo.play().catch(() => undefined)

    const playbackDeadlineMs = performance.now() + Math.max(5_000, audioVideo.duration * 1000 + 3_000)

    try {
      while (!audioVideo.ended && performance.now() < playbackDeadlineMs) {
        if (abortSignal?.aborted) throw new DOMException('Aborted', 'AbortError')
        if (encoderError) throw encoderError
        const { done, value } = await reader.read()
        if (done) break
        if (value) {
          audioEncoder.encode(value as AudioData)
          ;(value as AudioData).close()
        }
      }
      let drainingAudio = true
      while (drainingAudio) {
        if (abortSignal?.aborted) throw new DOMException('Aborted', 'AbortError')
        if (encoderError) throw encoderError
        const { done, value } = await reader.read()
        if (done) {
          drainingAudio = false
          break
        }
        if (value) {
          audioEncoder.encode(value as AudioData)
          ;(value as AudioData).close()
        }
      }
      await audioEncoder.flush()
    } finally {
      audioEncoder.close()
      reader.releaseLock()
      audioTrack.stop()
      audioVideo.pause()
    }

    await playPromise
    if (!audioVideo.ended && Number.isFinite(audioVideo.duration)) {
      await waitForVideoEndedOrAbort(audioVideo, abortSignal).catch(() => undefined)
    }
  } finally {
    if (audioVideo.parentNode) audioVideo.parentNode.removeChild(audioVideo)
  }
}

interface RenderFrameContext {
  video: HTMLVideoElement
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  fps: number
  duration: number
  totalFrames: number
  frameDurationUs: number
  sampleTimesLength: number
  totalWork: number
  renderProcessedFrame: (mediaTime: number, sourceFrame?: CanvasImageSource) => Promise<void>
  options: VideoProcessingOptions
}

async function encodeVideoTrackFrameByFrame(
  format: FrameEncoderFormat,
  renderCtx: RenderFrameContext,
  sourceUrl: string,
): Promise<Blob> {
  const host = getWebCodecsHost()
  if (typeof host.VideoEncoder !== 'function' || typeof host.VideoFrame !== 'function') {
    throw new Error('WebCodecs VideoEncoder is unavailable in this browser.')
  }

  const { canvas, fps, duration, totalFrames, frameDurationUs, sampleTimesLength, totalWork, renderProcessedFrame, options } = renderCtx
  const w = canvas.width
  const h = canvas.height
  const sink = createFrameMuxer(format, w, h, fps)
  const keyFrameInterval = Math.max(1, Math.round(fps * 2))

  let encoderError: DOMException | null = null
  const videoEncoder = new host.VideoEncoder!({
    output: (chunk, meta) => sink.addVideoChunk(chunk, meta),
    error: (error) => { encoderError = error },
  })
  videoEncoder.configure({
    codec: format.encoderCodec,
    width: w,
    height: h,
    bitrate: VIDEO_BITRATE,
    framerate: fps,
  })

  const audioPromise = encodeAudioTrackFromSource(sourceUrl, sink, options.abortSignal)

  let prevTimestampUs = -1
  try {
    await forEachPresentedVideoFrame(
      renderCtx.video,
      duration,
      fps,
      totalFrames,
      async ({ frameIndex, mediaTime }) => {
        if (encoderError) throw encoderError

        await renderProcessedFrame(mediaTime, renderCtx.video)

        const currentFrame = frameIndex + 1
        options.onRenderFrame?.({ frameIndex: currentFrame, totalFrames, canvas, mediaTime })

        const timestampUs = Math.round(mediaTime * 1_000_000)
        const durationUs = prevTimestampUs < 0
          ? frameDurationUs
          : Math.max(1, timestampUs - prevTimestampUs)
        prevTimestampUs = timestampUs

        const videoFrame = new host.VideoFrame!(canvas, { timestamp: timestampUs, duration: durationUs })
        videoEncoder.encode(videoFrame, { keyFrame: frameIndex % keyFrameInterval === 0 })
        videoFrame.close()

        options.onProgress?.(sampleTimesLength + currentFrame, totalWork)
        if (frameIndex % 24 === 0) await sleepMs(0)
      },
      options.abortSignal,
    )

    if (encoderError) throw encoderError
    options.onPhase?.('finishing')
    options.onProgress?.(totalWork - 1, totalWork)
    await videoEncoder.flush()
  } finally {
    videoEncoder.close()
    await audioPromise.catch(() => undefined)
  }

  sink.finalize()
  const blob = new Blob([sink.getBuffer()], { type: format.mimeType })
  return normalizeRecordedVideoBlob(blob, format.mimeType)
}

async function encodeViaRecorderReplay(
  recorderFormat: VideoExportOption,
  renderCtx: RenderFrameContext,
  sourceUrl: string,
): Promise<Blob> {
  const {
    video, canvas, ctx, fps, duration, totalFrames, sampleTimesLength, totalWork,
    renderProcessedFrame, options,
  } = renderCtx

  if (!recorderFormat.mimeType) throw new Error('No supported browser video encoder found for the selected format.')

  const w = canvas.width
  const h = canvas.height
  const estimatedFrameBytes = Math.max(32_000, Math.round(w * h * 0.12))
  if (totalFrames * estimatedFrameBytes > FALLBACK_FRAME_CACHE_BUDGET_BYTES) {
    throw new Error(
      'Video is too long for fallback encoding in this browser. Use Chrome/Edge for frame-accurate export, or shorten the clip.',
    )
  }

  options.onPhase?.('preparing')
  const frameBlobs: Blob[] = []
  await forEachPresentedVideoFrame(
    video,
    duration,
    fps,
    totalFrames,
    async ({ mediaTime }) => {
      await renderProcessedFrame(mediaTime, video)
      frameBlobs.push(await canvasToBlob(canvas, 'image/jpeg', 0.92))
      options.onProgress?.(
        sampleTimesLength + Math.floor((frameBlobs.length) * 0.45),
        totalWork,
      )
      if (frameBlobs.length % 12 === 0) await sleepMs(0)
    },
    options.abortSignal,
  )

  options.onPhase?.('rendering')

  const audioVideo = document.createElement('video') as CaptureVideoElement
  audioVideo.preload = 'auto'
  audioVideo.src = sourceUrl
  audioVideo.playsInline = true
  audioVideo.muted = false
  audioVideo.volume = 0
  audioVideo.crossOrigin = 'anonymous'
  audioVideo.style.position = 'fixed'
  audioVideo.style.left = '-99999px'
  audioVideo.style.top = '0'
  audioVideo.style.width = '1px'
  audioVideo.style.height = '1px'
  document.body.appendChild(audioVideo)
  await waitForVideoEvent(audioVideo, 'loadeddata')

  const capture = createCanvasStream(canvas, fps)
  const composedStream = new MediaStream()
  composedStream.addTrack(capture.videoTrack)
  getCaptureStream(audioVideo)?.getAudioTracks().forEach((track) => composedStream.addTrack(track))

  const recorder = new MediaRecorder(composedStream, {
    mimeType: recorderFormat.mimeType,
    videoBitsPerSecond: VIDEO_BITRATE,
    audioBitsPerSecond: AUDIO_BITRATE,
  })

  const chunks: Blob[] = []
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data)
  }
  const recorderStopped = new Promise<void>((resolve) => { recorder.onstop = () => resolve() })

  const recorderTimesliceMs = Math.max(1, Math.round(1000 / fps))
  recorder.start(recorderTimesliceMs)
  const replayStart = performance.now()
  const audioPlayPromise = audioVideo.play().catch(() => undefined)

  try {
    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      if (options.abortSignal?.aborted) throw new DOMException('Aborted', 'AbortError')
      const bitmap = await createImageBitmap(frameBlobs[frameIndex])
      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(bitmap, 0, 0, w, h)
      bitmap.close()
      capture.requestFrame?.()
      await sleepUntil(replayStart + (frameIndex + 1) * (1000 / fps))
      options.onProgress?.(
        sampleTimesLength + Math.floor(totalFrames * 0.45) + frameIndex + 1,
        totalWork,
      )
    }
  } finally {
    capture.stream.getTracks().forEach((track) => track.stop())
  }

  await audioPlayPromise
  if (!audioVideo.ended && Number.isFinite(audioVideo.duration)) {
    await waitForVideoEndedOrAbort(audioVideo, options.abortSignal).catch(() => undefined)
  }
  if (recorder.state !== 'inactive') recorder.stop()
  await recorderStopped

  if (audioVideo.parentNode) audioVideo.parentNode.removeChild(audioVideo)
  options.onPhase?.('finishing')
  options.onProgress?.(totalWork - 1, totalWork)
  options.onProgress?.(totalWork, totalWork)
  return normalizeRecordedVideoBlob(new Blob(chunks, { type: recorderFormat.mimeType }), recorderFormat.mimeType)
}

function resolveRecorderFormat(preferred?: VideoExportFormatId): VideoExportOption | null {
  const ordered = preferred
    ? [
        ...VIDEO_EXPORT_CONFIGS.filter((cfg) => cfg.id === preferred),
        ...VIDEO_EXPORT_CONFIGS.filter((cfg) => cfg.id !== preferred),
      ]
    : VIDEO_EXPORT_CONFIGS

  for (const config of ordered) {
    const mimeType = config.mimeCandidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? null
    if (mimeType) return { id: config.id, label: config.label, ext: config.ext, mimeType, supported: true }
  }
  return null
}

function videoZoneStrength(zone: Zone, strength: number): number {
  const base = Math.max(strength, VIDEO_MIN_EFFECT_STRENGTH)
  const size = Math.sqrt(Math.max(0, zone.width * zone.height))
  const foregroundBoost = clamp((size - 0.08) / 0.22, 0, 1)

  if (zone.effect === 'blur' || zone.effect === 'zoom-blur') return base * (1.35 + foregroundBoost * 1.7)
  if (zone.effect === 'pixelate' || zone.effect === 'noise' || zone.effect === 'static') return base * (1.15 + foregroundBoost * 0.75)
  return Math.min(1, base)
}

function pickCustomImageAssetId(assets: CustomImageAsset[] | undefined, seed: string | number): string | undefined {
  const ready = assets?.filter((asset) => asset.imageBitmap) ?? []
  if (ready.length === 0) return undefined
  let hash = 2166136261
  const str = String(seed)
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return ready[(hash >>> 0) % ready.length]?.id
}

function applyVideoEffectSettings(zone: Zone, options: VideoProcessingOptions, timedZoneIds: Set<string>): Zone {
  const isTimedMask = [...timedZoneIds].some((prefix) => zone.id.startsWith(`${prefix}-`))
  if (isTimedMask) return zone
  const effect = options.effect
  return {
    ...zone,
    effect,
    emoji: options.fixedEmoji ?? zone.emoji,
    customImageAssetId: effect === 'custom-image'
      ? (options.fixedCustomImageId ?? zone.customImageAssetId ?? pickCustomImageAssetId(options.customImages, zone.id))
      : zone.customImageAssetId,
  }
}

function drawZones(
  ctx: CanvasRenderingContext2D,
  zones: Zone[],
  w: number,
  h: number,
  strength: number,
  effectOptions?: EffectRenderOptions,
): void {
  for (const zone of zones) {
    applyEffectRect(
      ctx,
      zone.effect,
      zone.x * w,
      zone.y * h,
      zone.width * w,
      zone.height * h,
      videoZoneStrength(zone, strength),
      zone.emoji,
      {
        ...effectOptions,
        zoneId: zone.id,
        customImageAssetId: zone.customImageAssetId,
        seed: zone.id,
      },
    )
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function zoneCenter(zone: Zone): { x: number; y: number } {
  return { x: zone.x + zone.width / 2, y: zone.y + zone.height / 2 }
}

function zoneIou(a: Zone, b: Zone): number {
  const ax2 = a.x + a.width
  const ay2 = a.y + a.height
  const bx2 = b.x + b.width
  const by2 = b.y + b.height
  const ix = Math.max(0, Math.min(ax2, bx2) - Math.max(a.x, b.x))
  const iy = Math.max(0, Math.min(ay2, by2) - Math.max(a.y, b.y))
  const intersection = ix * iy
  if (intersection <= 0) return 0
  const union = a.width * a.height + b.width * b.height - intersection
  return union > 0 ? intersection / union : 0
}

function faceToZone(
  face: { x: number; y: number; width: number; height: number },
  w: number,
  h: number,
  effect: AnonymizeEffectId,
  emoji: string,
): Zone {
  const padX = face.width * VIDEO_ZONE_PADDING
  const padY = face.height * VIDEO_ZONE_PADDING
  const x = face.x - padX
  const y = face.y - padY
  const width = face.width + padX * 2
  const height = face.height + padY * 2
  return {
    id: '',
    x: clamp(x / w, 0, 1),
    y: clamp(y / h, 0, 1),
    width: clamp(width / w, 0.001, 1),
    height: clamp(height / h, 0.001, 1),
    effect,
    emoji,
  }
}

function isLikelyVideoFace(face: { width: number; height: number; score?: number }, w: number, h: number): boolean {
  const score = face.score ?? 1
  const aspect = face.width / Math.max(1, face.height)
  const relativeArea = (face.width * face.height) / Math.max(1, w * h)
  return (
    score >= VIDEO_MIN_FACE_SCORE &&
    aspect >= 0.55 &&
    aspect <= 1.55 &&
    relativeArea >= 0.00008 &&
    relativeArea <= VIDEO_MAX_FACE_REL_AREA
  )
}

function filterVideoDetections(
  detections: Zone[],
  tracks: VideoTrackState[],
): Zone[] {
  const confirmedAreas = tracks
    .filter((track) => track.confirmed && track.missed === 0)
    .map((track) => track.zone.width * track.zone.height)
    .sort((a, b) => a - b)
  const medianArea = confirmedAreas.length > 0
    ? confirmedAreas[Math.floor(confirmedAreas.length / 2)]
    : null

  return detections.filter((det) => {
    const area = det.width * det.height
    if (medianArea != null && area > medianArea * 2.8) return false
    return true
  })
}

function stabilizeTracks(
  tracks: VideoTrackState[],
  detections: Zone[],
  mediaTime: number,
  nextTrackId: () => string,
  nextTrackEmoji: () => string,
): VideoTrackState[] {
  const unmatchedTracks = new Set(tracks.map((_, index) => index))
  const nextTracks = [...tracks]

  detections.forEach((det) => {
    let bestTrackIndex = -1
    let bestScore = 0
    const dc = zoneCenter(det)

    unmatchedTracks.forEach((trackIndex) => {
      const track = nextTracks[trackIndex]
      const tc = zoneCenter(track.zone)
      const dist = Math.hypot(dc.x - tc.x, dc.y - tc.y)
      const score = zoneIou(track.zone, det) * 1.5 + Math.max(0, 0.35 - dist)
      if (score > bestScore) {
        bestScore = score
        bestTrackIndex = trackIndex
      }
    })

    if (bestTrackIndex >= 0 && bestScore > 0.18) {
      const track = nextTracks[bestTrackIndex]
      const prevCenter = zoneCenter(track.zone)
      const dt = Math.max(1 / FALLBACK_FPS, mediaTime - track.lastSeenTime)
      const hitStreak = track.hitStreak + 1
      const confirmed = track.confirmed || hitStreak >= VIDEO_TRACK_CONFIRM_HITS
      const smoothed: Zone = {
        ...track.zone,
        x: track.zone.x + (det.x - track.zone.x) * TRACK_SMOOTHING,
        y: track.zone.y + (det.y - track.zone.y) * TRACK_SMOOTHING,
        width: track.zone.width + (det.width - track.zone.width) * TRACK_SMOOTHING,
        height: track.zone.height + (det.height - track.zone.height) * TRACK_SMOOTHING,
        effect: det.effect,
      }
      const nextCenter = zoneCenter(smoothed)
      nextTracks[bestTrackIndex] = {
        ...track,
        zone: smoothed,
        vx: (nextCenter.x - prevCenter.x) / dt,
        vy: (nextCenter.y - prevCenter.y) / dt,
        lastSeenTime: mediaTime,
        lastPredictTime: mediaTime,
        missed: 0,
        hitStreak,
        confirmed,
      }
      unmatchedTracks.delete(bestTrackIndex)
    } else {
      const id = nextTrackId()
      nextTracks.push({
        id,
        zone: { ...det, id, emoji: nextTrackEmoji() },
        vx: 0,
        vy: 0,
        lastSeenTime: mediaTime,
        lastPredictTime: mediaTime,
        missed: 0,
        hitStreak: 1,
        confirmed: false,
      })
    }
  })

  unmatchedTracks.forEach((trackIndex) => {
    nextTracks[trackIndex] = { ...nextTracks[trackIndex], missed: nextTracks[trackIndex].missed + 1 }
  })

  return nextTracks.filter((track) => {
    if (mediaTime - track.lastSeenTime > TRACK_KEEPALIVE_SEC) return false
    if (track.missed >= 4) return false
    if (!track.confirmed && track.missed > 0) return false
    return true
  })
}

function predictTrackZones(tracks: VideoTrackState[], mediaTime: number): Zone[] {
  tracks.forEach((track) => {
    const dt = clamp(mediaTime - track.lastPredictTime, 0, 0.25)
    if (dt > 0) {
      track.zone.x = clamp(track.zone.x + track.vx * dt, 0, 1 - track.zone.width)
      track.zone.y = clamp(track.zone.y + track.vy * dt, 0, 1 - track.zone.height)
      track.lastPredictTime = mediaTime
    }
  })
  return tracks.map((track) => track.zone)
}

function cloneZone(zone: Zone): Zone {
  return { ...zone }
}

function pushVideoKeyframe(timeline: VideoTrackKeyframe[], timeSec: number, zones: Zone[]): void {
  const safeTime = Math.max(0, timeSec)
  const clonedZones = zones.map(cloneZone)
  const last = timeline[timeline.length - 1]
  if (!last || safeTime > last.timeSec + 0.001) {
    timeline.push({ timeSec: safeTime, zones: clonedZones })
    return
  }
  if (last && Math.abs(last.timeSec - safeTime) <= 0.001) {
    last.zones = clonedZones
  }
}

const DETECTION_SAMPLE_FPS = 8

function buildFrameSampleTimes(duration: number, _fps: number): number[] {
  const sampleStep = 1 / DETECTION_SAMPLE_FPS
  const lastSampleTime = Math.max(0, duration - sampleStep)
  const sampleTimes: number[] = []

  for (let timeSec = 0; timeSec <= lastSampleTime + 0.0001; timeSec += sampleStep) {
    const clamped = Math.min(lastSampleTime, timeSec)
    const previous = sampleTimes[sampleTimes.length - 1]
    if (previous == null || clamped > previous + 0.0005) sampleTimes.push(clamped)
  }

  if (sampleTimes.length === 0) sampleTimes.push(0)
  return sampleTimes
}

async function normalizeRecordedVideoBlob(blob: Blob, mimeType: string): Promise<Blob> {
  const type = blob.type || mimeType
  if (!type.toLowerCase().includes('webm')) return blob

  try {
    const fixed = await fixWebmDuration(new Blob([blob], { type }))
    return fixed.type ? fixed : new Blob([fixed], { type })
  } catch (err) {
    console.warn('WebM duration repair failed; returning original recorder blob.', err)
    return blob
  }
}

function interpolateZone(a: Zone, b: Zone, t: number): Zone {
  return {
    ...a,
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    width: a.width + (b.width - a.width) * t,
    height: a.height + (b.height - a.height) * t,
    effect: b.effect,
  }
}

function zonesAtTime(timeline: VideoTrackKeyframe[], mediaTime: number): Zone[] {
  if (timeline.length === 0) return []
  if (mediaTime <= timeline[0].timeSec) return timeline[0].zones.map(cloneZone)

  let prev = timeline[0]
  let next: VideoTrackKeyframe | null = null
  for (let i = 1; i < timeline.length; i++) {
    if (timeline[i].timeSec >= mediaTime) {
      next = timeline[i]
      break
    }
    prev = timeline[i]
  }
  if (!next) return prev.zones.map(cloneZone)

  const span = Math.max(0.001, next.timeSec - prev.timeSec)
  const t = clamp((mediaTime - prev.timeSec) / span, 0, 1)
  const nextById = new Map(next.zones.map((zone) => [zone.id, zone]))

  const zones = prev.zones.map((zone) => {
    const matchingNext = nextById.get(zone.id)
    return matchingNext ? interpolateZone(zone, matchingNext, t) : cloneZone(zone)
  })

  next.zones.forEach((zone) => {
    if (!prev.zones.some((prevZone) => prevZone.id === zone.id) && t > 0.66) zones.push(cloneZone(zone))
  })
  return zones
}

function zonesBetweenKeyframes(prev: VideoTrackKeyframe, next: VideoTrackKeyframe, mediaTime: number): Zone[] {
  if (mediaTime <= prev.timeSec) return prev.zones.map(cloneZone)
  if (mediaTime >= next.timeSec) return next.zones.map(cloneZone)

  const span = Math.max(0.001, next.timeSec - prev.timeSec)
  const t = clamp((mediaTime - prev.timeSec) / span, 0, 1)
  const nextById = new Map(next.zones.map((zone) => [zone.id, zone]))

  const zones = prev.zones.map((zone) => {
    const matchingNext = nextById.get(zone.id)
    return matchingNext ? interpolateZone(zone, matchingNext, t) : cloneZone(zone)
  })

  next.zones.forEach((zone) => {
    if (!prev.zones.some((prevZone) => prevZone.id === zone.id) && t > 0.66) zones.push(cloneZone(zone))
  })
  return zones
}

function getFrameZonesAtTime(
  timeline: VideoTrackKeyframe[],
  timedZones: VideoTimedZone[],
  mediaTime: number,
): Zone[] {
  let zones: Zone[] = []
  if (timeline.length > 0) {
    if (timeline.length <= 1 || mediaTime <= timeline[0].timeSec || mediaTime >= timeline[timeline.length - 1].timeSec) {
      zones = zonesAtTime(timeline, mediaTime)
    } else {
      let keyframeIndex = 0
      while (keyframeIndex < timeline.length - 2 && timeline[keyframeIndex + 1].timeSec < mediaTime) {
        keyframeIndex += 1
      }
      zones = zonesBetweenKeyframes(timeline[keyframeIndex], timeline[keyframeIndex + 1], mediaTime)
    }
  }
  for (const timedZone of timedZones) {
    if (mediaTime >= timedZone.startSec && mediaTime <= timedZone.endSec) {
      zones.push({ ...timedZone.zone, id: `${timedZone.id}-t${Math.round(mediaTime * 1000)}` })
    }
  }
  return zones
}

function waitForSeek(video: HTMLVideoElement, timeSec: number): Promise<void> {
  const targetTime = Math.min(Math.max(0, timeSec), Number.isFinite(video.duration) ? video.duration : timeSec)
  if (Math.abs(video.currentTime - targetTime) < 0.001) return Promise.resolve()
  return new Promise<void>((resolve, reject) => {
    const onSeeked = () => {
      cleanup()
      resolve()
    }
    const onError = () => {
      cleanup()
      reject(new Error('Video seek failed'))
    }
    const cleanup = () => {
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
    }
    video.addEventListener('seeked', onSeeked, { once: true })
    video.addEventListener('error', onError, { once: true })
    video.currentTime = targetTime
  })
}

interface PresentedVideoFrame {
  frameIndex: number
  mediaTime: number
}

/**
 * Decode frames by playing the video and reading each presented frame.
 * Seeking lands on keyframes (~every 15–30 frames) and duplicates frames — never use seek per output frame.
 */
async function forEachPresentedVideoFrame(
  video: HTMLVideoElement,
  duration: number,
  fps: number,
  maxFrames: number,
  handler: (frame: PresentedVideoFrame) => Promise<void>,
  abortSignal?: AbortSignal,
): Promise<number> {
  if (typeof video.requestVideoFrameCallback !== 'function') {
    for (let frameIndex = 0; frameIndex < maxFrames; frameIndex++) {
      if (abortSignal?.aborted) throw new DOMException('Aborted', 'AbortError')
      const mediaTime = Math.min(duration, frameIndex / fps)
      await waitForSeek(video, mediaTime)
      await handler({ frameIndex, mediaTime })
    }
    return maxFrames
  }

  await waitForSeek(video, 0)
  video.playbackRate = 1
  const playPromise = video.play().catch(() => undefined)

  let frameIndex = 0
  let lastMediaTime = -Infinity
  let callbackId = 0

  const capturedCount = await new Promise<number>((resolve, reject) => {
    let settled = false
    const finish = (count: number) => {
      if (settled) return
      settled = true
      cleanup()
      resolve(count)
    }
    const fail = (err: unknown) => {
      if (settled) return
      settled = true
      cleanup()
      reject(err)
    }

    const cleanup = () => {
      video.removeEventListener('ended', onEnded)
      window.clearTimeout(timeoutId)
      video.pause()
      if (callbackId && typeof video.cancelVideoFrameCallback === 'function') {
        video.cancelVideoFrameCallback(callbackId)
      }
    }

    const onEnded = () => finish(frameIndex)

    const timeoutMs = Math.max(120_000, Math.ceil(duration * 1000) * 40)
    const timeoutId = window.setTimeout(() => finish(frameIndex), timeoutMs)
    video.addEventListener('ended', onEnded, { once: true })

    const schedule = () => {
      if (abortSignal?.aborted) {
        fail(new DOMException('Aborted', 'AbortError'))
        return
      }
      if (video.ended) {
        finish(frameIndex)
        return
      }
      callbackId = video.requestVideoFrameCallback(onVideoFrame)
    }

    const onVideoFrame = (_now: DOMHighResTimeStamp, metadata: VideoFrameCallbackMetadata) => {
      // Pause so async rendering cannot fall behind real-time playback and miss the tail frames.
      video.pause()
      void (async () => {
        try {
          if (abortSignal?.aborted) throw new DOMException('Aborted', 'AbortError')

          const mediaTime = metadata.mediaTime
          const nearEnd = mediaTime >= duration - 0.001 || video.ended

          if (mediaTime <= lastMediaTime + 0.00001) {
            if (!nearEnd && frameIndex < maxFrames) {
              await video.play().catch(() => undefined)
              schedule()
            } else {
              finish(frameIndex)
            }
            return
          }
          lastMediaTime = mediaTime

          await handler({ frameIndex, mediaTime })
          frameIndex++

          if (nearEnd || frameIndex >= maxFrames) {
            finish(frameIndex)
            return
          }

          await video.play().catch(() => undefined)
          schedule()
        } catch (err) {
          fail(err)
        }
      })()
    }

    schedule()
  })

  await playPromise
  return capturedCount
}

function waitForVideoEvent(video: HTMLVideoElement, eventName: 'loadeddata' | 'loadedmetadata' | 'ended'): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const onResolve = () => {
      cleanup()
      resolve()
    }
    const onReject = () => {
      cleanup()
      reject(new Error(`Video event failed: ${eventName}`))
    }
    const cleanup = () => {
      video.removeEventListener(eventName, onResolve)
      video.removeEventListener('error', onReject)
    }
    video.addEventListener(eventName, onResolve, { once: true })
    video.addEventListener('error', onReject, { once: true })
  })
}

function waitForVideoEndedOrAbort(video: HTMLVideoElement, abortSignal?: AbortSignal): Promise<void> {
  if (abortSignal?.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'))
  return new Promise<void>((resolve, reject) => {
    const onEnded = () => {
      cleanup()
      resolve()
    }
    const onAbort = () => {
      cleanup()
      reject(new DOMException('Aborted', 'AbortError'))
    }
    const onError = () => {
      cleanup()
      reject(new Error('Video event failed: ended'))
    }
    const cleanup = () => {
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('error', onError)
      abortSignal?.removeEventListener('abort', onAbort)
    }
    video.addEventListener('ended', onEnded, { once: true })
    video.addEventListener('error', onError, { once: true })
    abortSignal?.addEventListener('abort', onAbort, { once: true })
  })
}

function normalizeEstimatedFps(fps: number): number {
  if (!Number.isFinite(fps) || fps <= 0) return FALLBACK_FPS
  const commonRates = [23.976, 24, 25, 29.97, 30, 50, 59.94, 60]
  const closest = commonRates.reduce((best, candidate) => (
    Math.abs(candidate - fps) < Math.abs(best - fps) ? candidate : best
  ), commonRates[0])
  if (Math.abs(closest - fps) <= 1.25) return closest
  return clamp(Math.round(fps), 10, 60)
}

async function estimateVideoFps(video: HTMLVideoElement, abortSignal?: AbortSignal): Promise<number> {
  if (typeof video.requestVideoFrameCallback !== 'function' || !Number.isFinite(video.duration) || video.duration < 0.4) {
    return FALLBACK_FPS
  }

  const originalMuted = video.muted
  const originalVolume = video.volume
  let callbackHandle: number | null = null

  try {
    await waitForSeek(video, 0)
    video.muted = true
    video.volume = 0

    return await new Promise<number>((resolve, reject) => {
      if (abortSignal?.aborted) {
        reject(new DOMException('Aborted', 'AbortError'))
        return
      }

      let settled = false
      let startMediaTime: number | null = null
      let startPresentedFrames: number | null = null
      let bestEstimate = FALLBACK_FPS

      const cleanup = () => {
        if (callbackHandle != null && typeof video.cancelVideoFrameCallback === 'function') {
          video.cancelVideoFrameCallback(callbackHandle)
        }
        callbackHandle = null
        window.clearTimeout(timeoutId)
        abortSignal?.removeEventListener('abort', onAbort)
      }
      const finish = (fps: number) => {
        if (settled) return
        settled = true
        cleanup()
        resolve(normalizeEstimatedFps(fps))
      }
      const fail = (err: unknown) => {
        if (settled) return
        settled = true
        cleanup()
        reject(err)
      }
      const onAbort = () => fail(new DOMException('Aborted', 'AbortError'))
      const sampleLimitSec = Math.min(1.2, Math.max(0.25, video.duration - 0.05))
      const timeoutId = window.setTimeout(() => finish(bestEstimate), 1800)

      abortSignal?.addEventListener('abort', onAbort, { once: true })

      const onVideoFrame: VideoFrameRequestCallback = (_, metadata) => {
        callbackHandle = null
        if (abortSignal?.aborted) {
          onAbort()
          return
        }

        if (startMediaTime == null || startPresentedFrames == null) {
          startMediaTime = metadata.mediaTime
          startPresentedFrames = metadata.presentedFrames
        } else {
          const elapsed = metadata.mediaTime - startMediaTime
          const frames = metadata.presentedFrames - startPresentedFrames
          if (elapsed > 0 && frames > 0) bestEstimate = frames / elapsed
          if (elapsed >= 0.55 && frames >= 8) {
            finish(bestEstimate)
            return
          }
        }

        if (metadata.mediaTime >= sampleLimitSec) {
          finish(bestEstimate)
          return
        }

        callbackHandle = video.requestVideoFrameCallback(onVideoFrame)
      }

      callbackHandle = video.requestVideoFrameCallback(onVideoFrame)
      video.play().catch((err) => finish(err instanceof DOMException ? FALLBACK_FPS : bestEstimate))
    })
  } finally {
    video.pause()
    video.muted = originalMuted
    video.volume = originalVolume
    await waitForSeek(video, 0).catch(() => undefined)
  }
}

/**
 * Extract a poster frame (first visible frame) from a video blob.
 */
export async function extractPosterFrame(videoBlob: Blob): Promise<{ blob: Blob; width: number; height: number }> {
  const url = URL.createObjectURL(videoBlob)
  try {
    const video = document.createElement('video')
    video.muted = true
    video.preload = 'auto'
    video.src = url

    await waitForVideoEvent(video, 'loadeddata')

    video.currentTime = Math.min(0.1, video.duration / 2)
    await new Promise<void>((resolve) => { video.onseeked = () => resolve() })

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0)

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Poster capture failed')), 'image/jpeg', 0.9)
    })

    return { blob, width: video.videoWidth, height: video.videoHeight }
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 * Get video metadata without fully decoding it.
 */
export async function getVideoMetadata(videoBlob: Blob): Promise<VideoMetadata> {
  const url = URL.createObjectURL(videoBlob)
  try {
    const video = document.createElement('video')
    video.muted = true
    video.preload = 'metadata'
    video.src = url

    await waitForVideoEvent(video, 'loadedmetadata')

    let fps = FALLBACK_FPS
    try {
      fps = await estimateVideoFps(video)
    } catch {
      fps = FALLBACK_FPS
    }

    return {
      width: video.videoWidth,
      height: video.videoHeight,
      duration: video.duration,
      fps,
    }
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 * Process video as a continuous stream so the output timing stays 1:1 with the source.
 * Audio is preserved by muxing the original audio track with the processed canvas video track.
 * All detection and rendering stay in the browser (local YuNet WASM).
 */
export async function processVideo(
  videoBlob: Blob,
  options: VideoProcessingOptions,
): Promise<Blob> {
  const recorderFormat = resolveRecorderFormat(options.outputFormat)
  let frameEncoderFormat: FrameEncoderFormat | null = null

  const url = URL.createObjectURL(videoBlob)
  let hiddenVideo: CaptureVideoElement | null = null
  let aborted = false
  let overrideBitmaps: Array<VideoFrameOverride & { bitmap: ImageBitmap }> = []

  try {
    const video = document.createElement('video') as CaptureVideoElement
    hiddenVideo = video
    video.preload = 'auto'
    video.src = url
    video.playsInline = true
    video.muted = true
    video.volume = 0
    video.crossOrigin = 'anonymous'
    video.style.position = 'fixed'
    video.style.left = '-99999px'
    video.style.top = '0'
    video.style.width = '1px'
    video.style.height = '1px'
    document.body.appendChild(video)

    await waitForVideoEvent(video, 'loadeddata')

    const w = video.videoWidth
    const h = video.videoHeight
    const duration = video.duration
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error('Could not read video duration.')
    }
    if (duration > VIDEO_RUNTIME_LIMITS.maxDurationSec) {
      throw new Error(`Video is too long (${Math.ceil(duration)}s). Maximum is ${VIDEO_RUNTIME_LIMITS.maxDurationSec / 60} minutes.`)
    }
    const fps = await estimateVideoFps(video, options.abortSignal)
    frameEncoderFormat = await pickFrameEncoderFormat(options.outputFormat, w, h, fps)
    if (!frameEncoderFormat && !recorderFormat?.mimeType) {
      throw new Error('No supported browser video encoder found for the selected format.')
    }
    const totalFrames = Math.max(1, Math.ceil(duration * fps))
    const overrideWindowSec = Math.max(1 / fps, 0.04)

    overrideBitmaps = await Promise.all((options.frameOverrides ?? []).map(async (override) => ({
      ...override,
      bitmap: await createImageBitmap(override.frameBlob),
    })))

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!

    const detectScale = Math.min(1, DETECT_MAX_DIM / Math.max(w, h))
    const detectW = Math.max(1, Math.round(w * detectScale))
    const detectH = Math.max(1, Math.round(h * detectScale))
    const detectCanvas = document.createElement('canvas')
    detectCanvas.width = detectW
    detectCanvas.height = detectH
    const detectCtx = detectCanvas.getContext('2d')!

    let tracks: VideoTrackState[] = []
    let trackSeq = 0
    const usedTrackEmojis = new Set<string>()
    const nextTrackId = () => `vt-${++trackSeq}`
    const nextTrackEmoji = () => {
      if (options.fixedEmoji) return options.fixedEmoji
      for (let i = 0; i < 24; i++) {
        const emoji = pickRandomEmoji()
        if (!usedTrackEmojis.has(emoji)) {
          usedTrackEmojis.add(emoji)
          return emoji
        }
      }
      return pickRandomEmoji()
    }

    const sampleTimes = buildFrameSampleTimes(duration, fps)
    const timeline: VideoTrackKeyframe[] = []
    const timedZones = options.timedZones ?? []
    const totalWork = sampleTimes.length + totalFrames

    options.onPhase?.('analyzing')
    for (let i = 0; i < sampleTimes.length; i++) {
      if (options.abortSignal?.aborted) throw new DOMException('Aborted', 'AbortError')
      const sampleTime = sampleTimes[i]
      await waitForSeek(video, sampleTime)
      detectCtx.clearRect(0, 0, detectW, detectH)
      detectCtx.drawImage(video, 0, 0, detectW, detectH)
      const faces = await detectFaces(detectCanvas, true)
      const rawDetections = faces.filter((face) => isLikelyVideoFace(face, detectW, detectH)).map((face) => faceToZone(
        {
          x: face.x / detectScale,
          y: face.y / detectScale,
          width: face.width / detectScale,
          height: face.height / detectScale,
        },
        w,
        h,
        options.effect,
        options.emoji,
      ))
      const detections = filterVideoDetections(rawDetections, tracks)
      tracks = stabilizeTracks(tracks, detections, sampleTime, nextTrackId, nextTrackEmoji)
      const zones = predictTrackZones(
        tracks.filter((track) => track.confirmed && track.missed === 0),
        sampleTime,
      ).map(cloneZone)
      const lastTime = timeline[timeline.length - 1]?.timeSec ?? -1
      const preRollTime = Math.max(0, sampleTime - VIDEO_DETECTION_PREROLL_SEC)
      if (zones.length > 0 && preRollTime > lastTime + 0.001 && preRollTime < sampleTime - 0.001) {
        pushVideoKeyframe(timeline, preRollTime, zones)
      }
      pushVideoKeyframe(timeline, sampleTime, zones)
      options.onProgress?.(i + 1, totalWork)
      await new Promise<void>((resolve) => window.setTimeout(resolve, 0))
    }

    await waitForSeek(video, 0)
    options.onPhase?.('rendering')

    const effectOptions: EffectRenderOptions = {
      customImages: options.customImages,
      customImageSource: options.customImageSource,
    }

    const distortEnabled = (options.distort?.enabled.length ?? 0) > 0
    const colorAdjEnabled = options.colorAdj != null && !isColorAdjNoop(options.colorAdj)
    const frameDurationUs = Math.round(1_000_000 / fps)

    const timedZoneIds = new Set(timedZones.map((item) => item.id))

    const renderProcessedFrame = async (mediaTime: number, sourceFrame?: CanvasImageSource) => {
      const override = overrideBitmaps.find((item) => Math.abs(item.timeSec - mediaTime) <= overrideWindowSec)
      ctx.clearRect(0, 0, w, h)
      if (override) {
        ctx.drawImage(override.bitmap, 0, 0, w, h)
        return
      }
      ctx.drawImage(sourceFrame ?? video, 0, 0, w, h)
      const zones = getFrameZonesAtTime(timeline, timedZones, mediaTime)
        .map((zone) => applyVideoEffectSettings(zone, options, timedZoneIds))
      drawZones(ctx, zones, w, h, options.strength, effectOptions)
      if (colorAdjEnabled && options.colorAdj) {
        applyColorAdjustments(ctx, options.colorAdj, canvas)
      }
      if (distortEnabled && options.distort) {
        const frameSeed = clamp(Math.round(mediaTime * fps), 0, Math.max(0, totalFrames - 1))
        const distorted = await applyDistortPipeline(
          canvas,
          options.distort.enabled,
          options.distort.strengths,
          options.distort.params,
          options.distort.pixelShiftType,
          frameSeed,
        )
        ctx.clearRect(0, 0, w, h)
        ctx.drawImage(distorted, 0, 0, w, h)
      }
    }

    const renderCtx: RenderFrameContext = {
      video,
      canvas,
      ctx,
      fps,
      duration,
      totalFrames,
      frameDurationUs,
      sampleTimesLength: sampleTimes.length,
      totalWork,
      renderProcessedFrame,
      options,
    }

    options.abortSignal?.addEventListener('abort', () => {
      aborted = true
    }, { once: true })

    if (frameEncoderFormat) {
      const result = await encodeVideoTrackFrameByFrame(frameEncoderFormat, renderCtx, url)
      if (aborted) throw new DOMException('Aborted', 'AbortError')
      options.onProgress?.(totalWork, totalWork)
      return result
    }

    const result = await encodeViaRecorderReplay(recorderFormat!, renderCtx, url)
    if (aborted) throw new DOMException('Aborted', 'AbortError')
    return result
  } finally {
    URL.revokeObjectURL(url)
    overrideBitmaps.forEach((item) => item.bitmap.close())
    if (hiddenVideo?.parentNode) hiddenVideo.parentNode.removeChild(hiddenVideo)
  }
}

export function getSupportedVideoExportOptions(): VideoExportOption[] {
  const hasFrameEncoder = typeof getWebCodecsHost().VideoEncoder !== 'undefined'
  return VIDEO_EXPORT_CONFIGS.map((config) => {
    const mimeType = config.mimeCandidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? null
    const framePipelineSupported = hasFrameEncoder && (
      config.id === 'webm' || config.id === 'mp4' || config.id === 'mov' || config.id === 'ogv'
    )
    const resolvedMime = mimeType
      ?? (framePipelineSupported
        ? (config.id === 'webm' || config.id === 'ogv' ? 'video/webm' : 'video/mp4')
        : null)
    return {
      id: config.id,
      label: config.label,
      ext: config.ext,
      mimeType: resolvedMime,
      supported: resolvedMime != null,
    }
  })
}

export function getVideoPipelineCapabilities(): VideoPipelineCapabilities {
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null
  const captureTrack = canvas?.captureStream?.(0).getVideoTracks()[0] as ManualCanvasCaptureTrack | undefined
  const manualCanvasFrameCapture = Boolean(captureTrack && typeof captureTrack.requestFrame === 'function')
  captureTrack?.stop()
  const host = getWebCodecsHost()
  const webCodecsRenderer = Boolean(host.VideoEncoder && host.VideoFrame)

  return {
    mediaRecorder: typeof MediaRecorder !== 'undefined',
    manualCanvasFrameCapture,
    requestVideoFrameCallback: 'requestVideoFrameCallback' in HTMLVideoElement.prototype,
    timelineWorker: typeof Worker !== 'undefined',
    offscreenCanvas: typeof OffscreenCanvas !== 'undefined',
    webCodecs: Boolean(host.VideoEncoder && host.VideoFrame),
    webCodecsRenderer,
  }
}

export function mimeTypeToVideoExtension(mimeType: string): string {
  const normalized = mimeType.toLowerCase()
  if (normalized.includes('webm')) return 'webm'
  if (normalized.includes('quicktime')) return 'mov'
  if (normalized.includes('ogg')) return 'ogv'
  if (normalized.includes('mpeg')) return 'mpeg'
  if (normalized.includes('matroska')) return 'mkv'
  if (normalized.includes('avi') || normalized.includes('msvideo')) return 'avi'
  if (normalized.includes('mp4')) return 'mp4'
  return 'webm'
}

/**
 * Check whether a MIME type represents a video.
 */
export function isVideoMime(mime: string): boolean {
  return mime.startsWith('video/')
}

/**
 * Accepted video file extensions.
 */
export const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v', '.ogv'] as const

/**
 * Check whether a File is a supported video based on MIME or extension.
 */
export function isVideoFile(file: File): boolean {
  if (file.type.startsWith('video/')) return true
  const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '')
  return (VIDEO_EXTENSIONS as readonly string[]).includes(ext)
}

/** Stabilizes video editor preview detections (same filters as export pipeline). */
export class VideoFaceTrackStabilizer {
  private tracks: VideoTrackState[] = []
  private trackSeq = 0

  reset(): void {
    this.tracks = []
    this.trackSeq = 0
  }

  update(
    faces: Array<{ x: number; y: number; width: number; height: number; score?: number }>,
    frameW: number,
    frameH: number,
    timeSec: number,
    effect: AnonymizeEffectId,
    emojiForTrack: () => string,
  ): Zone[] {
    const rawDetections = faces
      .filter((face) => isLikelyVideoFace(face, frameW, frameH))
      .map((face) => faceToZone(
        { x: face.x, y: face.y, width: face.width, height: face.height },
        frameW,
        frameH,
        effect,
        emojiForTrack(),
      ))
    const detections = filterVideoDetections(rawDetections, this.tracks)
    this.tracks = stabilizeTracks(
      this.tracks,
      detections,
      timeSec,
      () => `vpt-${++this.trackSeq}`,
      emojiForTrack,
    )
    return predictTrackZones(
      this.tracks.filter((track) => track.confirmed && track.missed === 0),
      timeSec,
    ).map(cloneZone)
  }
}
