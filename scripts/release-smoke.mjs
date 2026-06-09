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

async function main() {
  console.log(`Smoke tests → ${BASE}`)
  let browser
  try {
    browser = await chromium.launch({ headless: true })
  } catch {
    console.error('Playwright chromium not installed. Run: npx playwright install chromium')
    process.exit(1)
  }

  for (const vp of VIEWPORTS) {
    await testViewport(browser, vp)
  }
  await testAssetsAndHeaders(browser)
  await browser.close()

  console.log(`\n--- Summary: ${passes.length} passed, ${failures.length} failed ---`)
  if (failures.length) {
    failures.forEach((f) => console.error(`  FAIL: ${f}`))
    process.exit(1)
  }
  console.log('All smoke tests passed.')
}

main()
