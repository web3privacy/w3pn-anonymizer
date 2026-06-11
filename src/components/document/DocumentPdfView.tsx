import { useRef, useState } from 'react'
import type { ParsedDocument, PiiSpan, RedactionEffect } from '../../lib/document/documentTypes'
import { piiColor } from '../../lib/document/documentTypes'

type Draft = { pageIndex: number; x: number; y: number; w: number; h: number } | null

export interface DocumentPdfViewProps {
  parsed: ParsedDocument
  spans: PiiSpan[]
  effect: RedactionEffect
  activeSpanId: string | null
  onToggleSpan: (id: string) => void
  onAddManualBox: (pageIndex: number, x: number, y: number, w: number, h: number) => void
  onSelectSpan: (id: string | null) => void
}

export function DocumentPdfView({
  parsed, spans, effect, activeSpanId, onToggleSpan, onAddManualBox, onSelectSpan,
}: DocumentPdfViewProps) {
  const [draft, setDraft] = useState<Draft>(null)
  const dragRef = useRef<{ pageIndex: number; startX: number; startY: number } | null>(null)
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({})

  const relCoords = (pageIndex: number, clientX: number, clientY: number) => {
    const el = pageRefs.current[pageIndex]
    if (!el) return { x: 0, y: 0 }
    const r = el.getBoundingClientRect()
    return {
      x: Math.min(1, Math.max(0, (clientX - r.left) / r.width)),
      y: Math.min(1, Math.max(0, (clientY - r.top) / r.height)),
    }
  }

  const onDown = (pageIndex: number, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.doc-box')) return // toggling an existing box
    const { x, y } = relCoords(pageIndex, e.clientX, e.clientY)
    dragRef.current = { pageIndex, startX: x, startY: y }
    setDraft({ pageIndex, x, y, w: 0, h: 0 })
  }
  const onMove = (e: React.MouseEvent) => {
    const d = dragRef.current
    if (!d) return
    const { x, y } = relCoords(d.pageIndex, e.clientX, e.clientY)
    setDraft({
      pageIndex: d.pageIndex,
      x: Math.min(d.startX, x),
      y: Math.min(d.startY, y),
      w: Math.abs(x - d.startX),
      h: Math.abs(y - d.startY),
    })
  }
  const onUp = () => {
    const d = draft
    dragRef.current = null
    setDraft(null)
    if (d && d.w > 0.01 && d.h > 0.01) onAddManualBox(d.pageIndex, d.x, d.y, d.w, d.h)
  }

  return (
    <div className="doc-pdf-view" onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}>
      {parsed.pages!.map((page) => (
        <div
          key={page.index}
          className="doc-page"
          ref={(el) => { pageRefs.current[page.index] = el }}
          onMouseDown={(e) => onDown(page.index, e)}
          style={{ aspectRatio: `${page.widthPx} / ${page.heightPx}` }}
        >
          <img className="doc-page-img" src={page.imageUrl} alt={`Page ${page.index + 1}`} draggable={false} />
          {spans.map((s) =>
            (s.boxes ?? [])
              .filter((b) => b.pageIndex === page.index)
              .map((b, bi) => {
                const color = piiColor(s.type)
                return (
                  <div
                    key={`${s.id}-${bi}`}
                    className={`doc-box${s.enabled ? ' doc-box--on' : ' doc-box--off'}${s.id === activeSpanId ? ' doc-box--active' : ''}${s.enabled && effect === 'blackout' ? ' doc-box--blackout' : ''}`}
                    style={{
                      left: `${b.x * 100}%`, top: `${b.y * 100}%`,
                      width: `${b.width * 100}%`, height: `${b.height * 100}%`,
                      ['--pii' as string]: color,
                    }}
                    title={`${s.type} — click to toggle`}
                    onClick={(e) => { e.stopPropagation(); onSelectSpan(s.id); onToggleSpan(s.id) }}
                  />
                )
              }),
          )}
          {draft && draft.pageIndex === page.index && (
            <div
              className="doc-box doc-box--draft"
              style={{ left: `${draft.x * 100}%`, top: `${draft.y * 100}%`, width: `${draft.w * 100}%`, height: `${draft.h * 100}%` }}
            />
          )}
          <span className="doc-page-num">{page.index + 1}</span>
        </div>
      ))}
    </div>
  )
}
