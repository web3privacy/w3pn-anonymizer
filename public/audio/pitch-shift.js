/* Bounded dual-delay pitch shifter for video: preserve the original playback speed. */
class VideoPitchShift extends AudioWorkletProcessor {
  static get parameterDescriptors() { return [{ name: 'semitones', defaultValue: 0, minValue: -24, maxValue: 24, automationRate: 'k-rate' }] }
  constructor() {
    super()
    this.buffers = [new Float32Array(8192), new Float32Array(8192)]
    this.position = 0
    this.phase = 0
  }
  process(inputs, outputs, parameters) {
    const input = inputs[0], output = outputs[0]
    if (!input?.length) return true
    const rate = Math.pow(2, parameters.semitones[0] / 12)
    const window = Math.round(sampleRate * 0.04)
    for (let i = 0; i < output[0].length; i++) {
      const a = this.phase, b = (a + 0.5) % 1
      const weight = 0.5 - 0.5 * Math.cos(2 * Math.PI * a)
      for (let channel = 0; channel < output.length; channel++) {
        const source = input[channel] ?? input[0]
        const ring = this.buffers[Math.min(channel, 1)]
        ring[this.position] = source[i]
        const read = (phase) => {
          const delay = 2 + (rate >= 1 ? 1 - phase : phase) * window
          const index = (this.position - delay + ring.length) % ring.length
          const lower = Math.floor(index), fraction = index - lower
          return ring[lower] * (1 - fraction) + ring[(lower + 1) % ring.length] * fraction
        }
        output[channel][i] = Math.abs(rate - 1) < 0.0001 ? source[i] : read(a) * weight + read(b) * (1 - weight)
      }
      this.position = (this.position + 1) % 8192
      this.phase = (this.phase + Math.abs(rate - 1) / window) % 1
    }
    return true
  }
}
registerProcessor('video-pitch-shift', VideoPitchShift)
