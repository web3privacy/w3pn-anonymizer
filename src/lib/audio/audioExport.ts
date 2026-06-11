/** Encode AudioBuffer to 16-bit PCM WAV blob (local export, no external deps). */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const bitsPerSample = 16
  const blockAlign = (numChannels * bitsPerSample) / 8
  const dataLength = buffer.length * blockAlign
  const arrayBuffer = new ArrayBuffer(44 + dataLength)
  const view = new DataView(arrayBuffer)

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }

  writeStr(0, 'RIFF')
  view.setUint32(4, 36 + dataLength, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitsPerSample, true)
  writeStr(36, 'data')
  view.setUint32(40, dataLength, true)

  const channels: Float32Array[] = []
  for (let c = 0; c < numChannels; c++) channels.push(buffer.getChannelData(c))

  let offset = 44
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = Math.max(-1, Math.min(1, channels[c][i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
      offset += 2
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

export type AudioExportFormatId = 'wav' | 'webm' | 'ogg' | 'mp4'

export interface AudioExportFormat {
  id: AudioExportFormatId
  label: string
  ext: string
  /** MediaRecorder mime type; undefined for the dependency-free WAV writer. */
  mimeType?: string
}

const RECORDER_FORMATS: AudioExportFormat[] = [
  { id: 'webm', label: 'WebM (Opus)', ext: 'webm', mimeType: 'audio/webm;codecs=opus' },
  { id: 'ogg', label: 'OGG (Opus)', ext: 'ogg', mimeType: 'audio/ogg;codecs=opus' },
  { id: 'mp4', label: 'MP4 (AAC)', ext: 'm4a', mimeType: 'audio/mp4' },
]

/** WAV (always available) plus whatever lossy formats MediaRecorder can encode here. */
export function supportedAudioExportFormats(): AudioExportFormat[] {
  const wav: AudioExportFormat = { id: 'wav', label: 'WAV (lossless)', ext: 'wav' }
  const canRecord = typeof MediaRecorder !== 'undefined'
    && typeof MediaRecorder.isTypeSupported === 'function'
  if (!canRecord) return [wav]
  const lossy = RECORDER_FORMATS.filter((f) => f.mimeType && MediaRecorder.isTypeSupported(f.mimeType))
  return [wav, ...lossy]
}

/**
 * Encode an AudioBuffer to a lossy container via MediaRecorder. This plays the
 * buffer through a MediaStream in real time, so it takes roughly the clip's
 * duration — acceptable for short clips and the only local path to Opus/AAC.
 */
async function encodeViaMediaRecorder(buffer: AudioBuffer, mimeType: string): Promise<Blob> {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const ctx = new Ctx()
  try {
    const dest = ctx.createMediaStreamDestination()
    const src = ctx.createBufferSource()
    src.buffer = buffer
    src.connect(dest)
    const recorder = new MediaRecorder(dest.stream, { mimeType })
    const chunks: BlobPart[] = []
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
    const stopped = new Promise<void>((resolve) => { recorder.onstop = () => resolve() })
    recorder.start()
    src.start()
    await new Promise<void>((resolve) => { src.onended = () => resolve() })
    recorder.stop()
    await stopped
    return new Blob(chunks, { type: mimeType })
  } finally {
    await ctx.close().catch(() => { /* ignore */ })
  }
}

/** Encode a rendered AudioBuffer to the requested export format. */
export async function encodeAudioBuffer(buffer: AudioBuffer, format: AudioExportFormat): Promise<Blob> {
  if (format.id === 'wav' || !format.mimeType) return audioBufferToWavBlob(buffer)
  return encodeViaMediaRecorder(buffer, format.mimeType)
}

export function anonymizedAudioFilename(originalName: string, ext = 'wav'): string {
  const base = (originalName.split('/').pop() ?? originalName).replace(/\.[^.]+$/, '')
  return `${base}-anonymized.${ext}`
}
