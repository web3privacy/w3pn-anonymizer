/**
 * Noise gate AudioWorklet — attenuates input below a threshold with smooth
 * attack/release so background hiss and room tone don't carry speaker cues
 * through silences. Local-only, stateless beyond envelope.
 */
class NoiseGateProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'threshold', defaultValue: 0.015, minValue: 0, maxValue: 0.5, automationRate: 'k-rate' },
      { name: 'attack', defaultValue: 0.005, minValue: 0.0005, maxValue: 0.1, automationRate: 'k-rate' },
      { name: 'release', defaultValue: 0.08, minValue: 0.005, maxValue: 1, automationRate: 'k-rate' },
    ]
  }

  constructor() {
    super()
    this._env = 0
  }

  process(inputs, outputs, params) {
    const input = inputs[0]
    const output = outputs[0]
    if (!input || input.length === 0) return true
    const threshold = params.threshold[0]
    const attack = params.attack[0]
    const release = params.release[0]
    const ch0 = input[0]
    const n = ch0.length
    const dt = 1 / sampleRate
    const aCoef = Math.exp(-dt / attack)
    const rCoef = Math.exp(-dt / release)

    for (let i = 0; i < n; i++) {
      const a = Math.abs(ch0[i])
      const target = a > threshold ? 1 : 0
      const coef = target > this._env ? aCoef : rCoef
      this._env = target + (this._env - target) * coef
      for (let c = 0; c < output.length; c++) {
        const inCh = input[c] || ch0
        output[c][i] = inCh[i] * this._env
      }
    }
    return true
  }
}

registerProcessor('noise-gate-processor', NoiseGateProcessor)
