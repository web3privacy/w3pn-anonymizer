#!/usr/bin/env node
/**
 * E2E: verify the vendor ImageTracer loads inside a Web Worker under the app's
 * production CSP/headers, and that imagedataToSVG returns SVG markup. This is
 * the core assumption behind the vectorize worker offload (Phase 6). If CSP
 * blocked importScripts, the app would silently fall back to the main thread.
 *
 * Run: npm run build && npm run preview -- --host 127.0.0.1 --port 4173 &
 *      node scripts/vectorize-e2e.mjs
 */
import { chromium } from 'playwright'

const BASE = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:4173'

const result = await (async () => {
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })

    return await page.evaluate(async () => {
      const vendorUrl = new URL('vendor/imagetracer_v1.2.6.js', document.baseURI).toString()
      const workerSrc = `
        self.onmessage = (ev) => {
          try {
            self.importScripts(ev.data.vendorUrl)
            if (!self.ImageTracer) { self.postMessage({ error: 'ImageTracer not registered' }); return }
            const w = ev.data.width, h = ev.data.height
            const data = new Uint8ClampedArray(w * h * 4)
            for (let i = 0; i < data.length; i += 4) {
              const on = ((i / 4) % w) < (w / 2)
              data[i] = on ? 0 : 255; data[i+1] = on ? 0 : 255; data[i+2] = on ? 0 : 255; data[i+3] = 255
            }
            const svg = self.ImageTracer.imagedataToSVG({ data, width: w, height: h }, 'default')
            self.postMessage({ svg })
          } catch (e) { self.postMessage({ error: String(e && e.message || e) }) }
        }
      `
      const blob = new Blob([workerSrc], { type: 'text/javascript' })
      const worker = new Worker(URL.createObjectURL(blob))
      const out = await new Promise((resolve) => {
        const timer = setTimeout(() => resolve({ error: 'timeout' }), 15000)
        worker.onmessage = (e) => { clearTimeout(timer); resolve(e.data) }
        worker.onerror = (e) => { clearTimeout(timer); resolve({ error: 'worker onerror: ' + e.message }) }
        worker.postMessage({ vendorUrl, width: 32, height: 32 })
      })
      worker.terminate()
      return out
    })
  } finally {
    await browser.close()
  }
})()

if (result.error) {
  console.error(`  ✗ vectorize worker E2E failed: ${result.error}`)
  process.exit(1)
}
if (typeof result.svg === 'string' && result.svg.includes('<svg')) {
  console.log(`  ✓ vectorize worker produced SVG (${result.svg.length} chars) under app CSP`)
  process.exit(0)
}
console.error('  ✗ vectorize worker returned no SVG markup')
process.exit(1)
