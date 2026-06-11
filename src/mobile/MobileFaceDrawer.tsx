import { Icon } from '../components/Icon'
import { InfoHint } from '../components/InfoHint'
import { PrimaryTargetsToggles } from '../components/tool-panels/PrimaryTargetsToggles'
import type { AppMobileBindings } from './bindings'
import { MobileRangeWithThumb } from './MobileRangeWithThumb'
import { MobileToolDrawer } from './MobileToolDrawer'

interface MobileFaceDrawerProps {
  b: AppMobileBindings
  liveMode?: boolean
}

const SENSITIVITY_HINT = 'Higher catches more targets (incl. small / turned faces) but may add false positives.'
const FACE_OFFSET_HINT = 'Grows the anonymized area around each face. Raise it if hair, ears or chin stay visible.'

export function MobileFaceDrawer({ b, liveMode = false }: MobileFaceDrawerProps) {
  const open = b.mobilePanel === 'tool-face'
  const close = () => b.setMobilePanel(null)
  const detectorReady = b.detector.mode === 'yunet-wasm'
  const facesEnabled = liveMode ? b.liveDetectEnabled : b.autoDetect

  const setFacesEnabled = (v: boolean) => {
    if (liveMode) {
      b.setLiveDetectEnabled(v)
    } else {
      b.setAutoDetect(v)
      b.setShowBoxes(v)
    }
  }

  const setClasses = (names: string[], enabled: boolean) => {
    b.setEnabledClasses((cur) => {
      if (enabled) return Array.from(new Set([...cur, ...names]))
      const remove = new Set(names)
      return cur.filter((c) => !remove.has(c))
    })
  }

  return (
    <MobileToolDrawer open={open} onClose={close} title="DETECTION" variant="tool">
      <div className="mobile-face-drawer">
        <PrimaryTargetsToggles
          detectionConfig={b.detectionConfig}
          modelStatus={b.modelStatus}
          facesEnabled={facesEnabled}
          onFacesToggle={setFacesEnabled}
          onToggleCategory={b.setCategoryEnabled}
          enabledClasses={b.enabledClasses}
          onSetClasses={setClasses}
          compact
        />

        <button
          type="button"
          className="mobile-face-more-classes"
          onClick={() => b.setMobilePanel('tool-detect-classes')}
        >
          <span className="mobile-face-more-classes-text">
            <Icon name="category" size={18} />
            <span>All classes</span>
          </span>
          <span className="mobile-face-more-classes-right">
            {b.enabledClasses.length > 0 && (
              <span className="mobile-face-more-classes-count">{b.enabledClasses.length}</span>
            )}
            <Icon name="chevron_right" size={18} />
          </span>
        </button>

        <div className="mobile-face-settings">
          <div className="mobile-slider-row-v2 mobile-slider-row-v2--with-hint">
            <span className="mobile-slider-row-v2-label">Sensitivity</span>
            <MobileRangeWithThumb
              min={0}
              max={100}
              value={b.detectSensitivity}
              onChange={b.setDetectSensitivity}
              format={(v) => `${v}%`}
              ariaLabel="Sensitivity"
            />
            <InfoHint text={SENSITIVITY_HINT} label="Sensitivity — info" />
          </div>

          <div className="mobile-slider-row-v2 mobile-slider-row-v2--with-hint">
            <span className="mobile-slider-row-v2-label">Face offset</span>
            <MobileRangeWithThumb
              min={0}
              max={100}
              value={b.detectFaceOffset}
              onChange={b.setDetectFaceOffset}
              format={(v) => `+${v}%`}
              ariaLabel="Face offset"
            />
            <InfoHint text={FACE_OFFSET_HINT} label="Face offset — info" />
          </div>

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
        </div>

        {!detectorReady && (
          <p className="mobile-face-hint mobile-face-hint--warn">
            Face model is still loading…
          </p>
        )}
      </div>
    </MobileToolDrawer>
  )
}
