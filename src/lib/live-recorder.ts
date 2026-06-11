export class LiveRecorder {
  private recorder: MediaRecorder | null = null
  private chunks: Blob[] = []
  private stream: MediaStream | null = null

  start(canvas: HTMLCanvasElement, fps = 24, audioTrack?: MediaStreamTrack | null): boolean {
    if (this.recorder?.state === 'recording') return true
    this.chunks = []
    try {
      this.stream = canvas.captureStream(fps)
      // Mix the live microphone track in so the capture carries audio. The track
      // is cloned so stopping the recorder never kills the live preview's mic.
      const hasAudio = !!audioTrack && audioTrack.readyState === 'live'
      if (hasAudio) this.stream.addTrack(audioTrack!.clone())
      const mime = hasAudio
        ? (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
          ? 'video/webm;codecs=vp9,opus'
          : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
            ? 'video/webm;codecs=vp8,opus'
            : MediaRecorder.isTypeSupported('video/webm')
              ? 'video/webm'
              : '')
        : (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : MediaRecorder.isTypeSupported('video/webm')
            ? 'video/webm'
            : '')
      this.recorder = mime
        ? new MediaRecorder(this.stream, {
          mimeType: mime,
          audioBitsPerSecond: 128_000,
          videoBitsPerSecond: 4_000_000,
        })
        : new MediaRecorder(this.stream)
      this.recorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.chunks.push(e.data)
      }
      this.recorder.start(200)
      return true
    } catch {
      this.stopTracks()
      return false
    }
  }

  isRecording(): boolean {
    return this.recorder?.state === 'recording'
  }

  stop(): Promise<Blob | null> {
    return new Promise((resolve) => {
      const rec = this.recorder
      if (!rec || rec.state === 'inactive') {
        this.stopTracks()
        resolve(null)
        return
      }
      rec.onstop = () => {
        const type = rec.mimeType || 'video/webm'
        const blob = this.chunks.length > 0 ? new Blob(this.chunks, { type }) : null
        this.chunks = []
        this.recorder = null
        this.stopTracks()
        resolve(blob)
      }
      rec.stop()
    })
  }

  private stopTracks() {
    this.stream?.getTracks().forEach((t) => t.stop())
    this.stream = null
  }
}
