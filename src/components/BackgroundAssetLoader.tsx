import { useEffect, useState } from 'react'
import { getPrefetchState, subscribePrefetch, type PrefetchState } from '../lib/asset-prefetch'

/**
 * Unobtrusive corner pill showing background model-download progress. Visible
 * only while prefetch is running (and briefly after it completes), so it never
 * gets in the way of the home / hypno screen.
 */
export function BackgroundAssetLoader() {
  const [state, setState] = useState<PrefetchState>(() => getPrefetchState())
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => subscribePrefetch(setState), [])

  useEffect(() => {
    if (state.phase === 'running') setDismissed(false)
  }, [state.phase])

  // Auto-hide a short while after completion.
  useEffect(() => {
    if (state.phase !== 'done') return
    const t = setTimeout(() => setDismissed(true), 2600)
    return () => clearTimeout(t)
  }, [state.phase])

  if (dismissed) return null
  if (state.phase === 'idle' || state.phase === 'skipped') return null

  const pct = state.total > 0
    ? Math.min(100, Math.round((state.loaded / state.total) * 100))
    : null
  const isDone = state.phase === 'done'

  return (
    <div
      className={`bg-asset-loader${isDone ? ' bg-asset-loader--done' : ''}`}
      role="status"
      aria-live="polite"
    >
      {isDone ? (
        <span className="bg-asset-loader-check" aria-hidden="true">✓</span>
      ) : (
        <span className="bg-asset-loader-spinner" aria-hidden="true" />
      )}
      <div className="bg-asset-loader-body">
        <span className="bg-asset-loader-label">
          {isDone ? 'Privacy models ready' : state.label || 'Loading privacy models…'}
        </span>
        {!isDone && (
          <span className="bg-asset-loader-bar" aria-hidden="true">
            <span
              className={`bg-asset-loader-fill${pct === null ? ' bg-asset-loader-fill--indeterminate' : ''}`}
              style={pct !== null ? { width: `${pct}%` } : undefined}
            />
          </span>
        )}
      </div>
      {!isDone && pct !== null && <span className="bg-asset-loader-pct">{pct}%</span>}
    </div>
  )
}
