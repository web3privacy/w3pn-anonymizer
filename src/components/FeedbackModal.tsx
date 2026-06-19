import { type FormEvent, useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'

interface FeedbackModalProps {
  subject: string
  message: string
  onChangeSubject: (value: string) => void
  onChangeMessage: (value: string) => void
  onClose: () => void
  onSent: () => void
}

const FEEDBACK_ENDPOINT =
  window.location.protocol === 'capacitor:' || window.location.protocol === 'ionic:'
    ? 'https://anonymizer.web3privacy.info/api/feedback'
    : '/api/feedback'

export function FeedbackModal({
  subject,
  message,
  onChangeSubject,
  onChangeMessage,
  onClose,
  onSent,
}: FeedbackModalProps) {
  const messageRef = useRef<HTMLTextAreaElement | null>(null)
  const requestRef = useRef<AbortController | null>(null)
  const closeTimerRef = useRef<number | null>(null)
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const canSend = message.trim().length > 1 && sendState !== 'sending'

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      messageRef.current?.focus({ preventScroll: true })
    })
    return () => {
      cancelAnimationFrame(frame)
      requestRef.current?.abort()
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    }
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSend) return

    setSendState('sending')
    setErrorMessage('')
    const controller = new AbortController()
    requestRef.current = controller

    try {
      const response = await fetch(FEEDBACK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
          page: window.location.href,
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: window.devicePixelRatio,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Feedback endpoint returned ${response.status}`)
      }

      setSendState('sent')
      closeTimerRef.current = window.setTimeout(onSent, 450)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setSendState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Feedback could not be sent.')
    } finally {
      if (requestRef.current === controller) requestRef.current = null
    }
  }

  return (
    <div className="feedback-backdrop" onClick={onClose}>
      <form
        className="feedback-modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => { void handleSubmit(e) }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
      >
        <button className="about-modal-close" type="button" onClick={onClose} aria-label="Close">
          <Icon name="close" size={18} />
        </button>
        <h2 className="feedback-modal-title" id="feedback-modal-title">Send Feedback</h2>
        <p className="feedback-modal-desc">
          We'd love to hear from you. Your message is sent anonymously to the W3PN feedback inbox.
        </p>
        <input
          type="text"
          className="feedback-subject"
          placeholder="Subject"
          value={subject}
          onChange={(e) => onChangeSubject(e.target.value)}
        />
        <textarea
          ref={messageRef}
          className="feedback-textarea"
          rows={6}
          placeholder="Tell us what you think, report a bug, or suggest a feature…"
          value={message}
          onChange={(e) => onChangeMessage(e.target.value)}
        />
        {sendState === 'error' && (
          <p className="feedback-modal-status feedback-modal-status--error" role="alert">
            Could not send feedback. Please try again in a moment.
          </p>
        )}
        {errorMessage && (
          <p className="feedback-modal-technical">{errorMessage}</p>
        )}
        {sendState === 'sent' && (
          <p className="feedback-modal-status feedback-modal-status--sent" role="status">
            Feedback sent. Thank you.
          </p>
        )}
        <div className="feedback-modal-actions">
          <button className="btn btn-sm" type="button" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-sm btn-primary feedback-modal-send"
            type="submit"
            disabled={!canSend}
          >
            <Icon name="send" size={13} /> {sendState === 'sending' ? 'Sending…' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}
