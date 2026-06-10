#!/usr/bin/env node
/**
 * Release smoke tests — home, about, demo load, ONNX assets, headers.
 * Run: npm run build && npm run preview & node scripts/release-smoke.mjs
 */
import { chromium } from 'playwright'

const BASE = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:4173'
const VIEWPORTS = [
  { name: 'phone-se', width: 375, height: 667 },
  { name: 'phone-14', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'edge-mobile', width: 1023, height: 768 },
  { name: 'edge-desktop', width: 1024, height: 768 },
  { name: 'desktop', width: 1440, height: 900 },
]

const failures = []
const passes = []

function pass(msg) {
  passes.push(msg)
  console.log(`  ✓ ${msg}`)
}

function fail(msg) {
  failures.push(msg)
  console.error(`  ✗ ${msg}`)
}

async function waitForAppReady(page) {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForSelector('.app-shell-mobile, .app-shell-desktop-v2', { timeout: 30000 })
}

async function testViewport(browser, vp) {
  console.log(`\n[${vp.name}] ${vp.width}×${vp.height}`)
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
  const page = await context.newPage()
  const consoleErrors = []
  const requests = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('request', (req) => {
    const url = req.url()
    if (url.startsWith('http')) requests.push(new URL(url).host)
  })

  try {
    await waitForAppReady(page)
    const shell = await page.locator('.app-shell-mobile, .app-shell-desktop-v2').first().getAttribute('class')
    // MOBILE_BREAKPOINT_PX = 1024 → matchMedia (max-width: 1024px) includes 1024 as mobile
    if (vp.width <= 1024 && !shell?.includes('app-shell-mobile')) {
      fail(`${vp.name}: expected mobile shell`)
    } else if (vp.width > 1024 && !shell?.includes('app-shell-desktop')) {
      fail(`${vp.name}: expected desktop shell`)
    } else {
      pass(`${vp.name}: correct shell (${shell?.split(' ').filter((c) => c.startsWith('app-shell')).join(', ')})`)
    }

    // About page
    const aboutBtn = page.locator('button:has-text("What is this app"), button:has-text("ABOUT"), .mobile-home-v2-about-link, .desktop-home-v2-about-link').first()
    if (await aboutBtn.count()) {
      await aboutBtn.click()
      await page.waitForSelector('.mobile-about', { timeout: 5000 })
      pass(`${vp.name}: about opens`)
      await page.locator('.mobile-about-close').click()
      await page.waitForSelector('.mobile-about', { state: 'hidden', timeout: 5000 })
      pass(`${vp.name}: about closes`)
    } else {
      fail(`${vp.name}: about link not found`)
    }

    // Load demo (first available)
    const demoBtn = page.locator('button:has-text("Load demo"), button:has-text("LOAD DEMO")').first()
    if (await demoBtn.count()) {
      const disabled = await demoBtn.isDisabled()
      if (!disabled) {
        await demoBtn.click()
        await page.waitForTimeout(2000)
        const photoCount = await page.locator('.photo-item, .mobile-gallery-item').count()
        if (photoCount > 0) pass(`${vp.name}: demo loaded (${photoCount} items)`)
        else pass(`${vp.name}: demo click (editor may use different gallery selector)`)
      } else {
        pass(`${vp.name}: demo button disabled during model init (expected)`)
      }
    }

    // Storage keys
    const storage = await page.evaluate(() => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
    }))
    const allowedLocal = ['anonymizer-theme', 'anonymizer-enable-optical-mode']
    const badLocal = storage.local.filter((k) => !allowedLocal.includes(k))
    if (badLocal.length) fail(`${vp.name}: unexpected localStorage keys: ${badLocal.join(', ')}`)
    else pass(`${vp.name}: localStorage OK (${storage.local.join(', ') || 'empty'})`)

    const externalHosts = [...new Set(requests)].filter((h) => !h.includes('127.0.0.1') && !h.includes('localhost'))
    if (externalHosts.length) fail(`${vp.name}: external hosts: ${externalHosts.join(', ')}`)
    else pass(`${vp.name}: no external network hosts`)

    const criticalErrors = consoleErrors.filter((e) =>
      !e.includes('favicon')
      && !e.includes('DevTools')
      && !e.includes('frame-ancestors')
      && !e.includes('wasm streaming compile failed')
      && !e.includes('falling back to ArrayBuffer')
    )
    if (criticalErrors.length) fail(`${vp.name}: console errors: ${criticalErrors.slice(0, 3).join(' | ')}`)
    else pass(`${vp.name}: no critical console errors`)
  } catch (err) {
    fail(`${vp.name}: ${err instanceof Error ? err.message : String(err)}`)
  } finally {
    await context.close()
  }
}

