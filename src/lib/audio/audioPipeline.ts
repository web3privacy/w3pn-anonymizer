import type { AudioEffectSettings } from './audioTypes'
import { effectiveAudioSettings, semitonesToPlaybackRate } from './audioUtils'

export type AudioGraphNodes = {
  source: AudioBufferSourceNode | MediaElementAudioSourceNode | null
  destination: AudioNode
  disconnect: () => void
}

/** Reusable white-noise buffer (2s, mono) for the additive "hiss" effect. */
function createNoiseBuffer(ctx: BaseAudioContext): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * 2)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

/**
 * Build a Web Audio graph for preview/export from preset settings.
 *
 * Chain: input → highpass → lowpass → compressor → bitcrush → [ring mod] →
 * [tremolo] → master gain (+ additive noise) → output.
 *
 * Pitch is applied via playback rate on an AudioBufferSourceNode (offline
 * export); for live <audio> preview the caller sets element.playbackRate so the
 * preview and export stay consistent (a varispeed shift that also masks tempo).
 */
export function buildAudioEffectGraph(
  ctx: BaseAudioContext,
  input: AudioNode,
  settings: AudioEffectSettings,
): { output: AudioNode; disconnect: () => void } {
  const params = effectiveAudioSettings(settings)
  const nodes: AudioNode[] = [input]
  const started: Array<AudioScheduledSourceNode> = []

  const highpass = ctx.createBiquadFilter()
  highpass.type = 'highpass'
  highpass.frequency.value = params.highpassHz ?? 80
  input.connect(highpass)
  nodes.push(highpass)

  const lowpass = ctx.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.value = params.lowpassHz ?? 8000
  highpass.connect(lowpass)
  nodes.push(lowpass)

  // Formant shift approximation: a peaking filter that moves vocal-tract
  // resonance energy up/down to disguise timbre (-1..1 → ~750 Hz..3 kHz).
  let preComp: AudioNode = lowpass
  const formant = params.formantShift ?? 0
  if (Math.abs(formant) > 0.01) {
    const peak = ctx.createBiquadFilter()
    peak.type = 'peaking'
    peak.frequency.value = 1500 * Math.pow(2, formant * 1.2)
    peak.Q.value = 1.2
    peak.gain.value = 8 + Math.abs(formant) * 6
    lowpass.connect(peak)
    nodes.push(peak)
    preComp = peak
  }

  const compressor = ctx.createDynamicsCompressor()
  compressor.threshold.value = -24
  compressor.ratio.value = 4 + (params.compressorAmount ?? 0) * 8
  preComp.connect(compressor)
  nodes.push(compressor)

  // Bitcrush via WaveShaper quantization. IMPORTANT: only insert the shaper when
  // there is meaningful crush. With a near-zero amount the curve must NOT collapse
  // the signal to a few levels (that turns voice into harsh noise) — so we bypass
  // entirely below a small threshold, and otherwise map amount → fewer levels
  // (more crush = harsher) with a safe floor.
  let tail: AudioNode = compressor
  const crush = params.bitcrushAmount ?? 0
  if (crush > 0.02) {
    const shaper = ctx.createWaveShaper()
    // crush 0 → ~64 levels (clean), crush 1 → 4 levels (harsh).
    const levels = Math.max(4, Math.round(64 - crush * 60))
    const q = (levels - 1) / 2
    const curve = new Float32Array(256)
    for (let i = 0; i < 256; i++) {
      const x = (i / 128) - 1
      curve[i] = Math.max(-1, Math.min(1, Math.round(x * q) / q))
    }
    shaper.curve = curve
    compressor.connect(shaper)
    nodes.push(shaper)
    tail = shaper
  }

  // Ring modulation — multiply the signal by a sine carrier (robotic timbre).
  const ringFreq = params.ringModFrequency ?? 0
  if (ringFreq > 0) {
    const ringGain = ctx.createGain()
    ringGain.gain.value = 0 // driven entirely by the oscillator
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = ringFreq
    osc.connect(ringGain.gain)
    tail.connect(ringGain)
    osc.start()
    nodes.push(ringGain)
    started.push(osc)
    tail = ringGain
  }

  // Tremolo — amplitude LFO.
  const tremDepth = Math.min(0.95, params.tremoloDepth ?? 0)
  if (tremDepth > 0) {
    const tremGain = ctx.createGain()
    tremGain.gain.value = 1 - tremDepth
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = params.tremoloRate ?? 5
    const lfoDepth = ctx.createGain()
    lfoDepth.gain.value = tremDepth
    lfo.connect(lfoDepth)
    lfoDepth.connect(tremGain.gain)
    tail.connect(tremGain)
    lfo.start()
    nodes.push(tremGain, lfoDepth)
    started.push(lfo)
    tail = tremGain
  }

  const master = ctx.createGain()
  master.gain.value = 1
  tail.connect(master)
  nodes.push(master)

  // Additive white noise (radio hiss) mixed into the master output.
  const noiseAmount = params.noiseAmount ?? 0
  if (noiseAmount > 0) {
    const noiseSrc = ctx.createBufferSource()
    noiseSrc.buffer = createNoiseBuffer(ctx)
    noiseSrc.loop = true
    const noiseGain = ctx.createGain()
    noiseGain.gain.value = Math.min(0.4, noiseAmount * 0.5)
    noiseSrc.connect(noiseGain)
    noiseGain.connect(master)
    noiseSrc.start()
    nodes.push(noiseGain)
    started.push(noiseSrc)
  }

  // Pitch via varispeed (offline buffer source only; live preview uses the
  // element's playbackRate, set by the caller).
  const rate = semitonesToPlaybackRate(params.pitchSemitones ?? 0)
  if (input instanceof AudioBufferSourceNode) {
    input.playbackRate.value = rate
  }

  return {
    output: master,
    disconnect: () => {
      for (const s of started) {
        try { s.stop() } catch { /* not started / already stopped */ }
      }
      nodes.forEach((n) => {
        try { n.disconnect() } catch { /* already disconnected */ }
      })
    },
  }
}

export async function renderProcessedAudioBuffer(
  _ctx: AudioContext,
  sourceBuffer: AudioBuffer,
  settings: AudioEffectSettings,
): Promise<AudioBuffer> {
  if (settings.mode === 'keep_original') return sourceBuffer

  const params = effectiveAudioSettings(settings)
  const rate = semitonesToPlaybackRate(params.pitchSemitones ?? 0)
  // Varispeed changes the effective duration; size the offline buffer so the
  // whole recording is captured (no truncation on pitch-down, no dead air on
  // pitch-up).
  const renderLength = Math.max(1, Math.ceil(sourceBuffer.length / rate))

  const offline = new OfflineAudioContext(
    sourceBuffer.numberOfChannels,
    renderLength,
    sourceBuffer.sampleRate,
  )
  const src = offline.createBufferSource()
  src.buffer = sourceBuffer
  const { output, disconnect } = buildAudioEffectGraph(offline, src, settings)
  output.connect(offline.destination)
  src.start(0)
  const rendered = await offline.startRendering()
  disconnect()
  return rendered
}
