import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
const base = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:5173'
const out = resolve(process.env.TYPE_AUDIT_OUT ?? 'docs/typography-2026-09-29/after')
await mkdir(out, { recursive: true })
const check = (ok, message) => { if (!ok) throw new Error(message) }
const browser = await chromium.launch()
const reports = []
try {
  for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [844, 390], [1024, 768], [1025, 560], [1200, 560], [1440, 900], [1920, 1080]]) {
    const mobile = width <= 1024
    const page = await browser.newPage({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile })
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    const visible = (locator) => locator.filter({ visible: true })
    const capture = async (name) => {
      await page.waitForTimeout(150)
      const metrics = await page.evaluate(() => {
        const buttonSizes = {}, labels = []
        for (const el of document.querySelectorAll('button')) {
          if (el.getBoundingClientRect().width && el.innerText.trim()) {
            const size = getComputedStyle(el).fontSize
            buttonSizes[size] = (buttonSizes[size] ?? 0) + 1
          }
        }
        for (const el of document.querySelectorAll('.mobile-range-thumb-label')) {
          const box = el.getBoundingClientRect()
          if (!box.width || !box.height) continue
          const range = document.createRange(); range.selectNodeContents(el)
          const text = range.getBoundingClientRect(), container = el.parentElement.getBoundingClientRect()
          labels.push({ value: el.textContent, font: getComputedStyle(el).fontSize, width: box.width, textWidth: text.width,
            fits: text.left >= box.left + 2 && text.right <= box.right - 2 && text.top >= box.top && text.bottom <= box.bottom,
            inside: box.left >= container.left - 1 && box.right <= container.right + 1 })
        }
        return { buttonSizes, labels, pageFits: document.documentElement.scrollWidth <= innerWidth }
      })
      check(Object.keys(metrics.buttonSizes).every((size) => size === '11px'), `${width} ${name}: inconsistent button type ${JSON.stringify(metrics.buttonSizes)}`)
      check(metrics.labels.every((l) => l.font === '10px' && l.fits && l.inside), `${width} ${name}: readout does not fit ${JSON.stringify(metrics.labels)}`)
      check(metrics.pageFits, `${width} ${name}: page overflows horizontally`)
      if (process.env.TYPE_SCREENSHOTS !== '0') await page.screenshot({ path: `${out}/${width}-${name}.png` })
      reports.push({ width, height, name, ...metrics })
    }
    const openLibrary = async () => {
      if (mobile) {
        await page.getByRole('button', { name: 'Open library', exact: true }).click()
        await page.locator('.mobile-gallery-inner').waitFor()
      }
    }
    const select = async (name) => {
      await openLibrary()
      await page.locator(mobile ? '.mobile-gallery-item' : '.photo-item', { hasText: name }).click()
    }
    await page.goto(base, { waitUntil: 'networkidle' })
    await capture('home')
    await page.getByRole('button', { name: /LOAD DEMO/i }).click()
    await page.waitForTimeout(700)
    await capture('photo')
    await openLibrary()
    const placeholders = page.locator(mobile ? '.mobile-gallery-inner .media-placeholder' : '.sidebar .media-placeholder')
    await page.waitForFunction((selector) => document.querySelectorAll(selector).length === 3, mobile ? '.mobile-gallery-inner .media-placeholder' : '.sidebar .media-placeholder')
    check(await placeholders.count() === 3, `${width}: missing grid placeholders`)
    check(JSON.stringify((await placeholders.evaluateAll((es) => es.map((e) => e.dataset.mediaKind))).sort()) === JSON.stringify(['audio', 'pdf', 'txt']), 'Missing media kind')
    check(await placeholders.evaluateAll((es) => es.every((e) => !!e.querySelector('svg path') && !e.querySelector('img'))), 'Non-image media still uses broken img previews')
    await capture('library-grid')
    await page.getByRole('button', { name: mobile ? 'List view' : 'List', exact: true }).click()
    check(await placeholders.count() === 3, `${width}: missing list placeholders`)
    await capture('library-list')
    await page.getByRole('button', { name: mobile ? 'Grid view' : 'Thumbnails', exact: true }).click()
    await page.locator(mobile ? '.mobile-gallery-item' : '.photo-item', { hasText: 'demo-voice.m4a' }).click()
    const intensity = page.getByRole('slider', { name: 'Intensity', exact: true })
    for (const value of ['0', '100']) { await intensity.fill(value); await capture(`audio-intensity-${value}`) }
    // Actual preset labels must fit their buttons, rather than be truncated.
    const presetsFit = await page.locator('.audio-preset-chip').evaluateAll((es) => es.every((e) => e.scrollWidth <= e.clientWidth + 1))
    check(presetsFit, `${width}: audio preset labels clip`)
    if (mobile) check(await page.locator('.audio-cat-categories .mobile-tool-btn').evaluateAll((es) => es.every((e) => {
      const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight
    })), `${width}: audio category controls are outside the screen`)
    const category = (name) => page.locator('.audio-cat-tab, .audio-cat-categories .mobile-tool-btn', { hasText: name }).filter({ visible: true })
    await category('Voice').click()
    for (const value of ['-100', '100']) { await page.getByRole('slider', { name: 'Formant', exact: true }).fill(value); await capture(`formant-${value}`) }
    const closeAudio = async (cat) => {
      if (mobile) { await page.keyboard.press('Escape'); await page.waitForTimeout(250) }
      else await page.locator('.audio-pop-backdrop').click({ position: { x: 10, y: 10 } })
    }
    await closeAudio('Voice')
    await category('Tone').click()
    for (const value of ['800', '16000']) { await page.getByRole('slider', { name: 'Low-pass', exact: true }).fill(value); await capture(`tone-${value}`) }
    await page.getByRole('slider', { name: 'High-pass', exact: true }).fill('1000')
    await capture('tone-1000Hz')
    const lowpass = page.getByRole('slider', { name: 'Low-pass', exact: true })
    await lowpass.focus(); await page.keyboard.press('ArrowLeft')
    check(await lowpass.inputValue() === '15900', 'Resizing readout changed keyboard slider behavior')
    await closeAudio('Tone')
    check(await page.locator('.audio-preset-chip').evaluateAll((es) => es.every((e) => e.scrollWidth <= e.clientWidth + 1)), `${width}: custom audio preset labels clip`)
    await select('demo-document.txt')
    await page.locator('.doc-text-body').waitFor()
    check(await page.locator('.doc-text-body').evaluate((e) => getComputedStyle(e).fontSize) === '13px', 'Document content lost readable body type')
    await capture('txt')
    await select('demo-document-scan.pdf')
    await page.waitForTimeout(600)
    await capture('pdf')
    await select('demo-privacy-street.png')
    await page.locator('.viewer canvas').first().waitFor()
    if (mobile) await page.locator('.mobile-tool-btn-face').click()
    else await page.locator('.ts-btn-autodetect').click()
    await visible(page.getByRole('slider', { name: /Sensitivity/ })).fill('100')
    await capture('face-percent')
    check(errors.length === 0, errors.join('\n'))
    console.log(`${width}×${height}: unified button type, all readouts fit, grid/list icons and keyboard sliders passed`)
    await page.close()
  }
} finally {
  await browser.close()
  await writeFile(`${out}/metrics.json`, JSON.stringify(reports, null, 2))
}
