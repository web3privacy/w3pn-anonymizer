import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage()
  await page.goto('http://127.0.0.1:5173')
  const results = await page.evaluate(async () => {
    const { pixelatePixels } = await import('/src/lib/pixelate-pixels.ts')
    const { glApplyPixelateRect, pixelateStrengthForBlockSize } = await import('/src/lib/gl/pixelate-gl.ts')
    const results = []
    for (const transparent of [false, true]) for (const [width, height] of [[29, 37], [120, 93], [64, 64]]) {
      const source = document.createElement('canvas')
      source.width = width; source.height = height
      const ctx = source.getContext('2d', { willReadFrequently: true })
      const pixels = ctx.createImageData(width, height)
      for (let index = 0; index < pixels.data.length; index += 4) {
        pixels.data[index] = (index * 13) % 256
        pixels.data[index + 1] = (index * 7) % 256
        pixels.data[index + 2] = (index * 3) % 256
        pixels.data[index + 3] = transparent ? 32 + (index * 11) % 224 : 255
      }
      ctx.putImageData(pixels, 0, 0)
      for (const block of [4, 7, 20, 35, 52]) {
        const gpu = glApplyPixelateRect(source, width, height, pixelateStrengthForBlockSize(block))
        if (!gpu) throw new Error('GPU unavailable for pixel parity test')
        const out = document.createElement('canvas'); out.width = width; out.height = height
        const outCtx = out.getContext('2d', { willReadFrequently: true })
        outCtx.drawImage(gpu, 0, 0)
        const expected = outCtx.getImageData(0, 0, width, height).data
        const cpu = document.createElement('canvas'); cpu.width = width; cpu.height = height
        const cpuCtx = cpu.getContext('2d', { willReadFrequently: true })
        const sampled = ctx.getImageData(0, 0, width, height)
        sampled.data.set(pixelatePixels(sampled.data, width, height, block))
        cpuCtx.putImageData(sampled, 0, 0)
        const actual = cpuCtx.getImageData(0, 0, width, height).data
        let maxDifference = 0
        for (let index = 0; index < actual.length; index++) maxDifference = Math.max(maxDifference, Math.abs(actual[index] - expected[index]))
        results.push({ transparent, width, height, block, maxDifference })
      }
    }
    const { applyEffectRect } = await import('/src/lib/effects.ts')
    const masked = document.createElement('canvas'); masked.width = 80; masked.height = 80
    const ctx = masked.getContext('2d', { willReadFrequently: true })
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 80, 80)
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 40, 80)
    const original = ctx.getImageData(0, 0, 80, 80).data
    ctx.save(); ctx.beginPath(); ctx.arc(40, 40, 20, 0, Math.PI * 2); ctx.clip()
    applyEffectRect(ctx, 'pixelate', 0, 0, 80, 80, 0.7, '')
    ctx.restore()
    const pixels = ctx.getImageData(0, 0, 80, 80).data
    for (let y = 0; y < 80; y++) for (let x = 0; x < 80; x++) {
      if (Math.hypot(x - 40, y - 40) < 22) continue
      for (let channel = 0; channel < 4; channel++) {
        const index = (y * 80 + x) * 4 + channel
        if (pixels[index] !== original[index]) throw new Error('Pixelate ignored circular clipping')
      }
    }
    return results
  })
  console.log(JSON.stringify(results, null, 2))
  if (results.some((result) => result.maxDifference > 2)) throw new Error('CPU mosaic differs from GPU reference')
} finally { await browser.close() }
