import { Icon } from '../components/Icon'
import type { AppMobileBindings } from './bindings'
import { MobileRangeWithThumb } from './MobileRangeWithThumb'
import { MobileToolDrawer } from './MobileToolDrawer'

interface MobileFaceDrawerProps {
  b: AppMobileBindings
  liveMode?: boolean
}

export function MobileFaceDrawer({ b, liveMode = false }: MobileFaceDrawerProps) {
  const open = b.mobilePanel === 'tool-face'
  const close = () => b.setMobilePanel(null)
  const isVideo = Boolean(b.activePhoto?.isVideo)
  const detectorReady = b.detector.mode === 'yunet-wasm'
  const enabled = liveMode ? b.liveDetectEnabled : b.autoDetect

  const setEnabled = (v: boolean) => {
    if (liveMode) {
      b.setLiveDetectEnabled(v)
    } else {
      b.setAutoDetect(v)
      b.setShowBoxes(v)
    }
  }

  return (
    <MobileToolDrawer open={open} onClose={close} title="FACE DETECTION" variant="tool">
      <div className="mobile-face-drawer">
        <label className="mobile-face-master-toggle">
          <span className="mobile-face-master-text">
            <Icon name="face_retouching_natural" filled={enabled} size={20} />
            <span>Face detection</span>
          </span>
          <span className={`mobile-switch${enabled ? ' on' : ''}`}>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            <span className="mobile-switch-track" />
            <span className="mobile-switch-knob" />
          </span>
        </label>

        <div className="mobile-face-settings">
          <div className="mobile-slider-row-v2">
            <span className="mobile-slider-row-v2-label">Sensitivity</span>
            <MobileRangeWithThumb
              min={0}
              max={100}
              value={b.detectSensitivity}
              onChange={b.setDetectSensitivity}
              format={(v) => `${v}%`}
              ariaLabel="Sensitivity"
            />
          </div>
          <p className="mobile-face-hint">Higher catches more faces (incl. small / turned) but may add false positives.</p>

          <div className="mobile-slider-row-v2">
            <span className="mobile-slider-row-v2-label">Face offset</span>
            <MobileRangeWithThumb
              min={0}
              max={100}
              value={b.detectFaceOffset}
              onChange={b.setDetectFaceOffset}
              format={(v) => `+${v}%`}
              ariaLabel="Face offset"
            />
          </div>
          <p className="mobile-face-hint">Grows the anonymized area around each face. Raise it if hair, ears or chin stay visible.</p>

          {!liveMode && (
            <label className="mobile-face-check-row">
              <input
                type="checkbox"
                checked={b.detectThorough}
                onChange={(e) => b.setDetectThorough(e.target.checked)}
              />
              <span className="mobile-face-check-text">
                <span>Thorough scan</span>
                <span className="mobile-face-check-hint">Multi-pass tiling for distant / tiny faces (slower)</span>
              </span>
            </label>
          )}

          {!liveMode && (
            <label className="mobile-face-check-row">
              <input
                type="checkbox"
                checked={b.showBoxes}
                onChange={(e) => b.setShowBoxes(e.target.checked)}
              />
              <span className="mobile-face-check-text">
                <span>Show detection boxes</span>
              </span>
            </label>
          )}

          {isVideo && (
            <p className="mobile-face-hint">
              Scans the current frame immediately, then re-analyses at +30%, +40% and +50% sensitivity each second you stay on the same frame.
            </p>
          )}
        </div>

        {!liveMode && !isVideo && (
          <div className="mobile-face-actions">
            <button
              type="button"
              className="mobile-face-action-btn mobile-face-action-btn--primary"
              onClick={() => { b.detectFacesOnActiveImage(false); close() }}
              disabled={!detectorReady}
            >
              <Icon name="search" size={16} /> Detect now
            </button>
            <button
              type="button"
              className="mobile-face-action-btn"
              onClick={() => { b.detectFacesOnActiveImage(true); close() }}
              disabled={!detectorReady}
            >
              <Icon name="tune" size={16} /> Robust re-detect
            </button>
            <div className="mobile-face-actions-row">
              <button
                type="button"
                className="mobile-face-action-btn mobile-face-action-btn--half"
                onClick={() => b.removeSelectedZone()}
                disabled={!b.selectedZoneId}
              >
                <Icon name="delete" size={16} /> Remove
              </button>
              <button
                type="button"
                className="mobile-face-action-btn mobile-face-action-btn--half"
                onClick={() => b.clearZones()}
                disabled={b.activeZones.length === 0}
              >
                <Icon name="clear_all" size={16} /> Clear all
              </button>
            </div>
          </div>
        )}

        {!detectorReady && (
          <p className="mobile-face-hint mobile-face-hint--warn">
            Face model is still loading…
          </p>
        )}
      </div>
    </MobileToolDrawer>
  )
}
