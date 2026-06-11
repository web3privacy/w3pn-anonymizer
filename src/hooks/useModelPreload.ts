import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getPrefetchState,
  subscribePrefetch,
  startAssetPrefetch,
  type PrefetchGroup,
  type PrefetchState,
} from '../lib/asset-prefetch'

/**
 * Models that back the default privacy session (faces + license plates +
 * sensitive text). Faces (YuNet) load via the detector hook on boot; the rest
 * are warmed here so detection feels instant the moment a mode opens. Heavier
 * opt-in models (COCO / custom) keep streaming in lazily when enabled.
 */
const DEFAULT_GROUPS: PrefetchGroup[] = ['yolo-license-plate', 'ocr']

/** Hard ceiling so the home screen never feels stuck behind a slow download. */
const MAX_WAIT_MS = 12_000
/** If prefetch never leaves idle (nothing to fetch / already cached), settle. */
const IDLE_SETTLE_MS = 1_400

export interface ModelPreloadStatus {
  /** True once the privacy engine is warm enough to reveal the mode buttons. */
  ready: boolean
  /** 0..100 combined progress, or null while indeterminate. */
  pct: number | null
  /** Human-readable label for the current loading step. */
  label: string
}

/**
 * Drives the integrated home-screen preloader. Eagerly warms the default model
 * set on mount, folds in the face-detector boot state, and reports a single
 * readiness flag + progress so the home screen can gate its mode buttons behind
 * a visible, never-stuck loading indicator.
 */
export function useModelPreload(detectorLoading: boolean): ModelPreloadStatus {
  const [state, setState] = useState<PrefetchState>(() => getPrefetchState())
  const [idleSettled, setIdleSettled] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const startedRef = useRef(false)

  useEffect(() => subscribePrefetch(setState), [])

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    startAssetPrefetch(DEFAULT_GROUPS)
    const settle = window.setTimeout(() => {
      if (getPrefetchState().phase === 'idle') setIdleSettled(true)
    }, IDLE_SETTLE_MS)
    const hard = window.setTimeout(() => setTimedOut(true), MAX_WAIT_MS)
    return () => {
      window.clearTimeout(settle)
      window.clearTimeout(hard)
    }
  }, [])

  return useMemo<ModelPreloadStatus>(() => {
    const prefetchReady =
      state.phase === 'done' || state.phase === 'skipped' || idleSettled
    const ready = timedOut || (!detectorLoading && prefetchReady)

    if (ready) {
      return { ready: true, pct: 100, label: 'Privacy models ready' }
    }

    // Prefer the concrete download percentage while models stream in.
    if (state.phase === 'running' && state.total > 0) {
      const pct = Math.min(99, Math.round((state.loaded / state.total) * 100))
      return { ready: false, pct, label: state.label || 'Loading privacy models…' }
    }

    if (detectorLoading) {
      return { ready: false, pct: null, label: 'Starting privacy engine…' }
    }

    return { ready: false, pct: null, label: state.label || 'Loading privacy models…' }
  }, [state, idleSettled, timedOut, detectorLoading])
}
