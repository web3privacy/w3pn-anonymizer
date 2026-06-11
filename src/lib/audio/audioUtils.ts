import type { AudioEffectSettings } from './audioTypes'
import { resolveAudioPreset } from './audioPresets'

let sharedContext: AudioContext | null = null

export function getAudioContext(): AudioContext {
  if (!sharedContext || sharedContext.state === 'closed') {
    sharedContext = new AudioContext()
  }
  return sharedContext
}

export async function decodeAudioBlob(blob: Blob): Promise<AudioBuffer> {
  const ctx = getAudioContext()
  const arrayBuffer = await blob.arrayBuffer()
  return ctx.decodeAudioData(arrayBuffer.slice(0))
}

export function getAudioDuration(buffer: AudioBuffer): number {
  return buffer.duration
}

export function disposeAudioContext(): void {
  if (sharedContext && sharedContext.state !== 'closed') {
    void sharedContext.close()
  }
  sharedContext = null
}

export function effectiveAudioSettings(settings: AudioEffectSettings): AudioEffectSettings {
  if (settings.preset === 'custom') return settings
  return resolveAudioPreset(settings.preset, settings.intensity, settings)
}

export function semitonesToPlaybackRate(semitones: number): number {
  return Math.pow(2, semitones / 12)
}

/**
 * Downsample an AudioBuffer to `buckets` peak amplitudes (0..1) for a waveform /
 * sound-graph overview. Each bucket holds the max absolute sample across that
 * slice, so silent regions render as flat lines and audio as tall bars.
 */
export function computeWaveformPeaks(buffer: AudioBuffer, buckets: number): Float32Array {
  const peaks = new Float32Array(buckets)
  const channels = buffer.numberOfChannels
  const total = buffer.length
  if (total === 0 || buckets === 0) return peaks
  const step = total / buckets
  for (let ch = 0; ch < channels; ch++) {
    const data = buffer.getChannelData(ch)
    for (let b = 0; b < buckets; b++) {
      const start = Math.floor(b * step)
      const end = Math.min(total, Math.floor((b + 1) * step))
      let peak = 0
      for (let i = start; i < end; i++) {
        const v = Math.abs(data[i])
        if (v > peak) peak = v
      }
      if (peak > peaks[b]) peaks[b] = peak
    }
  }
  return peaks
}
