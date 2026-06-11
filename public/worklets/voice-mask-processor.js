/**
 * Destructive voice de-identification AudioWorklet.
 *
 * Combines a granular (delay-line) pitch shifter whose ratio wanders via a
 * random walk (destroys the speaker's pitch contour / intonation), a slowly
 * drifting ring modulator (smears formant/timbre cues), so the output no longer
 * tracks speaker-specific biometric traits. Intelligibility tames the amount of
 * destruction. Fully local; nothing is stored or transmitted.
 *
 * NOTE: This strongly reduces recognizability but cannot guarantee defeating
 * forensic speaker recognition.
 */
class VoiceMaskProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'strength', defaultValue: 0.8, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
      { name: 'intelligibility', defaultValue: 0.6, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
      { name: 'pitchBias', defaultValue: -3, minValue: -12, maxValue: 12, automationRate: 'k-rate' },
      { name: 'randomization', defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
    ]
  }

  constructor() {
    super()
    this.BUF = 8192
    this.buf = new Float32Array(this.BUF)
    this.writeIdx = 0
    this.G = Math.max(256, Math.floor(sampleRate * 0.045)) // ~45 ms grains
    this.p0 = 0
    this.jit = 0
    this.ringPhase = 0
    this.carrier = 32
    this.seed = (Math.random() * 1e9) | 0 || 12345
  }

  _rand() {
    let x = this.seed
    x ^= x << 13
    x ^= x >>> 17
    x ^= x << 5
    this.seed = x
    return (x >>> 0) / 4294967296
  }

  _read(pos) {
    let i = Math.floor(pos)
    const frac = pos - i
    i = ((i % this.BUF) + this.BUF) % this.BUF
    const j = (i + 1) % this.BUF
    return this.buf[i] * (1 - frac) + this.buf[j] * frac
  }

  process(inputs, outputs, params) {
    const input = inputs[0]
    const output = outputs[0]
    if (!output || output.length === 0) return true
    if (!input || input.length === 0) {
      for (let c = 0; c < output.length; c++) output[c].fill(0)
      return true
    }
    const ch0 = input[0]
    const n = ch0.length
    const strength = params.strength[0]
    const intel = params.intelligibility[0]
    const pitchBias = params.pitchBias[0]
    const randomization = params.randomization[0]

    const baseRate = Math.pow(2, pitchBias / 12)
    const jitterAmt = 0.07 * strength * (0.35 + randomization)
    const ringDepth = 0.55 * strength * (1 - 0.7 * intel)
    const G = this.G
    const twoPi = 2 * Math.PI

    for (let s = 0; s < n; s++) {
      this.buf[this.writeIdx] = ch0[s]

      // Time-varying pitch ratio (random walk → wandering intonation).
      this.jit += (this._rand() - 0.5) * 0.02
      this.jit *= 0.995
      if (this.jit > 1) this.jit = 1
      else if (this.jit < -1) this.jit = -1
      const rate = baseRate * (1 + this.jit * jitterAmt)

      // Two-tap granular pitch shifter (delay-line phasor).
      this.p0 += (1 - rate)
      while (this.p0 >= G) this.p0 -= G
      while (this.p0 < 0) this.p0 += G
      const p1 = (this.p0 + G / 2) % G
      const w0 = 0.5 - 0.5 * Math.cos((twoPi * this.p0) / G)
      const w1 = 0.5 - 0.5 * Math.cos((twoPi * p1) / G)
      let v = this._read(this.writeIdx - this.p0) * w0 + this._read(this.writeIdx - p1) * w1
      const wsum = w0 + w1
      if (wsum > 1e-4) v /= wsum

      // Drifting ring modulation smears timbre/formant cues.
      this.carrier += (this._rand() - 0.5) * 0.5
      if (this.carrier < 14) this.carrier = 14
      else if (this.carrier > 85) this.carrier = 85
      this.ringPhase += (twoPi * this.carrier) / sampleRate
      if (this.ringPhase > twoPi) this.ringPhase -= twoPi
      v *= (1 - ringDepth) + ringDepth * Math.sin(this.ringPhase)

      for (let c = 0; c < output.length; c++) output[c][s] = v
      this.writeIdx = (this.writeIdx + 1) % this.BUF
    }
    return true
  }
}

registerProcessor('voice-mask-processor', VoiceMaskProcessor)
