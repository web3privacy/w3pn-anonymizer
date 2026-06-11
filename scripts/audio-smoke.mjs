#!/usr/bin/env node
/**
 * Smoke test for audio mode: loads the demo voice recording, plays it, switches
 * privacy modes/presets, and exports an anonymized WAV.
 *
 * Run: npm run build && npx vite preview --host 127.0.0.1 --port 4173 &
 *      node scripts/audio-smoke.mjs
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

  const demoBtn = page.locator('button:has-text("Load demo"), button:has-text("LOAD DEMO")').first()
  await demoBtn.waitFor({ timeout: 30000 })
  if (await demoBtn.isDisabled()) await page.waitForTimeout(5000)
  await demoBtn.click()
  await page.waitForSelector('.photo-item', { timeout: 30000 })

  // Find the audio demo item by name.
  const count = await page.locator('.photo-item').count()
  let audioIdx = -1
  for (let i = 0; i < count; i++) {
    const title = await page.locator('.photo-item').nth(i).getAttribute('title').catch(() => null)
    const txt = (title ?? '') + (await page.locator('.photo-item').nth(i).textContent().catch(() => ''))
    if (/voice|\.m4a/i.test(txt)) { audioIdx = i; break }
  }
  if (audioIdx === -1) { fail('Audio demo item not found in library'); throw new Error('no audio item') }
  pass('Audio demo item present in library')

  await page.locator('.photo-item').nth(audioIdx).click()
  await page.waitForSelector('.audio-mode-viewer', { timeout: 15000 })
  pass('Audio mode viewer rendered for .m4a')

  // Duration should decode from metadata.
  await page.waitForTimeout(1500)
  const meta = await page.locator('.audio-mode-time').first().textContent()
  if (meta && /\d+:\d{2}/.test(meta)) pass(`Duration decoded: ${meta.trim()}`)
  else fail(`Duration not decoded (meta="${meta}")`)

  // Waveform overview canvas should render.
  if (await page.locator('.audio-wave-canvas').count() > 0) pass('Waveform overview canvas present')
  else fail('Waveform overview canvas missing')

  // Play and confirm scrubber advances.
  const playBtn = page.locator('.audio-transport button').first()
  await playBtn.click()
  await page.waitForTimeout(1500)
  const t1 = await page.locator('.audio-mode-scrubber').inputValue()
  if (Number(t1) > 0) pass(`Playback advances (t=${Number(t1).toFixed(2)}s)`)
  else fail('Playback did not advance currentTime')
  await playBtn.click() // pause

  // Switch to distort_voice and pick a pitch preset.
  await page.locator('.audio-toolbar-modes button:has-text("Distort")').click()
  await page.waitForSelector('.audio-presets-row', { timeout: 5000 })
  await page.locator('.audio-preset-chip:has-text("Deep voice")').click()
  pass('Distort voice + Deep voice preset selected')

  // A/B compare toggle exists and original mode is selectable.
  await page.locator('.audio-seg--ab button:has-text("Original")').click()
  await page.locator('.audio-seg--ab button:has-text("Anonymized")').click()
  pass('A/B compare toggle works')

  // Advanced controls expand.
  await page.locator('.audio-advanced-toggle').click()
  if (await page.locator('.audio-advanced').count() > 0) pass('Advanced controls expand')
  else fail('Advanced controls did not expand')

  // Export WAV.
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 30000 }),
    page.locator('.audio-mode-viewer button:has-text("Export WAV")').click(),
  ])
  const fn = download.suggestedFilename()
  if (/anonymized\.wav$/.test(fn)) pass(`Exported WAV: ${fn}`)
  else fail(`Unexpected export filename: ${fn}`)

  const audioErrors = consoleErrors.filter((e) => /audio|decode|wav/i.test(e))
  if (audioErrors.length > 0) fail(`Console errors: ${audioErrors.slice(0, 3).join(' | ')}`)
  else pass('No audio-related console errors')

  console.log('\n' + (failures.length === 0 ? 'All audio checks passed.' : `${failures.length} check(s) failed.`))
  process.exit(failures.length === 0 ? 0 : 1)
} finally {
  await browser.close()
}
