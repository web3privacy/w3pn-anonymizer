import { describe, it, expect } from 'vitest'
import { piiDetectionsFromWords, type TessWord } from './ocrPiiDetector'

function word(text: string, x0: number, y0: number, x1: number, y1: number): TessWord {
  return { text, bbox: { x0, y0, x1, y1 }, confidence: 90 }
}

describe('piiDetectionsFromWords', () => {
  const W = 1000
  const H = 500

  it('locates an email token and boxes it over the word', () => {
    const words: TessWord[] = [
      word('Contact', 10, 10, 120, 40),
      word('me', 130, 10, 170, 40),
      word('at', 180, 10, 210, 40),
      word('john.doe@example.com', 220, 10, 520, 40),
    ]
    const dets = piiDetectionsFromWords(words, W, H)
    const email = dets.find((d) => d.objectClass === 'email')
    expect(email).toBeDefined()
    expect(email?.type).toBe('pii_text')
    // The box should sit roughly where the email word is (x normalized ~0.22).
    expect(email!.bbox.x).toBeGreaterThan(0.18)
    expect(email!.bbox.x).toBeLessThan(0.24)
    expect(email!.bbox.width).toBeGreaterThan(0)
  })

  it('detects a Luhn-valid credit card split across word tokens', () => {
    const words: TessWord[] = [
      word('Card:', 10, 60, 90, 90),
      word('4111', 100, 60, 180, 90),
      word('1111', 190, 60, 270, 90),
      word('1111', 280, 60, 360, 90),
      word('1111', 370, 60, 450, 90),
    ]
    const dets = piiDetectionsFromWords(words, W, H)
    const card = dets.find((d) => d.objectClass === 'credit_card')
    expect(card).toBeDefined()
    // Union spans the four number tokens.
    expect(card!.bbox.width).toBeGreaterThan((450 - 100) / W - 0.02)
  })

  it('returns nothing for plain text without PII', () => {
    const words: TessWord[] = [
      word('the', 10, 10, 60, 40),
      word('quick', 70, 10, 150, 40),
      word('brown', 160, 10, 250, 40),
      word('fox', 260, 10, 320, 40),
    ]
    expect(piiDetectionsFromWords(words, W, H)).toHaveLength(0)
  })

  it('respects the minimum confidence threshold', () => {
    const words: TessWord[] = [word('+420 777 123 456', 10, 10, 300, 40)]
    // Phone confidence is 0.6; a 0.9 floor should drop it.
    expect(piiDetectionsFromWords(words, W, H, 0.9)).toHaveLength(0)
    expect(piiDetectionsFromWords(words, W, H, 0.5).length).toBeGreaterThan(0)
  })
})
