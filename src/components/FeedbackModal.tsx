import { Icon } from './Icon'

interface FeedbackModalProps {
  subject: string
  message: string
  onChangeSubject: (value: string) => void
  onChangeMessage: (value: string) => void
  onClose: () => void
  onSent: () => void
}

const FEEDBACK_EMAIL = 'coinmandeer@gmail.com'
const FEEDBACK_SUBJECT_PREFIX = 'ANONYMIZER:'

/** Feedback modal — composes a mailto link. Presentational. */
export function FeedbackModal({
  subject,
  message,
  onChangeSubject,
  onChangeMessage,
  onClose,
  onSent,
}: FeedbackModalProps) {
  const mailSubject = `${FEEDBACK_SUBJECT_PREFIX} ${subject.trim()}`.trimEnd()
  const mailto = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(message)}`
  return (
    <div className="feedback-backdrop" onClick={onClose}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        <button className="about-modal-close" type="button" onClick={onClose} aria-label="Close">
          <Icon name="close" size={18} />
        </button>
        <h2 className="feedback-modal-title">Send Feedback</h2>
        <p className="feedback-modal-desc">
          We'd love to hear from you! Your message will open in your mail client.
        </p>
        <input
          type="text"
          className="feedback-subject"
          placeholder="Subject"
          value={subject}
          onChange={(e) => onChangeSubject(e.target.value)}
        />
        <textarea
          className="feedback-textarea"
          rows={6}
          placeholder="Tell us what you think, report a bug, or suggest a feature…"
          value={message}
          onChange={(e) => onChangeMessage(e.target.value)}
        />
        <div className="feedback-modal-actions">
          <button className="btn btn-sm" type="button" onClick={onClose}>Cancel</button>
          <a
            className="btn btn-sm btn-primary feedback-modal-send"
            href={mailto}
            target="_blank"
            rel="noreferrer"
            onClick={onSent}
          >
            <Icon name="send" size={13} /> Send
          </a>
        </div>
      </div>
    </div>
  )
}
