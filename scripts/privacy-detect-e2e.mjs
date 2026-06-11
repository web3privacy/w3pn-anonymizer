#!/usr/bin/env node
/**
 * Probes YOLO ONNX availability and runs extended-target detection in the browser.
 *
 * Run: npm run build && npm run preview -- --host 127.0.0.1 --port 4173 &
 *      node scripts/privacy-detect-e2e.mjs
 */
import { chromium } from 'playwright'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const BASE = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:4173'
const ROOT = join(import.meta.dirname, '..')

const failures = []
const pass = (m) => console.log(`  ✓ ${m}`)
const fail = (m) => { failures.push(m); console.error(`  ✗ ${m}`) }

for (const name of ['yolo-coco.onnx', 'yolo-license-plate.onnx']) {
  const p = join(ROOT, 'public/models/privacy', name)
  if (existsSync(p)) pass(`ONNX on disk: ${name}`)
  else fail(`ONNX missing on disk: ${name}`)
}
const customPath = join(ROOT, 'public/models/privacy/yolo-privacy-custom.onnx')
if (existsSync(customPath)) pass('ONNX on disk: yolo-privacy-custom.onnx')
else pass('ONNX optional: yolo-privacy-custom.onnx not present (tattoo/sign targets stay SOON)')

const browser = await chromium.launch()
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  const consoleErrors = []
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForSelector('.app-shell-desktop-v2', { timeout: 30000 })

  const modelStatus = await page.evaluate(async () => {
    const paths = {
      'yolo-coco': '/models/privacy/yolo-coco.onnx',
      'yolo-license-plate': '/models/privacy/yolo-license-plate.onnx',
      'yolo-privacy-custom': '/models/privacy/yolo-privacy-custom.onnx',
    }
    const out = {}
    for (const [id, path] of Object.entries(paths)) {
      try {
        const res = await fetch(path, { method: 'HEAD' })
        const len = Number(res.headers.get('content-length') ?? 0)
        const ct = res.headers.get('content-type') ?? ''
        out[id] = res.ok && !ct.includes('text/html') && (len === 0 || len > 50_000) ? 'ready' : 'missing'
      } catch {
        out[id] = 'missing'
      }
    }
    return out
  })

  for (const [id, status] of Object.entries(modelStatus)) {
    if (status === 'ready') pass(`HTTP probe: ${id} → ready`)
    else if (id !== 'yolo-privacy-custom') fail(`HTTP probe: ${id} → ${status}`)
  }

  const demoBtn = page.locator('button:has-text("Load demo"), button:has-text("LOAD DEMO")').first()
  await demoBtn.waitFor({ timeout: 30000 })
  if (await demoBtn.isDisabled()) await page.waitForTimeout(5000)
  await demoBtn.click()
  await page.waitForSelector('.photo-item', { timeout: 30000 })

  const photoCount = await page.locator('.photo-item').count()
  let bestZones = 0
  for (let i = 0; i < Math.min(photoCount, 5); i++) {
    await page.locator('.photo-item').nth(i).click()
    await page.waitForSelector('.editor-area canvas', { timeout: 15000 })
    await page.waitForTimeout(3000)
    const anonymizeVisible = await page.locator('.viewer-corner button:has-text("Anonymize")').count()
    if (anonymizeVisible > 0) {
      bestZones = 1
      pass(`Demo photo #${i + 1}: auto-detect produced zones`)
      break
    }
  }
  if (bestZones === 0) fail('No demo photo produced detection zones after auto-detect')

  const faceSettingsBtn = page.locator('button[title="Detection settings (double-click to refresh detector)"]').first()
  await faceSettingsBtn.click()
  await page.waitForSelector('.ts-flyout-title:has-text("Face detection")', { timeout: 5000 })

  const detectBtn = page.locator('button.tool-panel-detect-btn').first()
  await detectBtn.click()
  await page.waitForSelector('.local-proof-badge', { timeout: 180000 })
  pass('Face-only Detect now completed')

  // Read the zone count badge (activeZones.length) shown on the detect toggle.
  const readZoneCount = async () => {
    const txt = await page.locator('.ts-face-count-inline').first().textContent().catch(() => null)
    return Number((txt ?? '0').trim()) || 0
  }

  if (modelStatus['yolo-coco'] === 'ready' || modelStatus['yolo-license-plate'] === 'ready') {
    await faceSettingsBtn.click()
    await page.waitForSelector('.ts-flyout-title:has-text("Face detection")', { timeout: 5000 })

    // License plates should be ON by default (no SOON badge) when model is ready.
    if (modelStatus['yolo-license-plate'] === 'ready') {
      const plateBtn = page.locator('.detect-settings-targets--extended button').filter({ hasText: /plate|SPZ/i }).first()
      if (await plateBtn.count() > 0) {
        const soon = await plateBtn.locator('.detect-settings-soon').count()
        const pressed = await plateBtn.getAttribute('aria-pressed')
        if (soon === 0 && pressed === 'true') pass('License plates ON by default')
        else if (soon === 0) { await plateBtn.click(); pass('License plates enabled') }
        else fail('License plates show SOON while model ready')
      }
    }

    if (modelStatus['yolo-coco'] === 'ready') {
      const personBtn = page.locator('.detect-settings-targets--extended button').filter({ hasText: 'People' }).first()
      if (await personBtn.locator('.detect-settings-soon').count() === 0) {
        const pressed = await personBtn.getAttribute('aria-pressed')
        if (pressed !== 'true') await personBtn.click()
        pass('People target enabled (YOLO COCO ready)')
      } else {
        fail('People target still SOON while yolo-coco is ready')
      }
    }

    await detectBtn.click()
    await page.waitForSelector('.local-proof-badge', { timeout: 180000 })
    await page.waitForTimeout(800)
    const zones = await readZoneCount()
    if (zones > 0) pass(`Extended detection produced ${zones} zone(s) → boxes render`)
    else fail('Extended detection produced 0 zones — no boxes would render')
  }

  // "All classes" sheet: enable a raw COCO class (car) and confirm object zones render.
  if (modelStatus['yolo-coco'] === 'ready') {
    await faceSettingsBtn.click()
    await page.waitForSelector('.ts-flyout-title:has-text("Face detection")', { timeout: 5000 })

    const classToggle = page.locator('.detect-class-toggle').first()
    if (await classToggle.count() > 0) {
      await classToggle.click()
      await page.waitForSelector('.detect-class-list', { timeout: 5000 })
      const carRow = page.locator('.detect-class-row').filter({ hasText: /^Car$/ }).first()
      if (await carRow.count() > 0) {
        const carInput = carRow.locator('input[type="checkbox"]')
        if (!(await carInput.isChecked())) await carInput.check()
        pass('Enabled raw class "car" via All classes panel')

        await detectBtn.click()
        await page.waitForSelector('.local-proof-badge', { timeout: 180000 })
        await page.waitForTimeout(800)
        const zones = await readZoneCount()
        if (zones > 0) pass(`All-classes detection produced ${zones} zone(s) → object boxes render`)
        else fail('All-classes detection produced 0 zones — object boxes would not render')
      } else {
        fail('"Car" class row not found in All classes panel')
      }
    } else {
      fail('All classes toggle not found in Face detection flyout')
    }
  }

  const onnxErrors = consoleErrors.filter((e) => /onnx|yolo|detection/i.test(e))
  if (onnxErrors.length > 0) fail(`Console errors: ${onnxErrors.slice(0, 3).join(' | ')}`)
  else pass('No ONNX-related console errors')

  console.log('\n' + (failures.length === 0 ? 'All privacy detection checks passed.' : `${failures.length} check(s) failed.`))
  process.exit(failures.length === 0 ? 0 : 1)
} finally {
  await browser.close()
}
