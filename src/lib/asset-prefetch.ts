/**
 * Background asset prefetcher. Warms the HTTP cache for heavy, optional models
 * (YOLO ONNX, on-device OCR engine + language data) while the user is idle on
 * the home / hypno screen, so the first real detection feels instant without
 * bloating the initial app load.
 *
 * Prefetch is driven by which detection categories are actually enabled, so a
 * default session (faces + license plates + sensitive text) only warms the
 * license-plate model and the OCR engine — the broader COCO / custom privacy
 * models stream in only once the user opts into those extra targets.
 *
 * Everything stays local: this only fetches files already served from /public.
 * Respects Save-Data and very slow connections, and never blocks the UI.
 */

import type { PrivacyDetectionType } from '../types'
import { MODELS_FOR_DETECTION_TYPE } from './detections/detection-availability'

export type PrefetchPhase = 'idle' | 'running' | 'done' | 'skipped'

export type PrefetchState = {
  phase: PrefetchPhase
  /** Bytes downloaded so far across all assets. */
  loaded: number
  /** Estimated total bytes (sum of discovered content-lengths). */
  total: number
  /** Assets fully fetched. */
  completed: number
  /** Total assets to fetch. */
  count: number
  label: string
}

type PrefetchCandidate = { url: string; label: string }

/** A bundle of files that back one optional capability. */
export type PrefetchGroup =
  | 'yolo-coco'
  | 'yolo-license-plate'
  | 'yolo-privacy-custom'
  | 'ocr'

// Heavy, optional assets grouped by capability. Faces (YuNet) + live mode load
// on boot elsewhere and are intentionally NOT listed here.
const GROUP_CANDIDATES: Record<PrefetchGroup, PrefetchCandidate[]> = {
  'yolo-coco': [{ url: '/models/privacy/yolo-coco.onnx', label: 'Object detection model' }],
  'yolo-license-plate': [{ url: '/models/privacy/yolo-license-plate.onnx', label: 'License-plate model' }],
  'yolo-privacy-custom': [{ url: '/models/privacy/yolo-privacy-custom.onnx', label: 'Privacy model' }],
  ocr: [
    { url: '/tesseract/tesseract-core-simd-lstm.wasm.js', label: 'OCR engine' },
    { url: '/tesseract/tesseract-core-simd-lstm.wasm', label: 'OCR engine' },
    { url: '/tesseract/lang/eng.traineddata', label: 'OCR · English' },
    { url: '/tesseract/lang/ces.traineddata', label: 'OCR · Czech' },
  ],
}

/** Map the enabled detection categories to the prefetch groups they need. */
export function prefetchGroupsForConfig(
  config: ReadonlyArray<{ type: PrivacyDetectionType; enabled: boolean }>,
): PrefetchGroup[] {
  const groups = new Set<PrefetchGroup>()
  for (const cat of config) {
    if (!cat.enabled) continue
    // Sensitive text runs on the local OCR engine, not a YOLO model.
    if (cat.type === 'pii_text') { groups.add('ocr'); continue }
    for (const modelId of MODELS_FOR_DETECTION_TYPE[cat.type] ?? []) {
      if (modelId in GROUP_CANDIDATES) groups.add(modelId as PrefetchGroup)
    }
  }
  return [...groups]
}

let state: PrefetchState = {
  phase: 'idle', loaded: 0, total: 0, completed: 0, count: 0, label: '',
}
// URLs already warmed (or in-flight) so repeated calls only fetch new groups.
const warmedUrls = new Set<string>()
let queue: PrefetchCandidate[] = []
let running = false
const listeners = new Set<(s: PrefetchState) => void>()

function emit(patch: Partial<PrefetchState>) {
  state = { ...state, ...patch }
  for (const cb of listeners) cb(state)
}

export function getPrefetchState(): PrefetchState {
  return state
}

