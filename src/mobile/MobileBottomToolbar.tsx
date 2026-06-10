import { Icon } from '../components/Icon'
import { memo } from 'react'
import { EFFECTS, getMobileStrengthLabel } from '../lib/effects'
import type { AppMobileBindings } from './bindings'
import { MobileRangeWithThumb } from './MobileRangeWithThumb'
import { isCategoryEffectActive } from './categoryActivity'
import { getCategoryToolDisplay } from './categoryToolDisplay'
import { panelForCategory } from './toolRotation'
import type { MobileToolCategory } from './types'

const EDITOR_CATEGORIES: MobileToolCategory[] = ['face', 'zone', 'effects', 'crop', 'adjust', 'distort']
const VIDEO_CATEGORIES: MobileToolCategory[] = ['face', 'effects', 'adjust', 'distort']
// Effects (the anonymization tool) sits immediately after FACE detect in live.
const LIVE_CATEGORIES: MobileToolCategory[] = ['effects', 'adjust', 'distort']

interface MobileBottomToolbarProps {
  b: AppMobileBindings
  liveMode?: boolean
  liveFaceCount?: number
}

export const MobileBottomToolbar = memo(function MobileBottomToolbar({ b, liveMode = false, liveFaceCount = 0 }: MobileBottomToolbarProps) {
  const strVal = Math.min(100, Math.max(1, Math.round(b.brushStrength * 100)))
  const sizeVal = Math.min(99, Math.max(0, Math.round(b.brushSize)))
  const isVideoEditor = !liveMode && Boolean(b.activePhoto?.isVideo)
  const detMode = b.detector.mode
  const detectorOff = detMode !== 'yunet-wasm'
  const detectorBusy = b.detectorLoading || b.detector.mode === 'unavailable'

  const faceActive = liveMode ? b.liveDetectEnabled : b.autoDetect
  const faceCount = liveMode
    ? liveFaceCount
    : isVideoEditor
      ? b.videoPreviewFaceCount
      : b.activeZones.length
  const faceBtnClass = !liveMode && detectorOff ? ' ts-btn-setup' : ''

  const categories = liveMode
    ? LIVE_CATEGORIES
    : isVideoEditor
      ? VIDEO_CATEGORIES
      : EDITOR_CATEGORIES
  const extraCategories = categories.filter((c) => c !== 'face')

  const isDrawerOpen = (cat: MobileToolCategory) => {
    const panel = panelForCategory(cat)
    return panel != null && b.mobilePanel === panel
  }

  // Applied/active tool state (distinct from drawer open `.active`).
  const isCategorySelected = (cat: MobileToolCategory): boolean =>
    isCategoryEffectActive(cat, b, liveMode)

  const openFaceDrawer = () => {
    if (detectorBusy) return
    b.selectToolCategory('face')
  }

  // Derive a short label for the strength slider based on the active effect.
  const activeEffectMeta = EFFECTS.find((e) => e.id === b.selectedEffect)
  const strLabel = activeEffectMeta
    ? getMobileStrengthLabel(activeEffectMeta.id)
    : 'STR'

  return (
    <div className={`mobile-bottom-toolbar${isVideoEditor && b.videoProcessing ? ' mobile-bottom-toolbar--processing' : ''}`}>
      {!b.videoProcessing && b.toolMode !== 'crop' ? (
      <div className="mobile-sliders-row">
        <div className="mobile-slider-group">
          <span className="mobile-slider-label">{strLabel}</span>
          <MobileRangeWithThumb
            min={1}
            max={100}
            value={strVal}
            onChange={(v) => b.setBrushStrength(v / 100)}
            ariaLabel="Strength"
          />
        </div>
        {!liveMode && !isVideoEditor && (
          <div className="mobile-slider-group">
            <span className="mobile-slider-label">BRUSH</span>
            <MobileRangeWithThumb
              min={0}
              max={99}
              value={sizeVal}
              onChange={b.setBrushSize}
              ariaLabel="Brush size"
            />
          </div>
        )}
      </div>
      ) : null}
      <div className="mobile-tool-categories">
        <button
          type="button"
          className={`mobile-tool-btn mobile-tool-btn-face ts-btn-autodetect${isDrawerOpen('face') ? ' active' : ''}${faceActive ? ' detect-on' : ''}${faceBtnClass}${detectorBusy ? ' loading' : ''}`}
          aria-label={detectorBusy ? 'Loading face model' : 'Face detection settings'}
          disabled={detectorBusy}
          onClick={openFaceDrawer}
        >
          {detectorBusy ? (
            <span className="mobile-face-loader" aria-hidden="true" />
          ) : (
            <span className="mobile-tool-btn-icon-wrap">
              <Icon name="face_retouching_natural" filled={faceActive} size={22} />
              {faceActive && !detectorBusy && (
                <span className="mobile-face-count-badge" aria-label={`${faceCount} faces`}>{faceCount}</span>
              )}
            </span>
          )}
          <span className="mobile-tool-btn-label">FACE</span>
        </button>
        {extraCategories.map((cat) => {
          const { icon, label, ariaLabel } = getCategoryToolDisplay(cat, b, liveMode)
          return (
            <button
              key={cat}
              type="button"
              className={`mobile-tool-btn${isDrawerOpen(cat) ? ' active' : ''}${isCategorySelected(cat) ? ' selected' : ''}`}
              onClick={() => b.selectToolCategory(cat)}
              aria-label={ariaLabel}
            >
              <Icon name={icon} size={22} filled={isCategorySelected(cat)} />
              <span className="mobile-tool-btn-label">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
})
