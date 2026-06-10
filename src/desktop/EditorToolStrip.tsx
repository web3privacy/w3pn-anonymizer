import type { Dispatch, RefObject, SetStateAction } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../components/Icon'
import { AdjustToolPanel } from '../components/tool-panels/AdjustToolPanel'
import { DistortToolPanel } from '../components/tool-panels/DistortToolPanel'
import { FaceSettingsPanel } from '../components/tool-panels/FaceSettingsPanel'
import { RangeWithThumb } from '../components/RangeWithThumb'
import { DEFAULT_CUSTOM_IMAGE_PRESET_ID } from '../lib/custom-image-presets'
import type { DistortEffectId } from '../lib/distort-effects'
import { EFFECT_ICONS, DEFAULT_ADJ_TRANSFORM_PARAMS } from '../lib/editor-constants'
import { EFFECTS, getMobileStrengthLabel } from '../lib/effects'
import type { PixelShiftType } from '../lib/effects'
import type {
  AnonymizeEffectId,
  ColorAdjustments,
  CustomImageAsset,
  CustomImageSource,
  DetectionTarget,
  DetectorStatus,
  PhotoItem,
  ToolMode,
  Zone,
} from '../types'
import { DEFAULT_COLOR_ADJUSTMENTS } from '../types'

type FlyoutAnchor = { top: number; left: number }

export interface EditorToolStripProps {
  detector: DetectorStatus
  faceFlyoutBtnRef: RefObject<HTMLButtonElement>
  autoDetect: boolean
  faceFlyoutOpen: boolean
  setFaceFlyoutAnchor: Dispatch<SetStateAction<FlyoutAnchor | null>>
  faceFlyoutAnchor: FlyoutAnchor | null
  setFaceFlyoutOpen: Dispatch<SetStateAction<boolean>>
  setAdjFlyoutOpen: Dispatch<SetStateAction<boolean>>
  setTransformFlyoutOpen: Dispatch<SetStateAction<boolean>>
  setEffectFlyoutOpen: Dispatch<SetStateAction<boolean>>
  refreshDetector: (forceReset?: boolean) => Promise<DetectorStatus>
  setNotice: (message: string) => void
  activeZones: Zone[]
  effectFlyoutBtnRef: RefObject<HTMLButtonElement>
  effectFlyoutOpen: boolean
  selectedEffect: AnonymizeEffectId
  setEffectFlyoutAnchor: Dispatch<SetStateAction<FlyoutAnchor | null>>
  effectFlyoutAnchor: FlyoutAnchor | null
  toolMode: ToolMode
  activePhoto: PhotoItem | null
  setToolMode: Dispatch<SetStateAction<ToolMode>>
  setZonesAnonymized: Dispatch<SetStateAction<boolean>>
  detectTarget: DetectionTarget
  setDetectTarget: Dispatch<SetStateAction<DetectionTarget>>
  detectSensitivity: number
  setDetectSensitivity: Dispatch<SetStateAction<number>>
  detectFaceOffset: number
  setDetectFaceOffset: Dispatch<SetStateAction<number>>
  detectThorough: boolean
  setDetectThorough: Dispatch<SetStateAction<boolean>>
  setAutoDetect: Dispatch<SetStateAction<boolean>>
  showBoxes: boolean
  setShowBoxes: Dispatch<SetStateAction<boolean>>
  detectFacesOnActiveImage: (robust?: boolean) => void
  adjFlyoutOpen: boolean
  adjFlyoutAnchor: FlyoutAnchor | null
  adjFlyoutBtnRef: RefObject<HTMLButtonElement>
  setAdjFlyoutAnchor: Dispatch<SetStateAction<FlyoutAnchor | null>>
  colorAdj: ColorAdjustments
  setColorAdj: Dispatch<SetStateAction<ColorAdjustments>>
  renderCanvas: () => void
  transformFlyoutOpen: boolean
  transformFlyoutAnchor: FlyoutAnchor | null
  transformFlyoutBtnRef: RefObject<HTMLButtonElement>
  setTransformFlyoutAnchor: Dispatch<SetStateAction<FlyoutAnchor | null>>
  enabledDistorts: DistortEffectId[]
  toggleDistortEffect: (id: DistortEffectId) => void
  distortStrengthByEffect: Record<DistortEffectId, number>
  setDistortStrength: (id: DistortEffectId, value: number) => void
  adjTransformParams: typeof DEFAULT_ADJ_TRANSFORM_PARAMS
  setAdjParam: <K extends keyof typeof DEFAULT_ADJ_TRANSFORM_PARAMS>(
    key: K,
    value: (typeof DEFAULT_ADJ_TRANSFORM_PARAMS)[K],
  ) => void
  adjPixelShiftType: PixelShiftType
  setAdjPixelShiftType: Dispatch<SetStateAction<PixelShiftType>>
  resetAdjTransformPreview: () => void
  applyAdjTransformToCanvas: () => void | Promise<void>
  setCropDraft: Dispatch<SetStateAction<{ x: number; y: number; w: number; h: number } | null>>
  updateSelectedZoneEffect: (effect: AnonymizeEffectId) => void
  setEffectPickerOpen: Dispatch<SetStateAction<'emoji' | 'custom-image' | null>>
  customImageAssets: CustomImageAsset[]
  loadCustomImagePreset: (source: CustomImageSource) => void | Promise<void>
  customImageSource: CustomImageSource
  brushSize: number
  handleBrushSizeChange: (v: number) => void
  brushStrength: number
  setBrushStrength: Dispatch<SetStateAction<number>>
}

