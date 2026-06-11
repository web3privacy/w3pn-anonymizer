/**
 * Level meter AudioWorklet — posts RMS + peak of the input to the main thread
 * (~30 fps). Passes audio through unchanged. No audio is stored or transmitted.
 */
class LevelMeterProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this._frame = 0
    this._peak = 0
  }

  process(inputs, outputs) {
    const input = inputs[0]
    const output = outputs[0]
    if (input && input.length > 0) {
      const ch = input[0]
      let sum = 0
      let peak = 0
      for (let i = 0; i < ch.length; i++) {
        const v = ch[i]
        sum += v * v
        const a = v < 0 ? -v : v
        if (a > peak) peak = a
      }
      const rms = Math.sqrt(sum / Math.max(1, ch.length))
      if (peak > this._peak) this._peak = peak
      // Pass-through copy.
      for (let c = 0; c < output.length; c++) {
        const inCh = input[c] || input[0]
        output[c].set(inCh)
      }
      this._frame += ch.length
      if (this._frame >= 1500) {
        this.port.postMessage({ rms, peak: this._peak })
        this._frame = 0
        this._peak = 0
      }
    }
    return true
  }
}

registerProcessor('level-meter-processor', LevelMeterProcessor)
