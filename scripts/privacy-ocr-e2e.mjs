#!/usr/bin/env node
/**
 * Smoke test for on-photo sensitive-text (OCR PII) detection + background asset
 * prefetch. Generates an image with an email and a credit-card number in-page,
 * loads it, lets auto-detect run the local OCR pipeline, and asserts pii_text
 * detections are produced. Also confirms the background model loader appears.
 *
 * Run: npm run build && npx vite preview --host 127.0.0.1 --port 4173 &
 *      node scripts/privacy-ocr-e2e.mjs
 */
import { chromium } from 'playwright'

const BASE = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:4173'
const failures = []
const pass = (m) => console.log(`  \u2713 ${m}`)
const fail = (m) => { failures.push(m); console.error(`  \u2717 ${m}`) }

const browser = await chromium.launch()
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  const consoleErrors = []
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForSelector('.app-shell-desktop-v2', { timeout: 30000 })

  // Background prefetch should kick in (idle) and surface the loader pill.
  const loaderSeen = await page
    .waitForSelector('.bg-asset-loader', { timeout: 12000 })
    .then(() => true)
    .catch(() => false)
  if (loaderSeen) pass('Background asset loader appeared')
  else fail('Background asset loader did not appear')

  // Generate a PII image and feed it to the image upload input.
  await page.evaluate(async () => {
    const c = document.createElement('canvas')
    c.width = 960; c.height = 360
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, c.width, c.height)
    ctx.fillStyle = '#000000'
    ctx.font = '40px Arial, sans-serif'
    ctx.fillText('Email: john.doe@example.com', 40, 110)
    ctx.fillText('Card: 4111 1111 1111 1111', 40, 200)
    ctx.fillText('Phone: +420 777 123 456', 40, 290)
    const blob = await new Promise((res) => c.toBlob(res, 'image/png'))
    const file = new File([blob], 'pii-test.png', { type: 'image/png' })
    const input = [...document.querySelectorAll('input[type=file]')]
      .find((el) => (el.getAttribute('accept') ?? '').includes('image'))
    const dt = new DataTransfer()
    dt.items.add(file)
    input.files = dt.files
    input.dispatchEvent(new Event('change', { bubbles: true }))
  })

  await page.waitForSelector('.photo-item', { timeout: 20000 })
  pass('PII test image added to library')
  // The upload usually auto-opens the photo; click is best-effort (overlay may intercept).
  await page.locator('.photo-item').first().click({ force: true, timeout: 4000 }).catch(() => {})

  // Wait for auto-detect → OCR pipeline to populate detection counts.
  const countsEl = page.locator('[data-testid="detection-counts"]')
  let counts = {}
  for (let i = 0; i < 60; i++) {
    const raw = await countsEl.getAttribute('data-counts').catch(() => '{}')
    try { counts = JSON.parse(raw ?? '{}') } catch { counts = {} }
    if ((counts.pii_text ?? 0) > 0) break
    await page.waitForTimeout(1000)
  }
  if ((counts.pii_text ?? 0) > 0) pass(`OCR detected sensitive text: ${counts.pii_text} region(s)`)
  else fail(`No pii_text detections (counts=${JSON.stringify(counts)})`)

  const relErrors = consoleErrors.filter((e) => /tesseract|ocr|worker|wasm/i.test(e))
  if (relErrors.length > 0) fail(`Console errors: ${relErrors.slice(0, 3).join(' | ')}`)
  else pass('No OCR-related console errors')

  console.log('\n' + (failures.length === 0 ? 'All OCR/prefetch checks passed.' : `${failures.length} check(s) failed.`))
  process.exit(failures.length === 0 ? 0 : 1)
} finally {
  await browser.close()
}
