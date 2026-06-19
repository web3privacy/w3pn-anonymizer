import { useEffect, useMemo, useState } from 'react'
import {
  getPrefetchState,
  subscribePrefetch,
  type PrefetchState,
} from '../lib/asset-prefetch'
import type { DetectorLoadProgress } from '../lib/detector'

/**
 * Faces (YuNet) load via the detector hook on boot. Optional YOLO/OCR models
 * are intentionally not warmed here; they lazy-load only when a user enables
 * and runs the heavier detection path.
 */
/** If prefetch never leaves idle (nothing to fetch / already cached), settle. */
const IDLE_SETTLE_MS = 1_400

export interface ModelPreloadStatus {
  /** True once the privacy engine is warm enough to reveal the mode buttons. */
  ready: boolean
  /** 0..100 combined progress, or null while indeterminate. */
  pct: number | null
  /** Human-readable label for the current loading step. */
  label: string
  detail?: string
}

function modelLoadPercent(progress: DetectorLoadProgress | null): number | null {
  if (!progress || progress.total <= 0) return null
  return Math.min(99, Math.max(0, Math.round((progress.loaded / progress.total) * 100)))
}

function modelLoadDetail(progress: DetectorLoadProgress | null): string | undefined {
  if (!progress || progress.total <= 0) return undefined
  return `${(progress.loaded / 1048576).toFixed(1)} / ${(progress.total / 1048576).toFixed(1)} MB`
}

/**
 * Drives the integrated home-screen preloader. It waits only for the face
 * detector boot state; optional object/OCR models are loaded later by the
 * detection flow that actually requested them.
 */
export function useModelPreload(
  detectorLoading: boolean,
  modelLoadProgress: DetectorLoadProgress | null = null,
): ModelPreloadStatus {
  const [state, setState] = useState<PrefetchState>(() => getPrefetchState())
  const [idleSettled, setIdleSettled] = useState(false)

  useEffect(() => subscribePrefetch(setState), [])

  useEffect(() => {
    setIdleSettled(false)
    const settle = window.setTimeout(() => {
      const current = getPrefetchState().phase
      if (current === 'idle' || current === 'done' || current === 'skipped') {
        setIdleSettled(true)
      }
    }, IDLE_SETTLE_MS)
    return () => window.clearTimeout(settle)
  }, [])

  return useMemo<ModelPreloadStatus>(() => {
    const prefetchReady = state.phase !== 'running' || idleSettled
    const ready = !detectorLoading && prefetchReady

    if (ready) {
      return { ready: true, pct: 100, label: 'Privacy models ready' }
    }

    const facePct = modelLoadPercent(modelLoadProgress)
    if (detectorLoading && modelLoadProgress?.phase === 'download' && facePct !== null) {
      return {
        ready: false,
        pct: facePct,
        label: 'Loading face model…',
        detail: modelLoadDetail(modelLoadProgress),
      }
    }

    if (detectorLoading && modelLoadProgress?.phase === 'ready') {
      return { ready: false, pct: 99, label: 'Starting face detector…' }
    }

    // Prefer the concrete download percentage while models stream in.
    if (state.phase === 'running' && state.total > 0) {
      const pct = Math.min(99, Math.round((state.loaded / state.total) * 100))
      return { ready: false, pct, label: state.label || 'Loading privacy models…' }
    }

    if (detectorLoading) {
      return { ready: false, pct: 8, label: 'Starting face detector…' }
    }

    return { ready: false, pct: null, label: state.label || 'Loading privacy models…' }
  }, [state, idleSettled, detectorLoading, modelLoadProgress])
}
