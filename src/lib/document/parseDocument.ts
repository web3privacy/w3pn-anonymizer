/**
 * Local document parsing. TXT/MD become a single plain-text buffer; PDFs are
 * rendered to page rasters with extracted text items mapped to normalized page
 * boxes (so PII matches can be turned into redaction rectangles). All in-browser.
 */
import type { DocPage, DocTextItem, DocumentKind, ParsedDocument } from './documentTypes'

export function kindFromName(name: string, mimeType?: string): DocumentKind | null {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf' || mimeType === 'application/pdf') return 'pdf'
  if (ext === 'md' || ext === 'markdown') return 'md'
  if (ext === 'txt' || mimeType?.startsWith('text/plain')) return 'txt'
  if (ext === 'docx') return 'docx'
  return null
}

export async function parseTextDocument(blob: Blob, kind: DocumentKind): Promise<ParsedDocument> {
  const text = await blob.text()
  return { kind, text }
}

let pdfWorkerReady = false
async function loadPdfjs() {
  const pdfjs = await import('pdfjs-dist')
  if (!pdfWorkerReady) {
    // Vite resolves the worker module to a fetchable URL; fall back to the
    // public copy when the bundler URL import is unavailable.
    try {
      const bundled = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
      pdfjs.GlobalWorkerOptions.workerSrc = bundled
    } catch {
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
    }
    pdfWorkerReady = true
  }
  return pdfjs
}

const MAX_RENDER_WIDTH = 1600

export async function parsePdfDocument(blob: Blob): Promise<ParsedDocument> {
  const pdfjs = await loadPdfjs()
  const data = await blob.arrayBuffer()
  const doc = await pdfjs.getDocument({ data, isEvalSupported: false }).promise
  const pages: DocPage[] = []
  const docTextChunks: string[] = []

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    const baseViewport = page.getViewport({ scale: 1 })
    const scale = Math.min(2.5, MAX_RENDER_WIDTH / baseViewport.width)
    const viewport = page.getViewport({ scale })

    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    const ctx = canvas.getContext('2d')!
    await page.render({ canvasContext: ctx, viewport }).promise

    const textContent = await page.getTextContent()
    const items: DocTextItem[] = []
    let pageText = ''
    for (const raw of textContent.items as Array<{ str: string; transform: number[]; width: number; height: number }>) {
      const str = raw.str
      const charStart = pageText.length
      // transform = [a, b, c, d, e, f]; e,f are the text origin in PDF user space.
      const tx = pdfjs.Util.transform(viewport.transform, raw.transform)
      const fontHeight = Math.hypot(tx[2], tx[3]) || raw.height * scale
      const wpx = raw.width * scale
      const xpx = tx[4]
      const ypx = tx[5] - fontHeight // top-left
      items.push({
        str,
        x: xpx / viewport.width,
        y: ypx / viewport.height,
        width: wpx / viewport.width,
        height: fontHeight / viewport.height,
        charStart,
      })
      pageText += str
      // pdfjs marks line breaks via hasEOL; add a space/newline to keep matches sane.
      if ((raw as unknown as { hasEOL?: boolean }).hasEOL) pageText += '\n'
      else pageText += ' '
    }

    const imageUrl = canvas.toDataURL('image/png')
    pages.push({
      index: p - 1,
      imageUrl,
      widthPx: canvas.width,
      heightPx: canvas.height,
      text: pageText,
      items,
    })
    docTextChunks.push(pageText)
  }

  await doc.destroy()
  return { kind: 'pdf', text: docTextChunks.join('\n\n'), pages }
}

export async function parseDocument(blob: Blob, kind: DocumentKind): Promise<ParsedDocument> {
  if (kind === 'pdf') return parsePdfDocument(blob)
  if (kind === 'docx') {
    // v1.5: DOCX support via mammoth → fall back to text extraction when wired.
    return parseTextDocument(blob, 'docx')
  }
  return parseTextDocument(blob, kind)
}

/**
 * Map a plain-text character range on a page to the set of item boxes it covers.
 * Over-covers at item granularity (safe for redaction).
 */
export function rangeToPageBoxes(page: DocPage, start: number, end: number): DocTextItem[] {
  return page.items.filter((item) => {
    const itemEnd = item.charStart + item.str.length
    return start < itemEnd && end > item.charStart
  })
}
