import type { DetectorLoadProgress } from '../lib/detector'

interface ModelLoadStatusProps {
  active: boolean
  progress: DetectorLoadProgress | null
  /** Full-screen overlay on the home screen; compact toast elsewhere. */
  variant?: 'overlay' | 'toast'
}

function progressPercent(progress: DetectorLoadProgress | null): number | null {
  if (!progress || progress.total <= 0) return null
  return Math.min(100, Math.round((progress.loaded / progress.total) * 100))
}

export function ModelLoadStatus({ active, progress, variant = 'toast' }: ModelLoadStatusProps) {
  if (!active) return null

  const phase = progress?.phase ?? 'init'
  const pct = progressPercent(progress)
  const isReady = phase === 'ready'
  const isDownload = phase === 'download' && pct !== null

  const label = isReady
    ? 'Face detection ready'
    : isDownload
      ? 'Loading face model'
      : phase === 'init'
        ? 'Starting face detection…'
        : 'Preparing face detection…'

  const detail = isDownload && progress && progress.total > 0
    ? `${(progress.loaded / 1048576).toFixed(1)} / ${(progress.total / 1048576).toFixed(1)} MB${pct !== null ? ` · ${pct}%` : ''}`
    : isReady
      ? 'Ready'
      : pct !== null && phase === 'init'
        ? `${pct}%`
        : null

  const barWidth = isReady
    ? 100
    : pct ?? (phase === 'init' ? undefined : 0)

  const content = (
    <>
      {isReady ? (
        <span className="model-load-toast-check" aria-hidden="true">✓</span>
      ) : (
        <span className="model-load-toast-spinner" aria-hidden="true" />
      )}
      <div className="model-load-toast-body">
        <span className="model-load-toast-label">{label}</span>
        {detail && <span className="model-load-toast-bytes">{detail}</span>}
        {!isReady && (
          <span
            className={`model-load-toast-bar${barWidth === undefined ? ' model-load-toast-bar--indeterminate' : ''}`}
            aria-hidden="true"
          >
            {barWidth !== undefined && (
              <span className="model-load-toast-fill" style={{ width: `${barWidth}%` }} />
            )}
          </span>
        )}
      </div>
    </>
  )

  if (variant === 'overlay') {
    return (
      <div className="model-load-overlay" role="status" aria-live="polite" aria-busy={!isReady}>
        <div className={`model-load-overlay-card${isReady ? ' model-load-overlay-card--ready' : ''}`}>
          {content}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`model-load-toast${isReady ? ' model-load-toast--ready' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy={!isReady}
    >
      {content}
    </div>
  )
}
