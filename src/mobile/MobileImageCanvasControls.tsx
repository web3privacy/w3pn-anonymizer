import { memo, useEffect, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import type { AppMobileBindings } from './bindings'
import { useHoldRepeat } from '../lib/useHoldRepeat'

interface MobileImageCanvasControlsProps {
  b: AppMobileBindings
}

function isEditFrameMode(b: AppMobileBindings): boolean {
  const p = b.activePhoto
  return Boolean(p && !p.isVideo && p.derivedFromVideoId && p.derivedFromVideoTime != null)
}

export const MobileImageCanvasControls = memo(function MobileImageCanvasControls({ b }: MobileImageCanvasControlsProps) {
  const photo = b.activePhoto
  const editFrame = photo ? isEditFrameMode(b) : false
  const hasZones = b.activeZones.length > 0
  const canAnonymize = hasZones && !b.zonesAnonymized
  const cropMode = b.toolMode === 'crop'
  const canApplyCrop = cropMode && b.cropDraft != null && b.cropDraft.w > 0.002 && b.cropDraft.h > 0.002
  const busy = b.isBusy
  const zoomPct = Math.round(b.mobileViewZoom * 100)
  const canUndo = b.undoCount > 0
  const editPrevHold = useHoldRepeat({ onStep: () => b.stepEditFrameAdjacent(-1) })
  const editNextHold = useHoldRepeat({ onStep: () => b.stepEditFrameAdjacent(1) })
  const libraryPhotos = b.photos.filter((p) => !p.isVideo)
  const libraryIndex = photo ? libraryPhotos.findIndex((p) => p.id === photo.id) : -1
  const hasLibraryPrev = libraryIndex > 0
  const hasLibraryNext = libraryIndex >= 0 && libraryIndex < libraryPhotos.length - 1

  // Zoom indicator: surface briefly on change, then fade after 2s so it never
  // shifts the anonymize button's position (it's absolutely positioned).
  const [zoomVisible, setZoomVisible] = useState(false)
  const firstZoomRef = useRef(true)
  useEffect(() => {
    if (firstZoomRef.current) { firstZoomRef.current = false; return }
    setZoomVisible(true)
    const t = window.setTimeout(() => setZoomVisible(false), 2000)
    return () => clearTimeout(t)
  }, [zoomPct])

  if (!photo || photo.isVideo) return null

  const zoomStep = (dir: 1 | -1) => b.stepMobileViewZoom(dir)

  const canReturnToLive = b.mobileEditorReturnTo === 'live'

  return (
    <div className="mobile-canvas-controls">
      {!editFrame && !canReturnToLive && libraryPhotos.length > 1 && (
        <>
          <button
            type="button"
            className="mobile-library-nav-btn mobile-library-nav-btn--prev"
            onClick={() => b.stepAdjacentLibraryPhoto(-1)}
            disabled={busy || !hasLibraryPrev}
            aria-label="Previous photo"
          >
            <Icon name="chevron_left" size={22} />
          </button>
          <button
            type="button"
            className="mobile-library-nav-btn mobile-library-nav-btn--next"
            onClick={() => b.stepAdjacentLibraryPhoto(1)}
            disabled={busy || !hasLibraryNext}
            aria-label="Next photo"
          >
            <Icon name="chevron_right" size={22} />
          </button>
        </>
      )}
      <div className="mobile-canvas-top-actions">
        {canReturnToLive && (
          <button
            type="button"
            className="mobile-canvas-top-btn mobile-canvas-top-btn--back"
            onClick={b.returnToLiveFromEditor}
            disabled={busy}
            aria-label="Back to live camera"
          >
            <Icon name="arrow_back" size={16} />
            <span>BACK</span>
          </button>
        )}
        {canUndo && (
          <button
            type="button"
            className="mobile-canvas-top-btn"
            onClick={() => b.undo()}
            disabled={busy}
            aria-label="Undo last edit"
          >
            <Icon name="undo" size={16} />
            <span>UNDO</span>
          </button>
        )}
        <button
          type="button"
          className="mobile-canvas-top-btn"
          onClick={() => { void b.resetPhotoToOriginal() }}
          disabled={busy}
          aria-label="Reset image"
        >
          <Icon name="restart_alt" size={16} />
          <span>RESET</span>
        </button>
        {b.mobileViewTransformDirty && (
          <button
            type="button"
            className="mobile-canvas-top-btn"
            onClick={b.resetMobileViewTransform}
            disabled={busy}
            aria-label="Reset zoom and pan"
          >
            <Icon name="center_focus_strong" size={16} />
            <span>FIT</span>
          </button>
        )}
      </div>

      <div className="mobile-canvas-bottom-bar mobile-canvas-bottom-bar--image">
        <button
          type="button"
          className="mobile-zoom-side-btn"
          onClick={() => zoomStep(-1)}
          aria-label="Zoom out"
        >
          −
        </button>

        <div className="mobile-canvas-action-cluster">
          <div className="mobile-image-action-stack">
            <div className={`mobile-zoom-indicator${zoomVisible ? ' visible' : ''}`} aria-live="polite">
              {zoomPct}%
            </div>
          {editFrame ? (
            <div className="mobile-edit-frame-actions">
              <button
                type="button"
                className="mobile-canvas-secondary-btn"
                onClick={b.jumpToSourceVideoFromSnapshot}
                disabled={busy}
              >
                CANCEL
              </button>
              <button
                type="button"
                className="mobile-anonymize-btn mobile-anonymize-btn--save-video"
                onClick={b.applySnapshotToSourceVideo}
                disabled={busy}
              >
                SAVE TO VIDEO
              </button>
            </div>
          ) : cropMode ? (
            <div className="mobile-edit-frame-actions">
              <button
                type="button"
                className="mobile-canvas-secondary-btn"
                onClick={b.cancelCropMode}
                disabled={busy}
              >
                CANCEL
              </button>
              <button
                className="mobile-anonymize-btn"
                type="button"
                onClick={b.cropToSelection}
                disabled={busy || !canApplyCrop}
              >
                APPLY CROP
              </button>
            </div>
          ) : canAnonymize ? (
            <button
              className="mobile-anonymize-btn"
              type="button"
              onClick={b.applyZones}
              disabled={busy}
            >
              ANONYMIZE
            </button>
          ) : null}
          </div>
        </div>

        <button
          type="button"
          className="mobile-zoom-side-btn"
          onClick={() => zoomStep(1)}
          aria-label="Zoom in"
        >
          +
        </button>
      </div>

      {editFrame && (
        <div className="mobile-canvas-frame-nav">
          {b.activeVideoFrameLabel && (
            <div className="mobile-video-frame-indicator mobile-video-frame-indicator--snapshot" aria-live="polite">
              {b.activeVideoFrameLabel}
            </div>
          )}
          <button type="button" className="mobile-zoom-side-btn" {...editPrevHold} disabled={busy} aria-label="Previous frame">◀</button>
          <button type="button" className="mobile-zoom-side-btn" {...editNextHold} disabled={busy} aria-label="Next frame">▶</button>
        </div>
      )}
    </div>
  )
})
