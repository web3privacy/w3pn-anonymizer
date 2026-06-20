import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '../Icon'
import { saveAs } from 'file-saver'
import type { PhotoItem } from '../../types'
import type { ParsedDocument, PiiCategory, PiiSpan, RedactionEffect } from '../../lib/document/documentTypes'
import {
  DEFAULT_REDACTION_EFFECT,
  PII_CATEGORY_COLORS,
  PII_CATEGORY_LABELS,
  PII_CATEGORY_ORDER,
  piiCategory,
} from '../../lib/document/documentTypes'
import { parseDocument } from '../../lib/document/parseDocument'
import { detectDocumentPii } from '../../lib/document/detectDocumentPii'
import { detectPiiInText } from '../../lib/document/piiDetectors'
import {
  buildRedactedText,
  redactedTextBlob,
  exportFlattenedPdf,
  exportPagesZip,
  redactedFilename,
} from '../../lib/document/redactDocument'
import { DocumentTextView } from './DocumentTextView'
import { DocumentPdfView } from './DocumentPdfView'
import { DocumentDetectionDialog } from './DocumentDetectionDialog'

const EFFECTS: { id: RedactionEffect; label: string; pdfOnly?: boolean; textOnly?: boolean }[] = [
  { id: 'blackout', label: 'Blackout' },
  { id: 'blur', label: 'Blur', pdfOnly: true },
  { id: 'pixelate', label: 'Pixelate', pdfOnly: true },
  { id: 'token', label: 'Token', textOnly: true },
]

let manualCounter = 0
const manualId = () => `manual-${(manualCounter += 1)}-${Math.random().toString(36).slice(2, 6)}`

export interface DocumentModeProps {
  activePhoto: PhotoItem
  /** Persist the redacted document back into the library item (export + outline). */
  onCommitAnonymized?: (blob: Blob, mimeType: string) => void
}

