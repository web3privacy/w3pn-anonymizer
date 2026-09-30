import { buildVideoSampleTimes, buildVideoReviewRanges, normalizeAnalysisSettings, type VideoAnalysisSettings, type VideoAnalysisResult } from './video-analysis'
import { VideoTempFile, transferVideoFileOwnership, releaseVideoFile } from './video-storage'
import { detectFaces } from './detector'
import { privacyDetectionToZone } from './detections/adapters'
import { detectImagePrivacyDetections } from './detections/run-image-detection'
import {
  applyDistortPipeline,
  type DistortEffectId,
  type DistortParams,
} from './distort-effects'
import { applyColorAdjustments, applyEffectRect, isColorAdjNoop, pickRandomEmoji, type PixelShiftType } from './effects'
import { effectiveAudioSettings } from './audio/audioUtils'
import type { AudioEffectSettings, AudioPrivacyMode } from './audio/audioTypes'
import type { EffectRenderOptions } from '../types'
import type { AnonymizeEffectId, ColorAdjustments, CustomImageAsset, CustomImageSource, DetectionCategoryConfig, ModelAvailabilityStatus, Zone } from '../types'
import { getFrameZonesAtTime, type VideoTrackKeyframe } from './video-timeline-core'
import { isVideoTimelineWorkerAvailable } from './video-timeline-client'
import { resolveVideoExportSize, VIDEO_MAX_EXPORT_DIMENSION, type VideoExportSize } from './video-export-size'

export interface VideoDistortOptions {
  enabled: DistortEffectId[]
  strengths: Record<DistortEffectId, number>
  params: DistortParams
  pixelShiftType: PixelShiftType
}

export interface VideoRenderSettings {
  effect: AnonymizeEffectId
  strength: number
  fixedEmoji?: string
  fixedCustomImageId?: string
  customImageSource?: CustomImageSource
  customImages?: CustomImageAsset[]
  colorAdj?: ColorAdjustments
  distort?: VideoDistortOptions
}

export interface VideoRenderSettingsKeyframe {
  timeSec: number
  settings: VideoRenderSettings
}

export interface VideoProcessingOptions {
  analysisSettings?: VideoAnalysisSettings
  previousAnalysis?: VideoAnalysisResult
  additionalAnalysisPass?: boolean
  onAnalysis?: (result: VideoAnalysisResult) => void
  effect: AnonymizeEffectId
  strength: number
  emoji: string
  /** Optional exact export dimensions. Detection stays on the source frame; render output is scaled here. */
  targetSize?: VideoExportSize | null
  /** When set, every detected face uses this exact emoji instead of random unique ones. */
  fixedEmoji?: string
  /** When set, every custom-image zone uses this asset instead of random picks. */
  fixedCustomImageId?: string
  customImages?: CustomImageAsset[]
  customImageSource?: CustomImageSource
  outputFormat?: VideoExportFormatId
  frameOverrides?: VideoFrameOverride[]
  timedZones?: VideoTimedZone[]
  /** Audio handling during export. Default keep_original. */
  audioPrivacyMode?: AudioPrivacyMode
  audioSettings?: AudioEffectSettings
  /** Global color adjustments applied after anonymization on non-override frames. */
  colorAdj?: ColorAdjustments
  /** Global distort filter applied after color adjustments on non-override frames. */
  distort?: VideoDistortOptions
  /** Optional timeline of effect/color/distort settings captured while scrubbing the video. */
  renderSettingsKeyframes?: VideoRenderSettingsKeyframe[]
  /** Optional multi-target detection (YOLO). Face-only when omitted or no extended targets enabled. */
  detectionConfig?: DetectionCategoryConfig[]
  modelStatus?: Record<string, ModelAvailabilityStatus>
  detectConfidence?: number
  faceOffsetPercent?: number
  enabledClasses?: string[]
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
  keyframes?: { timeSec: number; zone: Zone }[]
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
  { id: 'mov', label: 'MOV', ext: 'mov', mimeCandidates: ['video/quicktime'] },
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
const VIDEO_ZONE_PADDING = 0.46
const VIDEO_TRACK_CONFIRM_HITS = 2
const VIDEO_MIN_BLUR_STRENGTH = 0.55

export const VIDEO_RUNTIME_LIMITS = {
  acceptedExtensions: ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', 'ogv'] as const,
  maxUploadBytes: null,
  /** Duration and upload size are governed by available device storage. */
  maxDurationSec: null,
  detectMaxDimension: DETECT_MAX_DIM,
  defaultFps: FALLBACK_FPS,
  estimatedFpsRange: { min: 10, max: 60 },
  videoBitrate: VIDEO_BITRATE,
  audioBitrate: AUDIO_BITRATE,
  maxExportDimension: VIDEO_MAX_EXPORT_DIMENSION,
} as const

export { resolveVideoExportSize, type VideoExportSize } from './video-export-size'

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
  readonly encodeQueueSize: number
  encode(frame: { close(): void }, options?: { keyFrame?: boolean }): void
  flush(): Promise<void>
  close(): void
}

