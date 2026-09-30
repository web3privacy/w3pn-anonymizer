import { chromium } from 'playwright'
import sharp from 'sharp'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const base = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:5173'
const check = (ok, message) => { if (!ok) throw new Error(message) }
const dir = await mkdtemp(join(tmpdir(), 'anonymizer-brush-startup-'))
const input = join(dir, 'texture.png')
const width = 600, height = 400, pixels = Buffer.alloc(width * height * 3)
for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
  const i = (y * width + x) * 3
  pixels[i] = (x * 17 + y * 13) % 256
  pixels[i + 1] = (x * 3 + y * 19) % 256
  pixels[i + 2] = 100 + x % 100
}
await sharp(pixels, { raw: { width, height, channels: 3 } }).png().toFile(input)
const browser = await chromium.launch()
try {
  // Fresh browser context for EVERY effect; no switching photos to initialize it.
  for (const effect of (process.env.BRUSH_EFFECTS?.split(',') ?? ['Pixelate', 'Blur', 'Zoom Blur', 'Blackout', 'Emoji', 'Noise', 'Glitch', 'Color Ball', 'ASCII', 'Custom Image', 'Prism'])) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.addInitScript((cpuOnly) => {
      if (cpuOnly) {
        const getContext = HTMLCanvasElement.prototype.getContext
        HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
          return kind === 'webgl2' ? null : getContext.call(this, kind, ...args)
        }
      }
      const decode = window.createImageBitmap
      window.delayedPreviewsStarted = 0
      window.delayedPreviewsFinished = 0
      window.createImageBitmap = async (...args) => {
        const slow = args[0] instanceof Blob && args[0].type === 'image/jpeg'
        if (slow) {
          window.delayedPreviewsStarted++
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
        const bitmap = await decode(...args)
        if (slow) window.delayedPreviewsFinished++
        return bitmap
      }
    }, process.env.EFFECT_CPU_ONLY === '1')
    await page.goto(base, { waitUntil: 'networkidle' })
    await page.locator('input[type=file]').first().setInputFiles(input)
    await page.waitForFunction(() => window.delayedPreviewsStarted > 0)
    if (effect !== 'Pixelate') {
      await page.getByRole('button', { name: /^Effect: / }).click()
      await page.locator('.ts-effect-tile').filter({ has: page.locator('.ts-effect-tile-label', { hasText: new RegExp(`^${effect}$`) }) }).click()
      const pickerClose = page.locator('.effect-picker-close')
      if (await pickerClose.count()) await pickerClose.click()
      else await page.keyboard.press('Escape')
    }
    const canvas = page.locator('.viewer canvas:not(.brush-preview-overlay):not(.video-distort-preview)').first()
    const hash = () => canvas.evaluate((c) => {
      let h = 2166136261
      for (const byte of c.getContext('2d').getImageData(0, 0, c.width, c.height).data) h = Math.imul(h ^ byte, 16777619)
      return h >>> 0
    })
    const before = await hash()
    const box = await canvas.boundingBox()
    await page.mouse.move(box.x + box.width * .5, box.y + box.height * .5)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width * .6, box.y + box.height * .5, { steps: 8 })
    await page.mouse.up()
    await page.mouse.move(0, 0)
    const painted = await hash()
    check(painted !== before, `${effect}: first brush stroke did not change the photo`)
    check(await page.evaluate(() => window.delayedPreviewsFinished < window.delayedPreviewsStarted), `${effect}: test missed the preview/brush race`)
    await page.waitForFunction(() => window.delayedPreviewsFinished === window.delayedPreviewsStarted)
    await page.waitForTimeout(200)
    check(await hash() === painted, `${effect}: old startup preview overwrote the first stroke`)
    await page.locator('button[title="Undo last edit"]').click()
    check(await hash() === before, `${effect}: Undo did not restore the photo`)
    check(errors.length === 0, errors.join('\n'))
    console.log(`${effect}: first stroke persists across delayed preview; Undo works${process.env.EFFECT_CPU_ONLY === '1' ? ' (CPU)' : ''}`)
    await context.close()
  }
  // Opening Tools activates its already-selected brush on the first mobile visit.
  for (const [width, height] of [[390, 844], [768, 1024], [844, 390]]) {
    const page = await browser.newPage({ viewport: { width, height }, isMobile: true, hasTouch: true })
    await page.goto(base, { waitUntil: 'networkidle' })
    await page.locator('input[type=file]').first().setInputFiles(input)
    await page.locator('.mobile-tool-btn:has-text("TOOLS")').click()
    await page.getByRole('dialog', { name: 'Brush / Zone', exact: true }).waitFor()
    // Do not click Brush again: the UI already displays it as selected.
    await page.keyboard.press('Escape')
    await page.waitForTimeout(400)
    const canvas = page.locator('.viewer canvas:not(.brush-preview-overlay):not(.video-distort-preview)').first()
    const hash = () => canvas.evaluate((c) => {
      let h = 2166136261
      for (const byte of c.getContext('2d').getImageData(0, 0, c.width, c.height).data) h = Math.imul(h ^ byte, 16777619)
      return h >>> 0
    })
    const before = await hash(), box = await canvas.boundingBox()
    await page.mouse.move(box.x + box.width * .5, box.y + box.height * .5)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width * .65, box.y + box.height * .5, { steps: 8 })
    await page.mouse.up()
    await page.mouse.move(0, 0)
    const painted = await hash()
    check(painted !== before, `${width}: opening Tools did not activate the selected brush`)
    await page.waitForTimeout(300)
    check(await hash() === painted, `${width}: first mobile brush stroke disappeared`)
    console.log(`${width}×${height}: first Tools visit activates brush and retains the stroke`)
    await page.close()
  }
  // A real detected-faces summary must live inside the header and leave quickly.
  for (const [width, height] of [[320, 568], [390, 844], [844, 390], [1025, 560], [1440, 900]]) {
    const page = await browser.newPage({ viewport: { width, height }, isMobile: width <= 1024, hasTouch: width <= 1024 })
    await page.goto(base, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: /LOAD DEMO/i }).click()
    await page.waitForFunction(() => document.querySelector('.app-status-notice')?.textContent.includes('Detected'))
    const notice = page.locator('.app-status-notice').first()
    check(await notice.evaluate((el) => {
      const header = el.closest('header')
      if (!header) return false
      const r = el.getBoundingClientRect(), h = header.getBoundingClientRect()
      return r.x >= h.x && r.right <= h.right && r.y >= h.y && r.bottom <= h.bottom
    }), `${width}: notice covers the photo/outside header`)
    check(await page.locator('.local-proof-badge').count() === 0, 'Duplicate persistent photo badge remains')
    const actions = page.locator('header .topbar-live-btn, header .mobile-topbar-v2-right').first()
    const nr = await notice.boundingBox(), ar = await actions.boundingBox()
    check(nr.x + nr.width <= ar.x, `${width}: notice overlaps header actions`)
    if (process.env.BRUSH_SCREENSHOTS) await page.screenshot({ path: join(process.env.BRUSH_SCREENSHOTS, `notice-${width}.png`) })
    await notice.waitFor({ state: 'hidden', timeout: 2300 })
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}: horizontal overflow`)
    console.log(`${width}×${height}: real detection notice inside header, gone within 2 seconds`)
    await page.close()
  }
} finally {
  await browser.close()
  await rm(dir, { recursive: true, force: true })
}
