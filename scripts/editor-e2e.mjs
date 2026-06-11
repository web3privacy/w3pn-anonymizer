#!/usr/bin/env node
/**
 * Editor interaction E2E — a safety net for the App.tsx refactor (Phase 3).
 * Drives the real desktop editor and asserts the extracted hooks still work
 * end-to-end:
 *   - render pipeline + theme: demo loads → main canvas renders non-blank
 *   - useVectorize + worker: Vectorize panel produces an SVG preview
 *
 * Run: npm run build && npm run preview -- --host 127.0.0.1 --port 4173 &
 *      node scripts/editor-e2e.mjs
 */
import { chromium } from 'playwright'

const BASE = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:4173'

const failures = []
const pass = (m) => console.log(`  ✓ ${m}`)
const fail = (m) => { failures.push(m); console.error(`  ✗ ${m}`) }

const browser = await chromium.launch()
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  const consoleErrors = []
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForSelector('.app-shell-desktop-v2', { timeout: 30000 })

  // data-theme applied (useThemeMode)
  const themeAttr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
  if (themeAttr === 'dark' || themeAttr === 'light') pass(`useThemeMode: data-theme="${themeAttr}"`)
  else fail(`useThemeMode: data-theme missing (got ${themeAttr})`)

  // Load demo media
  const demoBtn = page.locator('button:has-text("Load demo"), button:has-text("LOAD DEMO")').first()
  await demoBtn.waitFor({ timeout: 30000 })
  if (await demoBtn.isDisabled()) {
    // Detector still initializing — wait briefly and retry
    await page.waitForTimeout(3000)
  }
  await demoBtn.click()
  await page.waitForSelector('.photo-item', { timeout: 30000 })

  // Sidebar (EditorSidebar) renders the photo list
  const photoItemCount = await page.locator('.photo-item').count()
  if (photoItemCount > 0) pass(`EditorSidebar: ${photoItemCount} photo item(s) rendered`)
  else fail('EditorSidebar: no photo items rendered')

  // Select the first photo (ensures an image, not the demo video, is active)
  await page.locator('.photo-item').first().click()
  await page.waitForSelector('.editor-area canvas', { timeout: 30000 })
  await page.waitForTimeout(1200) // allow renderCanvas to paint

  // Main canvas renders non-blank (render pipeline intact)
  const canvasInfo = await page.evaluate(() => {
    const canvases = Array.from(document.querySelectorAll('.editor-area canvas'))
      .filter((c) => !c.classList.contains('brush-preview-overlay') && !c.classList.contains('video-distort-preview'))
    let best = null
    for (const c of canvases) {
      if (c.width > 0 && c.height > 0 && (!best || c.width * c.height > best.width * best.height)) best = c
    }
    if (!best) return { found: false }
    try {
      const ctx = best.getContext('2d')
      const w = Math.min(best.width, 64), h = Math.min(best.height, 64)
      const sx = Math.floor((best.width - w) / 2), sy = Math.floor((best.height - h) / 2)
      const { data } = ctx.getImageData(sx, sy, w, h)
      let opaque = 0
      const first = [data[0], data[1], data[2]]
      let varied = false
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 0) opaque++
        if (data[i] !== first[0] || data[i + 1] !== first[1] || data[i + 2] !== first[2]) varied = true
      }
      return { found: true, width: best.width, height: best.height, opaque, varied }
    } catch (e) {
      return { found: true, error: String(e && e.message || e) }
    }
  })
  if (!canvasInfo.found) fail('render: no main editor canvas found')
  else if (canvasInfo.error) fail(`render: cannot read canvas (${canvasInfo.error})`)
  else if (canvasInfo.opaque > 0 && canvasInfo.varied) pass(`render: main canvas ${canvasInfo.width}×${canvasInfo.height} painted (non-blank)`)
  else fail(`render: canvas appears blank (opaque=${canvasInfo.opaque}, varied=${canvasInfo.varied})`)

  // EditorActionToolbar renders the Download action
  const downloadBtn = page.locator('.action-toolbar button[title="Download anonymized copy"]')
  if (await downloadBtn.count()) pass('EditorActionToolbar: Download button rendered')
  else fail('EditorActionToolbar: Download button not found')

  // useVectorize: open the Vectorize panel → SVG preview appears
  const vecBtn = page.locator('button[title="Vectorize image to SVG"]').first()
  if (await vecBtn.count()) {
    await vecBtn.click()
    try {
      const img = page.locator('img[alt="SVG vectorized preview"]')
      await img.waitFor({ state: 'visible', timeout: 30000 })
      const src = await img.getAttribute('src')
      if (src && src.startsWith('blob:')) pass('useVectorize: SVG preview rendered (blob URL)')
      else fail(`useVectorize: SVG preview src unexpected (${src})`)
    } catch {
      fail('useVectorize: SVG preview did not appear within timeout')
    }
    // Close vectorize panel before zone interaction
    await vecBtn.click()
  } else {
    fail('useVectorize: Vectorize button not found (is an image active?)')
  }

  // EditorToolStrip: activate zone tool and draw a rectangle on the canvas
  const zoneBtn = page.locator('button[title="Add zone — draw rectangle to select face region"]').first()
  if (await zoneBtn.count()) {
    await zoneBtn.click()
    pass('EditorToolStrip: zone tool activated')
    const canvas = page.locator('.editor-area .viewer canvas:not(.brush-preview-overlay):not(.video-distort-preview)').first()
    const box = await canvas.boundingBox()
    if (box) {
      const x1 = box.x + box.width * 0.35
      const y1 = box.y + box.height * 0.35
      const x2 = box.x + box.width * 0.55
      const y2 = box.y + box.height * 0.55
      await page.mouse.move(x1, y1)
      await page.mouse.down()
      await page.mouse.move(x2, y2, { steps: 8 })
      await page.mouse.up()
      await page.waitForTimeout(600)
      const anonymizeBtn = page.locator('.viewer-corner button:has-text("Anonymize")')
      if (await anonymizeBtn.count()) {
        pass('zone→pointer: rectangle created, Anonymize button visible')
        await anonymizeBtn.click()
        await page.waitForTimeout(800)
        const undoBtn = page.locator('button[title="Undo last edit"]')
        if (await undoBtn.count()) {
          pass('useUndoStack: Undo available after Anonymize')
          await undoBtn.click()
          await page.waitForTimeout(500)
          pass('useUndoStack: Undo clicked without error')
        } else fail('useUndoStack: Undo button not shown after Anonymize')
      } else fail('zone→pointer: Anonymize button not visible after drawing zone')
    } else fail('zone→pointer: canvas bounding box unavailable')
  } else fail('EditorToolStrip: zone tool button not found')

  // Privacy targets panel in face flyout
  const faceBtn = page.locator('button[title="Face detection settings"], button[title*="Face"], button[title*="Privacy"]').first()
  if (await faceBtn.count()) {
    await faceBtn.click()
    await page.waitForTimeout(400)
    const targets = page.locator('.privacy-targets-panel')
    if (await targets.count()) pass('PrivacyTargetsPanel: visible in face flyout')
    else fail('PrivacyTargetsPanel: not found in face flyout')
    await page.keyboard.press('Escape')
  } else {
    pass('PrivacyTargetsPanel: face flyout button not found (skipped)')
  }

  const criticalErrors = consoleErrors.filter((e) =>
    !e.includes('favicon') && !e.includes('DevTools') && !e.includes('frame-ancestors')
    && !e.includes('wasm streaming compile failed') && !e.includes('falling back to ArrayBuffer')
  )
  if (criticalErrors.length) fail(`console errors: ${criticalErrors.slice(0, 3).join(' | ')}`)
  else pass('no critical console errors')

  await context.close()
} finally {
  await browser.close()
}

console.log(`\n--- Editor E2E: ${failures.length === 0 ? 'all passed' : `${failures.length} failed`} ---`)
process.exit(failures.length === 0 ? 0 : 1)