interface AudioEncoderInstance {
  readonly encodeQueueSize?: number
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
  finalize: (signal?: AbortSignal) => Promise<Blob>
  drain: () => Promise<void>
  dispose: () => Promise<void>
  audioCodec: 'opus' | 'aac'
}


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
      ids: ['mp4'],
      format: { container: 'mp4', encoderCodec: 'avc1.42E01E', muxVideoCodec: 'avc', mimeType: 'video/mp4' },
    },
    {
      ids: ['webm'],
      format: { container: 'webm', encoderCodec: 'vp09.00.10.08', muxVideoCodec: 'V_VP9', mimeType: 'video/webm' },
    },
    {
      ids: ['webm'],
      format: { container: 'webm', encoderCodec: 'vp8', muxVideoCodec: 'V_VP8', mimeType: 'video/webm' },
    },
  ]

  const ordered = preferred
    ? candidates.filter((item) => item.ids?.includes(preferred))
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
      return format
    }
  }
  return null
}

async function createFrameMuxer(format: FrameEncoderFormat, width: number, height: number, fps: number, includeAudio: boolean): Promise<FrameMuxerSink> {
  const spool = await VideoTempFile.create()
  type ChunkEntry = { offset: number; size: number; timestamp: number; duration: number;
    type: EncodedVideoChunkType; video: boolean; meta?: EncodedVideoChunkMetadata | EncodedAudioChunkMetadata }
  const entries: ChunkEntry[] = []
  const append = (chunk: EncodedVideoChunk | EncodedAudioChunk, video: boolean, meta?: EncodedVideoChunkMetadata | EncodedAudioChunkMetadata) => {
    const data = new Uint8Array(chunk.byteLength)
    chunk.copyTo(data)
    entries.push({ offset: spool.size, size: data.length, timestamp: chunk.timestamp,
      duration: chunk.duration ?? 0, type: chunk.type, video, meta })
    spool.write(data)
  }
  return {
    audioCodec: format.container === 'mp4' ? 'aac' : 'opus',
    addVideoChunk: (chunk, meta) => append(chunk, true, meta),
    addAudioChunk: (chunk, meta) => append(chunk, false, meta),
    drain: () => spool.drain(),
    dispose: () => spool.dispose(),
    finalize: async (signal) => {
      const data = await spool.finish()
      const output = await VideoTempFile.create()
      try {
        const targetOptions = { onData: (bytes: Uint8Array, position: number) => output.write(bytes, position), chunked: true, chunkSize: 1024 * 1024 }
        const muxer = format.container === 'mp4'
          ? await import('mp4-muxer').then(({ Muxer, StreamTarget }) => new Muxer({
              target: new StreamTarget(targetOptions), video: { codec: 'avc', width, height },
              audio: includeAudio ? { codec: 'aac', numberOfChannels: 2, sampleRate: 48_000 } : undefined,
              fastStart: 'fragmented', firstTimestampBehavior: 'cross-track-offset',
            }))
          : await import('webm-muxer').then(({ Muxer, StreamTarget }) => new Muxer({
              target: new StreamTarget(targetOptions), video: { codec: format.muxVideoCodec, width, height, frameRate: fps },
              audio: includeAudio ? { codec: 'A_OPUS', numberOfChannels: 2, sampleRate: 48_000 } : undefined,
              firstTimestampBehavior: 'offset',
            }))
        // Interleave from disk: feeding an entire track first makes muxers retain it in RAM.
        entries.sort((a, b) => a.timestamp - b.timestamp)
        for (const entry of entries) {
          if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
          const bytes = await data.slice(entry.offset, entry.offset + entry.size).arrayBuffer()
          const init = { data: bytes, timestamp: entry.timestamp, duration: entry.duration, type: entry.type }
          if (entry.video) muxer.addVideoChunk(new EncodedVideoChunk(init), entry.meta as EncodedVideoChunkMetadata)
          else muxer.addAudioChunk(new EncodedAudioChunk(init), entry.meta as EncodedAudioChunkMetadata)
          await output.drain()
        }
        muxer.finalize()
        return await output.finish(format.mimeType)
      } catch (error) { await output.dispose(); throw error }
    },
  }
}

async function createVideoAudio(sourceUrl: string, settings?: AudioEffectSettings, signal?: AbortSignal) {
  const video = document.createElement('video')
  video.preload = 'auto'
  video.src = sourceUrl
  video.playsInline = true
  const context = new AudioContext({ sampleRate: 48_000 })
  let disconnect = () => {}
  let stream: MediaStream | undefined
  const close = async () => {
    video.pause()
    video.removeAttribute('src')
    video.load()
    disconnect()
    stream?.getTracks().forEach((track) => track.stop())
    await context.close()
  }
  try {
    await waitForVideoEvent(video, 'loadeddata', signal)
    const source = context.createMediaElementSource(video)
    let output: AudioNode = source
    if (settings?.mode === 'distort_voice') {
      const { buildAudioEffectGraph } = await import('./audio/audioPipeline')
      const params = effectiveAudioSettings(settings)
      await context.audioWorklet.addModule(new URL('audio/pitch-shift.js', document.baseURI).href)
      const pitch = new AudioWorkletNode(context, 'video-pitch-shift', { channelCount: 2, parameterData: { semitones: params.pitchSemitones ?? 0 } })
      source.connect(pitch)
      const graph = buildAudioEffectGraph(context, pitch, settings)
      output = graph.output
      disconnect = () => { graph.disconnect(); source.disconnect(); pitch.disconnect() }
    }
    const destination = context.createMediaStreamDestination()
    destination.channelCount = 2
    output.connect(destination)
    stream = destination.stream
    await context.resume()
    return { video, context, output, stream, close }
  } catch (error) { await close(); throw error }
}

