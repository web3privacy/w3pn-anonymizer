import { useMemo, useState } from 'react'
import { Icon } from '../Icon'
import type { ModelAvailabilityStatus } from '../../types'
import { getAvailableExtraClasses, prettyClassName } from '../../lib/detections/class-catalog'

export interface DetectionClassListPanelProps {
  modelStatus: Record<string, ModelAvailabilityStatus>
  enabledClasses: string[]
  onToggleClass: (className: string, enabled: boolean) => void
  onSetAll: (classNames: string[], enabled: boolean) => void
  compact?: boolean
}

/** Searchable list of every raw YOLO class the ready models can detect, with an "All" master toggle. */
export function DetectionClassListPanel({
  modelStatus,
  enabledClasses,
  onToggleClass,
  onSetAll,
  compact = false,
}: DetectionClassListPanelProps) {
  const [query, setQuery] = useState('')

  const available = useMemo(() => getAvailableExtraClasses(modelStatus), [modelStatus])
  const enabledSet = useMemo(() => new Set(enabledClasses), [enabledClasses])
  const allNames = useMemo(() => available.map((e) => e.className), [available])
  const enabledCount = useMemo(
    () => allNames.filter((n) => enabledSet.has(n)).length,
    [allNames, enabledSet],
  )
  const allOn = allNames.length > 0 && enabledCount === allNames.length

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return available
    return available.filter((e) => e.className.toLowerCase().includes(q))
  }, [available, query])

  if (available.length === 0) {
    return (
      <div className={`detect-class-panel${compact ? ' detect-class-panel--compact' : ''}`}>
        <p className="detect-class-empty">
          No object models loaded yet. Add a YOLO model (e.g. <code>yolo-coco.onnx</code>) to detect
          additional object classes.
        </p>
      </div>
    )
  }

  return (
    <div className={`detect-class-panel${compact ? ' detect-class-panel--compact' : ''}`}>
      <p className="detect-class-hint">
        Detect any object the model knows. These draw boxes you anonymize with the selected effect.
      </p>

      <div className="detect-class-search">
        <Icon name="search" size={16} />
        <input
          type="text"
          value={query}
          placeholder="Search classes…"
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search detection classes"
        />
        {query && (
          <button type="button" className="detect-class-search-clear" onClick={() => setQuery('')} aria-label="Clear search">
            <Icon name="close" size={14} />
          </button>
        )}
      </div>

      <label className="detect-class-row detect-class-row--all">
        <span className="detect-class-name">
          <Icon name="select_all" size={18} />
          <span>All classes</span>
          <span className="detect-class-count">{enabledCount}/{allNames.length}</span>
        </span>
        <span className={`mobile-switch${allOn ? ' on' : ''}`}>
          <input
            type="checkbox"
            checked={allOn}
            onChange={(e) => onSetAll(allNames, e.target.checked)}
          />
          <span className="mobile-switch-track" />
          <span className="mobile-switch-knob" />
        </span>
      </label>

      <div className="detect-class-list">
        {filtered.map((entry) => {
          const on = enabledSet.has(entry.className)
          return (
            <label key={entry.className} className="detect-class-row">
              <span className="detect-class-name">{prettyClassName(entry.className)}</span>
              <span className={`mobile-switch${on ? ' on' : ''}`}>
                <input
                  type="checkbox"
                  checked={on}
                  onChange={(e) => onToggleClass(entry.className, e.target.checked)}
                />
                <span className="mobile-switch-track" />
                <span className="mobile-switch-knob" />
              </span>
            </label>
          )
        })}
        {filtered.length === 0 && (
          <p className="detect-class-empty">No classes match “{query}”.</p>
        )}
      </div>
    </div>
  )
}
