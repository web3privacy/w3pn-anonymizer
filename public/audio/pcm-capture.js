/* Local PCM bridge: bounded 2048-sample messages, including the final partial block. */
class PcmCapture extends AudioWorkletProcessor {
  constructor() {
    super()
    this.active = false
    this.left = new Float32Array(2048)
    this.right = new Float32Array(2048)
    this.count = 0
    this.port.onmessage = ({ data }) => {
      this.active = data === 'start'
      if (data === 'stop') { this.flush(); this.port.postMessage('stopped') }
    }
  }
  flush() {
    if (!this.count) return
    const left = this.left.slice(0, this.count), right = this.right.slice(0, this.count)
    this.port.postMessage([left, right], [left.buffer, right.buffer])
    this.count = 0
  }
  process(inputs) {
    if (this.active && inputs[0]?.[0]) {
      const left = inputs[0][0], right = inputs[0][1] ?? left
      for (let i = 0; i < left.length; i++) {
        this.left[this.count] = left[i]; this.right[this.count] = right[i]
        if (++this.count === this.left.length) this.flush()
      }
    }
    return true
  }
}
registerProcessor('pcm-capture', PcmCapture)