async function encodeAudioTrackFromSource(
  sourceUrl: string, sink: FrameMuxerSink, signal?: AbortSignal, settings?: AudioEffectSettings,
): Promise<void> {
  const host = getWebCodecsHost()
  if (typeof host.AudioEncoder !== 'function') throw new Error('Audio encoding unavailable. Select Remove audio or use another browser.')
  const config = { codec: sink.audioCodec === 'aac' ? 'mp4a.40.2' : 'opus', sampleRate: 48_000, numberOfChannels: 2, bitrate: AUDIO_BITRATE }
  if (!(await host.AudioEncoder.isConfigSupported(config)).supported) throw new Error('Selected audio codec is unavailable.')
  const audio = await createVideoAudio(sourceUrl, settings, signal)
  const internalAbort = new AbortController()
  const onAbort = () => internalAbort.abort()
  signal?.addEventListener('abort', onAbort, { once: true })
  let encoder: AudioEncoderInstance | undefined
  let node: AudioWorkletNode | undefined
  let failure: unknown = null
  let frames = 0
  let stopCapture = () => {}
  try {
    await audio.context.audioWorklet.addModule(new URL('audio/pcm-capture.js', document.baseURI).href)
    encoder = new host.AudioEncoder({ output: (chunk, meta) => { try { sink.addAudioChunk(chunk, meta) } catch (error) { failure = error; internalAbort.abort() } }, error: (error) => { failure = error; internalAbort.abort() } })
    encoder.configure(config)
    node = new AudioWorkletNode(audio.context, 'pcm-capture', { channelCount: 2 })
    audio.output.connect(node)
    const mute = audio.context.createGain()
    mute.gain.value = 0
    node.connect(mute).connect(audio.context.destination)
    node.port.onmessage = (event: MessageEvent<Float32Array[] | string>) => {
      if (event.data === 'stopped') { stopCapture(); return }
      if (!Array.isArray(event.data)) return
      if (failure || signal?.aborted) return
      const channels = event.data
      const length = Math.min(channels[0].length, Math.max(0, Math.floor(audio.video.duration * 48_000) - frames))
      if (length === 0) return
      const data = new Float32Array(length * 2)
      data.set(channels[0].subarray(0, length)); data.set((channels[1] ?? channels[0]).subarray(0, length), length)
      const chunk = new AudioData({ format: 'f32-planar', sampleRate: 48_000, numberOfFrames: length,
        numberOfChannels: 2, timestamp: Math.round(frames / 48_000 * 1_000_000), data })
      try {
        if ((encoder?.encodeQueueSize ?? 0) > 32) throw new Error('Audio encoder cannot keep up.')
        encoder!.encode(chunk)
        frames += length
      } catch (error) { failure = error; internalAbort.abort() }
      finally { chunk.close() }
    }
    const done = waitForVideoEndedOrAbort(audio.video, internalAbort.signal)
    // Attach the rejection handler before starting playback.
    void done.catch(() => undefined)
    await audio.video.play()
    node.port.postMessage('start')
    try { await done } catch (error) { throw failure ?? error }
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Audio capture did not finish.')), 5000)
      stopCapture = () => { clearTimeout(timer); resolve() }
      node!.port.postMessage('stop')
    })
    if (failure) throw failure
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    await encoder.flush()
    if (failure) throw failure
  } finally {
    signal?.removeEventListener('abort', onAbort)
    internalAbort.abort()
    node?.disconnect()
    if (node) node.port.onmessage = null
    encoder?.close()
    await audio.close()
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
  const sink = await createFrameMuxer(format, w, h, fps, options.audioPrivacyMode !== 'remove_audio')
  const keyFrameInterval = Math.max(1, Math.round(fps * 2))

  let encoderError: DOMException | null = null
  try {
    const videoEncoder = new host.VideoEncoder!({
      output: (chunk, meta) => { try { sink.addVideoChunk(chunk, meta) } catch (error) { encoderError = new DOMException(String(error)) } },
      error: (error) => { encoderError = error },
    })


    let prevTimestampUs = -1
    try {
      videoEncoder.configure({
        codec: format.encoderCodec,
        width: w,
        height: h,
        bitrate: VIDEO_BITRATE,
        framerate: fps,
      })
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
          try { videoEncoder.encode(videoFrame, { keyFrame: frameIndex % keyFrameInterval === 0 }) }
          finally { videoFrame.close() }
          // Flush a small batch rather than allowing raw frames to accumulate in the encoder.
          if (videoEncoder.encodeQueueSize >= 4) await videoEncoder.flush()
          await sink.drain()

          options.onProgress?.(sampleTimesLength + currentFrame, totalWork)
          if (frameIndex % 24 === 0) await sleepMs(0)
        },
        options.abortSignal,
      )

      if (encoderError) throw encoderError
      options.onPhase?.('finishing')
      options.onProgress?.(totalWork - 1, totalWork)
      await videoEncoder.flush()
      if (encoderError) throw encoderError
    } finally {
      try { videoEncoder.close() } catch { /* Already closed by an encoder error. */ }

    }

    if (options.audioPrivacyMode !== 'remove_audio') await encodeAudioTrackFromSource(sourceUrl, sink, options.abortSignal, options.audioSettings)
    return await sink.finalize(options.abortSignal)
  } finally { await sink.dispose() }
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
  options.onPhase?.('preparing')
  const framesFile = await VideoTempFile.create()
  const frameOffsets: { start: number; end: number }[] = []
  let outputFile: VideoTempFile | undefined
  try {
    await forEachPresentedVideoFrame(
      video,
      duration,
      fps,
      totalFrames,
      async ({ mediaTime }) => {
        await renderProcessedFrame(mediaTime, video)
        const frame = await canvasToBlob(canvas, 'image/png')
        const start = framesFile.size
        framesFile.write(frame)
        await framesFile.drain()
        frameOffsets.push({ start, end: framesFile.size })
        options.onProgress?.(
          sampleTimesLength + Math.floor((frameOffsets.length) * 0.45),
          totalWork,
        )
        if (frameOffsets.length % 12 === 0) await sleepMs(0)
      },
      options.abortSignal,
    )

    const frames = await framesFile.finish()
    const readFrame = (index: number) => frames.slice(frameOffsets[index].start, frameOffsets[index].end, 'image/png')
    outputFile = await VideoTempFile.create()
    const output = outputFile
    options.onPhase?.('rendering')

    const capture = createCanvasStream(canvas, fps)
    const stream = new MediaStream([capture.videoTrack])
    let audio: Awaited<ReturnType<typeof createVideoAudio>> | undefined
    let recorder: MediaRecorder | undefined
    let recordingStopped: Promise<void> | undefined
    let recordingStarted = false
    let recorderError: Error | null = null
    try {
      if (options.audioPrivacyMode !== 'remove_audio') {
        audio = await createVideoAudio(sourceUrl, options.audioSettings, options.abortSignal)
        audio.stream.getAudioTracks().forEach((track) => stream.addTrack(track))
      }
      recorder = new MediaRecorder(stream, { mimeType: recorderFormat.mimeType, videoBitsPerSecond: VIDEO_BITRATE, audioBitsPerSecond: AUDIO_BITRATE })
      recorder.ondataavailable = (event) => {
        try { if (event.data.size) output.write(event.data) }
        catch (error) { recorderError = error instanceof Error ? error : new Error(String(error)) }
      }
      const stopped = new Promise<void>((resolve, reject) => {
        recorder!.onstop = () => resolve()
        recorder!.onerror = () => { recorderError = new Error('Video recorder failed.'); reject(recorderError) }
      })
      recordingStopped = stopped
      void stopped.catch(() => undefined)
      // Paint the first masked frame before recording starts (never record a stale canvas).
      const first = await createImageBitmap(readFrame(0))
      try { ctx.drawImage(first, 0, 0, w, h) } finally { first.close() }
      recorder.start(250)
      recordingStarted = true
      const replayStart = performance.now()
      if (audio) await audio.video.play()
      for (let index = 0; index < frameOffsets.length; index++) {
        if (options.abortSignal?.aborted) throw new DOMException('Aborted', 'AbortError')
        if (recorderError) throw recorderError
        await output.drain()
        const bitmap = await createImageBitmap(readFrame(index))
        try { ctx.clearRect(0, 0, w, h); ctx.drawImage(bitmap, 0, 0, w, h) }
        finally { bitmap.close() }
        capture.requestFrame?.()
        await sleepUntil(replayStart + (index + 1) * 1000 / fps)
        options.onProgress?.(sampleTimesLength + index + 1, totalWork)
      }
      recorder.stop()
      await stopped
      if (recorderError) throw recorderError
      options.onPhase?.('finishing')
      const recorded = await output.finish(recorderFormat.mimeType)
      const fixed = await normalizeRecordedVideoBlob(recorded, recorderFormat.mimeType)
      transferVideoFileOwnership(recorded, fixed)
      return fixed
    } finally {
      if (recorder?.state !== 'inactive') recorder?.stop()
      if (recordingStarted) await recordingStopped?.catch(() => undefined)
      stream.getTracks().forEach((track) => track.stop())
      capture.stream.getTracks().forEach((track) => track.stop())
      await audio?.close()
    }
  } catch (error) { await outputFile?.dispose(); throw error }
  finally { await framesFile.dispose() }
}

