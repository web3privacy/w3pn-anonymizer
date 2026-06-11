import { Icon } from './Icon'
import { ToolSliderRow } from './ToolSliderRow'
import { useVoiceAnonymizer } from '../hooks/useVoiceAnonymizer'
import { VOICE_MASK_PRESETS, VOICE_MASK_PRESET_LIST } from '../lib/audio/live/voiceMaskPresets'
import type { VoiceMaskPresetId } from '../lib/audio/live/voiceMaskTypes'
import { VOICE_MASK_PRIVACY } from '../lib/audio/live/voicePrivacyCopy'

export interface VoiceMaskPanelProps {
  className?: string
  /** Optional shared controller (lifted in live mode); falls back to its own. */
  controller?: ReturnType<typeof useVoiceAnonymizer>
}

/** Live microphone voice de-identification panel (local-only). */
export function VoiceMaskPanel({ className, controller }: VoiceMaskPanelProps) {
  const ownController = useVoiceAnonymizer()
  const v = controller ?? ownController
  const { settings, setSettings } = v

  const setPreset = (preset: VoiceMaskPresetId) => setSettings((s) => ({ ...s, preset }))

  return (
    <div className={`voice-mask-panel${className ? ` ${className}` : ''}`}>
      <div className="voice-mask-head">
        <div className="voice-mask-title">
          <Icon name="mic" size={18} />
          <span>Voice Mask</span>
          <span className="voice-mask-badge">Local</span>
        </div>
        {v.running && (
          <button type="button" className="btn btn-sm" onClick={v.stop}>
            <Icon name="mic_off" size={16} /> Stop
          </button>
        )}
      </div>

      {v.error && <p className="voice-mask-error"><Icon name="error" size={14} /> {v.error}</p>}

      {!v.running ? (
        // Before the mic is enabled the only action is turning it on — the
        // distortion controls stay hidden until there's a live signal to shape.
        <div className="voice-mask-enable">
          <button type="button" className="btn btn-primary voice-mask-enable-btn" onClick={() => { void v.start() }}>
            <Icon name="mic" size={20} /> Enable microphone
          </button>
          <p className="voice-mask-enable-hint">
            Your voice is processed locally and is never uploaded. Turn the mic on to reveal the masking controls.
          </p>
        </div>
      ) : (
        <>
          <div className="voice-mask-meter" aria-hidden>
            <span className="voice-mask-meter-bar" style={{ transform: `scaleX(${Math.min(1, v.level * 2.4)})` }} />
          </div>

          <div className="voice-mask-presets">
            {VOICE_MASK_PRESET_LIST.map((p) => (
              <button
                key={p}
                type="button"
                className={`btn btn-sm${settings.preset === p ? ' active' : ''}`}
                title={VOICE_MASK_PRESETS[p].description}
                onClick={() => setPreset(p)}
              >
                {VOICE_MASK_PRESETS[p].label}
              </button>
            ))}
          </div>
          <p className="voice-mask-desc">{VOICE_MASK_PRESETS[settings.preset].description}</p>

          {settings.preset !== 'off' && (
            <>
          <ToolSliderRow
            label="Strength"
            min={0} max={100} value={settings.strength}
            format={(x) => `${x}%`}
            onChange={(x) => setSettings((s) => ({ ...s, strength: x }))}
          />
          <ToolSliderRow
            label="Intelligibility"
            min={0} max={100} value={settings.intelligibility}
            format={(x) => `${x}%`}
            onChange={(x) => setSettings((s) => ({ ...s, intelligibility: x }))}
          />
            </>
          )}

          {settings.preset === 'off' && (
            <p className="voice-mask-enable-hint">Live recordings use the clean camera microphone with no masking.</p>
          )}

          <label className="voice-mask-toggle">
            <input
              type="checkbox"
              checked={settings.monitor}
              onChange={(e) => setSettings((s) => ({ ...s, monitor: e.target.checked }))}
            />
            <span>Monitor (use headphones)</span>
          </label>

          <div className="voice-mask-actions">
            {!v.recording ? (
              <button type="button" className="btn btn-sm" onClick={v.startRecording}>
                <Icon name="fiber_manual_record" size={16} /> Record
              </button>
            ) : (
              <button type="button" className="btn btn-sm voice-mask-recording" onClick={v.stopRecording}>
                <Icon name="stop" size={16} /> Stop recording
              </button>
            )}
            {v.recordingUrl && (
              <a className="btn btn-sm" href={v.recordingUrl} download="voice-masked.webm">
                <Icon name="download" size={16} /> Download
              </a>
            )}
          </div>

          {v.recordingUrl && (
            <audio className="voice-mask-playback" src={v.recordingUrl} controls />
          )}

          <p className="voice-mask-privacy">{VOICE_MASK_PRIVACY.strength}</p>
        </>
      )}
    </div>
  )
}
