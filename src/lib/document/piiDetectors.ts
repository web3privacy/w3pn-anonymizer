/**
 * Regex + checksum PII recognizers for the document anonymizer (v1). Pure
 * functions over plain text — no network, no model. Designed to be conservative
 * (validate with checksums where possible) to limit false positives, while the
 * UI still lets the user toggle every span on/off.
 */
import type { PiiSpan, PiiType } from './documentTypes'

export type RawMatch = {
  start: number
  end: number
  text: string
  confidence: number
}

export type Recognizer = {
  type: PiiType
  find: (text: string) => RawMatch[]
}

let counter = 0
function nextId(prefix: string): string {
  counter += 1
  return `${prefix}-${counter.toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

// ── Checksum validators ───────────────────────────────────────────

export function luhnValid(digits: string): boolean {
  const clean = digits.replace(/\D/g, '')
  if (clean.length < 12 || clean.length > 19) return false
  let sum = 0
  let alt = false
  for (let i = clean.length - 1; i >= 0; i--) {
    let d = clean.charCodeAt(i) - 48
    if (alt) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
    alt = !alt
  }
  return sum % 10 === 0
}

export function ibanValid(raw: string): boolean {
  const s = raw.replace(/\s+/g, '').toUpperCase()
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(s)) return false
  // Move first 4 chars to the end, convert letters to numbers, mod 97 === 1.
  const rearranged = s.slice(4) + s.slice(0, 4)
  let remainder = 0
  for (const ch of rearranged) {
    const code = ch >= 'A' && ch <= 'Z' ? (ch.charCodeAt(0) - 55).toString() : ch
    for (const digit of code) {
      remainder = (remainder * 10 + (digit.charCodeAt(0) - 48)) % 97
    }
  }
  return remainder === 1
}

/** CZ/SK rodné číslo (national ID): YYMMDD/XXX(X), mod 11 for the long form. */
export function rodneCisloValid(raw: string): boolean {
  const s = raw.replace(/\s+/g, '')
  const m = /^(\d{2})(\d{2})(\d{2})\/?(\d{3,4})$/.exec(s)
  if (!m) return false
  const month = parseInt(m[2], 10) % 50 % 20 // strip +50 (women) / +20 markers
  if (month < 1 || month > 12) return false
  const day = parseInt(m[3], 10)
  if (day < 1 || day > 31) return false
  const tail = m[4]
  if (tail.length === 4) {
    const full = m[1] + m[2] + m[3] + tail
    return parseInt(full, 10) % 11 === 0
  }
  return true // pre-1954 9-digit form has no checksum
}

// ── Recognizers ───────────────────────────────────────────────────

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const URL_RE = /\bhttps?:\/\/[^\s<>"')\]]+/gi
const IPV4_RE = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g
const IPV6_RE = /\b(?:[a-fA-F0-9]{1,4}:){2,7}[a-fA-F0-9]{1,4}\b/g
// Phone: international or grouped local numbers (7-15 digits with separators).
const PHONE_RE = /(?<![\w.])(?:\+\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?){2,5}\d{2,4}(?![\w])/g
const CARD_RE = /\b(?:\d[ -]?){13,19}\b/g
const IBAN_RE = /\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]){10,30}\b/gi
const NATIONAL_ID_RE = /\b\d{6}\/?\d{3,4}\b/g
const POSTAL_CZ_RE = /\b\d{3}[ ]?\d{2}\b/g
const BTC_RE = /\b(?:bc1[ac-hj-np-z02-9]{11,71}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})\b/g
const ETH_RE = /\b0x[a-fA-F0-9]{40}\b/g
// Secrets: common provider key shapes + PEM headers + long high-entropy tokens.
const SECRET_RE = new RegExp(
  [
    'sk_live_[0-9a-zA-Z]{16,}',
    'sk_test_[0-9a-zA-Z]{16,}',
    'AKIA[0-9A-Z]{16}',
    'gh[pousr]_[0-9a-zA-Z]{36,}',
    'xox[baprs]-[0-9a-zA-Z-]{10,}',
    'AIza[0-9A-Za-z_-]{35}',
    '-----BEGIN [A-Z ]*PRIVATE KEY-----',
    'eyJ[a-zA-Z0-9_-]{10,}\\.[a-zA-Z0-9_-]{10,}\\.[a-zA-Z0-9_-]{10,}', // JWT
  ].join('|'),
  'g',
)

function matchAll(re: RegExp, text: string, confidence: number, validate?: (s: string) => boolean): RawMatch[] {
  const out: RawMatch[] = []
  re.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const value = m[0]
    if (m.index === re.lastIndex) re.lastIndex++ // avoid zero-length loops
    if (validate && !validate(value)) continue
    out.push({ start: m.index, end: m.index + value.length, text: value, confidence })
  }
  return out
}

export const RECOGNIZERS: Recognizer[] = [
  { type: 'email', find: (t) => matchAll(EMAIL_RE, t, 0.97) },
  { type: 'url', find: (t) => matchAll(URL_RE, t, 0.9) },
  { type: 'secret', find: (t) => matchAll(SECRET_RE, t, 0.95) },
  { type: 'crypto', find: (t) => [...matchAll(ETH_RE, t, 0.96), ...matchAll(BTC_RE, t, 0.9)] },
  { type: 'iban', find: (t) => matchAll(IBAN_RE, t, 0.97, ibanValid) },
  { type: 'credit_card', find: (t) => matchAll(CARD_RE, t, 0.92, luhnValid) },
  { type: 'national_id', find: (t) => matchAll(NATIONAL_ID_RE, t, 0.85, rodneCisloValid) },
  { type: 'ip', find: (t) => [...matchAll(IPV4_RE, t, 0.85), ...matchAll(IPV6_RE, t, 0.8)] },
  { type: 'phone', find: (t) => matchAll(PHONE_RE, t, 0.6, (s) => (s.replace(/\D/g, '').length >= 7)) },
  { type: 'postal_code', find: (t) => matchAll(POSTAL_CZ_RE, t, 0.4) },
]

/** Type priority for resolving overlaps (specific + checksummed win). */
const TYPE_PRIORITY: Record<PiiType, number> = {
  secret: 100,
  iban: 95,
  credit_card: 90,
  crypto: 88,
  national_id: 85,
  email: 80,
  url: 70,
  ip: 60,
  phone: 40,
  postal_code: 20,
  person: 50,
  manual: 0,
}

/**
 * Run all recognizers over plain text and resolve overlaps so each character
 * region maps to a single span (the highest-priority / longest match wins).
 */
export function detectPiiInText(text: string): PiiSpan[] {
  const raw: Array<RawMatch & { type: PiiType }> = []
  for (const rec of RECOGNIZERS) {
    for (const m of rec.find(text)) raw.push({ ...m, type: rec.type })
  }
  // Sort by priority desc, then length desc, then position.
  raw.sort((a, b) => {
    const pa = TYPE_PRIORITY[a.type] ?? 0
    const pb = TYPE_PRIORITY[b.type] ?? 0
    if (pb !== pa) return pb - pa
    const la = a.end - a.start
    const lb = b.end - b.start
    if (lb !== la) return lb - la
    return a.start - b.start
  })

  const taken: Array<[number, number]> = []
  const overlaps = (s: number, e: number) => taken.some(([ts, te]) => s < te && e > ts)

  const spans: PiiSpan[] = []
  for (const m of raw) {
    if (overlaps(m.start, m.end)) continue
    taken.push([m.start, m.end])
    spans.push({
      id: nextId(m.type),
      type: m.type,
      text: m.text,
      source: 'regex',
      confidence: m.confidence,
      start: m.start,
      end: m.end,
      enabled: true,
    })
  }
  spans.sort((a, b) => (a.start ?? 0) - (b.start ?? 0))
  return spans
}

/** Stable token used to replace a redacted span in text exports. */
export function tokenForType(type: PiiType, index: number): string {
  const base = type.toUpperCase()
  return `[${base}_${index + 1}]`
}
