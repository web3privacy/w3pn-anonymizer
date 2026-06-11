import { useState } from 'react'
import { Icon } from './Icon'

export interface InfoHintProps {
  text: string
  /** Accessible label for the trigger button. */
  label?: string
  size?: number
}

/**
 * Small info "ⓘ" trigger that reveals an explanatory note in a popover. Used to
 * tuck slider captions / help text away so control rows stay compact.
 */
export function InfoHint({ text, label = 'More info', size = 15 }: InfoHintProps) {
  const [open, setOpen] = useState(false)
  return (
    <span className="info-hint">
      <button
        type="button"
        className={`info-hint-btn${open ? ' active' : ''}`}
        aria-label={label}
        aria-expanded={open}
        title={text}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="info" size={size} />
      </button>
      {open && (
        <>
          <div className="info-hint-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="info-hint-pop" role="tooltip">{text}</div>
        </>
      )}
    </span>
  )
}
