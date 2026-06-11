#!/usr/bin/env node
/**
 * Smoke test for the live Voice Mask: opens live mode, toggles the voice-mask
 * sheet, starts the mic graph (fake device), confirms the level meter reacts,
 * switches presets, and records a short clip.
 *
 * Run: npm run build && npx vite preview --host 127.0.0.1 --port 4173 &
 *      node scripts/voice-mask-e2e.mjs
 */
import { chromium } from 'playwright'

const BASE = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:4173'
const failures = []
const pass = (m) => console.log(`  \u2713 ${m}`)
const fail = (m) => { failures.push(m); console.error(`  \u2717 ${m}`) }

const browser = await chromium.launch({
  args: [
    '--use-fake-device-for-media-stream',
    '--use-fake-ui-for-media-stream',
    '--autoplay-policy=no-user-gesture-required',
  ],
})
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['microphone', 'camera'],
  })
  const page = await context.newPage()
  const consoleErrors = []
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForSelector('.app-shell-desktop-v2', { timeout: 30000 })

  // Open live mode (home screen primary action).
  const liveBtn = page.locator('button:has-text("TURN ON CAMERA")').first()
  await liveBtn.waitFor({ timeout: 30000 })
  await liveBtn.click()
  await page.waitForSelector('.desktop-live-overlay', { timeout: 20000 })
  pass('Live mode opened')

  // Open the voice-mask sheet (mic is the last item in the bottom tool menu).
  const voiceToggle = page.locator('.mobile-tool-btn-voice')
  await voiceToggle.waitFor({ timeout: 15000 })
  await voiceToggle.click()
  await page.waitForSelector('.mobile-live-voice-sheet .voice-mask-panel', { timeout: 10000 })
  pass('Voice mask sheet rendered')

  // Start the mic + DSP graph.
  const startBtn = page.locator('.voice-mask-panel button:has-text("Enable microphone")').first()
  await startBtn.click()
  await page.waitForTimeout(2000)

  // Level meter should react to the fake input (scaleX > 0 at some point).
  let sawLevel = false
  for (let i = 0; i < 20; i++) {
    const sx = await page.locator('.voice-mask-meter-bar').evaluate((el) => {
      const t = getComputedStyle(el).transform
      if (!t || t === 'none') return 0
      const m = t.match(/matrix\(([^)]+)\)/)
      return m ? parseFloat(m[1].split(',')[0]) : 0
    }).catch(() => 0)
    if (sx > 0.001) { sawLevel = true; break }
    await page.waitForTimeout(200)
  }
  if (sawLevel) pass('Level meter reacts to mic input')
  else fail('Level meter never moved (graph may be silent)')

  // Switch presets.
  const presets = page.locator('.voice-mask-presets button')
  const presetCount = await presets.count()
  if (presetCount >= 2) {
    await presets.nth(1).click()
    await page.waitForTimeout(300)
    pass(`Preset switch works (${presetCount} presets)`)
  } else fail(`Expected >=2 presets, found ${presetCount}`)

  // Record a short clip.
  const recBtn = page.locator('.voice-mask-panel button:has-text("Record")').first()
  if (await recBtn.count() > 0) {
    await recBtn.click()
    await page.waitForTimeout(1500)
    const stopRec = page.locator('.voice-mask-actions button:has-text("Stop recording")').first()
    await stopRec.click()
    await page.waitForTimeout(800)
    if (await page.locator('.voice-mask-playback, .voice-mask-panel audio').count() > 0) pass('Recording produced playback element')
    else fail('No playback element after recording')
  } else fail('Record button missing')

  const relErrors = consoleErrors.filter((e) => /audio|worklet|mic|getUserMedia|voice/i.test(e))
  if (relErrors.length > 0) fail(`Console errors: ${relErrors.slice(0, 3).join(' | ')}`)
  else pass('No voice-related console errors')

  console.log('\n' + (failures.length === 0 ? 'All voice-mask checks passed.' : `${failures.length} check(s) failed.`))
  process.exit(failures.length === 0 ? 0 : 1)
} finally {
  await browser.close()
}
