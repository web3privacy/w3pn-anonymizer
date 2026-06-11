import { describe, it, expect } from 'vitest'
import {
  luhnValid,
  ibanValid,
  rodneCisloValid,
  detectPiiInText,
  tokenForType,
} from './piiDetectors'

describe('checksum validators', () => {
  it('validates credit cards via Luhn', () => {
    expect(luhnValid('4242 4242 4242 4242')).toBe(true) // Stripe test Visa
    expect(luhnValid('4111111111111111')).toBe(true)
    expect(luhnValid('1234 5678 9012 3456')).toBe(false)
    expect(luhnValid('123')).toBe(false)
  })

  it('validates IBAN via mod-97', () => {
    expect(ibanValid('GB82 WEST 1234 5698 7654 32')).toBe(true)
    expect(ibanValid('DE89 3704 0044 0532 0130 00')).toBe(true)
    expect(ibanValid('GB00 WEST 1234 5698 7654 32')).toBe(false)
  })

  it('validates CZ rodné číslo mod-11', () => {
    expect(rodneCisloValid('9001010007')).toBe(true) // divisible by 11
    expect(rodneCisloValid('900101/0007')).toBe(true)
    expect(rodneCisloValid('9001010008')).toBe(false)
    expect(rodneCisloValid('9913010007')).toBe(false) // month 99 invalid
  })
})

describe('detectPiiInText', () => {
  it('detects emails, IBAN, cards and crypto', () => {
    const text = [
      'Contact me at jane.doe@example.com or visit https://example.org/x.',
      'Card 4242 4242 4242 4242, IBAN GB82 WEST 1234 5698 7654 32.',
      'ETH 0x52908400098527886E0F7030069857D2E4169EE7 done.',
    ].join('\n')
    const spans = detectPiiInText(text)
    const types = new Set(spans.map((s) => s.type))
    expect(types.has('email')).toBe(true)
    expect(types.has('url')).toBe(true)
    expect(types.has('credit_card')).toBe(true)
    expect(types.has('iban')).toBe(true)
    expect(types.has('crypto')).toBe(true)
  })

  it('produces non-overlapping spans sorted by position', () => {
    const spans = detectPiiInText('a@b.com then 4111 1111 1111 1111')
    for (let i = 1; i < spans.length; i++) {
      expect((spans[i].start ?? 0)).toBeGreaterThanOrEqual(spans[i - 1].end ?? 0)
    }
  })

  it('does not flag a random 16-digit number that fails Luhn', () => {
    const spans = detectPiiInText('order number 1234567890123456 shipped')
    expect(spans.some((s) => s.type === 'credit_card')).toBe(false)
  })

  it('builds stable replacement tokens', () => {
    expect(tokenForType('email', 0)).toBe('[EMAIL_1]')
    expect(tokenForType('credit_card', 2)).toBe('[CREDIT_CARD_3]')
  })
})
