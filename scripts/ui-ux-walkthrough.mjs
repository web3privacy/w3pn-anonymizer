import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const base = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:5173'
const out = resolve(process.env.UI_AUDIT_OUT ?? 'docs/ui-ux-2026-09-29/before')
await mkdir(out, { recursive: true })
const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] })
const reports = []
try {
  for (const [width, height] of [[320, 740], [390, 844], [768, 1024], [1024, 768], [1440, 900], [1920, 1080]]) {
    const mobile = width <= 1024
    const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile, permissions: ['camera', 'microphone'] })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    const capture = async (name) => {
      await page.waitForTimeout(350)
      const metrics = await page.evaluate(() => {
        const fonts = {}
        const panels = []
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect()
          if (!r.width || !r.height || r.bottom < 0 || r.top > innerHeight) continue
          const s = getComputedStyle(el)
          if (s.visibility === 'hidden' || s.opacity === '0') continue
          if (el.childElementCount === 0 && el.textContent.trim() && !el.classList.contains('material-symbols-outlined')) fonts[s.fontSize] = (fonts[s.fontSize] ?? 0) + 1
          if (el.matches('.ts-flyout,.mobile-drawer-bottom,.mobile-editor-toolbar-v2-panel,.feedback-modal,.mobile-about,.about-page')) panels.push({ class: el.className, background: s.backgroundColor, x: r.x, y: r.y, width: r.width, height: r.height, overflowX: el.scrollWidth > el.clientWidth + 1 })
        }
        return { horizontalPageOverflow: document.documentElement.scrollWidth > innerWidth, fonts, panels, buttons: [...document.querySelectorAll('button')].filter((el) => el.getClientRects().length).map((el) => el.getAttribute('aria-label') ?? el.title ?? el.innerText).filter(Boolean) }
      })
      await page.screenshot({ path: `${out}/${width}-${name}.png` })
      reports.push({ width, height, name, ...metrics, errors: [...errors] })
    }
    await page.goto(base, { waitUntil: 'networkidle' })
    await capture('home')
    await page.getByRole('button', { name: /WHAT IS THIS APP\?/i }).first().click()
    await capture('about-top')
    await page.locator('.mobile-about-scroll').evaluate((el) => { el.scrollTop = el.scrollHeight / 2 })
    await capture('about-middle')
    await page.locator('.mobile-about-scroll').evaluate((el) => { el.scrollTop = el.scrollHeight })
    await capture('about-bottom')
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: /LOAD DEMO/i }).click()
    await page.waitForSelector('.viewer canvas')
    await page.waitForTimeout(1000)
    await capture('photo')
    if (mobile) {
      await page.locator('.mobile-tb-v2-summary').click()
      await capture('photo-export')
      await page.locator('.mobile-tb-v2-summary').click()
      for (const [name, selector] of [['detection', '.mobile-tool-btn-face'], ['effects', '.mobile-tool-btn:has-text("EFFECT")'], ['tools', '.mobile-tool-btn:has-text("TOOLS")'], ['crop', '.mobile-tool-btn:has-text("CROP")'], ['adjust', '.mobile-tool-btn:has-text("ADJUST")'], ['distort', '.mobile-tool-btn:has-text("DISTORT")']]) {
        const control = page.locator(selector).first()
        if (!await control.count()) continue
        await control.click()
        await capture(name)
        await page.keyboard.press('Escape')
        await page.waitForTimeout(250)
      }
      for (const [name, file] of [['video', 'vitalik-rap.webm'], ['audio', 'demo-voice.m4a'], ['document', 'demo-document.txt'], ['pdf', 'demo-document-scan.pdf']]) {
        await page.getByRole('button', { name: 'Open library', exact: true }).click()
        await page.locator('.mobile-gallery-item', { hasText: file }).first().click()
        await page.waitForTimeout(800)
        await capture(name)
      }
      await page.getByRole('button', { name: 'Open library', exact: true }).click()
      await capture('library')
      await page.locator('.mobile-gallery-item').first().click()
    } else {
      for (const [name, selector] of [['detection', 'button[title="Face detection settings"]'], ['effects', 'button[aria-label^="Effect:"]'], ['adjust', 'button[title="Color adjustments"]'], ['distort', 'button[aria-label="Transform effects"]']]) {
        const control = page.locator(selector).first()
        if (!await control.count()) continue
        await control.click()
        await capture(name)
        await control.click()
      }
      await page.getByRole('button', { name: /^Batch$/i }).first().click()
      await capture('batch')
      await page.getByRole('button', { name: /^Batch$/i }).first().click()
      for (const [name, file] of [['video', 'vitalik-rap.webm'], ['audio', 'demo-voice.m4a'], ['document', 'demo-document.txt'], ['pdf', 'demo-document-scan.pdf']]) {
        const item = page.locator('.photo-item', { hasText: file }).first()
        if (!await item.count()) continue
        await item.click()
        await page.waitForTimeout(800)
        await capture(name)
      }
      await page.getByRole('button', { name: /Give feedback/i }).click()
      await capture('feedback')
      await page.keyboard.press('Escape')
    }
    if (mobile) {
      await page.getByRole('button', { name: /Give feedback/i }).click()
      await capture('feedback')
      await page.getByRole('dialog').filter({ has: page.locator('.feedback-textarea') }).getByRole('button', { name: 'Close', exact: true }).click()
    }
    await page.getByRole('button', { name: /LIVE MODE|^LIVE$/i }).first().click()
    await page.waitForTimeout(1600)
    await capture('live')
    const settings = page.getByRole('button', { name: 'Camera settings', exact: true })
    if (await settings.count()) { await settings.click(); await capture('live-settings') }
    await context.close()
    console.log(`UI walkthrough ${width}×${height}: captured`)
  }
} finally { await browser.close() }
await writeFile(`${out}/metrics.json`, JSON.stringify(reports, null, 2))
console.log(`${reports.length} views saved to ${out}`)