function resolveRecorderFormat(preferred?: VideoExportFormatId): VideoExportOption | null {
  if (typeof MediaRecorder === 'undefined') return null
  const ordered = preferred
    ? VIDEO_EXPORT_CONFIGS.filter((cfg) => cfg.id === preferred)
    : VIDEO_EXPORT_CONFIGS

  for (const config of ordered) {
    const mimeType = config.mimeCandidates.find((candidate) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(candidate)) ?? null
    if (mimeType) return { id: config.id, label: config.label, ext: config.ext, mimeType, supported: true }
  }
  return null
}

export function videoZoneStrength(zone: Zone, strength: number): number {
  const base = clamp(strength, 0, 1)
  const size = Math.sqrt(Math.max(0, zone.width * zone.height))
  const foregroundBoost = clamp((size - 0.08) / 0.22, 0, 1)

  if (zone.effect === 'blur' || zone.effect === 'zoom-blur') {
    return Math.min(1, Math.max(base, VIDEO_MIN_BLUR_STRENGTH) * (1.35 + foregroundBoost * 1.7))
  }
  if (zone.effect === 'pixelate' || zone.effect === 'noise') {
    return Math.min(1, base * (1.05 + foregroundBoost * 0.35))
  }
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

function applyVideoEffectSettings(
  zone: Zone,
  settings: VideoRenderSettings,
  customImages: CustomImageAsset[] | undefined,
  timedZoneIds: Set<string>,
): Zone {
  const isTimedMask = [...timedZoneIds].some((prefix) => zone.id.startsWith(`${prefix}-`))
  if (isTimedMask) return zone
  const effect = settings.effect
  return {
    ...zone,
    effect,
    emoji: settings.fixedEmoji ?? zone.emoji,
    customImageAssetId: effect === 'custom-image'
      ? (settings.fixedCustomImageId ?? zone.customImageAssetId ?? pickCustomImageAssetId(customImages, zone.id))
      : zone.customImageAssetId,
  }
}

function resolveVideoRenderSettingsAtTime(
  options: VideoProcessingOptions,
  mediaTime: number,
): VideoRenderSettings {
  const base: VideoRenderSettings = {
    effect: options.effect,
    strength: options.strength,
    fixedEmoji: options.fixedEmoji,
    fixedCustomImageId: options.fixedCustomImageId,
    customImageSource: options.customImageSource,
    customImages: options.customImages,
    colorAdj: options.colorAdj,
    distort: options.distort,
  }
  const keyframes = options.renderSettingsKeyframes ?? []
  if (keyframes.length === 0) return base

  let active: VideoRenderSettingsKeyframe | null = null
  for (const keyframe of keyframes) {
    if (keyframe.timeSec <= mediaTime + 0.0005) active = keyframe
    else break
  }
  return active ? { ...base, ...active.settings } : base
}

export function drawVideoZones(
  ctx: CanvasRenderingContext2D,
  zones: Zone[],
  w: number,
  h: number,
  strength: number,
  effectOptions?: EffectRenderOptions,
): void {
  let circleCanvas: HTMLCanvasElement | undefined
  for (const zone of zones) {
    if (zone.hidden) continue
    ctx.save()
    let effectCtx = ctx
    const x = zone.x * w, y = zone.y * h, width = zone.width * w, height = zone.height * h
    if (zone.maskShape === 'circle') {
      ctx.beginPath()
      ctx.ellipse((zone.x + zone.width / 2) * w, (zone.y + zone.height / 2) * h, zone.width * w / 2, zone.height * h / 2, 0, 0, Math.PI * 2)
      ctx.clip()
      // putImageData ignores canvas clipping. Render into a patch and composite it
      // through the clip so CPU and GPU effects respect the same circular mask.
      circleCanvas ??= document.createElement('canvas')
      circleCanvas.width = Math.max(1, Math.ceil(width))
      circleCanvas.height = Math.max(1, Math.ceil(height))
      effectCtx = circleCanvas.getContext('2d')!
      effectCtx.drawImage(ctx.canvas, x, y, width, height, 0, 0, circleCanvas.width, circleCanvas.height)
    }
    applyEffectRect(
      effectCtx,
      zone.effect,
      zone.maskShape === 'circle' ? 0 : x,
      zone.maskShape === 'circle' ? 0 : y,
      zone.maskShape === 'circle' ? circleCanvas!.width : width,
      zone.maskShape === 'circle' ? circleCanvas!.height : height,
      videoZoneStrength(zone, strength),
      zone.emoji,
      {
        ...effectOptions,
        zoneId: zone.id,
        customImageAssetId: zone.customImageAssetId,
        seed: zone.id,
      },
    )
    if (zone.maskShape === 'circle') ctx.drawImage(circleCanvas!, x, y, width, height)
    ctx.restore()
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
    width: clamp((x + width) / w, 0, 1) - clamp(x / w, 0, 1),
    height: clamp((y + height) / h, 0, 1) - clamp(y / h, 0, 1),
    effect,
    emoji,
  }
}

function isLikelyVideoFace(
  box: { width: number; height: number; score?: number },
  w: number,
  h: number,
  minScore: number,
): boolean {
  const score = box.score ?? 1
  const aspect = box.width / Math.max(1, box.height)
  const relativeArea = (box.width * box.height) / Math.max(1, w * h)
  return (
    score >= minScore &&
    aspect >= 0.55 &&
    aspect <= 1.55 &&
    relativeArea >= 0.00008 &&
    relativeArea <= 1
  )
}

function filterVideoDetections(
  detections: Zone[],
  tracks: VideoTrackState[],
): Zone[] {
  void tracks
  return detections.filter((d) => [d.x, d.y, d.width, d.height].every(Number.isFinite) && d.width > 0 && d.height > 0)
}

function stabilizeTracks(
  tracks: VideoTrackState[],
  detections: Zone[],
  mediaTime: number,
  nextTrackId: () => string,
  nextTrackEmoji: () => string,
  keepaliveSec = TRACK_KEEPALIVE_SEC,
): VideoTrackState[] {
  const unmatchedTracks = new Set(tracks.map((_, index) => index))
  const nextTracks = [...tracks]

  detections.forEach((det) => {
    let bestTrackIndex = -1
    let bestScore = 0
    const dc = zoneCenter(det)

    unmatchedTracks.forEach((trackIndex) => {
      const track = nextTracks[trackIndex]
      if (track.zone.detectionType !== det.detectionType || track.zone.objectClass !== det.objectClass) return
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
        ...det,
        id: track.id,
        emoji: track.zone.emoji,
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
        confirmed: true,
      })
    }
  })

  unmatchedTracks.forEach((trackIndex) => {
    nextTracks[trackIndex] = { ...nextTracks[trackIndex], missed: nextTracks[trackIndex].missed + 1 }
  })

  return nextTracks.filter((track) => {
    if (mediaTime - track.lastSeenTime > keepaliveSec) return false
    if (track.missed >= 4) return false
    if (!track.confirmed && track.missed > 0) return false
    return true
  })
}

