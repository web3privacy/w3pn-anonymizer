import { Icon } from '../components/Icon'
import type { AppMobileBindings } from './bindings'
import { MobileDrawMaskPanel } from './MobileDrawMaskPanel'
import { useHoldRepeat } from '../lib/useHoldRepeat'

interface MobileVideoCanvasControlsProps {
  b: AppMobileBindings
}

export function MobileVideoCanvasControls({ b }: MobileVideoCanvasControlsProps) {
  const prevHold = useHoldRepeat({ onStep: () => b.stepActiveVideoFrame(-1) })
  const nextHold = useHoldRepeat({ onStep: () => b.stepActiveVideoFrame(1) })

  if (!b.activePhoto?.isVideo) return null

  const drawActive = b.videoMaskDrawActive
  const busy = b.isBusy || b.videoProcessing
  const processLabel = b.autoDetect ? 'ANONYMIZE' : 'PROCESS'

  const toggleDrawMask = () => b.setVideoMaskDrawActive(!b.videoMaskDrawActive)

  return (
    <div className="mobile-video-canvas-controls">
      <div className="mobile-canvas-bottom-bar mobile-canvas-bottom-bar--video">
        <button
          type="button"
          className="mobile-zoom-side-btn"
          {...prevHold}
          disabled={busy}
          aria-label="Previous frame"
        >
          <Icon name="skip_previous" size={16} />
        </button>

        <div className="mobile-canvas-action-cluster">
          {b.activeVideoFrameLabel && (
            <div className="mobile-video-frame-indicator" aria-live="polite">
              {b.activeVideoFrameLabel}
            </div>
          )}
          <button
            type="button"
            className={`mobile-canvas-secondary-btn${drawActive ? ' active' : ''}`}
            onClick={toggleDrawMask}
            disabled={busy}
          >
            DRAW MASK
          </button>

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
        </div>

        <button
          type="button"
          className="mobile-zoom-side-btn"
          {...nextHold}
          disabled={busy}
          aria-label="Next frame"
        >
          <Icon name="skip_next" size={16} />
        </button>
      </div>

      {drawActive && <MobileDrawMaskPanel b={b} />}
    </div>
  )
}