export function DocumentMode({ activePhoto, onCommitAnonymized }: DocumentModeProps) {
  const [parsed, setParsed] = useState<ParsedDocument | null>(null)
  const [spans, setSpans] = useState<PiiSpan[]>([])
  const [effect, setEffect] = useState<RedactionEffect>(DEFAULT_REDACTION_EFFECT)
  const [status, setStatus] = useState<'idle' | 'parsing' | 'ready' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [exporting, setExporting] = useState<string | null>(null)
  const [activeSpanId, setActiveSpanId] = useState<string | null>(null)
  const [detectOpen, setDetectOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showRedacted, setShowRedacted] = useState(true)
  const reqRef = useRef(0)

  const isPdf = activePhoto.documentKind === 'pdf'

  useEffect(() => {
    const kind = activePhoto.documentKind ?? 'txt'
    const req = ++reqRef.current
    setStatus('parsing')
    setParsed(null)
    setSpans([])
    setErrorMsg('')
    setShowRedacted(kind !== 'pdf')
    setEffect(DEFAULT_REDACTION_EFFECT)
    void parseDocument(activePhoto.blob, kind)
      .then((doc) => {
        if (req !== reqRef.current) return
        setParsed(doc)
        setSpans(detectDocumentPii(doc))
        setStatus('ready')
      })
      .catch((err) => {
        if (req !== reqRef.current) return
        console.error('document parse failed', err)
        setErrorMsg(err instanceof Error ? err.message : 'Failed to parse document')
        setStatus('error')
      })
  }, [activePhoto.blob, activePhoto.documentKind])

  const toggleSpan = useCallback((id: string) => {
    setSpans((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)))
  }, [])

  const removeSpan = useCallback((id: string) => {
    setSpans((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const setAllEnabled = useCallback((enabled: boolean) => {
    setSpans((prev) => prev.map((s) => ({ ...s, enabled })))
  }, [])

  const addManualBox = useCallback((pageIndex: number, x: number, y: number, w: number, h: number) => {
    const span: PiiSpan = {
      id: manualId(), type: 'manual', text: '(manual area)', source: 'manual', confidence: 1,
      boxes: [{ pageIndex, x, y, width: w, height: h }], enabled: true,
    }
    setSpans((prev) => [...prev, span])
    setActiveSpanId(span.id)
  }, [])

  // Replace the working text (paste / type) and re-detect immediately. Manual
  // spans are dropped because their offsets no longer map to the new text.
  const replaceText = useCallback((nextText: string) => {
    setShowRedacted(false)
    setParsed((prev) => (prev ? { ...prev, text: nextText } : { kind: 'txt', text: nextText }))
    setSpans(detectPiiInText(nextText))
    setActiveSpanId(null)
  }, [])

  const copyRedacted = useCallback(async () => {
    if (!parsed) return
    try {
      await navigator.clipboard.writeText(buildRedactedText(parsed.text, spans, effect))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch (err) {
      console.error('clipboard write failed', err)
      setErrorMsg('Clipboard blocked by the browser — use Save file instead.')
    }
  }, [parsed, spans, effect])

  const categorySummary = useMemo(() => {
    const map = new Map<PiiCategory, number>()
    for (const s of spans) map.set(piiCategory(s.type), (map.get(piiCategory(s.type)) ?? 0) + 1)
    return PII_CATEGORY_ORDER
      .map((cat) => ({ cat, n: map.get(cat) ?? 0 }))
      .filter((g) => g.n > 0)
  }, [spans])
  const enabledCount = useMemo(() => spans.filter((s) => s.enabled).length, [spans])

  const availableEffects = EFFECTS.filter((e) => (isPdf ? !e.textOnly : !e.pdfOnly))

  const doExport = async (kind: 'pdf' | 'zip' | 'txt') => {
    if (!parsed) return
    setExporting(kind)
    try {
      if (kind === 'txt') {
        const blob = redactedTextBlob(parsed.text, spans, effect)
        saveAs(blob, redactedFilename(activePhoto.name, '.txt'))
        // The redacted text is a faithful latest state — commit it to the library.
        onCommitAnonymized?.(blob, 'text/plain')
      } else if (kind === 'pdf') {
        const blob = await exportFlattenedPdf(parsed, spans, effect)
        saveAs(blob, redactedFilename(activePhoto.name, '.pdf'))
        onCommitAnonymized?.(blob, 'application/pdf')
      } else {
        // Pages ZIP is an image bundle, not a re-openable document — download only.
        const blob = await exportPagesZip(parsed, spans, effect, activePhoto.name)
        saveAs(blob, redactedFilename(activePhoto.name, '-pages.zip'))
      }
    } catch (err) {
      console.error('export failed', err)
      setErrorMsg(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="doc-mode">
      <div className="doc-stage">
        <div className="doc-stage-top">
          <div className="doc-stage-title">
            <span className="doc-stage-name">{activePhoto.name.split('/').pop()}</span>
            <span className="doc-kind-badge">{(activePhoto.documentKind ?? 'txt').toUpperCase()}</span>
          </div>
          <div className="doc-stage-meta">
            {status === 'ready' && `${enabledCount}/${spans.length} redactions`}
            {status === 'parsing' && 'Parsing…'}
          </div>
        </div>

        <div className="doc-canvas-area">
          {status === 'parsing' && <div className="doc-placeholder"><Icon name="hourglass_top" size={28} /> Parsing document locally…</div>}
          {status === 'error' && <div className="doc-placeholder doc-error"><Icon name="error" size={28} /> {errorMsg}</div>}
          {status === 'ready' && parsed && (
            // Guard on the parsed doc actually having pages: when switching from an
            // edited TXT to a PDF there is one render where `isPdf` is already true
            // but `parsed` is still the stale text doc (no pages) — rendering the PDF
            // view then would crash on `pages.map` and blank the whole app.
            isPdf && parsed.pages && parsed.pages.length > 0 ? (
              <DocumentPdfView
                parsed={parsed}
                spans={spans}
                effect={effect}
                activeSpanId={activeSpanId}
                onToggleSpan={toggleSpan}
                onAddManualBox={addManualBox}
                onSelectSpan={setActiveSpanId}
              />
            ) : (
              <DocumentTextView
                text={parsed.text}
                redactedPreview={buildRedactedText(parsed.text, spans, effect)}
                showRedacted={showRedacted}
                onToggleAnonymized={() => setShowRedacted((v) => !v)}
                onReplaceText={replaceText}
                effects={availableEffects}
                effect={effect}
                onEffectChange={setEffect}
              />
            )
          )}
        </div>
      </div>

      <aside className="doc-sidebar">
        {isPdf && (
          <div className="doc-sidebar-section">
            <div className="doc-section-head">
              <span>Redaction effect</span>
            </div>
            <div className="doc-effect-row">
              {availableEffects.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  className={`btn btn-sm${effect === e.id ? ' active' : ''}`}
                  onClick={() => setEffect(e.id)}
                >{e.label}</button>
              ))}
            </div>
          </div>
        )}

        <div className="doc-sidebar-section">
          <div className="doc-section-head">
            <span>Detected ({spans.length})</span>
          </div>
          {categorySummary.length > 0 ? (
            <div className="doc-type-legend doc-type-legend--scroll">
              {categorySummary.map(({ cat, n }) => (
                <span key={cat} className="doc-type-chip">
                  <span className="doc-type-dot" style={{ background: PII_CATEGORY_COLORS[cat] }} />
                  {PII_CATEGORY_LABELS[cat]} {n}
                </span>
              ))}
            </div>
          ) : (
            <p className="doc-privacy-note">No sensitive data detected yet.</p>
          )}
          <button
            type="button"
            className="btn doc-review-btn"
            onClick={() => setDetectOpen(true)}
            disabled={spans.length === 0}
          >
            <Icon name="fact_check" size={16} /> Review detected
          </button>
        </div>

        <div className="doc-sidebar-section doc-export">
          {isPdf ? (
            <>
              <button type="button" className="btn btn-primary" disabled={!!exporting} onClick={() => void doExport('pdf')}>
                <Icon name="save" size={16} /> {exporting === 'pdf' ? 'Saving…' : 'Save'}
              </button>
              <button type="button" className="btn" disabled={!!exporting} onClick={() => void doExport('zip')}>
                <Icon name="folder_zip" size={16} /> {exporting === 'zip' ? 'Saving…' : 'Save as images'}
              </button>
            </>
          ) : (
            <div className="doc-export-row">
              <button type="button" className="btn" onClick={() => void copyRedacted()}>
                <Icon name={copied ? 'check' : 'content_copy'} size={16} /> {copied ? 'Copied' : 'Copy'}
              </button>
              <button type="button" className="btn btn-primary" disabled={!!exporting} onClick={() => void doExport('txt')}>
                <Icon name="save" size={16} /> {exporting === 'txt' ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </aside>

      <DocumentDetectionDialog
        open={detectOpen}
        onClose={() => setDetectOpen(false)}
        spans={spans}
        activeSpanId={activeSpanId}
        onToggle={toggleSpan}
        onRemove={removeSpan}
        onSelect={setActiveSpanId}
        onSetAll={setAllEnabled}
      />
    </div>
  )
}