function predictTrackZones(tracks: VideoTrackState[], mediaTime: number): Zone[] {
  return tracks.map((track) => {
    const dt = clamp(mediaTime - track.lastSeenTime, 0, TRACK_KEEPALIVE_SEC)
    const dx = track.vx * dt, dy = track.vy * dt
    const x = Math.max(0, Math.min(track.zone.x, track.zone.x + dx))
    const y = Math.max(0, Math.min(track.zone.y, track.zone.y + dy))
    return { ...track.zone, x, y,
      width: Math.min(1, Math.max(track.zone.x + track.zone.width, track.zone.x + dx + track.zone.width)) - x,
      height: Math.min(1, Math.max(track.zone.y + track.zone.height, track.zone.y + dy + track.zone.height)) - y }
  })
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

export async function normalizeRecordedVideoBlob(blob: Blob, mimeType: string): Promise<Blob> {
  const type = blob.type || mimeType
  if (!type.toLowerCase().includes('webm')) return blob

  try {
    const module = await import('webm-duration-fix')
    const exported = module.default as unknown as { default?: unknown }
    const fix = (typeof exported === 'function' ? exported : exported.default) as (blob: Blob) => Promise<Blob>
    if (typeof fix !== 'function') throw new Error('WebM duration module is unavailable.')
    const fixed = await fix(new Blob([blob], { type }))
    return fixed.type ? fixed : new Blob([fixed], { type })
  } catch (err) {
    console.warn('WebM duration repair failed; returning original recorder blob.', err)
    return blob
  }
}

function waitForSeek(video: HTMLVideoElement, timeSec: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'))
  const target = Math.min(Math.max(0, timeSec), Number.isFinite(video.duration) ? video.duration : timeSec)
  if (!video.seeking && Math.abs(video.currentTime - target) < 0.000001) return Promise.resolve()
  const waiting = waitForMediaEvent(video, 'seeked', signal)
  video.currentTime = target
  return waiting
}

function waitForMediaEvent(video: HTMLVideoElement, name: string, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'))
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer)
      video.removeEventListener(name, done)
      video.removeEventListener('error', failed)
      signal?.removeEventListener('abort', aborted)
    }
    const done = () => { cleanup(); resolve() }
    const failed = () => { cleanup(); reject(new Error(`Video could not complete ${name}.`)) }
    const aborted = () => { cleanup(); reject(new DOMException('Aborted', 'AbortError')) }
    const timer = setTimeout(failed, 30_000)
    video.addEventListener(name, done, { once: true })
    video.addEventListener('error', failed, { once: true })
    signal?.addEventListener('abort', aborted, { once: true })
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
  video: HTMLVideoElement, duration: number, fps: number, maxFrames: number,
  handler: (frame: PresentedVideoFrame) => Promise<void>, abortSignal?: AbortSignal,
): Promise<number> {
  // A paused, explicit sample for every output timestamp. Playback callbacks can
  // skip frames under load; export must not silently omit those frames.
  video.pause()
  for (let frameIndex = 0; frameIndex < maxFrames; frameIndex++) {
    if (abortSignal?.aborted) throw new DOMException('Aborted', 'AbortError')
    const mediaTime = Math.min(Math.max(0, duration - 0.000001), frameIndex / fps)
    await waitForSeek(video, mediaTime, abortSignal)
    await handler({ frameIndex, mediaTime })
  }
  return maxFrames
}

