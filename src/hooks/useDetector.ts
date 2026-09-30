import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
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

/** Load only when media or the camera needs the detector. One attempt at a time. */
export function useDetector(enabled = false): DetectorApi {
  const [detector, setDetector] = useState<DetectorStatus>({ mode: 'unavailable', message: 'Loads when needed.' })
  const [detectorLoading, setDetectorLoading] = useState(false)
  const [modelLoadProgress, setModelLoadProgress] = useState<DetectorLoadProgress | null>(null)
  const pending = useRef<Promise<DetectorStatus> | null>(null)
  const refreshDetector = useCallback((forceReset = true): Promise<DetectorStatus> => {
    if (pending.current) return pending.current
    setDetectorLoading(true)
    pending.current = (async () => {
      try {
        if (forceReset) resetDetectorStatus()
        const status = await initializeDetector()
        setDetector(status)
        return status
      } catch (error) {
        const status: DetectorStatus = { mode: 'unavailable', message: error instanceof Error ? error.message : 'Initialization failed.' }
        setDetector(status)
        return status
      } finally {
        setDetectorLoading(false)
        setModelLoadProgress(null)
        pending.current = null
      }
    })()
    return pending.current
  }, [])
  useEffect(() => {
    if (enabled) void refreshDetector(false)
  }, [enabled, refreshDetector])
  useEffect(() => {
    setModelLoadProgress(getDetectorLoadProgress())
    setDetectorLoadProgressCallback(setModelLoadProgress)
    return () => setDetectorLoadProgressCallback(null)
  }, [])
  return { detector, setDetector, detectorLoading, modelLoadProgress, refreshDetector }
}
