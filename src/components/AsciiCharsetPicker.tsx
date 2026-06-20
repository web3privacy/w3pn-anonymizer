import type { AsciiCharset } from '../types'

export interface AsciiCharsetPickerProps {
  charset: AsciiCharset
  onChange: (charset: AsciiCharset) => void
  color?: string
  onColorChange?: (color: string) => void
  className?: string
}

const OPTIONS: { id: AsciiCharset; label: string; sample: string; hint: string }[] = [
  { id: 'all', label: 'All', sample: '@#&8', hint: 'Mixed symbols, letters & digits' },
  { id: 'numbers', label: 'Numbers', sample: '0123', hint: 'Digits only' },
  { id: 'letters', label: 'A–Z', sample: 'abXY', hint: 'Latin letters only' },
  { id: 'other', label: 'Other', sample: '§¤#%', hint: 'Punctuation & exotic glyphs' },
]

/** Selects which glyph family the ASCII anonymization effect renders from. */
const ASCII_COLORS = ['#ffffff', '#72ff9f', '#ffd166', '#56d8ff', '#ff70c8']

export function AsciiCharsetPicker({ charset, onChange, color, onColorChange, className }: AsciiCharsetPickerProps) {
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
      {color && onColorChange && (
        <div className="ascii-color-row">
          <p className="ascii-charset-label">Text color</p>
          <div className="ascii-color-swatches">
            {ASCII_COLORS.map((option) => (
              <button
                key={option}
                type="button"
                className={`ascii-color-swatch${color.toLowerCase() === option ? ' active' : ''}`}
                style={{ backgroundColor: option }}
                onClick={() => onColorChange(option)}
                aria-label={`Set ASCII color ${option}`}
              />
            ))}
            <label className="ascii-color-custom" title="Choose custom ASCII color">
              <input type="color" value={color} onChange={(event) => onColorChange(event.target.value)} />
              <span>Custom</span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
