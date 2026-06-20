import { Icon } from './Icon'

export type VideoTrackMode = 'both' | 'video' | 'audio'

const OPTIONS: { id: VideoTrackMode; label: string; icon: string; hint: string }[] = [
  { id: 'both', label: 'Video + audio', icon: 'movie', hint: 'Keep the original video and sound' },
  { id: 'audio', label: 'Audio only', icon: 'graphic_eq', hint: 'Work with just the sound (audio mode)' },
  { id: 'video', label: 'Video only', icon: 'videocam_off', hint: 'Drop the sound — silent video' },
]

interface VideoTrackModeSelectProps {
  mode: VideoTrackMode
  onChange: (mode: VideoTrackMode) => void
  showLabel?: boolean
}

/** Dropdown that picks which tracks of a captured video to keep / edit. */
export function VideoTrackModeSelect({ mode, onChange, showLabel = true }: VideoTrackModeSelectProps) {
  const active = OPTIONS.find((o) => o.id === mode) ?? OPTIONS[0]
  return (
    <label className="video-track-mode" title={active.hint}>
      {showLabel && <Icon name={active.icon} size={16} />}
      {showLabel && <span className="video-track-mode-label">Tracks</span>}
      <select
        className="video-track-mode-select"
        value={mode}
        onChange={(e) => onChange(e.target.value as VideoTrackMode)}
        aria-label="Which tracks to keep"
      >
        {OPTIONS.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
    </label>
  )
}