/** Desktop vertical tool strip: detection, effects, zone/brush, crop/adjust/distort, sliders. */
export function EditorToolStrip(props: EditorToolStripProps) {
  const {
    detector,
    faceFlyoutBtnRef,
    autoDetect,
    faceFlyoutOpen,
    setFaceFlyoutAnchor,
    faceFlyoutAnchor,
    setFaceFlyoutOpen,
    setAdjFlyoutOpen,
    setTransformFlyoutOpen,
    setEffectFlyoutOpen,
    refreshDetector,
    setNotice,
    activeZones,
    effectFlyoutBtnRef,
    effectFlyoutOpen,
    selectedEffect,
    setEffectFlyoutAnchor,
    effectFlyoutAnchor,
    toolMode,
    activePhoto,
    setToolMode,
    setZonesAnonymized,
    detectTarget,
    setDetectTarget,
    detectSensitivity,
    setDetectSensitivity,
    detectFaceOffset,
    setDetectFaceOffset,
    detectThorough,
    setDetectThorough,
    setAutoDetect,
    showBoxes,
    setShowBoxes,
    detectFacesOnActiveImage,
    adjFlyoutOpen,
    adjFlyoutAnchor,
    adjFlyoutBtnRef,
    setAdjFlyoutAnchor,
    colorAdj,
    setColorAdj,
    renderCanvas,
    transformFlyoutOpen,
    transformFlyoutAnchor,
    transformFlyoutBtnRef,
    setTransformFlyoutAnchor,
    enabledDistorts,
    toggleDistortEffect,
    distortStrengthByEffect,
    setDistortStrength,
    adjTransformParams,
    setAdjParam,
    adjPixelShiftType,
    setAdjPixelShiftType,
    resetAdjTransformPreview,
    applyAdjTransformToCanvas,
    setCropDraft,
    updateSelectedZoneEffect,
    setEffectPickerOpen,
    customImageAssets,
    loadCustomImagePreset,
    customImageSource,
    brushSize,
    handleBrushSizeChange,
    brushStrength,
    setBrushStrength,
  } = props

  return (
    <div className="tool-strip">

      {/* 1. Auto-detect toggle — color states: green=ready, orange=unavailable, red=failed */}
      <div className="ts-tooltip-wrap" style={{ position: 'relative' }}>
        {(() => {
          const detMode = detector.mode
          const detectorOff = detMode !== 'yunet-wasm'
          const btnClass = detectorOff ? ' ts-btn-setup' : ''
          return (<>
            <button
              ref={faceFlyoutBtnRef}
              className={`ts-btn ts-btn-autodetect${autoDetect ? ' active' : ''}${faceFlyoutOpen ? ' flyout-open' : ''}${btnClass}`}
              type="button"
              onClick={() => {
                const rect = faceFlyoutBtnRef.current?.getBoundingClientRect()
                if (rect) setFaceFlyoutAnchor({ top: rect.top, left: rect.right + 6 })
                setFaceFlyoutOpen((v) => !v)
                setAdjFlyoutOpen(false)
                setTransformFlyoutOpen(false)
                setEffectFlyoutOpen(false)
              }}
              onDoubleClick={() => { void refreshDetector(true).then((s) => setNotice(s.message)) }}
              title="Detection settings (double-click to refresh detector)"
            >
              <Icon name="face_retouching_natural" filled={autoDetect} size={18} />
              {autoDetect && !detectorOff && (
                <span className="ts-face-count-inline">{activeZones.length}</span>
              )}
            </button>
            <span className="ts-tooltip">
              {autoDetect
                ? `Detection: ON · ${activeZones.length} face${activeZones.length !== 1 ? 's' : ''}${detectorOff ? ' · detector unavailable' : ''}`
                : 'Detection: OFF'}
            </span>
          </>)
        })()}
      </div>

      <div className="ts-sep" />

      {/* 6. Effect (anonymization style) — always active green, moved up */}
      <div className="ts-tooltip-wrap">
        <button
          ref={effectFlyoutBtnRef}
          className="ts-btn active"
          type="button"
          onClick={() => {
            const rect = effectFlyoutBtnRef.current?.getBoundingClientRect()
            if (rect) setEffectFlyoutAnchor({ top: rect.top, left: rect.right + 6 })
            setEffectFlyoutOpen((v) => !v)
            setAdjFlyoutOpen(false)
            setTransformFlyoutOpen(false)
            setFaceFlyoutOpen(false)
          }}
          title={`Effect: ${selectedEffect} — click to change`}
          aria-label={`Effect: ${selectedEffect}`}
        >
          <Icon name={EFFECT_ICONS[selectedEffect]} size={18} />
        </button>
        <span className="ts-tooltip">Effect: {selectedEffect}</span>
      </div>

      <div className="ts-sep" />

      {/* 3. Add zone toggle */}
      <div className="ts-tooltip-wrap">
        <button
          className={`ts-btn${toolMode === 'zone' ? ' active' : ''}`}
          type="button"
          disabled={!activePhoto}
          onClick={() => {
            setToolMode('zone')
            setZonesAnonymized(false)
            setNotice('Draw a box on the photo to add a face zone.')
          }}
          title="Add zone — draw rectangle to select face region"
          aria-label="Add zone"
        >
          <Icon name="crop_free" size={18} />
        </button>
        <span className="ts-tooltip">Add zone</span>
      </div>

      {/* 5. Brush toggle — grouped with add zone (no separator) */}
      <div className="ts-tooltip-wrap">
        <button
          className={`ts-btn${toolMode === 'brush' ? ' active' : ''}`}
          type="button"
          disabled={!activePhoto}
          onClick={() => setToolMode((m) => m === 'brush' ? 'zone' : 'brush')}
          title={toolMode === 'brush' ? 'Brush active — click to switch to zone selection' : 'Brush tool — click to activate'}
          aria-label="Brush tool"
        >
          <Icon name="brush" size={18} />
        </button>
        <span className="ts-tooltip">Brush</span>
      </div>

      {faceFlyoutOpen && faceFlyoutAnchor && createPortal(
        <div
          className="ts-flyout-portal ts-flyout ts-flyout--wide"
          style={{ position: 'fixed', top: faceFlyoutAnchor.top, left: faceFlyoutAnchor.left, zIndex: 9999 }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="ts-flyout-title">Face detection</div>
          <FaceSettingsPanel
            target={detectTarget}
            onTargetChange={setDetectTarget}
            sensitivity={detectSensitivity}
            onSensitivityChange={setDetectSensitivity}
            faceOffset={detectFaceOffset}
            onFaceOffsetChange={setDetectFaceOffset}
            thorough={detectThorough}
            onThoroughChange={setDetectThorough}
            detectEnabled={autoDetect}
            onDetectEnabledChange={(v) => { setAutoDetect(v); setShowBoxes(v) }}
            showBoxes={showBoxes}
            onShowBoxesChange={setShowBoxes}
            detectorReady={detector.mode === 'yunet-wasm'}
            isVideo={Boolean(activePhoto?.isVideo)}
            onDetectNow={() => { void detectFacesOnActiveImage(detectThorough); setFaceFlyoutOpen(false) }}
            compact
          />
        </div>,
        document.body
      )}

      {adjFlyoutOpen && adjFlyoutAnchor && createPortal(
        <div
          className="ts-flyout-portal ts-flyout ts-flyout--wide"
          style={{ position: 'fixed', top: adjFlyoutAnchor.top, left: adjFlyoutAnchor.left, zIndex: 9999 }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="ts-flyout-title">Adjust</div>
          <AdjustToolPanel
            colorAdj={colorAdj}
            onChange={setColorAdj}
            onReset={() => { setColorAdj(DEFAULT_COLOR_ADJUSTMENTS); renderCanvas() }}
            showPresets
            showExtended
          />
        </div>,
        document.body
      )}

      {transformFlyoutOpen && transformFlyoutAnchor && createPortal(
        <div
          className="ts-flyout-portal ts-flyout ts-flyout--wide"
          style={{ position: 'fixed', top: transformFlyoutAnchor.top, left: transformFlyoutAnchor.left, zIndex: 9999 }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="ts-flyout-title">Distort</div>
          <DistortToolPanel
            enabledDistorts={enabledDistorts}
            toggleDistortEffect={toggleDistortEffect}
            distortStrengthByEffect={distortStrengthByEffect}
            setDistortStrength={setDistortStrength}
            adjTransformParams={adjTransformParams}
            setAdjParam={setAdjParam}
            adjPixelShiftType={adjPixelShiftType}
            setAdjPixelShiftType={setAdjPixelShiftType}
            onReset={resetAdjTransformPreview}
            onApply={() => { void applyAdjTransformToCanvas() }}
            canApply={Boolean(activePhoto && enabledDistorts.length > 0)}
          />
        </div>,
        document.body
      )}

      <div className="ts-sep" />

      {/* Crop + Adjustments — grouped together */}
      <div className="ts-tooltip-wrap">
        <button
          className={`ts-btn${toolMode === 'crop' ? ' active' : ''}`}
          type="button"
          disabled={!activePhoto}
          onClick={() => { setToolMode((m) => m === 'crop' ? 'brush' : 'crop'); setCropDraft(null) }}
          title="Crop tool — draw a region and confirm in viewer"
          aria-label="Crop tool"
        >
          <Icon name="crop" size={18} />
        </button>
        <span className="ts-tooltip">Crop</span>
      </div>

      <div className="ts-tooltip-wrap">
        <button
          ref={adjFlyoutBtnRef}
          className={`ts-btn${adjFlyoutOpen ? ' active' : ''}`}
          type="button"
          onClick={() => {
            const rect = adjFlyoutBtnRef.current?.getBoundingClientRect()
            if (rect) setAdjFlyoutAnchor({ top: rect.top, left: rect.right + 6 })
            setAdjFlyoutOpen((v) => !v)
            setEffectFlyoutOpen(false)
            setTransformFlyoutOpen(false)
            setFaceFlyoutOpen(false)
          }}
          disabled={!activePhoto}
          title="Color adjustments"
          aria-label="Color adjustments"
        >
          <Icon name="palette" size={18} />
        </button>
        <span className="ts-tooltip">Colors</span>
      </div>

      <div className="ts-tooltip-wrap">
        <button
          ref={transformFlyoutBtnRef}
          className={`ts-btn${transformFlyoutOpen ? ' active' : ''}`}
          type="button"
          onClick={() => {
            const rect = transformFlyoutBtnRef.current?.getBoundingClientRect()
            if (rect) setTransformFlyoutAnchor({ top: rect.top, left: rect.right + 6 })
            setTransformFlyoutOpen((v) => !v)
            setAdjFlyoutOpen(false)
            setEffectFlyoutOpen(false)
            setFaceFlyoutOpen(false)
          }}
          disabled={!activePhoto}
          title="Transform effects (halftone, glitch, pixel-shift, color-shift)"
          aria-label="Transform effects"
        >
          <Icon name="auto_awesome" size={18} />
        </button>
        <span className="ts-tooltip">Transform</span>
      </div>

      {effectFlyoutOpen && effectFlyoutAnchor && createPortal(
        <div
          className="ts-flyout-portal ts-flyout"
          style={{ position: 'fixed', top: effectFlyoutAnchor.top, left: effectFlyoutAnchor.left, zIndex: 9999 }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="ts-flyout-title">Choose effect</div>
          <div className="ts-effect-grid">
            {EFFECTS.map((ef) => (
              <button
                key={ef.id}
                className={`ts-effect-tile${selectedEffect === ef.id ? ' active' : ''}`}
                type="button"
                onClick={() => {
                  updateSelectedZoneEffect(ef.id)
                  if (ef.id === 'emoji' || ef.id === 'custom-image') {
                    setEffectFlyoutOpen(false)
                    setEffectPickerOpen(ef.id)
                    if (ef.id === 'custom-image' && customImageAssets.length === 0) {
                      void loadCustomImagePreset(customImageSource === 'custom' ? DEFAULT_CUSTOM_IMAGE_PRESET_ID : customImageSource)
                    }
                  }
                }}
                title={ef.description}
              >
                <span className="ts-effect-tile-icon"><Icon name={EFFECT_ICONS[ef.id]} size={18} /></span>
                <span className="ts-effect-tile-label">{ef.label}</span>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}

      <div className="ts-sep" />

      <div className="ts-sliders-fill">
        <div className="ts-slider-group">
          <span className="ts-slider-label">SIZE</span>
          <RangeWithThumb
            orientation="vertical"
            min={4}
            max={100}
            value={Math.min(brushSize, 100)}
            onChange={handleBrushSizeChange}
            ariaLabel="Brush size"
          />
        </div>
        <div className="ts-slider-group">
          <span className="ts-slider-label">{getMobileStrengthLabel(selectedEffect)}</span>
          <RangeWithThumb
            orientation="vertical"
            min={1}
            max={100}
            value={Math.min(100, Math.max(1, Math.round(brushStrength * 100)))}
            onChange={(v) => setBrushStrength(v / 100)}
            ariaLabel="Effect strength"
          />
        </div>
      </div>

    </div>
  )
}
