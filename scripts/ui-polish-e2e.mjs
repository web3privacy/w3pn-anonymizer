import { chromium } from 'playwright'
const base = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:5173'
const browser = await chromium.launch()
const check = (condition, message) => { if (!condition) throw new Error(message) }
try {
  for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [844, 390], [1024, 768], [1025, 560], [1200, 560], [1440, 900], [1920, 1080]]) {
    const mobile = width <= 1024
    const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile, reducedMotion: width === 390 ? 'reduce' : 'no-preference' })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.goto(base, { waitUntil: 'networkidle' })
    const aboutButton = page.getByRole('button', { name: /WHAT IS THIS APP\?/i }).first()
    await aboutButton.click()
    const about = page.getByRole('dialog', { name: 'What is this app', exact: true })
    await about.waitFor()
    for (const [label, index] of [['Choose your media', 0], ['Review & export', 2], ['Detect & protect', 1]]) {
      const button = about.getByRole('button', { name: new RegExp(label, 'i') })
      await button.click()
      check(await button.getAttribute('aria-pressed') === 'true', 'About step selection was not announced')
      check(await page.locator(`.about-demo--step-${index}`).count() === 1, 'About illustration did not update')
    }
    check(await about.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), `${width}: About overflows horizontally`)
    if (width === 390) check(await page.locator('.about-demo-scan').evaluate((el) => getComputedStyle(el).animationName) === 'none', 'About ignored reduced motion')
    await page.keyboard.press('Escape')
    await about.waitFor({ state: 'hidden' })
    check(await aboutButton.evaluate((el) => el === document.activeElement), 'About did not restore keyboard focus')
    await page.getByRole('button', { name: /LOAD DEMO/i }).click()
    await page.waitForSelector('.viewer canvas')
    await page.waitForTimeout(600)
    const dismiss = page.getByRole('button', { name: 'Dismiss notification' })
    if (await dismiss.count()) await dismiss.click()
    if (mobile) {
      const overlap = await page.evaluate(() => {
        const brand = document.querySelector('.mobile-topbar-v2-brand').getBoundingClientRect()
        const actions = document.querySelector('.mobile-topbar-v2-right').getBoundingClientRect()
        return brand.right > actions.left + 1
      })
      check(!overlap, `${width}: header brand overlaps feedback/live controls`)
      const clippedLabels = await page.locator('.mobile-tool-btn-label').evaluateAll((els) => els.filter((el) => el.scrollWidth > el.clientWidth + 1).map((el) => el.textContent))
      check(clippedLabels.length === 0, `${width}: clipped tool labels: ${clippedLabels}`)
      await page.locator('.mobile-tb-v2-summary').click()
      check(await page.locator('.mobile-editor-toolbar-v2-panel').evaluate((el) => getComputedStyle(el).backgroundColor) === 'rgb(16, 16, 16)', 'Mobile export panel is not opaque')
      await page.locator('.mobile-tb-v2-summary').click()
      await page.locator('.mobile-tool-btn:has-text("DISTORT")').click()
      const drawer = page.getByRole('dialog').filter({ has: page.locator('.mobile-distort-list') })
      await drawer.waitFor()
      check(await drawer.evaluate((el) => getComputedStyle(el).backgroundColor) === 'rgb(16, 16, 16)', 'Mobile settings surface is transparent')
      await page.keyboard.press('Escape')
      await page.waitForTimeout(250)
    } else {
      const transform = page.getByRole('button', { name: 'Transform effects', exact: true })
      await transform.click()
      const panel = page.getByRole('dialog', { name: 'Distort', exact: true })
      await panel.locator('.mobile-distort-toggle').filter({ hasText: 'COLOR SHIFT' }).click()
      await panel.getByRole('slider', { name: 'Hue', exact: true }).fill('180')
      await page.waitForTimeout(600)
      const imageStats = await page.evaluate(() => {
        const canvas = document.querySelector('.viewer canvas:not(.brush-preview-overlay):not(.video-distort-preview)')
        const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
        let sum = 0, opaque = 0
        for (let i = 0; i < data.length; i += 4) { sum += data[i] + data[i + 1] + data[i + 2]; if (data[i + 3]) opaque++ }
        return { average: sum / (data.length / 4 * 3), opaque }
      })
      check(imageStats.average > 20 && imageStats.opaque > 1000, `${width}: Color Shift erased/darkened the image`)
      const bounds = await panel.boundingBox()
      check(bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= width && bounds.y + bounds.height <= height, `${width}: expanded effect panel is outside the viewport`)
      check(await panel.evaluate((el) => getComputedStyle(el).backgroundColor) === 'rgb(16, 16, 16)', 'Desktop settings surface is transparent')
      await page.keyboard.press('Escape')
      await panel.waitFor({ state: 'hidden' })
      check(await transform.evaluate((el) => el === document.activeElement), 'Flyout did not return keyboard focus')
      await page.evaluate(() => { document.documentElement.dataset.theme = 'light' })
      await transform.click()
      check(await panel.evaluate((el) => getComputedStyle(el).backgroundColor) === 'rgb(255, 255, 255)', 'Light-theme flyout is not readable')
      await page.keyboard.press('Escape')
      await page.evaluate(() => { document.documentElement.dataset.theme = 'dark' })
    }
    const feedback = page.getByRole('button', { name: 'Give feedback', exact: true })
    await feedback.click()
    const form = page.getByRole('dialog', { name: 'Send Feedback', exact: true })
    await form.waitFor()
    check(await page.locator('.feedback-textarea').evaluate((el) => el === document.activeElement), 'Feedback did not focus its message field')
    await page.keyboard.press('Escape')
    await form.waitFor({ state: 'hidden' })
    check(await feedback.evaluate((el) => el === document.activeElement), 'Feedback did not restore focus')
    check(errors.length === 0, errors.join('\n'))
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}: horizontal page overflow`)
    if (mobile) {
      await page.getByRole('button', { name: 'Open library', exact: true }).click()
      await page.locator('.mobile-gallery-item', { hasText: 'vitalik-rap.webm' }).click()
      await page.waitForTimeout(400)
      const clipped = await page.locator('.video-action-row .mobile-canvas-action-cluster button').evaluateAll((els) => els.filter((el) => el.scrollWidth > el.clientWidth + 1).map((el) => el.textContent))
      check(clipped.length === 0, `${width}: clipped video action text: ${clipped}`)
    }
    console.log(`${width}×${height}: About, layout, panels, feedback, focus${mobile ? '' : ', Color Shift'} passed`)
    await context.close()
  }
} finally { await browser.close() }
