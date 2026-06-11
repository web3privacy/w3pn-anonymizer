/**
 * Local-first document anonymization types. Everything here is processed in the
 * browser — no upload, no OCR, no network. PII text is never persisted.
 */

export type DocumentKind = 'pdf' | 'txt' | 'md' | 'docx'

/** Categories of sensitive information we detect. */
export type PiiType =
  | 'email'
  | 'phone'
  | 'credit_card'
  | 'iban'
  | 'url'
  | 'ip'
  | 'national_id' // CZ rodné číslo (and similar)
  | 'crypto'
  | 'secret' // API keys / tokens / private keys
  | 'postal_code'
  | 'person' // reserved for optional local NER (v1.5)
  | 'manual' // user-drawn redaction

/** Where a detection came from (affects trust / default-enabled). */
export type PiiSource = 'regex' | 'ner' | 'manual'

export type RedactionEffect = 'blackout' | 'blur' | 'pixelate' | 'token'

/** A normalized [0..1] box on a specific page (for PDF/visual redaction). */
export type PageBox = {
  pageIndex: number
  x: number
  y: number
  width: number
  height: number
}

/**
 * One detected (or manual) PII span. For text documents `start`/`end` index into
 * the plain-text buffer; for PDFs the `boxes` carry page-relative geometry.
 */
export type PiiSpan = {
  id: string
  type: PiiType
  /** The matched text (kept only in memory, never written to disk). */
  text: string
  source: PiiSource
  confidence: number
  /** Plain-text offsets (TXT/MD/DOCX). */
  start?: number
  end?: number
  /** Page geometry (PDF; may be multiple boxes if the match wraps lines). */
  boxes?: PageBox[]
  /** User toggle — false = treated as false-positive, not redacted. */
  enabled: boolean
  /** Per-span effect override; falls back to the document-level effect. */
  effect?: RedactionEffect
}

export type DocTextItem = {
  str: string
  /** Normalized [0..1] box relative to the page. */
  x: number
  y: number
  width: number
  height: number
  /** Character offset of this item's first char within the page's plain text. */
  charStart: number
}

export type DocPage = {
  index: number
  /** Rendered raster (object URL) for the page background. */
  imageUrl: string
  widthPx: number
  heightPx: number
  /** Plain text of the page (concatenated items). */
  text: string
  items: DocTextItem[]
}

export type ParsedDocument = {
  kind: DocumentKind
  /** Whole-document plain text (TXT/MD/DOCX) or concatenation of page text (PDF). */
  text: string
  /** Present for PDF (and rasterized formats). */
  pages?: DocPage[]
}

export const PII_TYPE_LABELS: Record<PiiType, string> = {
  email: 'Email',
  phone: 'Phone',
  credit_card: 'Payment card',
  iban: 'IBAN / bank',
  url: 'URL',
  ip: 'IP address',
  national_id: 'National ID',
  crypto: 'Crypto address',
  secret: 'Secret / key',
  postal_code: 'Postal code',
  person: 'Person',
  manual: 'Manual',
}

/** Distinct, high-contrast colors per PII category for overlays. */
export const PII_COLORS: Record<PiiType, string> = {
  email: '#00C2FF',
  phone: '#00FF78',
  credit_card: '#FFB000',
  iban: '#FF7A1A',
  url: '#7C5CFF',
  ip: '#21D4FD',
  national_id: '#FF4FD8',
  crypto: '#F5D90A',
  secret: '#FF3B3B',
  postal_code: '#8AE234',
  person: '#B388FF',
  manual: '#B6B6B6',
}

export const DEFAULT_REDACTION_EFFECT: RedactionEffect = 'blackout'

export function piiColor(type: PiiType): string {
  return PII_COLORS[type] ?? '#B6B6B6'
}

export function piiLabel(type: PiiType): string {
  return PII_TYPE_LABELS[type] ?? type
}

/** Coarse buckets for grouping the review list (email / card / phone / info / other). */
export type PiiCategory = 'email' | 'card' | 'phone' | 'info' | 'other'

const PII_TYPE_CATEGORY: Record<PiiType, PiiCategory> = {
  email: 'email',
  credit_card: 'card',
  iban: 'card',
  phone: 'phone',
  national_id: 'info',
  person: 'info',
  ip: 'info',
  url: 'info',
  postal_code: 'info',
  crypto: 'other',
  secret: 'other',
  manual: 'other',
}

export const PII_CATEGORY_ORDER: PiiCategory[] = ['email', 'card', 'phone', 'info', 'other']

export const PII_CATEGORY_LABELS: Record<PiiCategory, string> = {
  email: 'Email',
  card: 'Cards & bank',
  phone: 'Phone',
  info: 'Info',
  other: 'Other',
}

/** Representative color per category (drives chips / group headers). */
export const PII_CATEGORY_COLORS: Record<PiiCategory, string> = {
  email: PII_COLORS.email,
  card: PII_COLORS.credit_card,
  phone: PII_COLORS.phone,
  info: PII_COLORS.national_id,
  other: PII_COLORS.secret,
}

export function piiCategory(type: PiiType): PiiCategory {
  return PII_TYPE_CATEGORY[type] ?? 'other'
}
