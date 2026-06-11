import type { ParsedDocument, PiiSpan } from './documentTypes'
import { detectPiiInText } from './piiDetectors'
import { rangeToPageBoxes } from './parseDocument'

/**
 * Detect PII across a parsed document. Text documents keep plain-text offsets;
 * PDFs additionally carry normalized page boxes derived from the text layer.
 */
export function detectDocumentPii(parsed: ParsedDocument): PiiSpan[] {
  if (parsed.kind !== 'pdf' || !parsed.pages) {
    return detectPiiInText(parsed.text)
  }

  const spans: PiiSpan[] = []
  for (const page of parsed.pages) {
    const pageSpans = detectPiiInText(page.text)
    for (const span of pageSpans) {
      const items = rangeToPageBoxes(page, span.start ?? 0, span.end ?? 0)
      if (items.length === 0) continue
      spans.push({
        ...span,
        boxes: items.map((it) => ({
          pageIndex: page.index,
          x: it.x,
          y: it.y,
          width: it.width,
          height: it.height,
        })),
      })
    }
  }
  return spans
}
