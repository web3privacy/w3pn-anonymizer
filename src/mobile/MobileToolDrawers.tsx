import { Icon } from '../components/Icon'
import type { AppMobileBindings } from './bindings'
import { MobileDistortDrawer } from './MobileDistortDrawer'
import { MobileEffectsDrawer } from './MobileEffectsDrawer'
import { MobileFaceDrawer } from './MobileFaceDrawer'
import { MobileToolDrawer } from './MobileToolDrawer'
import { DEFAULT_COLOR_ADJUSTMENTS } from '../types'
import {
  CROP_TOOLS,
  cropToolLabel,
  ZONE_TOOLS,
  zoneToolLabel,
} from './toolRotation'
import type { MobilePanel } from './types'

interface MobileToolDrawersProps {
  b: AppMobileBindings
  liveMode?: boolean
}

export function MobileToolDrawers({ b, liveMode = false }: MobileToolDrawersProps) {
  const close = () => b.setMobilePanel(null)
  const videoEditor = Boolean(b.activePhoto?.isVideo && !liveMode)

  const drawer = (panel: MobilePanel, title: string, children: React.ReactNode) => (
    <MobileToolDrawer open={b.mobilePanel === panel} onClose={close} title={title} variant="tool">
      {children}
    </MobileToolDrawer>
  )

  return (
    <>
      <MobileFaceDrawer b={b} liveMode={liveMode} />

      {!liveMode && drawer('tool-zone', 'Brush / Zone', (
        <div className="mobile-tool-drawer-list">
          {ZONE_TOOLS.map((id) => {
            const active =
              (id === 'brush' && b.toolMode === 'brush' && !b.eraserActive) ||
              (id === 'eraser' && b.toolMode === 'brush' && b.eraserActive) ||
              (id === 'rectangle' && b.toolMode === 'zone')
            return (
            <button
              key={id}
              type="button"
              className={`mobile-tool-drawer-item${active ? ' active' : ''}`}
              onClick={() => { b.applyZoneTool(id); close() }}
            >
              <Icon name={id === 'brush' ? 'brush' : id === 'eraser' ? 'ink_eraser' : 'crop_free'} size={18} />
              {zoneToolLabel(id)}
            </button>
            )
          })}
        </div>
      ))}

      {!liveMode && drawer('tool-crop', 'Crop', (
        <div className="mobile-tool-drawer-list">
          {CROP_TOOLS.map((id) => (
            <button
              key={id}
              type="button"
              className={`mobile-tool-drawer-item${id === 'crop' && b.toolMode === 'crop' ? ' active' : ''}`}
              onClick={() => { b.applyCropTool(id); close() }}
            >
              <Icon name="crop" size={18} />
              {cropToolLabel(id)}
            </button>
          ))}
        </div>
      ))}

      {drawer('tool-adjust', 'ADJUST', (
        <div className="mobile-tool-drawer-v2">
          <div className="mobile-tool-drawer-v2-body">
            {([['brightness', 'Brightness'], ['contrast', 'Contrast'], ['saturation', 'Saturation']] as const).map(([key, label]) => (
              <div key={key} className="mobile-slider-row-v2">
                <span className="mobile-slider-row-v2-label">{label}</span>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={b.batch.colorAdj[key]}
                  onChange={(e) => b.setColorAdj((cur) => ({ ...cur, [key]: Number(e.target.value), preset: 'none' }))}
                />
                <span className="mobile-slider-row-v2-val">
                  {b.batch.colorAdj[key] > 0 ? '+' : ''}{b.batch.colorAdj[key]}
                </span>
              </div>
            ))}
          </div>
          <div className="mobile-distort-list-actions">
            <button
              className="mobile-distort-reset-btn"
              type="button"
              onClick={() => b.setColorAdj(DEFAULT_COLOR_ADJUSTMENTS)}
            >
              RESET ALL
            </button>
            {videoEditor && (
              <p className="mobile-distort-video-hint">Applied when you Process video</p>
            )}
            {!liveMode && !videoEditor && (
              <button
                className="mobile-distort-apply-btn"
                type="button"
                onClick={() => { b.applyColorAdjToActive(); close() }}
                disabled={!b.activePhoto}
              >
                APPLY TO PHOTO
              </button>
            )}
          </div>
        </div>
      ))}

      <MobileDistortDrawer b={b} liveMode={liveMode} />

      <MobileEffectsDrawer b={b} liveMode={liveMode} />

      {!liveMode && drawer('tool-more', 'More', (
        <div className="mobile-tool-drawer-list">
          <button type="button" className="mobile-tool-drawer-item" onClick={() => { b.setMobilePanel('gallery'); b.setGalleryBatchSelect(false) }}>
            <Icon name="photo_library" size={18} /> Open library
          </button>
          <button
            type="button"
            className="mobile-tool-drawer-item"
            disabled={b.detectorLoading}
            onClick={() => { if (b.detectorLoading) return; b.setMobileMode('live'); close() }}
          >
            <Icon name="photo_camera" size={18} /> Live mode
          </button>
          {b.activePhoto?.isVideo && (
            <button type="button" className="mobile-tool-drawer-item" onClick={() => b.setMobilePanel('video-timeline')}>
              <Icon name="movie" size={18} /> Video timeline
            </button>
          )}
        </div>
      ))}

      {drawer('video-timeline', 'Video timeline', (
        <p className="mobile-drawer-hint">
          Use the video player controls and mask tools on the preview. Timeline scrubbing is available on the video element.
        </p>
      ))}
    </>
  )
}
