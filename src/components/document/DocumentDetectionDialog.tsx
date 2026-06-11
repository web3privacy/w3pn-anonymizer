import { useMemo } from 'react'
import { createPortal } from 'react-dom'
import type { PiiCategory, PiiSpan } from '../../lib/document/documentTypes'
import {
  PII_CATEGORY_COLORS,
  PII_CATEGORY_LABELS,
  PII_CATEGORY_ORDER,
  piiCategory,
  piiColor,
  piiLabel,
} from '../../lib/document/documentTypes'
import { Icon } from '../Icon'

export interface DocumentDetectionDialogProps {
  open: boolean
  onClose: () => void
  spans: PiiSpan[]
  activeSpanId: string | null
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onSelect: (id: string | null) => void
  onSetAll: (enabled: boolean) => void
}

export function DocumentDetectionDialog({
  open, onClose, spans, activeSpanId, onToggle, onRemove, onSelect, onSetAll,
}: DocumentDetectionDialogProps) {
  const grouped = useMemo(() => {
    const map = new Map<PiiCategory, PiiSpan[]>()
    for (const s of spans) {
      const cat = piiCategory(s.type)
      const list = map.get(cat) ?? []
      list.push(s)
      map.set(cat, list)
    }
    return PII_CATEGORY_ORDER
      .map((cat) => ({ cat, items: map.get(cat) ?? [] }))
      .filter((g) => g.items.length > 0)
  }, [spans])

  const enabledCount = useMemo(() => spans.filter((s) => s.enabled).length, [spans])

  if (!open) return null

  return createPortal(
    <div className="doc-detect-backdrop" onClick={onClose}>
      <div
        className="doc-detect-sheet"
        role="dialog"
        aria-label="Detected sensitive data"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="doc-detect-header">
          <h2>Detected · {enabledCount}/{spans.length} on</h2>
          <div className="doc-detect-header-actions">
            <button type="button" className="btn btn-sm" onClick={() => onSetAll(true)}>All</button>
            <button type="button" className="btn btn-sm" onClick={() => onSetAll(false)}>None</button>
            <button type="button" className="doc-detect-close" onClick={onClose} aria-label="Close">
              <Icon name="close" size={18} />
            </button>
          </div>
        </div>

        <div className="doc-detect-body">
          {spans.length === 0 ? (
            <div className="doc-detection-empty">No sensitive data detected.</div>
          ) : (
            grouped.map(({ cat, items }) => (
              <section key={cat} className="doc-detect-group">
                <header className="doc-detect-group-head">
                  <span className="doc-detection-dot" style={{ background: PII_CATEGORY_COLORS[cat] }} />
                  <span className="doc-detect-group-title">{PII_CATEGORY_LABELS[cat]}</span>
                  <span className="doc-detect-group-count">{items.length}</span>
                </header>
                <ul className="doc-detection-list">
                  {items.map((s) => (
                    <li
                      key={s.id}
                      className={`doc-detection-row${s.id === activeSpanId ? ' active' : ''}${s.enabled ? '' : ' off'}`}
                      onMouseEnter={() => onSelect(s.id)}
                    >
                      <input
                        type="checkbox"
                        checked={s.enabled}
                        onChange={() => onToggle(s.id)}
                        aria-label={`Toggle ${piiLabel(s.type)}`}
                      />
                      <span className="doc-detection-dot" style={{ background: piiColor(s.type) }} />
                      <span className="doc-detection-type">{piiLabel(s.type)}</span>
                      <span className="doc-detection-text">{s.text}</span>
                      <button
                        type="button"
                        className="doc-detection-remove"
                        title="Remove (false positive)"
                        onClick={() => onRemove(s.id)}
                      >
                        <Icon name="close" size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
