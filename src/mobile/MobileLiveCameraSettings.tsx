import { Icon } from '../components/Icon'
import type { LiveTrackCapabilities } from '../lib/live-camera-controls'
import { MobileToolDrawer } from './MobileToolDrawer'
import type { LiveAspectRatio, LiveCameraSettings, LiveDisplayFit } from './liveCameraTypes'

interface MobileLiveCameraSettingsProps {
  open: boolean
  onClose: () => void
  settings: LiveCameraSettings
  onChange: (patch: Partial<LiveCameraSettings>) => void
  caps: LiveTrackCapabilities
  onSwitchCamera?: () => void
}

const ASPECT_OPTIONS: { id: LiveAspectRatio; label: string }[] = [
  { id: 'native', label: 'Native' },
  { id: '16:9', label: '16:9' },
  { id: '4:3', label: '4:3' },
  { id: '1:1', label: '1:1' },
]

const FIT_OPTIONS: { id: LiveDisplayFit; label: string; hint: string }[] = [
  { id: 'contain', label: 'Fit screen', hint: 'Show full frame (letterbox if needed)' },
  { id: 'cover', label: 'Fill space', hint: 'Crop to fill the preview area' },
]

export function MobileLiveCameraSettings({
  open,
  onClose,
  settings,
  onChange,
  caps,
  onSwitchCamera,
}: MobileLiveCameraSettingsProps) {
  return (
    <MobileToolDrawer open={open} onClose={onClose} title="Camera" variant="tool">
      <div className="mobile-live-settings">
        {onSwitchCamera && (
          <section className="mobile-live-settings-section">
            <h3 className="mobile-live-settings-heading">Source</h3>
            <button
              type="button"
              className="mobile-live-settings-row"
              onClick={onSwitchCamera}
            >
              <span className="mobile-live-settings-row-label">
                <Icon name="cameraswitch" size={18} /> Switch camera
              </span>
              <span className="mobile-live-settings-row-hint">Flip between front and back</span>
            </button>
          </section>
        )}

        <section className="mobile-live-settings-section">
          <h3 className="mobile-live-settings-heading">Aspect ratio</h3>
          <div className="mobile-live-settings-chips">
            {ASPECT_OPTIONS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`mobile-live-settings-chip${settings.aspectRatio === id ? ' active' : ''}`}
                onClick={() => onChange({ aspectRatio: id })}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="mobile-live-settings-section">
          <h3 className="mobile-live-settings-heading">Preview</h3>
          <div className="mobile-live-settings-list">
            {FIT_OPTIONS.map(({ id, label, hint }) => (
              <button
                key={id}
                type="button"
                className={`mobile-live-settings-row${settings.displayFit === id ? ' active' : ''}`}
                onClick={() => onChange({ displayFit: id })}
              >
                <span className="mobile-live-settings-row-label">{label}</span>
                <span className="mobile-live-settings-row-hint">{hint}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mobile-live-settings-section">
          <h3 className="mobile-live-settings-heading">Device</h3>
          {caps.torch && (
            <label className="mobile-live-settings-toggle">
              <span><Icon name="flashlight_on" size={18} /> Torch / flash</span>
              <input
                type="checkbox"
                checked={settings.torch}
                onChange={(e) => onChange({ torch: e.target.checked })}
              />
            </label>
          )}
          {caps.exposure && (
            <div className="mobile-live-settings-slider">
              <span className="mobile-live-settings-slider-label">
                Exposure {settings.exposureCompensation > 0 ? '+' : ''}{settings.exposureCompensation.toFixed(1)}
              </span>
              <input
                type="range"
                min={caps.exposureMin}
                max={caps.exposureMax}
                step={caps.exposureStep}
                value={settings.exposureCompensation}
                onChange={(e) => onChange({ exposureCompensation: Number(e.target.value) })}
              />
            </div>
          )}
          {caps.zoom && caps.zoomMax > caps.zoomMin && (
            <div className="mobile-live-settings-slider">
              <span className="mobile-live-settings-slider-label">
                Zoom {settings.zoom.toFixed(1)}×
              </span>
              <input
                type="range"
                min={caps.zoomMin}
                max={caps.zoomMax}
                step={caps.zoomStep}
                value={settings.zoom}
                onChange={(e) => onChange({ zoom: Number(e.target.value) })}
              />
            </div>
          )}
          {!caps.torch && !caps.exposure && !caps.zoom && (
            <p className="mobile-live-settings-hint">No extra hardware controls on this device.</p>
          )}
        </section>
      </div>
    </MobileToolDrawer>
  )
}
