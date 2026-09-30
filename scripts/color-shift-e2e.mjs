import { chromium } from 'playwright'
const base = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:5173'
const browser = await chromium.launch()
try {
  const cases = []
  for (const hue of [0, 60, 180, 360]) for (const sat of [0, 35, 100]) cases.push({ hue, sat })
  const outputs = []
  for (const cpuOnly of [false, true]) {
    const context = await browser.newContext()
    const page = await context.newPage()
    if (cpuOnly) await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function (kind, ...args) { return kind === 'webgl2' ? null : get.call(this, kind, ...args) }
    })
    await page.goto(base)
    outputs.push(await page.evaluate(async (cases) => {
      const { applyGlitchEffect } = await import('/src/lib/effects.ts')
      const canvas = document.createElement('canvas'); canvas.width = 80; canvas.height = 48
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      const source = ctx.createImageData(80, 48)
      for (let y = 0; y < 48; y++) for (let x = 0; x < 80; x++) {
        const i = (y * 80 + x) * 4
        source.data.set([x * 3, y * 5, (x + y) * 2, 255], i)
      }
      ctx.putImageData(source, 0, 0)
      const results = []
      for (const { hue, sat } of cases) {
        const result = await applyGlitchEffect(canvas, { subEffect: 'color-shift', amount: 40, seed: 42, halftoneDotSize: 8, halftoneShape: 'circle', colorShiftHue: hue, colorShiftSat: sat })
        const pixels = result.getContext('2d').getImageData(0, 0, 80, 48).data
        results.push([...pixels])
      }
      return results
    }, cases))
    await context.close()
  }
  const results = cases.map((params, index) => {
    const gpu = outputs[0][index], cpu = outputs[1][index]
    let maxDifference = 0, sum = 0
    for (let i = 0; i < gpu.length; i++) { maxDifference = Math.max(maxDifference, Math.abs(gpu[i] - cpu[i])); if (i % 4 !== 3) sum += gpu[i] }
    return { ...params, maxDifference, averageRgb: sum / (80 * 48 * 3) }
  })
  console.log(JSON.stringify(results, null, 2))
  if (results.some((r) => r.averageRgb < 20 || r.maxDifference > 3)) throw new Error('Color Shift darkened the image or differed from the CPU reference')
} finally { await browser.close() }
