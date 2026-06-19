import type { ModelPreloadStatus } from '../hooks/useModelPreload'

/**
 * Inline (non-dialog) loading indicator shown on the home screen while the
 * privacy models warm up. Sits where the mode buttons will appear, so the
 * screen never looks idle/broken during the first slow model download.
 */
export function HomeModelPreloader({ status }: { status: ModelPreloadStatus }) {
  const indeterminate = status.pct === null
  return (
    <div className="home-preloader" role="status" aria-live="polite">
      <div className="home-preloader-head">
        <span className="home-preloader-spinner" aria-hidden="true" />
        <span className="home-preloader-label">{status.label}</span>
        {!indeterminate && <span className="home-preloader-pct">{status.pct}%</span>}
      </div>
      {status.detail && <span className="home-preloader-detail">{status.detail}</span>}
      <span className="home-preloader-bar" aria-hidden="true">
        <span
          className={`home-preloader-fill${indeterminate ? ' home-preloader-fill--indeterminate' : ''}`}
          style={indeterminate ? undefined : { width: `${status.pct}%` }}
        />
      </span>
    </div>
  )
}
