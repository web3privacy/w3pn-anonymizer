import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { LiveRecorder } from '../lib/live-recorder'
import { saveLiveCapture } from './liveSessionBuffer'

// Hold duration before a press flips from "take photo" to "start video".
const HOLD_MS = 500
const RING_R = 30
const RING_C = 2 * Math.PI * RING_R

interface MobileLiveFloatingControlsProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  onCapturePhoto: () => void | Promise<void>
  onVideoSaved?: (blob: Blob, type: 'photo' | 'video') => void
  /** Live microphone track to mix into recorded video (capture records both). */
  getAudioTrack?: () => MediaStreamTrack | null
  onOpenCameraSettings?: () => void
  onToggleFlash?: () => void
  flashActive?: boolean
  flashAvailable?: boolean
  disabled?: boolean
  onRecordingChange?: (state: { recording: boolean; elapsedSec: number }) => void
}

export const MobileLiveFloatingControls = memo(function MobileLiveFloatingControls({
  canvasRef,
  onCapturePhoto,
  onVideoSaved,
  getAudioTrack,
  onOpenCameraSettings,
  onToggleFlash,
  flashActive,
  flashAvailable,
  disabled,
  onRecordingChange,
}: MobileLiveFloatingControlsProps) {
  const recorderRef = useRef(new LiveRecorder())
  const holdStartRef = useRef<number | null>(null)
  const rafRef = useRef(0)
  const recordingRef = useRef(false)
  const photoTakenRef = useRef(false)

  const [holdProgress, setHoldProgress] = useState(0)
  const [recording, setRecording] = useState(false)
  const [elapsedSec, setElapsedSec] = useState(0)

  const startRecording = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || recordingRef.current) return
    if (recorderRef.current.start(canvas, 24, getAudioTrack?.() ?? null)) {
      recordingRef.current = true
      setRecording(true)
      setElapsedSec(0)
    }
  }, [canvasRef, getAudioTrack])

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return
    recordingRef.current = false
    setRecording(false)
    const blob = await recorderRef.current.stop()
    setHoldProgress(0)
    setElapsedSec(0)
    if (blob && blob.size > 0) {
      saveLiveCapture(blob, 'video')
      onVideoSaved?.(blob, 'video')
    }
  }, [onVideoSaved])

  useEffect(() => {
    onRecordingChange?.({ recording, elapsedSec })
  }, [recording, elapsedSec, onRecordingChange])

  // Stop any in-flight recording on unmount (exit live / close overlay) so the
  // MediaRecorder and its cloned mic track don't keep running until tab close.
  useEffect(() => {
    const recorder = recorderRef.current
    return () => { if (recorder.isRecording()) void recorder.stop() }
  }, [])

  useEffect(() => {
    if (!recording) return
    const t0 = Date.now()
    const id = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - t0) / 1000))
    }, 250)
    return () => window.clearInterval(id)
  }, [recording])

  const cancelHoldAnimation = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || recordingRef.current) return
    photoTakenRef.current = false
    e.currentTarget.setPointerCapture(e.pointerId)
    holdStartRef.current = performance.now()
    setHoldProgress(0)

    const tick = () => {
      const start = holdStartRef.current
      if (start == null) return
      const p = Math.min(1, (performance.now() - start) / HOLD_MS)
      setHoldProgress(p)
      if (p >= 1 && !recordingRef.current) {
        cancelHoldAnimation()
        startRecording()
        return
      }
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const handlePointerUp = () => {
    cancelHoldAnimation()
    const start = holdStartRef.current
    holdStartRef.current = null

    if (recordingRef.current) {
      void stopRecording()
      return
    }

    setHoldProgress(0)
    if (start != null && performance.now() - start < HOLD_MS && !photoTakenRef.current) {
      photoTakenRef.current = true
      void onCapturePhoto()
    }
  }

  const handlePointerCancel = () => {
    cancelHoldAnimation()
    holdStartRef.current = null
    if (recordingRef.current) {
      void stopRecording()
      return
    }
    setHoldProgress(0)
  }

  const ringOffset = RING_C * (1 - holdProgress)
  const showRing = holdProgress > 0 && !recording

  return (
    <div className="mobile-live-floating-controls">
      <div className="mobile-live-capture-row">
        <div className="mobile-live-capture-side mobile-live-capture-side-left">
          {onOpenCameraSettings && (
            <button
              type="button"
              className="mobile-live-side-btn"
              onClick={onOpenCameraSettings}
              disabled={disabled}
              aria-label="Camera settings"
              title="Camera settings"
            >
              <Icon name="crop_free" size={24} />
            </button>
          )}
        </div>

        <div className="mobile-live-capture-wrap">
          <button
            type="button"
            className={`mobile-live-capture-btn${recording ? ' recording' : ''}`}
            disabled={disabled}
            aria-label={recording ? 'Stop recording' : 'Tap for photo, hold for video'}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          >
            <svg className="mobile-live-capture-ring" viewBox="0 0 68 68" aria-hidden="true">
              {showRing && (
                <circle
                  className="mobile-live-capture-ring-progress"
                  cx="34"
                  cy="34"
                  r={RING_R}
                  fill="none"
                  strokeWidth="2.5"
                  strokeDasharray={RING_C}
                  strokeDashoffset={ringOffset}
                  transform="rotate(-90 34 34)"
                />
              )}
              {recording && (
                <circle
                  className="mobile-live-capture-ring-recording"
                  cx="34"
                  cy="34"
                  r={RING_R}
                  fill="none"
                  strokeWidth="2.5"
                  strokeDasharray={`${RING_C * 0.08} ${RING_C * 0.04}`}
                />
              )}
            </svg>
            <Icon name={recording ? 'stop' : 'photo_camera'} size={28} filled />
          </button>
        </div>

        <div className="mobile-live-capture-side mobile-live-capture-side-right">
          {onToggleFlash && (
            <button
              type="button"
              className={`mobile-live-side-btn${flashActive ? ' active' : ''}`}
              onClick={onToggleFlash}
              disabled={disabled || !flashAvailable}
              aria-label="Toggle flash"
              aria-pressed={flashActive}
              title={flashAvailable ? 'Flash' : 'Flash not available on this camera'}
            >
              <Icon name={flashActive ? 'flash_on' : 'flash_off'} size={24} filled={flashActive} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
})