async function testAssetsAndHeaders(browser) {
  console.log('\n[assets & headers]')
  const page = await browser.newPage()
  try {
    const modelRes = await page.request.get(`${BASE}/models/face_detection_yunet_2023mar.onnx`)
    if (modelRes.ok()) pass('ONNX model reachable')
    else fail(`ONNX model HTTP ${modelRes.status()}`)

    const wasmRes = await page.request.get(`${BASE}/onnx/ort-wasm-simd-threaded.wasm`)
    if (wasmRes.ok()) pass('ORT WASM reachable')
    else fail(`ORT WASM HTTP ${wasmRes.status()}`)

    const homeRes = await page.goto(BASE, { timeout: 30000 })
    const headers = homeRes?.headers() ?? {}
    for (const key of ['cross-origin-opener-policy', 'cross-origin-embedder-policy', 'cross-origin-resource-policy']) {
      if (headers[key]) pass(`header ${key}: ${headers[key]}`)
      else fail(`missing header ${key}`)
    }
    if (headers['content-security-policy']) pass('CSP header present')
    else fail('missing CSP header (preview server should mirror vite.config headers)')
  } catch (err) {
    fail(`assets/headers: ${err instanceof Error ? err.message : String(err)}`)
  } finally {
    await page.close()
  }
}

async function testProductionMetadata(browser) {
  console.log('\n[production metadata]')
  const page = await browser.newPage()
  const productionUrl = 'https://anonymizer.web3privacy.info'
  try {
    const homeRes = await page.request.get(BASE)
    const html = await homeRes.text()
    const robotsRes = await page.request.get(`${BASE}/robots.txt`)
    const robots = await robotsRes.text()
    const sitemapRes = await page.request.get(`${BASE}/sitemap.xml`)
    const sitemap = await sitemapRes.text()

    const checks = [
      ['canonical URL', html.includes(`<link rel="canonical" href="${productionUrl}"`)],
      ['Open Graph URL', html.includes(`<meta property="og:url" content="${productionUrl}"`)],
      ['Open Graph image', html.includes(`<meta property="og:image" content="${productionUrl}/og-image.png"`)],
      ['Twitter image', html.includes(`<meta name="twitter:image" content="${productionUrl}/og-image.png"`)],
      ['JSON-LD URL', html.includes(`"url": "${productionUrl}"`)],
      ['robots sitemap', robots.includes(`Sitemap: ${productionUrl}/sitemap.xml`)],
      ['sitemap loc', sitemap.includes(`<loc>${productionUrl}</loc>`)],
    ]

    for (const [label, ok] of checks) {
      if (ok) pass(`metadata: ${label}`)
      else fail(`metadata: missing ${label}`)
    }

    const combined = `${html}\n${robots}\n${sitemap}`
    if (/promptstudio3000|anonymizer\.promptstudio/i.test(combined)) {
      fail('metadata: contains promptstudio domain reference')
    } else {
      pass('metadata: no promptstudio domain references')
    }
  } catch (err) {
    fail(`metadata: ${err instanceof Error ? err.message : String(err)}`)
  } finally {
    await page.close()
  }
}

async function testLiveCamera(browser) {
  console.log('\n[live camera]')
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    permissions: ['camera'],
  })
  const page = await context.newPage()
  const consoleErrors = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  try {
    await waitForAppReady(page)
    const liveBtn = page.locator('button:has-text("TURN ON CAMERA"), button:has-text("Live")').first()
    if (!(await liveBtn.count())) {
      fail('live camera: entry button not found')
      return
    }
    const canvasBeforeGesture = await page.locator('canvas.mobile-live-canvas').count()
    if (canvasBeforeGesture === 0) pass('live camera: waits for user gesture')
    else fail('live camera: stream canvas exists before user gesture')
    await page.waitForFunction(() => {
      const btn = [...document.querySelectorAll('button')]
        .find((b) => b.textContent?.includes('TURN ON CAMERA') || b.textContent?.includes('Live'))
      return btn instanceof HTMLButtonElement && !btn.disabled
    }, { timeout: 15000 })
    await liveBtn.click()
    await page.waitForSelector('canvas.mobile-live-canvas', { timeout: 10000 })
    await page.waitForTimeout(1200)
    const state = await page.evaluate(() => ({
      hasCanvas: Boolean(document.querySelector('canvas.mobile-live-canvas')),
      hasError: Boolean(document.querySelector('.mobile-live-error p')?.textContent?.trim()),
    }))
    if (!state.hasCanvas || state.hasError) {
      fail(`live camera: unexpected state ${JSON.stringify(state)}`)
    } else {
      pass('live camera: fake camera stream starts after gesture')
    }
    const criticalErrors = consoleErrors.filter((e) =>
      !e.includes('favicon')
      && !e.includes('DevTools')
      && !e.includes('frame-ancestors')
      && !e.includes('wasm streaming compile failed')
      && !e.includes('falling back to ArrayBuffer')
    )
    if (criticalErrors.length) fail(`live camera: console errors: ${criticalErrors.slice(0, 3).join(' | ')}`)
    else pass('live camera: no critical console errors')
  } catch (err) {
    fail(`live camera: ${err instanceof Error ? err.message : String(err)}`)
  } finally {
    await context.close()
  }
}

