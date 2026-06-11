#!/usr/bin/env node
/**
 * Smoke test for document anonymization mode: loads the demo text document,
 * verifies PII detections render, toggles one off, and exports redacted text.
 *
 * Run: npm run build && npx vite preview --host 127.0.0.1 --port 4173 &
 *      node scripts/document-e2e.mjs
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

  // Find the document demo item by name.
  const count = await page.locator('.photo-item').count()
  let docIdx = -1
  for (let i = 0; i < count; i++) {
    const title = await page.locator('.photo-item').nth(i).getAttribute('title').catch(() => null)
    const txt = (title ?? '') + (await page.locator('.photo-item').nth(i).textContent().catch(() => ''))
    if (/document|\.txt|\.md|\.pdf/i.test(txt)) { docIdx = i; break }
  }
  if (docIdx === -1) { fail('Document demo item not found in library'); throw new Error('no doc item') }
  pass('Document demo item present in library')

  await page.locator('.photo-item').nth(docIdx).click()
  await page.waitForSelector('.doc-mode', { timeout: 15000 })
  pass('Document mode rendered')

  // Detections should appear.
  await page.waitForSelector('.doc-detection-row', { timeout: 15000 })
  const detCount = await page.locator('.doc-detection-row').count()
  if (detCount >= 8) pass(`PII detections found: ${detCount}`)
  else fail(`Too few detections: ${detCount}`)

  // Highlights render in the text body.
  const marks = await page.locator('.doc-mark').count()
  if (marks > 0) pass(`Inline highlights rendered: ${marks}`)
  else fail('No inline highlights rendered')

  // Toggle the first detection off.
  await page.locator('.doc-detection-row input[type=checkbox]').first().uncheck()
  pass('Toggled a detection off')

  // Preview redacted text and confirm tokens appear.
  await page.locator('.doc-toggle input[type=checkbox]').check()
  const redacted = await page.locator('.doc-text-redacted').textContent()
  if (redacted && /\[EMAIL_\d\]|\[IBAN_\d\]|\[CREDIT_CARD_\d\]/.test(redacted)) pass('Redacted preview contains tokens')
  else fail('Redacted preview missing tokens')

  // Export redacted text.
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 30000 }),
    page.locator('.doc-export button:has-text("Export redacted text")').click(),
  ])
  const fn = download.suggestedFilename()
  if (/redacted\.txt$/.test(fn)) pass(`Exported redacted text: ${fn}`)
  else fail(`Unexpected export filename: ${fn}`)

  const docErrors = consoleErrors.filter((e) => /document|pii|redact|pdf/i.test(e))
  if (docErrors.length > 0) fail(`Console errors: ${docErrors.slice(0, 3).join(' | ')}`)
  else pass('No document-related console errors')

  console.log('\n' + (failures.length === 0 ? 'All document checks passed.' : `${failures.length} check(s) failed.`))
  process.exit(failures.length === 0 ? 0 : 1)
} finally {
  await browser.close()
}
