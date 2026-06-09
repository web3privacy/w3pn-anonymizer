import { Icon } from '../components/Icon'
import type { AppMobileBindings } from './bindings'

interface MobileDrawMaskPanelProps {
  b: AppMobileBindings
}

export function MobileDrawMaskPanel({ b }: MobileDrawMaskPanelProps) {
  const isVideo = b.activePhoto?.isVideo
  const drawActive = isVideo ? b.videoMaskDrawActive : b.imageMaskDrawActive
  if (!drawActive) return null

  const videoTools = [
    { id: 'rectangle', icon: 'select', label: 'RECTANGLE' },
    { id: 'circle', icon: 'radio_button_unchecked', label: 'CIRCLE' },
    { id: 'path', icon: 'polyline', label: 'PATH' },
  ] as const

  return (
    <div className="mobile-draw-mask-panel">
      <div className="mobile-draw-mask-tools">
        {isVideo ? (
          videoTools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              className={`mobile-draw-mask-tool${b.videoMaskShape === tool.id ? ' active' : ''}`}
              onClick={() => b.setVideoMaskShape(tool.id)}
              aria-label={tool.label}
            >
              <Icon name={tool.icon} size={20} />
              <span>{tool.label}</span>
            </button>
          ))
        ) : (
          <>
            <button
              type="button"
              className={`mobile-draw-mask-tool${b.toolMode === 'zone' ? ' active' : ''}`}
              onClick={() => b.setToolMode('zone')}
              aria-label="Rectangle"
            >
              <Icon name="select" size={20} />
              <span>RECTANGLE</span>
            </button>
          <button
            type="button"
            className={`mobile-draw-mask-tool${b.toolMode === 'brush' ? ' active' : ''}`}
            onClick={() => b.setToolMode('brush')}
            aria-label="Brush"
          >
            <Icon name="brush" size={20} />
            <span>BRUSH</span>
          </button>
          </>
        )}
      </div>

      {isVideo && (
        <label className="mobile-draw-mask-range">
          <span>Range</span>
          <input
            type="number"
            min={0.2}
            max={30}
            step={0.5}
            value={b.videoMaskRangeSec}
            onChange={(e) => b.setVideoMaskRangeSec(Math.min(30, Math.max(0.2, Number(e.target.value) || 0.2)))}
            disabled={b.videoProcessing || b.isBusy}
          />
          <span>s</span>
        </label>
      )}

      {!isVideo && b.activeZones.length > 0 && (
        <button type="button" className="mobile-draw-mask-clear" onClick={b.clearZones}>
          CLEAR ALL
        </button>
      )}

      {isVideo && b.activeVideoTimedZones.length > 0 && (
        <button
          type="button"
          className="mobile-draw-mask-clear"
          onClick={b.clearVideoTimedZones}
          disabled={b.videoProcessing}
        >
          RESET MASKS
        </button>
      )}
    </div>
  )
}
