import type { AsciiCharset } from '../types'

export interface AsciiCharsetPickerProps {
  charset: AsciiCharset
  onChange: (charset: AsciiCharset) => void
  className?: string
}

const OPTIONS: { id: AsciiCharset; label: string; sample: string; hint: string }[] = [
  { id: 'all', label: 'All', sample: '@#&8', hint: 'Mixed symbols, letters & digits' },
  { id: 'numbers', label: 'Numbers', sample: '0123', hint: 'Digits only' },
  { id: 'letters', label: 'A–Z', sample: 'abXY', hint: 'Latin letters only' },
  { id: 'other', label: 'Other', sample: '§¤#%', hint: 'Punctuation & exotic glyphs' },
]

/** Selects which glyph family the ASCII anonymization effect renders from. */
export function AsciiCharsetPicker({ charset, onChange, className }: AsciiCharsetPickerProps) {
  return (
    <div className={`ascii-charset-picker${className ? ` ${className}` : ''}`}>
      <p className="ascii-charset-label">Characters</p>
      <div className="ascii-charset-grid" role="radiogroup" aria-label="ASCII character set">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={charset === opt.id}
            className={`ascii-charset-chip${charset === opt.id ? ' active' : ''}`}
            onClick={() => onChange(opt.id)}
            title={opt.hint}
          >
            <span className="ascii-charset-sample">{opt.sample}</span>
            <span className="ascii-charset-name">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
