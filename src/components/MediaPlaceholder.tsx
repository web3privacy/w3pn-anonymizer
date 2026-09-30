/** Local SVG thumbnails for media that cannot be displayed in an <img>. */
export function MediaPlaceholder({ kind, className = '' }: {
  kind: 'audio' | 'txt' | 'pdf'
  className?: string
}) {
  return (
    <div className={`media-placeholder ${className}`} data-media-kind={kind} role="img" aria-label={`${kind === 'audio' ? 'Audio' : kind.toUpperCase()} file`}>
      <svg viewBox="0 0 32 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {kind === 'audio' ? (
          <path d="M4 15v6m6-12v18m6-22v26m6-22v18m6-12v6" />
        ) : (
          <>
            <path d="M7 3h12l7 7v22H7zM19 3v8h7" />
            {kind === 'pdf' ? <><rect x="11" y="15" width="11" height="8" rx="1" /><path d="m12 22 3-3 2 2 3-4 2 3M11 27h11" /></> : <path d="M11 16h11m-11 5h11m-11 5h8" />}
          </>
        )}
      </svg>
    </div>
  )
}
