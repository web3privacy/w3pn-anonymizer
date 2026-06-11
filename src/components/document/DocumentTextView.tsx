import type { RedactionEffect } from '../../lib/document/documentTypes'

export interface DocumentTextViewProps {
  text: string
  redactedPreview: string | null
  showRedacted: boolean
  onToggleAnonymized: () => void
  onReplaceText: (text: string) => void
  /** Redaction style choices available for this (text) document. */
  effects: { id: RedactionEffect; label: string }[]
  effect: RedactionEffect
  onEffectChange: (effect: RedactionEffect) => void
}

export function DocumentTextView({
  text, redactedPreview, showRedacted, onToggleAnonymized, onReplaceText,
  effects, effect, onEffectChange,
}: DocumentTextViewProps) {
  return (
    <div className="doc-text-view">
      <div className="doc-text-controls">
        <button
          type="button"
          role="switch"
          aria-checked={showRedacted}
          className={`ab-switch doc-ab-switch${showRedacted ? ' is-anon' : ' is-orig'}`}
          onClick={onToggleAnonymized}
          disabled={!text.trim()}
          title="Toggle between the original text and the anonymized preview"
        >
          <span className="ab-switch-label ab-switch-label--orig">Orig</span>
          <span className="ab-switch-track" aria-hidden="true"><span className="ab-switch-thumb" /></span>
          <span className="ab-switch-label ab-switch-label--anon">Anon</span>
        </button>

        <div className="doc-effect-seg" role="group" aria-label="Redaction style">
          {effects.map((e) => (
            <button
              key={e.id}
              type="button"
              className={`doc-seg-btn${effect === e.id ? ' active' : ''}`}
              aria-pressed={effect === e.id}
              onClick={() => onEffectChange(e.id)}
            >{e.label}</button>
          ))}
        </div>
      </div>

      {showRedacted && redactedPreview != null ? (
        <pre className="doc-text-body doc-text-redacted">{redactedPreview}</pre>
      ) : (
        <textarea
          className="doc-text-body doc-text-editor"
          value={text}
          spellCheck={false}
          placeholder="Paste or type text here…"
          onChange={(e) => onReplaceText(e.target.value)}
        />
      )}
    </div>
  )
}
