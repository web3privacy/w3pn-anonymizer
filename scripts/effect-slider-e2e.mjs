import { chromium } from 'playwright'

const base = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:4173'
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  if (process.env.EFFECT_CPU_ONLY === '1') await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      if (kind === 'webgl2') return null
      return getContext.call(this, kind, ...args)
    }
  })
  await page.addInitScript(() => {
    window.effectTimings = []
    window.effectDecodes = 0
    window.effectTextures = 0
    window.effectPaints = []
    const decode = window.createImageBitmap
    window.createImageBitmap = (...args) => { window.effectDecodes += 1; return decode(...args) }
    const texture = WebGL2RenderingContext.prototype.createTexture
    WebGL2RenderingContext.prototype.createTexture = function () {
      window.effectTextures += 1
      return texture.call(this)
    }
    const draw = CanvasRenderingContext2D.prototype.drawImage
    CanvasRenderingContext2D.prototype.drawImage = function (...args) {
      const start = performance.now()
      const result = draw.apply(this, args)
      window.effectTimings.push(performance.now() - start)
      if (this.canvas.isConnected && this.canvas.closest('.viewer')) window.effectPaints.push(performance.now())
      return result
    }
  })
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /LOAD DEMO/i }).click()
  await page.locator('.photo-item', { hasText: process.env.EFFECT_DEMO_NAME ?? 'demo-5.png' }).click()
  await page.waitForFunction(() => Number(document.querySelector('.ts-face-count-inline')?.textContent) > 0)
  await page.getByRole('button', { name: 'Anonymize', exact: true }).click()
  await page.waitForFunction(() => !document.querySelector('.corner-btn-anonymize'))
  await page.waitForTimeout(500)
  const slider = page.getByRole('slider', { name: 'Effect strength', exact: true })
  const values = [4, 8, 15, 35, 50]
  const runs = []
  for (const value of values) {
    await page.evaluate(() => { window.effectTimings = []; window.effectPaints = []; window.effectDecodes = 0; window.effectTextures = 0; window.effectInputAt = performance.now() })
    await slider.fill(String(value))
    await page.waitForTimeout(300)
    runs.push(await page.evaluate(() => ({ calls: window.effectTimings.length, drawMs: window.effectTimings.reduce((a, b) => a + b, 0), decodes: window.effectDecodes, textures: window.effectTextures, finalPaintMs: window.effectPaints.at(-1) - window.effectInputAt })))
  }
  console.log(JSON.stringify({ base, faces: await page.locator('.ts-face-count-inline').textContent(), runs, errors }, null, 2))
  const hash = async () => page.evaluate(() => {
    const canvas = document.querySelector('.viewer canvas:not(.brush-preview-overlay):not(.video-distort-preview)')
    const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
    let hash = 2166136261
    for (const byte of data) hash = Math.imul(hash ^ byte, 16777619)
    return hash >>> 0
  })
  const stable = await hash()
  // Fast direction reversals must end at the same pixels as an isolated update.
  for (const value of [8, 20, 4, 40, 10, 50]) await slider.fill(String(value))
  await page.waitForTimeout(700)
  if (await hash() !== stable) throw new Error('Rapid slider reversal published stale or partial pixels')
  console.log('Rapid slider reversal: final pixels match isolated render')
  for (const effect of ['Blur', 'Zoom Blur', 'Noise', 'Glitch', 'Color Ball', 'Prism']) {
    await page.getByRole('button', { name: /^Effect: / }).click()
    await page.locator('.ts-effect-tile').filter({ hasText: effect }).filter({ has: page.locator('.ts-effect-tile-label', { hasText: new RegExp(`^${effect}$`) }) }).click()
    await page.waitForTimeout(700)
    await slider.fill('65')
    await page.waitForTimeout(700)
    const expected = await hash()
    for (const value of [15, 45, 25, 85, 65]) await slider.fill(String(value))
    await page.waitForTimeout(700)
    // Color Ball intentionally randomizes its palette each application.
    if (effect !== 'Color Ball' && await hash() !== expected) throw new Error(`${effect}: obsolete render overwrote latest strength`)
    if (effect === 'Color Ball') {
      const settled = await hash()
      await page.waitForTimeout(150)
      if (await hash() !== settled) throw new Error('Color Ball did not settle after final slider value')
    }
    console.log(`${effect}: rapid reversal ${effect === 'Color Ball' ? 'settles at final value' : 'matches isolated render'}`)
  }
  // Trigger a fresh status message and inspect the actual rendered style.
  await page.locator('.photo-item', { hasText: process.env.EFFECT_DEMO_NAME === 'demo-1.webp' ? 'demo-5.png' : 'demo-1.webp' }).click()
  await page.waitForFunction(() => document.querySelector('.app-status-notice')?.textContent?.includes('Detected'))
  const notice = await page.locator('.app-status-notice').evaluate((element) => ({
    fontSize: getComputedStyle(element).fontSize,
    icon: element.querySelector('.material-symbols-outlined')?.textContent,
    iconColor: getComputedStyle(element.querySelector('.material-symbols-outlined')).color,
  }))
  console.log(JSON.stringify({ notice, cpuOnly: process.env.EFFECT_CPU_ONLY === '1', errors }))
  if (process.env.EFFECT_SCREENSHOT) await page.screenshot({ path: process.env.EFFECT_SCREENSHOT })
  if (notice.fontSize !== '11px' || notice.iconColor !== 'rgb(112, 255, 136)') throw new Error('Status notice style regression')
  if (errors.length) throw new Error(errors.join('\n'))
} finally {
  await browser.close()
}
