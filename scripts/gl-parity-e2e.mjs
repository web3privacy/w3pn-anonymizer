#!/usr/bin/env node
/**
 * E2E parity check (Phase 4): the WebGL color-adjustment path must look the
 * same as the CPU LUT path. Runs in a real browser (real WebGL2), generates a
 * test image, applies several adjustments through BOTH paths, and asserts the
 * max per-channel difference stays within a small visual tolerance.
 *
 * The CPU loop and the fragment shader below are kept in sync with
 * src/lib/effects.ts (buildColorLUT + applyColorAdjustments) and
 * src/lib/gl/color-adjust-gl.ts (COLOR_ADJUST_FRAG). The unit tests lock the
 * mode/scale/LUT mapping; this test locks the visual result.
 *
 * Run: npm run build && npm run preview -- --host 127.0.0.1 --port 4173 &
 *      node scripts/gl-parity-e2e.mjs
 */
import { chromium } from 'playwright'

const BASE = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:4173'
const TOLERANCE = 3 // max per-channel diff (0..255); float vs fixed-point sat differs by ~1

const browser = await chromium.launch()
let failed = false
try {
  const page = await browser.newPage()
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })

  const results = await page.evaluate((TOL) => {
    const W = 128, H = 128

    // ── Test image: rgb gradients + mixed tones ──────────────────────────────
    const src = document.createElement('canvas')
    src.width = W; src.height = H
    const sctx = src.getContext('2d')
    const img = sctx.createImageData(W, H)
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4
        img.data[i] = (x * 2) & 255
        img.data[i + 1] = (y * 2) & 255
        img.data[i + 2] = ((x + y)) & 255
        img.data[i + 3] = 255
      }
    }
    sctx.putImageData(img, 0, 0)

    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

    // ── CPU reference (verbatim from effects.ts) ─────────────────────────────
    function buildColorLUT(adj) {
      const lut = new Uint8ClampedArray(256)
      const br = adj.brightness / 100, co = adj.contrast / 100
      const sh = adj.shadows / 100, hl = adj.highlights / 100
      const cf = co >= 0 ? 1 + co * 2 : 1 + co
      for (let v = 0; v < 256; v++) {
        let f = v / 255
        f += br
        if (cf !== 1) f = (f - 0.5) * cf + 0.5
        if (sh !== 0) f += sh * 0.3 * (1 - f)
        if (hl !== 0) f += hl * 0.3 * f
        lut[v] = Math.round(clamp(f, 0, 1) * 255)
      }
      return lut
    }
    function cpuAdjust(adj) {
      const c = document.createElement('canvas'); c.width = W; c.height = H
      const ctx = c.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(src, 0, 0)
      const id = ctx.getImageData(0, 0, W, H)
      const data = id.data
      const lut = buildColorLUT(adj)
      const sa = adj.saturation / 100
      const isThreshold = adj.preset === 'threshold'
      const doSat = sa !== 0 || isThreshold
      const WR = 306, WG = 601, WB = 117
      const scale1024 = doSat && sa !== 0 ? Math.round((1 + sa) * 1024) : 0
      for (let i = 0; i < data.length; i += 4) {
        let r = lut[data[i]], g = lut[data[i + 1]], b = lut[data[i + 2]]
        if (doSat) {
          const luma = (WR * r + WG * g + WB * b) >> 10
          if (isThreshold) {
            const v = luma >= 128 ? 255 : 0
            data[i] = v; data[i + 1] = v; data[i + 2] = v; continue
          }
          r = clamp(luma + (((r - luma) * scale1024) >> 10), 0, 255)
          g = clamp(luma + (((g - luma) * scale1024) >> 10), 0, 255)
          b = clamp(luma + (((b - luma) * scale1024) >> 10), 0, 255)
        }
        data[i] = r; data[i + 1] = g; data[i + 2] = b
      }
      ctx.putImageData(id, 0, 0)
      return ctx.getImageData(0, 0, W, H).data
    }

    // ── GL path (shader verbatim from color-adjust-gl.ts) ────────────────────
    const FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_image;
uniform sampler2D u_lut;
uniform float u_satScale;
uniform int u_mode;
in vec2 v_uv;
out vec4 fragColor;
float lutLookup(float c){ float idx=(floor(c*255.0+0.5)+0.5)/256.0; return texture(u_lut, vec2(idx,0.5)).r; }
void main(){
  vec4 src=texture(u_image,v_uv);
  float r=lutLookup(src.r), g=lutLookup(src.g), b=lutLookup(src.b);
  if(u_mode==2){ float R=r*255.0,G=g*255.0,B=b*255.0; float luma=floor((306.0*R+601.0*G+117.0*B)/1024.0); float v=luma>=128.0?1.0:0.0; fragColor=vec4(v,v,v,src.a); return; }
  if(u_mode==1){ float R=r*255.0,G=g*255.0,B=b*255.0; float luma=floor((306.0*R+601.0*G+117.0*B)/1024.0); R=clamp(luma+(R-luma)*u_satScale,0.0,255.0); G=clamp(luma+(G-luma)*u_satScale,0.0,255.0); B=clamp(luma+(B-luma)*u_satScale,0.0,255.0); fragColor=vec4(R/255.0,G/255.0,B/255.0,src.a); return; }
  fragColor=vec4(r,g,b,src.a);
}`
    const VERT = `#version 300 es
