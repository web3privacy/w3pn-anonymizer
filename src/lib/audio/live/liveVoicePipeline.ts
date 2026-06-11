/**
 * Realtime local voice-mask graph:
 *
 *   mic → noise-gate → highpass → voice-mask(worklet) → lowpass → compressor
 *        → (+ radio hiss) → soft limiter → level-meter → MediaStreamDestination
 *                                                      ↘ (optional) monitor out
 *
 * The MediaStreamDestination feeds the recorder; monitoring is opt-in. Worklets
 * are loaded from /worklets (served from public/). Everything is local.
 */
import type { VoiceMaskParams } from './voiceMaskTypes'

const WORKLET_BASE = `${import.meta.env.BASE_URL ?? '/'}worklets/`

const loadedCtxs = new WeakSet<BaseAudioContext>()
async function ensureWorklets(ctx: AudioContext): Promise<void> {
  if (loadedCtxs.has(ctx)) return
  await Promise.all([
    ctx.audioWorklet.addModule(`${WORKLET_BASE}noise-gate-processor.js`),
    ctx.audioWorklet.addModule(`${WORKLET_BASE}voice-mask-processor.js`),
    ctx.audioWorklet.addModule(`${WORKLET_BASE}level-meter-processor.js`),
  ])
  loadedCtxs.add(ctx)
}

function makeNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * 2)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  return buf
}

export type LiveVoiceGraph = {
  outputStream: MediaStream
  analyser: AnalyserNode
  setParams: (p: VoiceMaskParams) => void
  setMonitor: (on: boolean) => void
  onLevel: (cb: (rms: number, peak: number) => void) => void
  dispose: () => void
}

export async function createLiveVoiceGraph(
  ctx: AudioContext,
  micStream: MediaStream,
  initial: VoiceMaskParams,
): Promise<LiveVoiceGraph> {
  await ensureWorklets(ctx)

  const source = ctx.createMediaStreamSource(micStream)

  const gate = new AudioWorkletNode(ctx, 'noise-gate-processor')
  gate.parameters.get('threshold')!.value = initial.gateThreshold

  const highpass = ctx.createBiquadFilter()
  highpass.type = 'highpass'
  highpass.frequency.value = initial.highpassHz

  const mask = new AudioWorkletNode(ctx, 'voice-mask-processor')
  const setMaskParam = (name: string, value: number) => {
    const p = mask.parameters.get(name)
    if (p) p.value = value
  }
  setMaskParam('strength', initial.strength)
  setMaskParam('intelligibility', initial.intelligibility)
  setMaskParam('pitchBias', initial.pitchBias)
  setMaskParam('randomization', initial.randomization)

  const lowpass = ctx.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.value = initial.lowpassHz

  const compressor = ctx.createDynamicsCompressor()
  compressor.threshold.value = -22
  compressor.ratio.value = 6

  const noiseGain = ctx.createGain()
  noiseGain.gain.value = Math.min(0.04, initial.noiseAmount * 0.06)
  const noiseSrc = ctx.createBufferSource()
  noiseSrc.buffer = makeNoiseBuffer(ctx)
  noiseSrc.loop = true

  const limiter = ctx.createWaveShaper()
  const limiterCurve = new Float32Array(1024)
  for (let i = 0; i < limiterCurve.length; i++) {
    const x = (i / (limiterCurve.length - 1)) * 2 - 1
    limiterCurve[i] = Math.tanh(x * 1.4)
  }
  limiter.curve = limiterCurve

  const outputGain = ctx.createGain()
  outputGain.gain.value = 2.4

  const analyser = ctx.createAnalyser()
  analyser.fftSize = 1024
  analyser.smoothingTimeConstant = 0.8

  const meter = new AudioWorkletNode(ctx, 'level-meter-processor')

  const dest = ctx.createMediaStreamDestination()

  const monitorGain = ctx.createGain()
  monitorGain.gain.value = 0 // monitoring off by default

  // Wire the chain.
  source.connect(gate)
  gate.connect(highpass)
  highpass.connect(mask)
  mask.connect(lowpass)
  lowpass.connect(compressor)
  compressor.connect(limiter)
  noiseSrc.connect(noiseGain)
  noiseGain.connect(limiter)
  limiter.connect(outputGain)
  outputGain.connect(meter)
  meter.connect(analyser)
  analyser.connect(dest)
  analyser.connect(monitorGain)
  monitorGain.connect(ctx.destination)
  try { noiseSrc.start() } catch { /* already started */ }

  let levelCb: ((rms: number, peak: number) => void) | null = null
  meter.port.onmessage = (e) => {
    if (levelCb && e.data) levelCb(e.data.rms ?? 0, e.data.peak ?? 0)
  }

  return {
    outputStream: dest.stream,
    analyser,
    setParams(p) {
      setMaskParam('strength', p.strength)
      setMaskParam('intelligibility', p.intelligibility)
      setMaskParam('pitchBias', p.pitchBias)
      setMaskParam('randomization', p.randomization)
      highpass.frequency.setTargetAtTime(p.highpassHz, ctx.currentTime, 0.05)
      lowpass.frequency.setTargetAtTime(p.lowpassHz, ctx.currentTime, 0.05)
      gate.parameters.get('threshold')!.value = p.gateThreshold
      noiseGain.gain.setTargetAtTime(Math.min(0.04, p.noiseAmount * 0.06), ctx.currentTime, 0.05)
    },
    setMonitor(on) {
      monitorGain.gain.setTargetAtTime(on ? 0.9 : 0, ctx.currentTime, 0.02)
    },
    onLevel(cb) { levelCb = cb },
    dispose() {
      try { noiseSrc.stop() } catch { /* not started */ }
      const all = [source, gate, highpass, mask, lowpass, compressor, noiseGain, noiseSrc, limiter, outputGain, meter, analyser, monitorGain]
      all.forEach((n) => { try { n.disconnect() } catch { /* already gone */ } })
      meter.port.onmessage = null
    },
  }
}
