/**
 * Redaction + safe export. Text exports replace PII with stable tokens; PDF/image
 * exports bake destructive redaction (blackout/blur/pixelate) onto rasterized
 * pages and flatten them so no original text layer survives.
 */
import JSZip from 'jszip'
import type { DocPage, ParsedDocument, PiiSpan, RedactionEffect } from './documentTypes'
import { tokenForType } from './piiDetectors'

/**
 * Replace enabled spans in text (processed back-to-front). The text-relevant
 * effects are `token` ([TYPE_n] placeholders) and `blackout` (█ block run); any
 * other (raster-only) effect falls back to block-out so the preview always
 * reflects the chosen redaction mode.
 */
export function buildRedactedText(
  text: string,
  spans: PiiSpan[],
  effect: RedactionEffect = 'token',
): string {
  const active = spans
    .filter((s) => s.enabled && s.start != null && s.end != null)
    .sort((a, b) => (b.start ?? 0) - (a.start ?? 0))
  const perTypeCount: Record<string, number> = {}
  // Assign tokens front-to-back for stable numbering, then splice back-to-front.
  const ordered = [...active].sort((a, b) => (a.start ?? 0) - (b.start ?? 0))
  const tokenById = new Map<string, string>()
  for (const s of ordered) {
    const idx = perTypeCount[s.type] ?? 0
    perTypeCount[s.type] = idx + 1
    tokenById.set(s.id, tokenForType(s.type, idx))
  }
  let out = text
  for (const s of active) {
    const fx = s.effect ?? effect
    const replacement = fx === 'token'
      ? (tokenById.get(s.id) ?? '[REDACTED]')
      : '█'.repeat(Math.max(1, (s.end! - s.start!)))
    out = out.slice(0, s.start!) + replacement + out.slice(s.end!)
  }
  return out
}

export function redactedTextBlob(text: string, spans: PiiSpan[], effect: RedactionEffect = 'token'): Blob {
  return new Blob([buildRedactedText(text, spans, effect)], { type: 'text/plain;charset=utf-8' })
}

/** Draw a single redaction effect into a rectangle of a 2D context. */
function applyRedactionRect(
  ctx: CanvasRenderingContext2D,
  effect: RedactionEffect,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  if (w <= 0 || h <= 0) return
  ctx.save()
  if (effect === 'blur') {
    // Heavy, multi-pass blur so the text underneath is genuinely unreadable —
    // a light single pass left thin glyphs faintly legible on small spans.
    const radius = Math.max(14, Math.min(w, h) * 1.1)
    ctx.beginPath()
    ctx.rect(x, y, w, h)
    ctx.clip()
    for (let pass = 0; pass < 3; pass++) {
      ctx.filter = `blur(${radius}px)`
      ctx.drawImage(ctx.canvas, x, y, w, h, x, y, w, h)
    }
    ctx.filter = 'none'
  } else if (effect === 'pixelate') {
    // Very coarse mosaic (≈2–3 blocks across the span) to destroy legibility.
    const block = Math.max(10, Math.floor(Math.min(w, h)))
    const tmp = document.createElement('canvas')
    tmp.width = Math.max(1, Math.round(w / block))
    tmp.height = Math.max(1, Math.round(h / block))
    const tctx = tmp.getContext('2d')!
    tctx.imageSmoothingEnabled = false
    tctx.drawImage(ctx.canvas, x, y, w, h, 0, 0, tmp.width, tmp.height)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(tmp, 0, 0, tmp.width, tmp.height, x, y, w, h)
  } else {
    // blackout (default) — opaque fill, the safest option.
    ctx.fillStyle = '#000'
    ctx.fillRect(x, y, w, h)
  }
  ctx.restore()
}

/** Bake redactions onto a page raster and return the resulting canvas. */
export async function renderRedactedPageCanvas(
  page: DocPage,
  spans: PiiSpan[],
  effect: RedactionEffect,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  canvas.width = page.widthPx
  canvas.height = page.heightPx
  const ctx = canvas.getContext('2d')!

  const img = new Image()
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('page image load failed'))
    img.src = page.imageUrl
  })
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const pad = 2
  for (const span of spans) {
    if (!span.enabled || !span.boxes) continue
    const fx = span.effect ?? effect
    if (fx === 'token') continue // token has no visual meaning on a raster
    for (const b of span.boxes) {
      if (b.pageIndex !== page.index) continue
      const x = b.x * canvas.width - pad
      const y = b.y * canvas.height - pad
      const w = b.width * canvas.width + pad * 2
      const h = b.height * canvas.height + pad * 2
      applyRedactionRect(ctx, fx, x, y, w, h)
    }
  }
  return canvas
}

/** Flatten redacted PDF pages into a new image-only PDF (no text layer). */
export async function exportFlattenedPdf(
  parsed: ParsedDocument,
  spans: PiiSpan[],
  effect: RedactionEffect,
): Promise<Blob> {
  if (!parsed.pages || parsed.pages.length === 0) throw new Error('no pages to export')
  const { jsPDF } = await import('jspdf')
  let pdf: import('jspdf').jsPDF | null = null

  for (let i = 0; i < parsed.pages.length; i++) {
    const page = parsed.pages[i]
    const canvas = await renderRedactedPageCanvas(page, spans, effect)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    const orientation = canvas.width >= canvas.height ? 'l' : 'p'
    if (!pdf) {
      pdf = new jsPDF({ orientation, unit: 'px', format: [canvas.width, canvas.height] })
    } else {
      pdf.addPage([canvas.width, canvas.height], orientation)
    }
    pdf.addImage(dataUrl, 'JPEG', 0, 0, canvas.width, canvas.height)
  }
  return pdf!.output('blob')
}

/** Export redacted page rasters as a ZIP of PNGs. */
export async function exportPagesZip(
  parsed: ParsedDocument,
  spans: PiiSpan[],
  effect: RedactionEffect,
  baseName: string,
): Promise<Blob> {
  if (!parsed.pages || parsed.pages.length === 0) throw new Error('no pages to export')
  const zip = new JSZip()
  const stem = baseName.replace(/\.[^.]+$/, '')
  for (const page of parsed.pages) {
    const canvas = await renderRedactedPageCanvas(page, spans, effect)
    const blob: Blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b!), 'image/png'),
    )
    zip.file(`${stem}-redacted-p${String(page.index + 1).padStart(2, '0')}.png`, blob)
  }
  return zip.generateAsync({ type: 'blob' })
}

export function redactedFilename(name: string, suffix: string): string {
  const dot = name.lastIndexOf('.')
  const stem = dot === -1 ? name : name.slice(0, dot)
  return `${stem.split('/').pop()}-redacted${suffix}`
}
