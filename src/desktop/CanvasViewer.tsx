import {
  type DragEvent,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  type Ref,
} from 'react'
import { createPortal } from 'react-dom'
import { ElapsedTimer } from '../components/ElapsedTimer'
import { Icon } from '../components/Icon'
import { ToolSliderRow } from '../components/ToolSliderRow'
import '../components/tool-panels/tool-panels.css'
import { clamp, zoneToCanvasRect, type DrawTransform } from '../lib/canvas-geometry'
import {
  type NormalizedFaceRect,
  type VideoContentLayout,
  formatVideoTime,
  videoOverlayLayerStyle,
} from '../lib/video-layout'
import { MobileDrawMaskPanel } from '../mobile/MobileDrawMaskPanel'
import { MobileVideoProgress } from '../mobile/MobileVideoProgress'
import { VECTORIZE_PRESETS, type VectorizeParams, type VectorizePreset } from '../lib/vectorize'
import type { VideoMaskEditMode } from '../hooks/useVideoController'
import type {
  VideoFrameOverride,
  VideoProcessingPhase,
  VideoRenderSettingsKeyframe,
  VideoTimedZone,
} from '../lib/video'
import type { PhotoItem, ToolMode, Zone } from '../types'

type CropDraft = { x: number; y: number; w: number; h: number }

type ZoneOverlayRect = { id: string; x: number; y: number; width: number; height: number }

type VideoProgress = {
  current: number
  total: number
  phase: VideoProcessingPhase
  renderFrame?: number
  renderTotal?: number
}

export type DetectionModelProgress = {
  label: string
  pct: number | null
  detail?: string
}

type HoldRepeatBindings = {
  onPointerDown: (e: ReactPointerEvent) => void
  onPointerUp: () => void
  onPointerLeave: () => void
  onPointerCancel: () => void
}

export interface CanvasViewerProps {
  showMobileEmbed: boolean
  toolMode: ToolMode
  batchPanelOpen: boolean
  isNormalizeCropPicking: boolean
  isDragOver: boolean
  isMobile: boolean
  isBusy: boolean
  isDetecting: boolean
  detectionStep: string
  detectionModelProgress: DetectionModelProgress | null
  localProcessingMs: number | null
  videoProcessing: boolean
  videoProgress: VideoProgress | null
  previewRendering: boolean
  showBoxes: boolean
  autoDetect: boolean
  mobileGestureActive: boolean
  vectorizePanelOpen: boolean
  vectorizePreviewActive: boolean
  vectorizing: boolean
  zonesAnonymized: boolean
  undoCount: number
  videoMaskDrawActive: boolean
  videoPlaying: boolean
  videoDistortPreviewVisible: boolean
  activePhoto: PhotoItem | null
  photosCount: number
  activeZones: Zone[]
  dirtyByPhoto: Record<string, boolean>
  folderScanState: { found: number } | null
  cropDraft: CropDraft | null
  zoneOverlayRects: ZoneOverlayRect[]
  svgPreviewUrl: string | null
  svgPreviewSize: number | null
  vectorizeParams: VectorizeParams
  activeVideoUrl: string | null
  processedVideoEpoch: number
  videoContentLayout: VideoContentLayout | null
  videoPreviewFaceZones: Zone[]
  videoDismissedAtFrame: NormalizedFaceRect[]
  visibleVideoTimedZones: VideoTimedZone[]
  videoDraftZone: Zone | null
  activeVideoFrameLabel: string | null
  activeVideoTime: number
  activeVideoFrameOverrides: VideoFrameOverride[]
  activeVideoRenderSettingsKeyframes: VideoRenderSettingsKeyframe[]
  viewportRef: RefObject<HTMLDivElement>
  canvasRef: RefObject<HTMLCanvasElement>
  overlayCanvasRef: RefObject<HTMLCanvasElement>
  mobilePreviewTransformRef: RefObject<HTMLDivElement>
  videoMediaRef: RefObject<HTMLDivElement | null>
  activeVideoRef: RefObject<HTMLVideoElement | null>
  videoDistortPreviewCanvasRef: RefObject<HTMLCanvasElement | null>
  transformRef: MutableRefObject<DrawTransform>
  framePrevHold: HoldRepeatBindings
  frameNextHold: HoldRepeatBindings
  onDragEnter: (e: DragEvent) => void
  onDragLeave: (e: DragEvent) => void
  onDragOver: (e: DragEvent) => void
  onDrop: (e: DragEvent) => void
  onCancelDetection: () => void
  onCancelVideoProcessing: () => void
  onSetActiveVideoTime: (time: number) => void
  onSyncVideoContentLayout: () => void
  onSetVideoReadyTick: (updater: (t: number) => number) => void
  onSetVideoPlaying: (playing: boolean) => void
  onVideoMaskPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void
  onVideoMaskPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void
  onVideoMaskPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void
  onVideoTimedZonePointerDown: (id: string, mode: VideoMaskEditMode, event: ReactPointerEvent<HTMLElement>) => void
  onVideoTimedZonePointerMove: (event: ReactPointerEvent<HTMLElement>) => void
  onVideoTimedZonePointerUp: (event: ReactPointerEvent<HTMLElement>) => void
  onRemoveVideoTimedZoneFromCurrentFrame: (id: string) => void
  onRemoveVideoPreviewFaceZone: (zoneId: string) => void
  onRestoreVideoPreviewFaceZone: (rect: NormalizedFaceRect) => void
  onSetVideoMaskDrawActive: (updater: (cur: boolean) => boolean) => void
  onProcessActiveVideo: () => void
  onOpenCurrentVideoFrameAsSnapshot: () => void
  onToggleVideoPlayback: () => void
  onSeekActiveVideo: (timeSec: number) => void
  onCanvasPointerDown: (event: ReactPointerEvent<HTMLCanvasElement>) => void
  onCanvasPointerMove: (event: ReactPointerEvent<HTMLCanvasElement>) => void
  onCanvasPointerUp: () => void
  onCanvasWheel: (event: React.WheelEvent<HTMLCanvasElement>) => void
  onRemoveZoneById: (id: string) => void
  onSetVectorizeParams: (params: VectorizeParams) => void
  onRunVectorizePreview: (params: VectorizeParams) => void
  onUpdateVectorizeParam: <K extends keyof VectorizeParams>(key: K, value: VectorizeParams[K]) => void
  onExportAsSvg: () => void
  onApplyVectorizePreview: () => void
  onSaveSnapshot: () => void
  onApplyFrameToVideo: () => void
  onBackToSourceVideo: () => void
  onStepEditFrameAdjacent: (direction: -1 | 1) => void
  onUndo: () => void
  onResetPhotoToOriginal: () => void
  onCropToSelection: () => void
  onApplyZones: () => void
  activeFrameEditDirty: boolean
  activeFrameSavedToVideo: boolean
}

