import { Icon } from '../components/Icon'
import type { CSSProperties } from 'react'
import { EFFECTS } from '../lib/effects'
import type { AppMobileBindings } from './bindings'
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

export function MobileBottomToolbar({ b, liveMode = false, liveFaceCount = 0 }: MobileBottomToolbarProps) {
  const strVal = Math.min(99, Math.max(0, Math.round(b.brushStrength * 100)))
  const sizeVal = Math.min(99, Math.max(0, Math.round(b.brushSize)))
  // Slider max is 99, so the thumb sits at value/99 of the track. Mirror that
  // exact fraction (0..100) for the in-thumb label so it never drifts sideways.
  const strPct = (strVal / 99) * 100
  const sizePct = (sizeVal / 99) * 100
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
  const faceBtnClass = !liveMode && b.lastDetectFailed && b.autoDetect && faceCount === 0
    ? ' ts-btn-fail'
    : !liveMode && detectorOff ? ' ts-btn-setup' : ''

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
  const strLabel = activeEffectMeta?.strengthLabel
    ? activeEffectMeta.strengthLabel.slice(0, 5).toUpperCase()
    : 'STR'

  return (
    <div className={`mobile-bottom-toolbar${isVideoEditor && b.videoProcessing ? ' mobile-bottom-toolbar--processing' : ''}`}>
      {!b.videoProcessing || !isVideoEditor ? (
      <div className="mobile-sliders-row">
        <div className="mobile-slider-group">
          <span className="mobile-slider-label">{strLabel}</span>
          <div className="mobile-range-with-thumb" style={{ '--mobile-range-pct': strPct } as CSSProperties}>
            <input
              type="range"
              min={0}
              max={99}
              value={strVal}
              onChange={(e) => b.setBrushStrength(Number(e.target.value) / 100)}
              aria-label="Strength"
            />
            <span className="mobile-range-thumb-label">{strVal}</span>
          </div>
        </div>
        {!liveMode && !isVideoEditor && (
          <div className="mobile-slider-group">
            <span className="mobile-slider-label">SIZE</span>
            <div className="mobile-range-with-thumb" style={{ '--mobile-range-pct': sizePct } as CSSProperties}>
              <input
                type="range"
                min={0}
                max={99}
                value={sizeVal}
                onChange={(e) => b.setBrushSize(Number(e.target.value))}
                aria-label="Brush size"
              />
              <span className="mobile-range-thumb-label">{sizeVal}</span>
            </div>
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
              {faceActive && faceCount > 0 && !detectorBusy && (
                <span className="mobile-face-count-badge" aria-label={`${faceCount} faces`}>{faceCount}</span>
              )}
            </span>
          )}
          <span className="mobile-tool-btn-label">FACE</span>
        </button>
        {extraCategories.map((cat) => {
          const { icon, label } = getCategoryToolDisplay(cat, b)
          return (
            <button
              key={cat}
              type="button"
              className={`mobile-tool-btn${isDrawerOpen(cat) ? ' active' : ''}${isCategorySelected(cat) ? ' selected' : ''}`}
              onClick={() => b.selectToolCategory(cat)}
              aria-label={label}
            >
              <Icon name={icon} size={22} filled={isCategorySelected(cat)} />
              <span className="mobile-tool-btn-label">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
