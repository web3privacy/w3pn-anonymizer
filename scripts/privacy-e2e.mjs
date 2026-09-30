import { writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
const browser = await chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] })
try {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  const requests = []
  page.on('request', (request) => requests.push(request.url()))
  await page.goto(process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:5173', { waitUntil: 'networkidle' })
  await page.locator('.desktop-home-v2-actions').waitFor()
  assert(!requests.some((url) => /\.(onnx|wasm)(\?|$)/.test(url)), 'home fetched a model or WASM')
  console.log('PASS: menu available without model/WASM downloads')
  const result = await page.evaluate(async () => {
    const { processVideo, normalizeRecordedVideoBlob, drawVideoZones } = await import('/src/lib/video.ts')
    const { VideoTempFile, releaseVideoFile } = await import('/src/lib/video-storage.ts')
    const canvas = document.createElement('canvas'); canvas.width = 160; canvas.height = 120
    const ctx = canvas.getContext('2d'); ctx.fillStyle = 'white'; ctx.fillRect(0, 0, 160, 120)
    const stream = canvas.captureStream(30)
    const audio = new AudioContext({ sampleRate: 48000 })
    const oscillator = audio.createOscillator(); oscillator.frequency.value = 200
    const gain = audio.createGain(); gain.gain.value = 0.2
    const destination = audio.createMediaStreamDestination()
    oscillator.connect(gain).connect(destination); oscillator.start()
    stream.addTrack(destination.stream.getAudioTracks()[0])
    const chunks = []
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus' })
    recorder.ondataavailable = ({ data }) => chunks.push(data)
    const stopped = new Promise((resolve) => { recorder.onstop = resolve })
    recorder.start()
    const interval = setInterval(() => { ctx.fillStyle = 'white'; ctx.fillRect(0, 0, 160, 120) }, 30)
    await new Promise((resolve) => setTimeout(resolve, 1050)); recorder.stop(); await stopped
    clearInterval(interval); stream.getTracks().forEach((track) => track.stop()); await audio.close()
    let source = new Blob(chunks, { type: 'video/webm' })
    // Browser recordings have no duration until repaired.
    source = await normalizeRecordedVideoBlob(source, 'video/webm')
    const pixels = []
    const options = {
      onRenderFrame: ({ canvas }) => { pixels.push([...canvas.getContext('2d').getImageData(80, 60, 1, 1).data]) },
      effect: 'blackout', strength: 1, emoji: '🙂', outputFormat: 'webm', audioPrivacyMode: 'remove_audio',
      detectionConfig: [{ type: 'face', enabled: false }], modelStatus: {},
      timedZones: [{ id: 'manual', startSec: 0, endSec: 20, zone: { id: 'z', x: 0.25, y: 0.25, width: 0.5, height: 0.5, effect: 'blackout', emoji: '🙂' } }],
    }
    const before = document.querySelectorAll('video').length
    let analysis
    const output = await processVideo(source, { ...options,
      analysisSettings: { mode: 'sampled', samplesPerSecond: 2, passes: 1 }, onAnalysis: (value) => { analysis = value } })
    const firstSampleCount = analysis.samples.length
    const extra = await processVideo(source, { ...options,
      analysisSettings: { mode: 'sampled', samplesPerSecond: 2, passes: 1 }, previousAnalysis: analysis,
      additionalAnalysisPass: true, onAnalysis: (value) => { analysis = value } })
    const extraSampleCount = analysis.samples.length
    const extraPasses = analysis.passes
    const originalSamplesRetained = analysis.samples.some((sample) => sample.timeSec === 0)
    await releaseVideoFile(extra)
    const everyFrame = await processVideo(source, { ...options,
      analysisSettings: { mode: 'every-frame', samplesPerSecond: 2, passes: 1 },
      frameOverrides: [{ timeSec: 0, frameBlob: await new Promise((resolve) => canvas.toBlob(resolve)) }],
      onAnalysis: (value) => { analysis = value } })
    const fullFrameCoverage = analysis.fullFrameCoverage
    const everyFrameCount = analysis.samples.length
    await releaseVideoFile(everyFrame)
    const url = URL.createObjectURL(output)
    const video = document.createElement('video'); video.muted = true; video.src = url
    await new Promise((resolve, reject) => { video.onloadeddata = resolve; video.onerror = reject })
    document.body.appendChild(video)
    await new Promise(async (resolve) => { video.requestVideoFrameCallback(resolve); await video.play() })
    video.pause()
    const duration = video.duration
    canvas.width = video.videoWidth; canvas.height = video.videoHeight
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(video, 0, 0)
    const dimensions = [video.videoWidth, video.videoHeight]
    const masked = [...ctx.getImageData(80, 60, 1, 1).data]
    const unmasked = [...ctx.getImageData(10, 10, 1, 1).data]
    video.removeAttribute('src'); video.load(); video.remove(); URL.revokeObjectURL(url)
    const distorted = await processVideo(source, { ...options, audioPrivacyMode: 'distort_voice',
      audioSettings: { mode: 'distort_voice', preset: 'custom', intensity: 1, pitchSemitones: 12, ringModFrequency: 0, highpassHz: 20, lowpassHz: 10000 } })
    const decode = new AudioContext()
    const buffer = await decode.decodeAudioData(await distorted.arrayBuffer())
    const samples = buffer.getChannelData(0)
    let crossings = 0
    const from = Math.round(buffer.sampleRate * 0.2), to = Math.min(samples.length, Math.round(buffer.sampleRate * 0.8))
    for (let i = from; i < to; i++) if (samples[i] > 0 && samples[i - 1] <= 0) crossings++
    const frequency = crossings / ((to - from) / buffer.sampleRate)
    await decode.close()
    const nativeEncoder = window.VideoEncoder
    let fallback
    try {
      window.VideoEncoder = undefined
      fallback = await processVideo(source, options)
    } finally { window.VideoEncoder = nativeEncoder }
    let mp4Result = { supported: false }
    const avc = await VideoEncoder.isConfigSupported({ codec: 'avc1.42E01E', width: 160, height: 120, bitrate: 6000000, framerate: 30 })
    if (avc.supported) {
      const aac = typeof AudioEncoder !== 'undefined' && (await AudioEncoder.isConfigSupported({ codec: 'mp4a.40.2', sampleRate: 48000, numberOfChannels: 2, bitrate: 128000 })).supported
      const mp4 = await processVideo(source, { ...options, outputFormat: 'mp4', audioPrivacyMode: aac ? 'keep_original' : 'remove_audio' })
      const mp4Url = URL.createObjectURL(mp4)
      const player = document.createElement('video'); player.muted = true; player.src = mp4Url
      await new Promise((resolve, reject) => { player.onloadeddata = resolve; player.onerror = reject })
      document.body.appendChild(player)
      await new Promise(async (resolve) => { player.requestVideoFrameCallback(resolve); await player.play() })
      player.pause(); ctx.drawImage(player, 0, 0)
      mp4Result = { supported: true, audio: aac, duration: player.duration, size: mp4.size, center: [...ctx.getImageData(80, 60, 1, 1).data] }
      player.removeAttribute('src'); player.load(); player.remove(); URL.revokeObjectURL(mp4Url)
      await releaseVideoFile(mp4)
    }
    // Abort a pending export and verify that hidden media resources disappear.
    const abort = new AbortController()
    const cancelled = processVideo(source, { ...options, abortSignal: abort.signal })
    setTimeout(() => abort.abort(), 40)
    let abortName = ''
    try { await cancelled } catch (error) { abortName = error.name }
    // Cancellation after disk spooling begins must also remove partial files.
    const renderAbort = new AbortController()
    let renderAbortName = ''
    try { await processVideo(source, { ...options, abortSignal: renderAbort.signal,
      onRenderFrame: ({ frameIndex }) => { if (frameIndex === 2) renderAbort.abort() } }) }
    catch (error) { renderAbortName = error.name }
    let fallbackAbortName = ''
    const fallbackAbort = new AbortController()
    let renderingPhases = 0
    try {
      window.VideoEncoder = undefined
      await processVideo(source, { ...options, abortSignal: fallbackAbort.signal,
        onPhase: (phase) => { if (phase === 'rendering' && ++renderingPhases === 2) setTimeout(() => fallbackAbort.abort(), 80) } })
    } catch (error) { fallbackAbortName = error.name }
    finally { window.VideoEncoder = nativeEncoder }
    // Verify all mask effects on a patterned image, with real canvas/GL execution.
    const custom = document.createElement('canvas'); custom.width = 32; custom.height = 32
    custom.getContext('2d').fillStyle = '#e41028'; custom.getContext('2d').fillRect(0, 0, 32, 32)
    const bitmap = await createImageBitmap(custom)
    const effects = ['blur', 'pixelate', 'zoom-blur', 'blackout', 'emoji', 'noise', 'glitch', 'thermal', 'ascii', 'contour', 'custom-image', 'prism']
    const effectResults = []
    for (const effect of effects) {
      for (let y = 0; y < 120; y++) for (let x = 0; x < 160; x++) {
        ctx.fillStyle = `rgb(${(x * 17 + y * 3) % 256},${(x * 7 + y * 11) % 256},${(x * 19 + y * 13) % 256})`
        ctx.fillRect(x, y, 1, 1)
      }
      const original = ctx.getImageData(0, 0, 160, 120).data
      drawVideoZones(ctx, [{ id: 'effect-test', x: 0.25, y: 0.25, width: 0.5, height: 0.5, effect, emoji: '🙂', maskShape: 'circle' }], 160, 120, 0.85,
        { customImages: [{ id: 'asset', imageBitmap: bitmap }] })
      const rendered = ctx.getImageData(0, 0, 160, 120).data
      let changed = 0, outsideChanged = 0
      for (let y = 0; y < 120; y++) for (let x = 0; x < 160; x++) {
        const pos = (y * 160 + x) * 4
        const differs = rendered[pos] !== original[pos] || rendered[pos + 1] !== original[pos + 1] || rendered[pos + 2] !== original[pos + 2]
        if (differs) changed++
        if (differs && ((x - 80) ** 2 / 40 ** 2 + (y - 60) ** 2 / 30 ** 2 > 1.15)) outsideChanged++
      }
      effectResults.push({ effect, changed, outsideChanged })
    }
    bitmap.close()
    // Exceed the former 160 MiB output cap using bounded, drained writes.
    const nativeWritable = FileSystemFileHandle.prototype.createWritable
    let workerBytes
    try {
      FileSystemFileHandle.prototype.createWritable = undefined
      const workerFile = await VideoTempFile.create()
      workerFile.write(new Uint8Array([1, 3, 7]))
      const workerOutput = await workerFile.finish()
      workerBytes = [...new Uint8Array(await workerOutput.arrayBuffer())]
      await releaseVideoFile(workerOutput)
    } finally { FileSystemFileHandle.prototype.createWritable = nativeWritable }
    const largeFile = await VideoTempFile.create()
    const block = new Uint8Array(1024 * 1024).fill(77)
    for (let i = 0; i < 180; i++) { largeFile.write(block); await largeFile.drain() }
    const large = await largeFile.finish('video/webm')
    const largeBytes = large.size
    const tail = new Uint8Array(await large.slice(-1).arrayBuffer())[0]
    await releaseVideoFile(large)
    const result = { firstSampleCount, extraSampleCount, extraPasses, originalSamplesRetained, fullFrameCoverage, everyFrameCount,
      effectResults, workerBytes, mp4Result, largeBytes, tail, renderAbortName, fallbackAbortName,
      fallbackBytes: fallback.size, dimensions, pixels: pixels.slice(0, 2), size: output.size, type: output.type, duration, masked, unmasked, frequency, audioDuration: buffer.duration, abortName,
      leakedVideos: document.querySelectorAll('video').length - before }
    await Promise.all([output, distorted, fallback].map(releaseVideoFile))
    let remainingFiles = 0
    const remainingSizes = []
    const root = await navigator.storage.getDirectory()
    for await (const [name, entry] of root.entries()) {
      if (name.startsWith('anonymizer-video-') && entry.kind === 'directory') {
        for await (const child of entry.values()) if (child.kind === 'file') { remainingFiles++; remainingSizes.push((await child.getFile()).size) }
      }
    }
    return { ...result, remainingFiles, remainingSizes, sourceBytes: [...new Uint8Array(await source.arrayBuffer())] }
  })
  await writeFile('/tmp/anonymizer-ui-fixture.webm', Buffer.from(result.sourceBytes))
  delete result.sourceBytes
  console.log(JSON.stringify(result, null, 2))
  assert(result.extraSampleCount > result.firstSampleCount)
  assert.equal(result.extraPasses, 2)
  assert(result.originalSamplesRetained)
  assert(result.fullFrameCoverage)
  assert(result.everyFrameCount > result.extraSampleCount)
  assert.equal(result.largeBytes, 180 * 1024 * 1024)
  assert.equal(result.tail, 77)
  assert.deepEqual(result.workerBytes, [1, 3, 7])
  assert.equal(result.remainingFiles, 0)
  assert.equal(result.renderAbortName, 'AbortError')
  assert.equal(result.fallbackAbortName, 'AbortError')
  for (const effect of result.effectResults) {
    assert(effect.changed > 0, `${effect.effect} did not render`)
    assert.equal(effect.outsideChanged, 0, `${effect.effect} escaped its circle mask`)
  }
  if (result.mp4Result.supported) {
    assert(result.mp4Result.duration > 0.9 && result.mp4Result.duration < 1.3)
    assert(result.mp4Result.center.slice(0, 3).every((value) => value < 20))
  }
  assert(result.fallbackBytes > 0)
  assert.equal(result.type, 'video/webm')
  assert(result.size > 0)
  assert(result.duration > 0.9 && result.duration < 1.3)
  assert(result.masked.slice(0, 3).every((channel) => channel < 20), 'mask missing from first exported frame')
  assert(result.unmasked.slice(0, 3).every((channel) => channel > 230))
  assert(result.frequency > 350 && result.frequency < 450, `pitch not applied: ${result.frequency}`)
  assert(result.audioDuration > 0.9 && result.audioDuration < 1.3)
  assert.equal(result.abortName, 'AbortError')
  assert.equal(result.leakedVideos, 0)
  assert.deepEqual(errors, [])
  console.log('PASS: actual WebM masking, voice processing, duration, abort and cleanup')
} finally { await browser.close() }