/** Desktop/mobile editor canvas viewer: drop hints, video player, image canvas, vectorize flyout, corner controls. */
export function CanvasViewer(props: CanvasViewerProps) {
  const {
    showMobileEmbed,
    toolMode,
    batchPanelOpen,
    isNormalizeCropPicking,
    isDragOver,
    isMobile,
    isBusy,
    isDetecting,
    detectionStep,
    detectionModelProgress,
    localProcessingMs,
    videoProcessing,
    videoProgress,
    previewRendering,
    showBoxes,
    autoDetect,
    mobileGestureActive,
    vectorizePanelOpen,
    vectorizePreviewActive,
    vectorizing,
    zonesAnonymized,
    undoCount,
    videoMaskDrawActive,
    videoPlaying,
    videoDistortPreviewVisible,
    activePhoto,
    photosCount,
    activeZones,
    dirtyByPhoto,
    folderScanState,
    cropDraft,
    zoneOverlayRects,
    svgPreviewUrl,
    svgPreviewSize,
    vectorizeParams,
    activeVideoUrl,
    processedVideoEpoch,
    videoContentLayout,
    videoPreviewFaceZones,
    videoDismissedAtFrame,
    visibleVideoTimedZones,
    videoDraftZone,
    activeVideoFrameLabel,
    activeVideoTime,
    activeVideoFrameOverrides,
    activeVideoRenderSettingsKeyframes,
    viewportRef,
    canvasRef,
    overlayCanvasRef,
    mobilePreviewTransformRef,
    videoMediaRef,
    activeVideoRef,
    videoDistortPreviewCanvasRef,
    transformRef,
    framePrevHold,
    frameNextHold,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    onCancelDetection,
    onCancelVideoProcessing,
    onSetActiveVideoTime,
    onSyncVideoContentLayout,
    onSetVideoReadyTick,
    onSetVideoPlaying,
    onVideoMaskPointerDown,
    onVideoMaskPointerMove,
    onVideoMaskPointerUp,
    onVideoTimedZonePointerDown,
    onVideoTimedZonePointerMove,
    onVideoTimedZonePointerUp,
    onRemoveVideoTimedZoneFromCurrentFrame,
    onRemoveVideoPreviewFaceZone,
    onRestoreVideoPreviewFaceZone,
    onSetVideoMaskDrawActive,
    onProcessActiveVideo,
    onOpenCurrentVideoFrameAsSnapshot,
    onToggleVideoPlayback,
    onSeekActiveVideo,
    onCanvasPointerDown,
    onCanvasPointerMove,
    onCanvasPointerUp,
    onCanvasWheel,
    onRemoveZoneById,
    onSetVectorizeParams,
    onRunVectorizePreview,
    onUpdateVectorizeParam,
    onExportAsSvg,
    onApplyVectorizePreview,
    onSaveSnapshot,
    onApplyFrameToVideo,
    onBackToSourceVideo,
    onStepEditFrameAdjacent,
    onUndo,
    onResetPhotoToOriginal,
    onCropToSelection,
    onApplyZones,
    activeFrameEditDirty,
    activeFrameSavedToVideo,
  } = props
  const isVideoFrameEdit = Boolean(activePhoto && !activePhoto.isVideo && activePhoto.isVideoFrameEdit)

  return (
    <div
      className={[
        'viewer',
        showMobileEmbed ? 'viewer-mobile-pinch' : '',
        showMobileEmbed && toolMode === 'crop' ? 'viewer-crop-mode' : '',
        batchPanelOpen && !isNormalizeCropPicking ? 'viewer-readonly' : '',
        isNormalizeCropPicking ? 'viewer-crop-picking' : '',
        isDragOver ? 'drag-over' : '',
      ].filter(Boolean).join(' ')}
      ref={viewportRef}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Empty state / drop hint */}
      {!activePhoto && photosCount === 0 && !isDragOver && (
        <div className="drop-hint">
          <div className="drop-hint-icon"><Icon name="image" size={52} /></div>
          <div className="drop-hint-text">
            Drop photos here<br />or use the explorer on the left
          </div>
          <div className="drop-hint-shortcut">
            <kbd className="kbd">⌘V</kbd> paste from clipboard
          </div>
        </div>
      )}

      {/* Drag-over overlay */}
      {isDragOver && (
        <div className="drag-over-hint">
          <div className="drag-over-icon"><Icon name="folder_open" size={48} /></div>
          <div className="drag-over-text">Drop to add photos or folders</div>
        </div>
      )}

      {/* Folder scan progress overlay */}
      {folderScanState && (
        <div className="drag-over-hint">
          <div className="drag-over-icon" style={{ animation: 'spin 1.2s linear infinite' }}>
            <Icon name="folder_open" size={48} />
          </div>
          <div className="drag-over-text">Scanning folder…</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            {folderScanState.found} image{folderScanState.found !== 1 ? 's' : ''} found
          </div>
        </div>
      )}

      {/* Detecting overlay — portaled on mobile so it sits above bottom drawers */}
      {(() => {
        if (!isDetecting) return null
        const progressPct = detectionModelProgress?.pct ?? null
        const progressLabel = detectionModelProgress?.label ?? detectionStep
        const overlay = (
          <div
            className={`detecting-overlay${isMobile ? ' detecting-overlay--portal' : ''}`}
            style={{ flexDirection: 'column', gap: '0.3rem', minWidth: 260, alignItems: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>⏳</span>
              <span>{detectionModelProgress ? 'Preparing analysis…' : 'Detecting faces…'}</span>
              <ElapsedTimer />
            </div>
            {activePhoto && (
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', maxWidth: 230, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activePhoto.name.split('/').pop()}
              </span>
            )}
            {progressLabel && (
              <span style={{ fontSize: '0.58rem', color: 'var(--accent)', opacity: 0.9 }}>
                {progressLabel}{progressPct !== null ? ` · ${progressPct}%` : ''}
              </span>
            )}
            {detectionModelProgress?.detail && (
              <span style={{ fontSize: '0.54rem', color: 'var(--text-muted)' }}>
                {detectionModelProgress.detail}
              </span>
            )}
            <div className="local-proof-bar">
              <div className={`local-proof-progress${progressPct !== null ? ' local-proof-progress--determinate' : ''}`}>
                {progressPct !== null && <span style={{ width: `${progressPct}%` }} />}
              </div>
              <span className="local-proof-label">
                <Icon name="lock" size={10} /> All data stays on your device
              </span>
            </div>
            <button
              className="btn btn-sm"
              type="button"
              onClick={onCancelDetection}
              style={{ marginTop: '0.15rem', fontSize: '0.6rem', padding: '0.15rem 0.5rem' }}
            >
              Stop
            </button>
          </div>
        )
        return isMobile ? createPortal(overlay, document.body) : overlay
      })()}
      {/* Local processing proof badge */}
      {!isDetecting && localProcessingMs != null && (
        <div className="local-proof-badge">
          <Icon name="verified_user" size={11} /> Processed locally in {localProcessingMs} ms
        </div>
      )}

      {/* Video processing — inline progress under action row (mobile-style) */}
      {/* Video player — shown instead of canvas when a video is selected */}
      {activePhoto?.isVideo && activeVideoUrl && (
        <div className="video-player-wrap">
          <div className="video-stage">
            <div className="video-media" ref={videoMediaRef as Ref<HTMLDivElement>}>
              <video
                key={`${activePhoto.id}-${processedVideoEpoch}-${activeVideoUrl}`}
                ref={activeVideoRef as Ref<HTMLVideoElement>}
                src={activeVideoUrl}
                className="video-player"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                onTimeUpdate={(event) => onSetActiveVideoTime(event.currentTarget.currentTime)}
                onSeeked={(event) => onSetActiveVideoTime(event.currentTarget.currentTime)}
                onLoadedMetadata={(event) => {
                  onSetActiveVideoTime(event.currentTarget.currentTime)
                  onSyncVideoContentLayout()
                  onSetVideoReadyTick((t) => t + 1)
                }}
                onLoadedData={() => onSetVideoReadyTick((t) => t + 1)}
                onPlay={() => onSetVideoPlaying(true)}
                onPause={() => onSetVideoPlaying(false)}
                onEnded={() => onSetVideoPlaying(false)}
              />
              <canvas
                ref={videoDistortPreviewCanvasRef as Ref<HTMLCanvasElement>}
                className={`video-distort-preview${videoDistortPreviewVisible ? ' visible' : ''}`}
                style={videoOverlayLayerStyle(videoContentLayout)}
                aria-hidden="true"
              />
              <div
                className={`video-mask-layer${videoMaskDrawActive ? ' drawing' : ''}`}
                style={videoOverlayLayerStyle(videoContentLayout)}
                onPointerDown={onVideoMaskPointerDown}
                onPointerMove={onVideoMaskPointerMove}
                onPointerUp={onVideoMaskPointerUp}
                onPointerCancel={onVideoMaskPointerUp}
              >
                {showBoxes && !activePhoto.edited && !mobileGestureActive && videoPreviewFaceZones.map((zone) => (
                  <button
                    key={zone.id}
                    type="button"
                    className="video-face-rect"
                    style={{
                      left: `${zone.x * 100}%`,
                      top: `${zone.y * 100}%`,
                      width: `${zone.width * 100}%`,
                      height: `${zone.height * 100}%`,
                    }}
                    onClick={(event) => {
                      event.stopPropagation()
                      onRemoveVideoPreviewFaceZone(zone.id)
                    }}
                    title="Exclude this face from anonymization"
                    aria-label="Exclude this face from anonymization"
                  >
                    <span className="video-face-rect-dismiss zone-delete-btn" aria-hidden="true">
                      <Icon name="close" size={12} />
                    </span>
                  </button>
                ))}
                {showBoxes && !activePhoto.edited && !mobileGestureActive && videoDismissedAtFrame.map((rect, index) => (
                  <button
                    key={`dismissed-${index}-${Math.round(rect.x * 1000)}`}
                    type="button"
                    className="video-face-rect video-face-rect--dismissed"
                    style={{
                      left: `${rect.x * 100}%`,
                      top: `${rect.y * 100}%`,
                      width: `${rect.width * 100}%`,
                      height: `${rect.height * 100}%`,
                    }}
                    onClick={(event) => {
                      event.stopPropagation()
                      onRestoreVideoPreviewFaceZone(rect)
                    }}
                    title="Restore anonymization for this face"
                    aria-label="Restore anonymization for this face"
                  >
                    <span className="video-face-rect-restore zone-delete-btn" aria-hidden="true">
                      <Icon name="add" size={12} />
                    </span>
                  </button>
                ))}
                {visibleVideoTimedZones.map((item) => {
                  const zone = item.zone
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`video-mask-rect video-mask-rect--editable video-mask-rect--${zone.maskShape ?? 'rectangle'}`}
                      style={{
                        left: `${zone.x * 100}%`,
                        top: `${zone.y * 100}%`,
                        width: `${zone.width * 100}%`,
                        height: `${zone.height * 100}%`,
                      }}
                      onPointerDown={(event) => onVideoTimedZonePointerDown(item.id, 'move', event)}
                      onPointerMove={onVideoTimedZonePointerMove}
                      onPointerUp={onVideoTimedZonePointerUp}
                      onPointerCancel={onVideoTimedZonePointerUp}
                      title="Drag to move this timeline mask"
                      aria-label="Move timeline mask"
                    >
                      <span
                        className="video-mask-remove-btn zone-delete-btn"
                        role="button"
                        tabIndex={0}
                        title="Stop this mask from this frame onward"
                        aria-label="Stop this mask from this frame onward"
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                          event.stopPropagation()
                          onRemoveVideoTimedZoneFromCurrentFrame(item.id)
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            event.stopPropagation()
                            onRemoveVideoTimedZoneFromCurrentFrame(item.id)
                          }
                        }}
                      >
                        <Icon name="close" size={12} />
                      </span>
                      {(['nw', 'ne', 'sw', 'se'] as const).map((handle) => (
                        <span
                          key={handle}
                          className={`video-mask-resize-handle video-mask-resize-handle--${handle}`}
                          role="presentation"
                          onPointerDown={(event) => onVideoTimedZonePointerDown(item.id, handle, event)}
                          onPointerMove={onVideoTimedZonePointerMove}
                          onPointerUp={onVideoTimedZonePointerUp}
                          onPointerCancel={onVideoTimedZonePointerUp}
                        />
                      ))}
                    </button>
                  )
                })}
                {videoDraftZone && (
                  <div
                    key={videoDraftZone.id}
                    className={`video-mask-rect video-mask-rect--${videoDraftZone.maskShape ?? 'rectangle'} draft`}
                    style={{
                      left: `${videoDraftZone.x * 100}%`,
                      top: `${videoDraftZone.y * 100}%`,
                      width: `${videoDraftZone.width * 100}%`,
                      height: `${videoDraftZone.height * 100}%`,
                    }}
                  />
                )}
              </div>
            </div>
            <div className="mobile-video-bottom-controls">
              <div className="mobile-video-bottom-controls__action">
                {!videoProcessing && (
                  <div className="video-action-row mobile-canvas-bottom-bar mobile-canvas-bottom-bar--video mobile-canvas-bottom-bar--inline">
                    <button
                      type="button"
                      className="mobile-zoom-side-btn"
                      {...framePrevHold}
                      disabled={isBusy}
                      aria-label="Previous frame"
                    >
                      <Icon name="skip_previous" size={16} />
                    </button>
                    <div className="mobile-canvas-action-cluster">
                      {activeVideoFrameLabel && (
                        <div className="mobile-video-frame-indicator" aria-live="polite">
                          {activeVideoFrameLabel}
                        </div>
                      )}
                      {!activePhoto.edited && (
                        <button
                          type="button"
                          className={`mobile-canvas-secondary-btn${videoMaskDrawActive ? ' active' : ''}`}
                          onClick={() => onSetVideoMaskDrawActive((cur) => !cur)}
                          disabled={isBusy}
                        >
                          DRAW MASK
                        </button>
                      )}
                      <button
                        type="button"
                        className="mobile-anonymize-btn"
                        onClick={onProcessActiveVideo}
                        disabled={isBusy}
                      >
                        {autoDetect ? 'ANONYMIZE' : 'PROCESS'}
                      </button>
                      <button
                        type="button"
                        className="mobile-canvas-secondary-btn"
                        onClick={onOpenCurrentVideoFrameAsSnapshot}
                        disabled={isBusy}
                      >
                        EDIT FRAME
                      </button>
                    </div>
                    <button
                      type="button"
                      className="mobile-zoom-side-btn"
                      {...frameNextHold}
                      disabled={isBusy}
                      aria-label="Next frame"
                    >
                      <Icon name="skip_next" size={16} />
                    </button>
                  </div>
                )}
                {videoProcessing && videoProgress && (
                  <MobileVideoProgress
                    phase={videoProgress.phase}
                    current={videoProgress.current}
                    total={videoProgress.total}
                    renderFrame={videoProgress.renderFrame}
                    renderTotal={videoProgress.renderTotal}
                    onCancel={onCancelVideoProcessing}
                  />
                )}
              </div>
              <div className={`mobile-video-bottom-controls__mask${videoMaskDrawActive && !videoProcessing ? '' : ' mobile-video-bottom-controls__mask--reserved'}`}>
                {!videoProcessing && videoMaskDrawActive && <MobileDrawMaskPanel />}
              </div>
            </div>
            {!videoProcessing && (
            <>
            <div className="video-timeline-row">
              <button
                type="button"
                className="btn btn-sm video-timeline-play"
                onClick={onToggleVideoPlayback}
                disabled={videoProcessing || isBusy}
                aria-label={videoPlaying ? 'Pause video' : 'Play video'}
              >
                <Icon name={videoPlaying ? 'pause' : 'play_arrow'} size={18} />
              </button>
              <div className="video-timeline-track-wrap">
                <input
                  type="range"
                  className="video-timeline-scrubber"
                  min={0}
                  max={activePhoto.videoDuration ?? activeVideoRef.current?.duration ?? 0}
                  step={0.001}
                  value={activeVideoTime}
                  disabled={videoProcessing || isBusy}
                  aria-label="Video timeline"
                  onChange={(event) => onSeekActiveVideo(parseFloat(event.target.value))}
                />
                {(activeVideoFrameOverrides.length > 0 || activeVideoRenderSettingsKeyframes.length > 0) && Number.isFinite(activePhoto.videoDuration) && (activePhoto.videoDuration ?? 0) > 0 && (
                  <div className="video-frame-marker-layer" aria-hidden="true">
                    {activeVideoFrameOverrides.map((item) => (
                      <span
                        key={`frame-${item.timeSec}`}
                        className="video-frame-marker"
                        style={{ left: `${clamp((item.timeSec / (activePhoto.videoDuration ?? 1)) * 100, 0, 100)}%` }}
                      />
                    ))}
                    {activeVideoRenderSettingsKeyframes.map((item) => (
                      <span
                        key={`settings-${item.timeSec}`}
                        className="video-frame-marker video-frame-marker--settings"
                        style={{ left: `${clamp((item.timeSec / (activePhoto.videoDuration ?? 1)) * 100, 0, 100)}%` }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <span className="video-timeline-time">
                {formatVideoTime(activeVideoTime)}
                {activePhoto.videoDuration != null ? ` / ${formatVideoTime(activePhoto.videoDuration)}` : ''}
              </span>
            </div>
            </>
            )}
          </div>
        </div>
      )}

      <div
        ref={mobilePreviewTransformRef}
        className={isMobile && activePhoto && !activePhoto.isVideo ? 'mobile-preview-transform' : undefined}
      >
        <canvas
          ref={canvasRef}
          className={batchPanelOpen && !isNormalizeCropPicking ? 'readonly-canvas' : ''}
          style={activePhoto?.isVideo ? { display: 'none' } : (toolMode === 'crop' ? { cursor: 'crosshair', touchAction: 'none' } : undefined)}
          onPointerDown={onCanvasPointerDown}
          onPointerMove={onCanvasPointerMove}
          onPointerUp={onCanvasPointerUp}
          onPointerCancel={onCanvasPointerUp}
          onWheel={onCanvasWheel}
          onPointerLeave={() => {
            onCanvasPointerUp()
            const overlay = overlayCanvasRef.current
            if (overlay) { const oc = overlay.getContext('2d'); if (oc) oc.clearRect(0, 0, overlay.width, overlay.height) }
          }}
        />
        {/* Brush preview overlay */}
        <canvas ref={overlayCanvasRef} className="brush-preview-overlay" />

        {/* Zone × delete buttons overlay */}
        {showBoxes && toolMode !== 'crop' && !activePhoto?.isVideo && zoneOverlayRects.length > 0 && (
          <div className="zone-delete-layer" style={{ pointerEvents: toolMode === 'brush' ? 'none' : undefined }}>
            {zoneOverlayRects.map(({ id, x, y, width, height }) => (
              <button
                key={id}
                className="zone-overlay-hit"
                type="button"
                style={{ left: x, top: y, width, height }}
                onClick={(e) => { e.stopPropagation(); onRemoveZoneById(id) }}
                title="Remove this face box"
                aria-label="Remove this face box"
              >
                <span className="zone-delete-btn zone-overlay-hit-icon" aria-hidden="true">
                  <Icon name="close" size={12} />
                </span>
              </button>
            ))}
          </div>
        )}

        {toolMode === 'crop' && isMobile && (
          <div className="mobile-crop-hint" aria-live="polite">
            Drag to select the crop area
          </div>
        )}

        {/* Crop draft overlay */}
        {toolMode === 'crop' && cropDraft && cropDraft.w > 0.0005 && cropDraft.h > 0.0005 && (() => {
          const t = transformRef.current
          const rect = zoneToCanvasRect({
            id: 'crop',
            x: cropDraft.x,
            y: cropDraft.y,
            width: cropDraft.w,
            height: cropDraft.h,
            effect: 'blur',
            emoji: '',
          }, t)
          return (
            <div
              className="mobile-crop-selection"
              style={{
                position: 'absolute', left: rect.x, top: rect.y, width: rect.width, height: rect.height,
                pointerEvents: 'none', boxSizing: 'border-box',
              }}
            />
          )
        })()}

        {/* SVG vectorize preview overlay */}
        {vectorizePreviewActive && svgPreviewUrl && (() => {
          const t = transformRef.current
          const hasFrame = t.drawWidth > 0 && t.drawHeight > 0
          return (
            <div
              className="svg-preview-overlay"
              style={hasFrame ? { left: t.drawX, top: t.drawY, width: t.drawWidth, height: t.drawHeight } : undefined}
            >
              <img src={svgPreviewUrl} alt="SVG vectorized preview" />
            </div>
          )
        })()}
      </div>

      {isVideoFrameEdit && !isMobile && (
        <>
          <button
            className="video-frame-back-btn"
            type="button"
            onClick={onBackToSourceVideo}
            disabled={isBusy}
            title="Return to the source video with saved frame edits preserved"
          >
            Back to video <Icon name="arrow_forward" size={14} />
          </button>
          <div className="video-frame-edit-control" aria-label="Video frame edit controls">
            <button
              className="video-frame-nav-btn"
              type="button"
              onClick={() => onStepEditFrameAdjacent(-1)}
              disabled={isBusy}
              aria-label="Previous frame"
              title="Previous frame"
            >
              <Icon name="skip_previous" size={18} />
            </button>
            <button
              className={`video-frame-save-btn${!activeFrameEditDirty && activeFrameSavedToVideo ? ' saved' : ''}`}
              type="button"
              onClick={onApplyFrameToVideo}
              disabled={isBusy || !activeFrameEditDirty}
              title={activeFrameEditDirty
                ? 'Save this edited frame into the video render'
                : activeFrameSavedToVideo
                  ? 'This frame is saved into the video render'
                  : 'Make an edit before saving this frame'}
            >
              {!activeFrameEditDirty && activeFrameSavedToVideo
                ? <><Icon name="check" size={15} /> Saved</>
                : <><Icon name="movie_edit" size={15} /> Save to video</>}
            </button>
            <button
              className="video-frame-nav-btn"
              type="button"
              onClick={() => onStepEditFrameAdjacent(1)}
              disabled={isBusy}
              aria-label="Next frame"
              title="Next frame"
            >
              <Icon name="skip_next" size={18} />
            </button>
          </div>
        </>
      )}

      {/* Vectorize panel — flyout from toolbar */}
      {vectorizePanelOpen && activePhoto && !activePhoto.isVideo && !isMobile && (
        <div className="vectorize-panel">
          <div className="vectorize-panel-header">
            <span style={{ fontWeight: 600, fontSize: '0.72rem' }}>Vectorize to SVG</span>
            {vectorizing && <span className="vectorize-spinner">⏳</span>}
            {svgPreviewSize != null && !vectorizing && (
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>~{Math.round(svgPreviewSize / 1024)} KB</span>
            )}
          </div>

          <label className="vectorize-label">Preset</label>
          <select
            className="field-select"
            value={vectorizeParams.preset}
            onChange={(e) => {
              const preset = e.target.value as VectorizePreset
              const next = { ...vectorizeParams, preset }
              onSetVectorizeParams(next)
              onRunVectorizePreview(next)
            }}
          >
            {VECTORIZE_PRESETS.map((p) => (
              <option key={p.id} value={p.id} title={p.desc}>{p.label}</option>
            ))}
          </select>

          {vectorizeParams.preset === 'default' && (
            <div className="tool-panel-sliders">
              <ToolSliderRow
                label="Colors"
                min={2}
                max={64}
                value={vectorizeParams.colorCount}
                onChange={(v) => onUpdateVectorizeParam('colorCount', v)}
              />
              <ToolSliderRow
                label="Smooth"
                min={0.5}
                max={10}
                step={0.5}
                value={vectorizeParams.minPathLength}
                format={(v) => v.toFixed(1)}
                onChange={(v) => onUpdateVectorizeParam('minPathLength', v)}
              />
              <ToolSliderRow
                label="Corners"
                min={0}
                max={2}
                step={0.1}
                value={vectorizeParams.cornerThreshold}
                format={(v) => v.toFixed(1)}
                onChange={(v) => onUpdateVectorizeParam('cornerThreshold', v)}
              />
            </div>
          )}

          {vectorizing && (
            <div className="vectorize-progress">
              <div className="vectorize-progress-bar" />
            </div>
          )}

          <div className="vectorize-panel-actions">
            <button
              className="btn vectorize-download-btn"
              type="button"
              onClick={onExportAsSvg}
              disabled={isBusy || vectorizing}
            >
              <Icon name="download" size={14} /> Download SVG
            </button>
            <button
              className="btn btn-primary vectorize-apply-btn"
              type="button"
              onClick={onApplyVectorizePreview}
              disabled={isBusy || vectorizing || !svgPreviewUrl}
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Save snapshot — bottom-left (shown when photo has edits, not for video) */}
      {activePhoto && !activePhoto.isVideo && (dirtyByPhoto[activePhoto.id] || zonesAnonymized) && !batchPanelOpen && (
        <button
          className="snapshot-corner-btn"
          type="button"
          onClick={onSaveSnapshot}
          disabled={isBusy}
          title="Save a snapshot of the current state as a new image in the explorer"
        >
          <Icon name="add_a_photo" size={13} /> Save snapshot
        </button>
      )}

      {/* Quality preview progress — bottom-left mini bar */}
      {previewRendering && (
        <div className="preview-progress-bar">
          <div className="preview-progress-track">
            <div className="preview-progress-fill" />
          </div>
          <span className="preview-progress-label">Rendering preview…</span>
        </div>
      )}

      {/* Undo + Reset — top-left (shown when photo has edits) */}
      {activePhoto && (activePhoto.edited || dirtyByPhoto[activePhoto.id] || undoCount > 0) && (
        <div className="undo-corner-group">
          {undoCount > 0 && (
            <button
              className="undo-corner-btn"
              type="button"
              onClick={onUndo}
              title="Undo last edit"
            >
              <Icon name="undo" size={14} /> Undo
            </button>
          )}
          <button
            className="undo-corner-btn"
            type="button"
            onClick={onResetPhotoToOriginal}
            title="Reset photo to original — undo all edits"
          >
            <Icon name="restart_alt" size={14} /> Reset
          </button>
        </div>
      )}

      {/* Bottom-right: Crop confirm OR Anonymize button */}
      {activePhoto && toolMode === 'crop' && (
        <div className="viewer-corner">
          <button
            className="corner-btn corner-btn-primary"
            type="button"
            onClick={onCropToSelection}
            disabled={isBusy || !cropDraft || (cropDraft.w < 0.002 && cropDraft.h < 0.002)}
            title="Confirm crop selection"
          >
            <Icon name="crop" size={13} /> Crop
          </button>
        </div>
      )}
      {activePhoto && toolMode !== 'crop' && activeZones.length > 0 && !zonesAnonymized && (
        <div className={`viewer-corner${isVideoFrameEdit ? ' viewer-corner--video-frame-edit' : ''}`}>
          <button
            className="corner-btn corner-btn-primary corner-btn-anonymize"
            type="button"
            onClick={onApplyZones}
            disabled={isBusy}
            title={`Apply anonymization to ${activeZones.length} zone${activeZones.length !== 1 ? 's' : ''}`}
          >
            Anonymize
          </button>
        </div>
      )}
    </div>
  )
}
