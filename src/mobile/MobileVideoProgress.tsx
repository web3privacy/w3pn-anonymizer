import { Icon } from '../components/Icon'
import type { VideoProcessingPhase } from '../lib/video'

interface MobileVideoProgressProps {
  phase: VideoProcessingPhase
  current: number
  total: number
  onCancel: () => void
}

function phaseLabel(phase: VideoProcessingPhase): string {
  switch (phase) {
    case 'analyzing': return 'Analyzing'
    case 'preparing': return 'Preparing'
    default: return 'Rendering'
  }
}

export function MobileVideoProgress({ phase, current, total, onCancel }: MobileVideoProgressProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="mobile-video-progress">
      <div className="mobile-video-progress-card">
        <div className="mobile-video-progress-head">
          <Icon name="movie" size={16} />
          <span>{phaseLabel(phase)} video…</span>
          <span className="mobile-video-progress-pct">{pct}%</span>
        </div>
        <div className="mobile-video-progress-track">
          <div className="mobile-video-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="mobile-video-progress-foot">
          <span>{current}/{total}</span>
          <button type="button" className="mobile-video-progress-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
