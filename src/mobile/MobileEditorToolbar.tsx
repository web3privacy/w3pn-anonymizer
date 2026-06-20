import { useEffect, useState } from 'react'
import { Icon } from '../components/Icon'
import { isLosslessFormat } from '../lib/image-encoders'
import type { AppMobileBindings } from './bindings'
import type { VideoExportFormatId } from '../lib/video'
import type { NormalizeFormat } from '../types'

function truncateFilename(name: string, maxLen = 18): string {
  if (name.length <= maxLen) return name
  return `${name.slice(0, maxLen - 1)}…`
}

function formatVideoTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

interface MobileEditorToolbarProps {
  b: AppMobileBindings
}

export function MobileEditorToolbar({ b }: MobileEditorToolbarProps) {
  const photo = b.activePhoto
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setExpanded(false)
  }, [photo?.id])

  if (!photo) return null

  const downloadDisabled = b.isBusy || b.videoProcessing
  const fullName = photo.name.split('/').pop() ?? photo.name
  const fileLabel = truncateFilename(fullName)
  const confirmedW = photo.isVideo
    ? (photo.videoWidth ?? 0)
    : (b.activeImageSize?.width ?? 0)
  const confirmedH = photo.isVideo
    ? (photo.videoHeight ?? 0)
    : (b.activeImageSize?.height ?? 0)
  const draft = b.mobileExportDraft
  const isPhoto = !photo.isVideo

  const toggleExpand = () => {
    if (expanded) {
      if (isPhoto) b.cancelMobileExportEdit()
      setExpanded(false)
      return
    }
    if (isPhoto) b.beginMobileExportEdit()
    setExpanded(true)
  }

  const handleOk = async () => {
    if (isPhoto) await b.commitMobileExportEdit()
    setExpanded(false)
  }

  const showQuality = draft && !isLosslessFormat(draft.format)

  return (
    <div className={`mobile-editor-toolbar-v2${expanded ? ' expanded' : ''}`}>
      <div className="mobile-editor-toolbar-v2-row">
        <button
          type="button"
          className="mobile-tb-v2-summary"
          onClick={toggleExpand}
          aria-expanded={expanded}
          title={fullName}
        >
          <span className="mobile-tb-v2-name">{fileLabel}</span>
          {confirmedW > 0 && confirmedH > 0 && (
            <span className="mobile-tb-v2-dims">({confirmedW}×{confirmedH})</span>
          )}
          <span className={`mobile-tb-v2-chevron${expanded ? ' open' : ''}`}>
            <Icon name="expand_more" size={14} />
          </span>
        </button>

        <button
          className="mobile-tb-v2-download"
          type="button"
          onClick={() => (photo.isVideo ? b.exportActiveVideo() : b.exportActivePhoto())}
          disabled={downloadDisabled}
          aria-label="Download"
        >
          <Icon name="download" size={16} />
        </button>
      </div>

      {expanded && (
        <div className="mobile-editor-toolbar-v2-panel">
          {isPhoto && draft ? (
            <>
              <div className="mobile-tb-v2-export-fields">
                <div className="mobile-tb-v2-field-row mobile-tb-v2-size-row">
                  <span className="mobile-tb-v2-field-label">Size</span>
                  <div className="mobile-tb-v2-res mobile-tb-v2-res--split">
                    <input
                      type="number"
                      value={draft.width}
                      min={1}
                      max={25000}
                      onChange={(e) => b.updateMobileExportDraft({ width: Number(e.target.value) })}
                    />
                    <span className="mobile-tb-v2-res-sep">×</span>
                    <input
                      type="number"
                      value={draft.height}
                      min={1}
                      max={25000}
                      onChange={(e) => b.updateMobileExportDraft({ height: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="mobile-tb-v2-field-row mobile-tb-v2-format-row">
                  <span className="mobile-tb-v2-field-label">Format</span>
                  <select
                    className="mobile-tb-v2-format-select"
                    value={draft.format}
                    onChange={(e) => b.updateMobileExportDraft({ format: e.target.value as NormalizeFormat })}
                  >
                    <option value="image/jpeg">JPG</option>
                    <option value="image/png">PNG</option>
                    <option value="image/webp">WebP</option>
                    <option value="image/bmp">BMP</option>
                    <option value="image/gif">GIF</option>
                    <option value="image/tiff">TIFF</option>
                  </select>
                </div>
              </div>
              {showQuality && (
                <div className="mobile-tb-v2-panel-row mobile-tb-v2-quality-row">
                  <span className="mobile-tb-v2-label">Q {draft.quality}%</span>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={draft.quality}
                    onChange={(e) => b.updateMobileExportDraft({ quality: Number(e.target.value) })}
                  />
                  <span className="mobile-tb-v2-preview">
                    {b.previewRendering ? '…' : b.previewFileSizeKb != null ? `~${b.previewFileSizeKb} KB` : '—'}
                  </span>
                  <button type="button" className="mobile-tb-v2-ok" onClick={() => { void handleOk() }} disabled={b.isBusy}>
                    OK
                  </button>
                </div>
              )}
              {!showQuality && (
                <div className="mobile-tb-v2-export-actions">
                  <button type="button" className="mobile-tb-v2-ok" onClick={() => { void handleOk() }} disabled={b.isBusy}>
                    OK
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="mobile-tb-v2-export-fields mobile-tb-v2-export-fields--video">
              <div className="mobile-tb-v2-field-row mobile-tb-v2-format-row">
                <span className="mobile-tb-v2-field-label">Format</span>
                <select
                  className="mobile-tb-v2-format-select"
                  value={b.videoExportFormat}
                  onChange={(e) => b.setVideoExportFormat(e.target.value as VideoExportFormatId)}
                  disabled={b.videoProcessing || b.isBusy}
                >
                  {b.videoExportOptions.map((opt) => (
                    <option key={opt.id} value={opt.id} disabled={!opt.supported}>
                      {opt.label}{opt.supported ? '' : ' — unavailable'}
                    </option>
                  ))}
                </select>
              </div>
              {photo.videoDuration != null && (
                <div className="mobile-tb-v2-field-row mobile-tb-v2-field-row--meta">
                  <span className="mobile-tb-v2-field-label">Duration</span>
                  <div className="mobile-tb-v2-meta-value">
                    <span>{formatVideoTime(photo.videoDuration)}</span>
                    {photo.videoFps ? (
                      <span className="mobile-tb-v2-meta-sub">{Math.round(photo.videoFps)} fps</span>
                    ) : null}
                  </div>
                </div>
              )}
              <div className="mobile-tb-v2-field-row mobile-tb-v2-field-row--meta">
                <span className="mobile-tb-v2-field-label">Edits</span>
                <div className="mobile-tb-v2-meta-value">
                  <span>{b.activeVideoFrameOverrides.length + b.activeVideoTimedZones.length + b.activeVideoRenderSettingsKeyframes.length}</span>
                  <span className="mobile-tb-v2-meta-sub">
                    {b.activeVideoFrameOverrides.length} frames · {b.activeVideoTimedZones.length} masks · {b.activeVideoRenderSettingsKeyframes.length} settings
                  </span>
                </div>
              </div>
              <details className="mobile-tb-v2-advanced mobile-tb-v2-advanced--video">
                <summary>Pipeline</summary>
                <div>
                  {b.videoPipelineCapabilities.timelineWorker ? 'worker' : 'main'} ·{' '}
                  {b.videoPipelineCapabilities.webCodecsRenderer ? 'WebCodecs' : 'MediaRecorder'}
                </div>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
