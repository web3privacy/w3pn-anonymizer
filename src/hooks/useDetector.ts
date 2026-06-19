import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import {
  initializeDetector,
  resetDetectorStatus,
  getDetectorLoadProgress,
  setDetectorLoadProgressCallback,
  type DetectorLoadProgress,
} from '../lib/detector'
import type { DetectorStatus } from '../types'

export interface DetectorApi {
  detector: DetectorStatus
  setDetector: Dispatch<SetStateAction<DetectorStatus>>
  detectorLoading: boolean
  modelLoadProgress: DetectorLoadProgress | null
  /** (Re)initialize the face detector; resolves with the resulting status. */
  refreshDetector: (forceReset?: boolean) => Promise<DetectorStatus>
}

/**
 * Owns the face-detector lifecycle: initial load, WASM/model download progress,
 * and automatic retries on window focus / visibility change / a polling loop
 * while the detector is unavailable. Extracted from App.tsx unchanged so the
 * lifecycle logic lives in one place. Everything runs locally in the browser.
 */
export function useDetector(): DetectorApi {
  const [detector, setDetector] = useState<DetectorStatus>({ mode: 'unavailable', message: 'Initializing...' })
  const [detectorLoading, setDetectorLoading] = useState(true)
  const [modelLoadProgress, setModelLoadProgress] = useState<DetectorLoadProgress | null>(() => getDetectorLoadProgress())

  const refreshDetector = useCallback(async (forceReset = true): Promise<DetectorStatus> => {
    setDetectorLoading(true)
    try {
      if (forceReset) resetDetectorStatus()
      const status = await Promise.race([
        initializeDetector(),
        new Promise<DetectorStatus>((_, reject) => {
          setTimeout(() => reject(new Error('Detector init timed out')), 45000)
        }),
      ])
      setDetector(status)
      setModelLoadProgress({ loaded: 1, total: 1, phase: 'ready' })
      await new Promise((resolve) => setTimeout(resolve, 400))
      return status
    } catch {
      const failed: DetectorStatus = { mode: 'unavailable', message: 'Initialization failed.' }
      setDetector(failed)
      await new Promise((resolve) => setTimeout(resolve, 600))
      return failed
    } finally {
      setDetectorLoading(false)
      setModelLoadProgress(null)
    }
  }, [])

  // Detector init
  useEffect(() => {
    void refreshDetector(false)
  }, [refreshDetector])

  // Surface model/WASM download progress so the loading state shows X / Y MB.
  useEffect(() => {
    setModelLoadProgress(getDetectorLoadProgress())
    setDetectorLoadProgressCallback((p) => setModelLoadProgress(p))
    return () => setDetectorLoadProgressCallback(null)
  }, [])

  useEffect(() => {
    const retryIfUnavailable = () => {
      if (document.visibilityState === 'hidden') return
      if (detectorLoading) return
      if (detector.mode !== 'unavailable') return
      void refreshDetector(true)
    }
    window.addEventListener('focus', retryIfUnavailable)
    document.addEventListener('visibilitychange', retryIfUnavailable)
    return () => {
      window.removeEventListener('focus', retryIfUnavailable)
      document.removeEventListener('visibilitychange', retryIfUnavailable)
    }
  }, [detector.mode, detectorLoading, refreshDetector])

  useEffect(() => {
    if (detectorLoading) return
    if (detector.mode !== 'unavailable') return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const retry = () => {
      if (cancelled || document.visibilityState === 'hidden') return
      void refreshDetector(true).then((status) => {
        if (!cancelled && status.mode === 'unavailable') {
          timer = setTimeout(retry, 2500)
        }
      })
    }

    timer = setTimeout(retry, 1200)
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [detector.mode, detectorLoading, refreshDetector])

  return { detector, setDetector, detectorLoading, modelLoadProgress, refreshDetector }
}