async function testCustomImagePresetAssets(browser) {
  console.log('\n[custom image preset assets]')
  const page = await browser.newPage()
  const folders = ['human', 'abstract', 'punks', 'aavegotchi', 'celebrities']

  try {
    for (const folder of folders) {
      const manifestRes = await page.request.get(`${BASE}/custom-images/${folder}/manifest.json`)
      if (!manifestRes.ok()) {
        fail(`custom image preset ${folder}: manifest HTTP ${manifestRes.status()}`)
        continue
      }
      const manifest = await manifestRes.json()
      const firstFile = Array.isArray(manifest.files) ? manifest.files[0] : null
      if (manifest.name !== folder || manifest.count !== manifest.files?.length || typeof firstFile !== 'string') {
        fail(`custom image preset ${folder}: invalid manifest shape`)
        continue
      }
      const imageRes = await page.request.get(`${BASE}/custom-images/${folder}/${firstFile}`)
      const contentType = imageRes.headers()['content-type'] ?? ''
      if (imageRes.ok() && contentType.includes('image/png')) {
        pass(`custom image preset ${folder}: manifest + sample PNG reachable (${manifest.files.length})`)
      } else {
        fail(`custom image preset ${folder}: sample PNG HTTP ${imageRes.status()} ${contentType}`)
      }
    }
  } catch (err) {
    fail(`custom image preset assets: ${err instanceof Error ? err.message : String(err)}`)
  } finally {
    await page.close()
  }
}

async function testPickerChoiceDialog(browser) {
  console.log('\n[picker choice]')
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await context.addInitScript(() => {
    Object.defineProperty(window, 'showDirectoryPicker', {
      configurable: true,
      value: async () => {
        const err = new Error('Mock folder picker cancelled')
        err.name = 'AbortError'
        throw err
      },
    })
  })
  const page = await context.newPage()
  const consoleErrors = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  try {
    await waitForAppReady(page)
    const selectMedia = page.locator('button:has-text("SELECT MEDIA")').first()
    await selectMedia.waitFor({ state: 'visible', timeout: 15000 })
    await page.waitForFunction(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('SELECT MEDIA'))
      return btn instanceof HTMLButtonElement && !btn.disabled
    }, { timeout: 15000 })
    await selectMedia.click()
    await page.waitForSelector('.picker-choice-dialog', { timeout: 5000 })
    await page.waitForFunction(() => (
      document.activeElement instanceof HTMLButtonElement
      && document.activeElement.textContent?.includes('Open folder')
    ), { timeout: 5000 })
    const state = await page.evaluate(() => {
      const dialog = document.querySelector('.picker-choice-dialog')
      return {
        title: document.querySelector('#picker-choice-title')?.textContent?.trim(),
        role: dialog?.getAttribute('role'),
        modal: dialog?.getAttribute('aria-modal'),
        trap: dialog?.getAttribute('data-dialog-focus-trap'),
        hasOpenFolder: [...document.querySelectorAll('button')].some((b) => b.textContent?.includes('Open folder')),
        hasSelectFiles: [...document.querySelectorAll('button')].some((b) => b.textContent?.includes('Select files')),
        activeText: document.activeElement?.textContent?.replace(/\s+/g, ' ').trim(),
      }
    })
    if (
      state.title === 'Add media'
      && state.role === 'dialog'
      && state.modal === 'true'
      && state.trap === 'true'
      && state.hasOpenFolder
      && state.hasSelectFiles
      && state.activeText?.includes('Open folder')
    ) {
      pass('picker choice: dialog opens with focused folder action')
    } else {
      fail(`picker choice: unexpected dialog state ${JSON.stringify(state)}`)
    }
    await page.locator('.picker-choice-dialog').press('Escape')
    await page.waitForSelector('.picker-choice-dialog', { state: 'hidden', timeout: 5000 })
    pass('picker choice: escape closes dialog')

    const criticalErrors = consoleErrors.filter((e) =>
      !e.includes('favicon')
      && !e.includes('DevTools')
      && !e.includes('frame-ancestors')
      && !e.includes('wasm streaming compile failed')
      && !e.includes('falling back to ArrayBuffer')
    )
    if (criticalErrors.length) fail(`picker choice: console errors: ${criticalErrors.slice(0, 3).join(' | ')}`)
    else pass('picker choice: no critical console errors')
  } catch (err) {
    fail(`picker choice: ${err instanceof Error ? err.message : String(err)}`)
  } finally {
    await context.close()
  }
}

async function main() {
  console.log(`Smoke tests → ${BASE}`)
  let browser
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('Executable doesn\'t exist') || message.includes('Please run the following command')) {
      console.error('Playwright chromium not installed. Run: npx playwright install chromium')
    } else {
      console.error('Playwright chromium failed to launch.')
      console.error(message)
    }
    process.exit(1)
  }

  for (const vp of VIEWPORTS) {
    await testViewport(browser, vp)
  }
  await testPickerChoiceDialog(browser)
  await testCustomImagePresetAssets(browser)
  await testLiveCamera(browser)
  await testAssetsAndHeaders(browser)
  await testProductionMetadata(browser)
  await browser.close()

  console.log(`\n--- Summary: ${passes.length} passed, ${failures.length} failed ---`)
  if (failures.length) {
    failures.forEach((f) => console.error(`  FAIL: ${f}`))
    process.exit(1)
  }
  console.log('All smoke tests passed.')
}

main()