function waitForVideoEvent(video: HTMLVideoElement, eventName: 'loadeddata' | 'loadedmetadata' | 'ended', signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'))
  if ((eventName === 'loadeddata' && video.readyState >= 2) || (eventName === 'loadedmetadata' && video.readyState >= 1) || (eventName === 'ended' && video.ended)) return Promise.resolve()
  return waitForMediaEvent(video, eventName, signal)
}

function waitForVideoEndedOrAbort(video: HTMLVideoElement, abortSignal?: AbortSignal): Promise<void> {
  if (video.ended) return Promise.resolve()
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
    const timer = setTimeout(onError, Math.min(2_147_483_647, Math.max(10_000, (video.duration || 0) * 1000 + 10_000)))
    const cleanup = () => {
      clearTimeout(timer)
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

    await waitForSeek(video, Math.min(0.1, video.duration / 2))

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
  const mode = options.audioPrivacyMode ?? options.audioSettings?.mode ?? 'keep_original'
  options = { ...options, renderSettingsKeyframes: (options.renderSettingsKeyframes ?? []).filter((item) => Number.isFinite(item.timeSec)).sort((a, b) => a.timeSec - b.timeSec), audioPrivacyMode: mode, audioSettings: {
    preset: 'maximum_mask', intensity: 1, ...options.audioSettings, mode,
  } }
  const recorderFormat = resolveRecorderFormat(options.outputFormat)
  let frameEncoderFormat: FrameEncoderFormat | null = null

  const url = URL.createObjectURL(videoBlob)
  let hiddenVideo: CaptureVideoElement | null = null
  let overrideBitmap: ImageBitmap | null = null
  let overrideBlob: Blob | null = null

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

    await waitForVideoEvent(video, 'loadeddata', options.abortSignal)

    const sourceW = video.videoWidth
    const sourceH = video.videoHeight
    const { width: w, height: h } = resolveVideoExportSize(sourceW, sourceH, options.targetSize)
    const duration = video.duration
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error('Could not read video duration.')
    }
    const fps = options.previousAnalysis?.source === videoBlob ? options.previousAnalysis.fps : await estimateVideoFps(video, options.abortSignal)
    frameEncoderFormat = await pickFrameEncoderFormat(options.outputFormat, w, h, fps)
    if (frameEncoderFormat && mode !== 'remove_audio') {
      const codec = frameEncoderFormat.container === 'mp4' ? 'mp4a.40.2' : 'opus'
      const encoder = getWebCodecsHost().AudioEncoder
      const supported = encoder && await encoder.isConfigSupported({ codec, sampleRate: 48_000, numberOfChannels: 2, bitrate: AUDIO_BITRATE }).catch(() => ({ supported: false }))
      if (!supported?.supported) frameEncoderFormat = null
    }
    if (!frameEncoderFormat && !recorderFormat?.mimeType) {
      throw new Error('No supported browser video encoder found for the selected format.')
    }
    const totalFrames = Math.max(1, Math.ceil(duration * fps))
    // Fail before model analysis when private disk storage is unavailable.
    const storageProbe = await VideoTempFile.create()
    await storageProbe.dispose()
    const overrideWindowSec = Math.max(1 / fps, 0.04)

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!

    const detectScale = Math.min(1, DETECT_MAX_DIM / Math.max(sourceW, sourceH))
    const detectW = Math.max(1, Math.round(sourceW * detectScale))
    const detectH = Math.max(1, Math.round(sourceH * detectScale))
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

    const analysisSettings = normalizeAnalysisSettings(options.analysisSettings)
    const signature = JSON.stringify([analysisSettings.mode, analysisSettings.samplesPerSecond, options.detectionConfig,
      options.modelStatus, options.enabledClasses, options.detectConfidence, options.faceOffsetPercent, sourceW, sourceH])
    const previous = options.previousAnalysis?.source === videoBlob && options.previousAnalysis.signature === signature && Math.abs(options.previousAnalysis.duration - duration) < 0.01
      ? options.previousAnalysis : undefined
    // Keep the established output frame grid across repeat exports of the same source.
    const analysisFps = previous?.fps ?? fps
    const passes = analysisSettings.mode === 'every-frame' || analysisSettings.samplesPerSecond >= analysisFps ? 1 : Math.min(1024, Math.max(analysisSettings.passes, (previous?.passes ?? 0) + (options.additionalAnalysisPass ? 1 : 0)))
    const sampleTimes = buildVideoSampleTimes(duration, analysisFps, analysisSettings, passes)
    const cachedSamples = new Map(previous?.samples.map((sample) => [sample.timeSec, sample.zones]) ?? [])
    const samples: VideoTrackKeyframe[] = []
    const keepaliveSec = Math.max(TRACK_KEEPALIVE_SEC, 2 / (analysisSettings.mode === 'every-frame' ? analysisFps : analysisSettings.samplesPerSecond))
    const timeline: VideoTrackKeyframe[] = []
    const timedZones = options.timedZones ?? []
    const totalWork = sampleTimes.length + totalFrames
    const faceDetectConfidence = options.detectConfidence ?? 0.65

    options.onPhase?.('analyzing')
    const useExtended = options.detectionConfig && options.modelStatus

    for (let i = 0; i < sampleTimes.length; i++) {
      if (options.abortSignal?.aborted) throw new DOMException('Aborted', 'AbortError')
      const sampleTime = sampleTimes[i]
      const cachedZones = cachedSamples.get(sampleTime)
      if (!cachedZones) {
        await waitForSeek(video, sampleTime, options.abortSignal)
        detectCtx.clearRect(0, 0, detectW, detectH)
        detectCtx.drawImage(video, 0, 0, detectW, detectH)
      }
      let detectedZones: Zone[]
      if (cachedZones) detectedZones = cachedZones
      else if (useExtended) {
        const { detections } = await detectImagePrivacyDetections(detectCanvas, {
          detectionConfig: options.detectionConfig!, modelStatus: options.modelStatus!,
          confidence: faceDetectConfidence, thorough: true, robust: true, enabledClasses: options.enabledClasses,
        })
        detectedZones = detections.map((det) => privacyDetectionToZone(det, {
          config: options.detectionConfig!, globalEffect: options.effect, emoji: options.fixedEmoji ?? options.emoji,
          faceOffsetPercent: options.faceOffsetPercent ?? 92, imageW: sourceW, imageH: sourceH,
        }))
      } else {
        const faces = await detectFaces(detectCanvas, true, faceDetectConfidence)
        detectedZones = faces.filter((face) => isLikelyVideoFace(face, detectW, detectH, faceDetectConfidence))
          .map((face) => ({ ...faceToZone(face, detectW, detectH, options.effect, options.fixedEmoji ?? options.emoji), confidence: face.score }))
      }
      samples.push({ timeSec: sampleTime, zones: detectedZones })
      tracks = stabilizeTracks(tracks, filterVideoDetections(detectedZones, tracks), sampleTime, nextTrackId, nextTrackEmoji, keepaliveSec)
      const zones = predictTrackZones(tracks, sampleTime)
      pushVideoKeyframe(timeline, sampleTime, zones)
      options.onProgress?.(i + 1, totalWork)
      if (!cachedZones || i % 24 === 0) await sleepMs(0)
    }

    options.onAnalysis?.({ signature, source: videoBlob, duration, fps: analysisFps, passes, samples, timeline,
      review: buildVideoReviewRanges(samples, duration, analysisFps),
      fullFrameCoverage: sampleTimes.length >= Math.ceil(duration * analysisFps) })
    await waitForSeek(video, 0, options.abortSignal)
    options.onPhase?.('preparing')
    // Resolve sparse keyframes on demand; do not allocate masks for every output frame.
    options.onPhase?.('rendering')

    const frameDurationUs = Math.round(1_000_000 / fps)

    const timedZoneIds = new Set(timedZones.map((item) => item.id))

    const renderProcessedFrame = async (mediaTime: number, sourceFrame?: CanvasImageSource) => {
      const override = (options.frameOverrides ?? []).find((item) => Math.abs(item.timeSec - mediaTime) <= overrideWindowSec)
      const renderSettings = resolveVideoRenderSettingsAtTime(options, mediaTime)
      const effectOptions: EffectRenderOptions = {
        customImages: renderSettings.customImages ?? options.customImages,
        customImageSource: renderSettings.customImageSource,
      }
      const distortEnabled = (renderSettings.distort?.enabled.length ?? 0) > 0
      const colorAdjEnabled = renderSettings.colorAdj != null && !isColorAdjNoop(renderSettings.colorAdj)
      ctx.clearRect(0, 0, w, h)
      if (override) {
        if (override.frameBlob !== overrideBlob) {
          overrideBitmap?.close()
          overrideBitmap = null
          overrideBlob = null
          overrideBitmap = await createImageBitmap(override.frameBlob)
          overrideBlob = override.frameBlob
        }
        ctx.drawImage(overrideBitmap!, 0, 0, w, h)
      } else {
        ctx.drawImage(sourceFrame ?? video, 0, 0, w, h)
      }
        const zones = getFrameZonesAtTime(timeline, timedZones, mediaTime)
          .map((zone) => applyVideoEffectSettings(zone, renderSettings, renderSettings.customImages ?? options.customImages, timedZoneIds))
        drawVideoZones(ctx, zones, w, h, renderSettings.strength, effectOptions)
      if (colorAdjEnabled && renderSettings.colorAdj) {
        applyColorAdjustments(ctx, renderSettings.colorAdj, canvas)
      }
      if (distortEnabled && renderSettings.distort) {
        const frameSeed = clamp(Math.round(mediaTime * fps), 0, Math.max(0, totalFrames - 1))
        const distorted = await applyDistortPipeline(
          canvas,
          renderSettings.distort.enabled,
          renderSettings.distort.strengths,
          renderSettings.distort.params,
          renderSettings.distort.pixelShiftType,
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

    if (frameEncoderFormat) {
      const result = await encodeVideoTrackFrameByFrame(frameEncoderFormat, renderCtx, url)
      if (options.abortSignal?.aborted) { await releaseVideoFile(result); throw new DOMException('Aborted', 'AbortError') }
      options.onProgress?.(totalWork, totalWork)
      return result
    }

    const result = await encodeViaRecorderReplay(recorderFormat!, renderCtx, url)
    if (options.abortSignal?.aborted) { await releaseVideoFile(result); throw new DOMException('Aborted', 'AbortError') }
    return result
  } finally {
    URL.revokeObjectURL(url)
    ;(overrideBitmap as ImageBitmap | null)?.close()
    if (hiddenVideo) { hiddenVideo.pause(); hiddenVideo.removeAttribute('src'); hiddenVideo.load(); hiddenVideo.remove() }
  }
}

export function getSupportedVideoExportOptions(): VideoExportOption[] {
  const hasFrameEncoder = typeof getWebCodecsHost().VideoEncoder !== 'undefined'
  return VIDEO_EXPORT_CONFIGS.map((config) => {
    const mimeType = config.mimeCandidates.find((candidate) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(candidate)) ?? null
    const framePipelineSupported = hasFrameEncoder && (
      config.id === 'webm' || config.id === 'mp4'
    )
    const resolvedMime = mimeType
      ?? (framePipelineSupported
        ? (config.id === 'webm' ? 'video/webm' : 'video/mp4')
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
    timelineWorker: isVideoTimelineWorkerAvailable(),
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
export class VideoDetectionTrackStabilizer {
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
    minFaceScore = 0.58,
  ): Zone[] {
    const rawDetections = faces
      .filter((face) => isLikelyVideoFace(face, frameW, frameH, minFaceScore))
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
      this.tracks.filter((track) => track.confirmed),
      timeSec,
    ).map(cloneZone)
  }
}

/** @deprecated Use VideoDetectionTrackStabilizer */
export const VideoFaceTrackStabilizer = VideoDetectionTrackStabilizer
