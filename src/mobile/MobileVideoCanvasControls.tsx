import { memo, useEffect, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import type { AppMobileBindings } from './bindings'
import { MobileDrawMaskPanel } from './MobileDrawMaskPanel'
import { useHoldRepeat } from '../lib/useHoldRepeat'

interface MobileVideoCanvasControlsProps {
  b: AppMobileBindings
}

export const MobileVideoCanvasControls = memo(function MobileVideoCanvasControls({ b }: MobileVideoCanvasControlsProps) {
  const prevHold = useHoldRepeat({ onStep: () => b.stepActiveVideoFrame(-1) })
  const nextHold = useHoldRepeat({ onStep: () => b.stepActiveVideoFrame(1) })

  const [zoomVisible, setZoomVisible] = useState(false)
  const firstZoomRef = useRef(true)
  const zoomPct = Math.round(b.mobileViewZoom * 100)

  useEffect(() => {
    if (firstZoomRef.current) { firstZoomRef.current = false; return }
    setZoomVisible(true)
    const t = window.setTimeout(() => setZoomVisible(false), 2000)
    return () => clearTimeout(t)
  }, [zoomPct])

  if (!b.activePhoto?.isVideo) return null

  const drawActive = b.videoMaskDrawActive
  const busy = b.isBusy || b.videoProcessing
  const processLabel = b.autoDetect ? 'ANONYMIZE' : 'PROCESS'
  const showFaceTools = !b.activePhoto.edited
  const zoomStep = (dir: 1 | -1) => b.stepMobileViewZoom(dir)

  const toggleDrawMask = () => b.setVideoMaskDrawActive(!b.videoMaskDrawActive)

  return (
    <div className="mobile-video-canvas-controls">
      <div className="mobile-canvas-top-actions">
        {b.mobileViewTransformDirty && (
          <button
            type="button"
            className="mobile-canvas-top-btn"
            onClick={b.resetMobileViewTransform}
            disabled={busy}
            aria-label="Reset zoom and pan"
          >
            <Icon name="center_focus_strong" size={16} />
            <span>FIT</span>
          </button>
        )}
      </div>

      <div className="mobile-canvas-bottom-bar mobile-canvas-bottom-bar--video">
        <button
          type="button"
          className="mobile-zoom-side-btn"
          onClick={() => zoomStep(-1)}
          disabled={busy}
          aria-label="Zoom out"
        >
          −
        </button>

        <div className="mobile-canvas-action-cluster">
          <div className="mobile-image-action-stack">
            <div className={`mobile-zoom-indicator${zoomVisible ? ' visible' : ''}`} aria-live="polite">
              {zoomPct}%
            </div>
            {b.activeVideoFrameLabel && (
              <div className="mobile-video-frame-indicator" aria-live="polite">
                {b.activeVideoFrameLabel}
              </div>
            )}
            {!b.videoProcessing && (
              <>
                {showFaceTools && (
                  <button
                    type="button"
                    className={`mobile-canvas-secondary-btn${drawActive ? ' active' : ''}`}
                    onClick={toggleDrawMask}
                    disabled={busy}
                  >
                    DRAW MASK
                  </button>
                )}
                <button
                  type="button"
                  className="mobile-anonymize-btn"
                  onClick={b.processActiveVideo}
                  disabled={busy}
                >
                  {processLabel}
                </button>
                <button
                  type="button"
                  className="mobile-canvas-secondary-btn"
                  onClick={b.openCurrentVideoFrameAsSnapshot}
                  disabled={busy}
                >
                  EDIT FRAME
                </button>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          className="mobile-zoom-side-btn"
          onClick={() => zoomStep(1)}
          disabled={busy}
          aria-label="Zoom in"
        >
          +
        </button>
      </div>

      {!b.videoProcessing && showFaceTools && (
        <div className="mobile-canvas-frame-nav">
          <button type="button" className="mobile-zoom-side-btn" {...prevHold} disabled={busy} aria-label="Previous frame">
            <Icon name="skip_previous" size={16} />
          </button>
          <button type="button" className="mobile-zoom-side-btn" {...nextHold} disabled={busy} aria-label="Next frame">
            <Icon name="skip_next" size={16} />
          </button>
        </div>
      )}

      {drawActive && !b.videoProcessing && showFaceTools && <MobileDrawMaskPanel b={b} />}
    </div>
  )
})