in vec2 a_pos; in vec2 a_uv; out vec2 v_uv;
void main(){ v_uv=a_uv; gl_Position=vec4(a_pos,0.0,1.0); }`

    const glCanvas = document.createElement('canvas'); glCanvas.width = W; glCanvas.height = H
    const gl = glCanvas.getContext('webgl2', { premultipliedAlpha: false, antialias: false })
    if (!gl) return { error: 'no webgl2' }
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o }
    const prog = gl.createProgram()
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
    gl.bindAttribLocation(prog, 0, 'a_pos'); gl.bindAttribLocation(prog, 1, 'a_uv')
    gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog))
    gl.useProgram(prog)
    const quad = new Float32Array([-1,-1,0,0, 1,-1,1,0, -1,1,0,1, -1,1,0,1, 1,-1,1,0, 1,1,1,1])
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0)
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

    function glAdjust(adj) {
      const lut = buildColorLUT(adj)
      const rgba = new Uint8Array(256 * 4)
      for (let i = 0; i < 256; i++) { rgba[i*4] = lut[i]; rgba[i*4+1] = lut[i]; rgba[i*4+2] = lut[i]; rgba[i*4+3] = 255 }
      const sa = adj.saturation / 100
      let mode = 0, satScale = 1
      if (adj.preset === 'threshold') mode = 2
      else if (sa !== 0) { mode = 1; satScale = Math.round((1 + sa) * 1024) / 1024 }

      const imgTex = gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, imgTex)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src)
      gl.uniform1i(gl.getUniformLocation(prog, 'u_image'), 0)

      const lutTex = gl.createTexture(); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, lutTex)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, rgba)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
      gl.uniform1i(gl.getUniformLocation(prog, 'u_lut'), 1)
      gl.uniform1f(gl.getUniformLocation(prog, 'u_satScale'), satScale)
      gl.uniform1i(gl.getUniformLocation(prog, 'u_mode'), mode)

      gl.viewport(0, 0, W, H)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      gl.deleteTexture(imgTex); gl.deleteTexture(lutTex)

      const out = document.createElement('canvas'); out.width = W; out.height = H
      const octx = out.getContext('2d')
      octx.globalCompositeOperation = 'copy'
      octx.drawImage(glCanvas, 0, 0)
      return octx.getImageData(0, 0, W, H).data
    }

    const base = { brightness: 0, contrast: 0, saturation: 0, shadows: 0, highlights: 0, preset: 'none' }
    const cases = [
      { name: 'brightness', adj: { ...base, brightness: 30 } },
      { name: 'contrast', adj: { ...base, contrast: 40 } },
      { name: 'shadows+highlights', adj: { ...base, shadows: 40, highlights: -30 } },
      { name: 'saturation+', adj: { ...base, saturation: 60 } },
      { name: 'desaturate', adj: { ...base, saturation: -80 } },
      { name: 'threshold', adj: { ...base, preset: 'threshold', contrast: 100, saturation: -100, shadows: -100, highlights: 100 } },
      { name: 'duotone-preset', adj: { ...base, brightness: 5, contrast: 30, saturation: -70, shadows: 10, highlights: -10 } },
    ]

    const out = []
    for (const c of cases) {
      const cpu = cpuAdjust(c.adj)
      const glo = glAdjust(c.adj)
      let maxDiff = 0
      for (let i = 0; i < cpu.length; i++) {
        if (i % 4 === 3) continue // skip alpha
        const d = Math.abs(cpu[i] - glo[i])
        if (d > maxDiff) maxDiff = d
      }
      out.push({ name: c.name, maxDiff, pass: maxDiff <= TOL })
    }
    return { results: out }
  }, TOLERANCE)

  if (results.error) {
    console.error(`  ✗ GL parity setup failed: ${results.error}`)
    process.exit(1)
  }
  for (const r of results.results) {
    if (r.pass) console.log(`  ✓ ${r.name}: maxDiff=${r.maxDiff} (≤ ${TOLERANCE})`)
    else { console.error(`  ✗ ${r.name}: maxDiff=${r.maxDiff} (> ${TOLERANCE})`); failed = true }
  }
} finally {
  await browser.close()
}
process.exit(failed ? 1 : 0)
