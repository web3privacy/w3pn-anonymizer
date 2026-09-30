import { useId } from 'react'
import { Icon } from './Icon'

/** Shared compact entry point; the existing feedback form opens on activation. */
export function FeedbackButton({ onClick }: { onClick: () => void }) {
  const hintId = useId()
  return (
    <span className="feedback-entry">
      <button type="button" className="feedback-entry-button" onClick={onClick} aria-label="Give feedback" aria-describedby={hintId}>
        <Icon name="chat_bubble_outline" size={18} />
      </button>
      <span id={hintId} className="feedback-entry-hint" role="tooltip">
        <strong>Feedback</strong>
        <span>A bug, an idea, or something we can improve?</span>
      </span>
    </span>
  )
}