export function subscribePrefetch(cb: (s: PrefetchState) => void): () => void {
  listeners.add(cb)
  cb(state)
  return () => listeners.delete(cb)
}

type NetworkInformation = {
  saveData?: boolean
  effectiveType?: string
}

/** Skip heavy prefetch on metered / very slow connections. */
function shouldSkipForConnection(): boolean {
  const nav = navigator as Navigator & { connection?: NetworkInformation }
  const conn = nav.connection
  if (!conn) return false
  if (conn.saveData) return true
  if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') return true
  return false
}

/** HEAD each candidate; keep the ones that are actually served (and look binary). */
async function discoverAssets(
  candidates: PrefetchCandidate[],
): Promise<{ url: string; label: string; bytes: number }[]> {
  const out: { url: string; label: string; bytes: number }[] = []
  await Promise.all(candidates.map(async (c) => {
    try {
      const res = await fetch(c.url, { method: 'HEAD' })
      const type = res.headers.get('content-type') ?? ''
      const len = Number(res.headers.get('content-length') ?? 0)
      // Dev servers may not send content-length; still prefetch if not HTML.
      if (!res.ok || type.includes('text/html')) return
      if (len > 0 && len < 10_000) return // stub / placeholder, not a real model
      out.push({ url: c.url, label: c.label, bytes: len })
    } catch {
      /* unreachable asset — skip */
    }
  }))
  return out
}

async function fetchWithProgress(url: string, onChunk: (n: number) => void): Promise<void> {
  const res = await fetch(url, { cache: 'force-cache' })
  if (!res.ok || !res.body) {
    // Consume anyway so it lands in cache, then bail.
    await res.arrayBuffer().catch(() => undefined)
    return
  }
  const reader = res.body.getReader()
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) onChunk(value.byteLength)
  }
}

async function drainQueue(): Promise<void> {
  while (queue.length > 0) {
    const batch = queue
    queue = []
    const assets = await discoverAssets(batch)
    const fresh = assets.filter((a) => !warmedUrls.has(a.url))
    if (fresh.length === 0) continue
    // Reserve the URLs up front so a concurrent call doesn't re-enqueue them.
    for (const a of fresh) warmedUrls.add(a.url)

    const total = state.total + fresh.reduce((sum, a) => sum + a.bytes, 0)
    emit({ phase: 'running', total, count: state.count + fresh.length, label: 'Loading privacy models…' })

    for (const asset of fresh) {
      emit({ label: asset.label })
      try {
        await fetchWithProgress(asset.url, (n) => emit({ loaded: state.loaded + n }))
      } catch {
        /* ignore individual failures; keep warming the rest */
      }
      emit({ completed: state.completed + 1 })
    }
  }
  emit({ phase: 'done', label: 'Privacy models ready', loaded: Math.max(state.loaded, state.total) })
}

/**
 * Warm the HTTP cache for the given capability groups. Safe to call repeatedly
 * and incrementally — only groups (and URLs) not already warmed are fetched, so
 * enabling an extra detection target later streams in just that model. Returns
 * immediately; progress arrives via subscribers.
 */
export function startAssetPrefetch(groups: PrefetchGroup[]): void {
  if (shouldSkipForConnection()) {
    if (state.phase === 'idle') emit({ phase: 'skipped', label: 'Prefetch skipped (data saver)' })
    return
  }

  for (const group of groups) {
    for (const candidate of GROUP_CANDIDATES[group] ?? []) {
      if (warmedUrls.has(candidate.url)) continue
      if (queue.some((q) => q.url === candidate.url)) continue
      queue.push(candidate)
    }
  }

  if (running || queue.length === 0) return
  running = true
  void drainQueue().finally(() => { running = false })
}

/** Test seam. */
export function _resetPrefetchForTest(): void {
  running = false
  queue = []
  warmedUrls.clear()
  listeners.clear()
  state = { phase: 'idle', loaded: 0, total: 0, completed: 0, count: 0, label: '' }
}
