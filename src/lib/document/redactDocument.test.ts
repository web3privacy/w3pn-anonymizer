import { describe, it, expect } from 'vitest'
import { buildRedactedText } from './redactDocument'
import { detectPiiInText } from './piiDetectors'

describe('buildRedactedText', () => {
  it('replaces enabled spans with stable tokens and leaves the rest intact', () => {
    const text = 'Mail jane@example.com and john@example.com here.'
    const spans = detectPiiInText(text)
    const out = buildRedactedText(text, spans)
    expect(out).toBe('Mail [EMAIL_1] and [EMAIL_2] here.')
  })

  it('skips disabled spans (treated as false-positives)', () => {
    const text = 'a@b.com x@y.com'
    const spans = detectPiiInText(text)
    spans[0].enabled = false
    const out = buildRedactedText(text, spans)
    expect(out).toContain('a@b.com')
    expect(out).toContain('[EMAIL_')
  })

  it('handles overlapping offsets safely (back-to-front splice)', () => {
    const text = 'card 4242 4242 4242 4242 and iban GB82 WEST 1234 5698 7654 32 end'
    const spans = detectPiiInText(text)
    const out = buildRedactedText(text, spans)
    expect(out.startsWith('card [')).toBe(true)
    expect(out.endsWith('end')).toBe(true)
    expect(out).not.toContain('4242 4242')
  })
})
