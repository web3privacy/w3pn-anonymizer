/** Identical selection indicator in both library layouts, independent of fonts. */
export function SelectionMark({ checked }: { checked: boolean }) {
  return <span className={`selection-mark${checked ? ' is-checked' : ''}`} aria-hidden="true">
    {checked && <svg viewBox="0 0 20 20" fill="none"><path d="m5 10 3.2 3.2L15 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
  </span>
}
