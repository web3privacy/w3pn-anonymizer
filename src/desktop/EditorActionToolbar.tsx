import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../components/Icon'
import { isLosslessFormat } from '../lib/image-encoders'
import type { PngDepth } from '../lib/export-canvas'
import type { VideoExportFormatId, VideoExportOption } from '../lib/video'
import type { NormalizeFormat, PhotoItem } from '../types'

interface EditorActionToolbarProps {
  activePhoto: PhotoItem | null
  photosCount: number
  resEditW: number
  resEditH: number
  setResEditW: (n: number) => void
  setResEditH: (n: number) => void
  activeImageSize: { width: number; height: number } | null
  onResize: () => void
  exportFormat: NormalizeFormat
  setExportFormat: (f: NormalizeFormat) => void
  hasSvgPreview: boolean
  exportPngDepth: PngDepth
  setExportPngDepth: (d: PngDepth) => void
  exportQuality: number
  setExportQuality: (n: number) => void
  previewFileSizeKb: number | null
  vectorizePanelOpen: boolean
  onToggleVectorize: () => void
  busy: boolean
  videoProcessing: boolean
  videoExportFormat: VideoExportFormatId
  videoExportOptions: VideoExportOption[]
  setVideoExportFormat: (format: VideoExportFormatId) => void
  onExportVideo: () => void
  onExportSvg: () => void
  onExportPhoto: () => void
  audioExportFormats: { id: string; label: string }[]
  audioExportFormatId: string
  setAudioExportFormatId: (id: string) => void
  onExportAudio: (formatId?: string) => void
  audioExporting: boolean
}

const SVG_FORMAT = 'image/svg+xml' as NormalizeFormat

/** Desktop editor action toolbar: filename, resolution, format/quality, vectorize, download. */
export function EditorActionToolbar(props: EditorActionToolbarProps) {
  const {
    activePhoto, photosCount, resEditW, resEditH, setResEditW, setResEditH, activeImageSize, onResize,
    exportFormat, setExportFormat, hasSvgPreview, exportPngDepth, setExportPngDepth, exportQuality, setExportQuality,
    previewFileSizeKb, vectorizePanelOpen, onToggleVectorize,
    busy, videoProcessing, videoExportFormat, videoExportOptions, setVideoExportFormat,
    onExportVideo, onExportSvg, onExportPhoto,
    audioExportFormats, audioExportFormatId, onExportAudio, audioExporting,
  } = props

  const filenameTipRef = useRef<HTMLSpanElement>(null)
  const [filenameTipPos, setFilenameTipPos] = useState<{ top: number; left: number } | null>(null)
  const audioBtnRef = useRef<HTMLButtonElement>(null)
  // The action toolbar clips overflow, so the download submenu is rendered into a
  // body portal positioned beneath the button (same pattern as the filename tip).
  const [audioMenuPos, setAudioMenuPos] = useState<{ top: number; right: number } | null>(null)
  const toggleAudioMenu = () => {
    if (audioMenuPos) { setAudioMenuPos(null); return }
    const r = audioBtnRef.current?.getBoundingClientRect()
    if (r) setAudioMenuPos({ top: r.bottom + 6, right: Math.max(8, window.innerWidth - r.right) })
  }
  const baseW = activeImageSize?.width ?? 0
  const baseH = activeImageSize?.height ?? 0
  const displayW = resEditW > 0 ? resEditW : baseW
  const displayH = resEditH > 0 ? resEditH : baseH
  const aspect = baseW > 0 && baseH > 0 ? baseW / baseH : 1
  const setWidthKeepingAspect = (value: number) => {
    const nextW = Number.isFinite(value) ? Math.max(1, Math.round(value)) : baseW
    setResEditW(nextW)
    if (aspect > 0) setResEditH(Math.max(1, Math.round(nextW / aspect)))
  }
  const setHeightKeepingAspect = (value: number) => {
    const nextH = Number.isFinite(value) ? Math.max(1, Math.round(value)) : baseH
    setResEditH(nextH)
    if (aspect > 0) setResEditW(Math.max(1, Math.round(nextH * aspect)))
  }

  return (
    <div className="action-toolbar">
      {activePhoto ? (
        <>
          {/* Filename chip — portal tooltip so it escapes overflow-y:hidden toolbar */}
          <span
            ref={filenameTipRef}
            className="tb-filename"
            onMouseEnter={() => {
              const r = filenameTipRef.current?.getBoundingClientRect()
              if (r) setFilenameTipPos({ top: r.bottom + 6, left: r.left })
            }}
            onMouseLeave={() => setFilenameTipPos(null)}
          >
            {activePhoto.name.split('/').pop()}
          </span>
          {filenameTipPos && createPortal(
            <div style={{
              position: 'fixed', top: filenameTipPos.top, left: filenameTipPos.left,
              background: 'var(--panel-bg)', border: '1px solid var(--border)',
              borderRadius: 5, padding: '0.3rem 0.55rem', fontSize: '0.7rem',
              color: 'var(--text-secondary)', whiteSpace: 'normal', wordBreak: 'break-all',
              maxWidth: 380, zIndex: 9999, boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              pointerEvents: 'none',
            }}>
              {activePhoto.name}
            </div>,
            document.body
          )}

          {activePhoto.isAudio ? (
            <>
              <span className="tb-filesize">Voice mask · anonymized download</span>
              {/* Download is a submenu: the button opens a flyout of codecs and the
                  chosen format is encoded + saved on click. */}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.3rem', flexShrink: 0, alignItems: 'center' }}>
                <button
                  ref={audioBtnRef}
                  className="tb-btn"
                  style={{ background: '#3b5bdb', borderColor: '#3b5bdb', color: '#fff', fontWeight: 600 }}
                  type="button"
                  onClick={toggleAudioMenu}
                  disabled={audioExporting}
                  title="Download anonymized audio"
                >
                  <Icon name="download" size={15} /> {audioExporting ? 'Exporting…' : 'Download'}
                  <Icon name="expand_more" size={14} />
                </button>
                {audioMenuPos && createPortal(
                  <>
                    <div className="tb-download-backdrop" onClick={() => setAudioMenuPos(null)} aria-hidden="true" />
                    <div
                      className="tb-download-menu"
                      role="menu"
                      style={{ position: 'fixed', top: audioMenuPos.top, right: audioMenuPos.right }}
                    >
                      <p className="tb-download-menu-title">Download as</p>
                      {audioExportFormats.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          role="menuitem"
                          className={`tb-download-item${f.id === audioExportFormatId ? ' active' : ''}`}
                          onClick={() => { setAudioMenuPos(null); onExportAudio(f.id) }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </>,
                  document.body,
                )}
              </div>
            </>
          ) : (
          <>
          <div className="tb-sep" />

          {/* Resolution — always-editable inline inputs, resize on blur/Enter */}
          {/* Accent outline only when value differs from actual image size */}
          <div className="tb-res-edit">
            <input
              className={`tb-res-input${resEditW > 0 && resEditW !== baseW ? ' tb-res-input--dirty' : ''}`}
              type="number"
              value={displayW}
              min={1}
              max={25000}
              title="Width — height follows the original aspect ratio"
              onChange={(e) => setWidthKeepingAspect(Number(e.target.value))}
              onFocus={() => { setResEditW(displayW); setResEditH(displayH) }}
              onBlur={() => { if (resEditW > 0 && resEditH > 0) onResize() }}
              onKeyDown={(e) => { if (e.key === 'Enter') onResize() }}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>×</span>
            <input
              className={`tb-res-input${resEditH > 0 && resEditH !== baseH ? ' tb-res-input--dirty' : ''}`}
              type="number"
              value={displayH}
              min={1}
              max={25000}
              title="Height — width follows the original aspect ratio"
              onChange={(e) => setHeightKeepingAspect(Number(e.target.value))}
              onFocus={() => { setResEditW(displayW); setResEditH(displayH) }}
              onBlur={() => { if (resEditW > 0 && resEditH > 0) onResize() }}
              onKeyDown={(e) => { if (e.key === 'Enter') onResize() }}
            />
          </div>

          <div className="tb-sep" />

          {activePhoto.isVideo ? (
            <select
              className="tb-select"
              value={videoExportFormat}
              onChange={(e) => setVideoExportFormat(e.target.value as VideoExportFormatId)}
              disabled={videoProcessing || busy}
              title="Video export format"
            >
              {videoExportOptions.map((opt) => (
                <option key={opt.id} value={opt.id} disabled={!opt.supported}>
                  {opt.label}{opt.supported ? '' : ' — unavailable'}
                </option>
              ))}
            </select>
          ) : (
            <>
          {/* Format */}
          <select
            className="tb-select"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as NormalizeFormat)}
            title="Export format"
          >
            <option value="image/jpeg">JPG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WebP</option>
            <option value="image/bmp">BMP</option>
            <option value="image/gif">GIF</option>
            <option value="image/tiff">TIFF</option>
            {hasSvgPreview && <option value="image/svg+xml">SVG (vector)</option>}
          </select>

          {/* PNG depth selector — quantization reduces file size at the cost of color precision */}
          {exportFormat === 'image/png' && (
            <select
              className="tb-select"
              value={exportPngDepth}
              onChange={(e) => setExportPngDepth(e.target.value as PngDepth)}
              title="PNG color depth — reducing colors makes the file smaller while keeping lossless encoding"
            >
              <option value="full">32-bit (full)</option>
              <option value="reduced">24-bit (smaller)</option>
              <option value="minimal">16-bit (smallest)</option>
            </select>
          )}

          {/* Quality slider+number — only for lossy formats */}
          {exportFormat !== SVG_FORMAT && !isLosslessFormat(exportFormat) && (
            <div className="tb-quality-wrap">
              <input
                className="tb-quality-slider"
                type="range"
                min={1}
                max={100}
                value={exportQuality}
                onChange={(e) => setExportQuality(Number(e.target.value))}
                title={`Quality: ${exportQuality}%`}
              />
              <input
                className="tb-quality-num"
                type="number"
                min={1}
                max={100}
                value={exportQuality}
                onChange={(e) => setExportQuality(Math.min(100, Math.max(1, Number(e.target.value))))}
                title="Quality (1–100)"
              />
            </div>
          )}

          {/* File size indicator */}
          {previewFileSizeKb !== null && (
            <span className="tb-filesize" title="Estimated export file size">
              ~{previewFileSizeKb} KB
            </span>
          )}
            </>
          )}

          {/* SVG vectorize toggle */}
          {!activePhoto.isVideo && (
            <button
              className={`tb-btn${vectorizePanelOpen ? ' active' : ''}`}
              type="button"
              onClick={onToggleVectorize}
              title="Vectorize image to SVG"
              style={{ fontSize: '0.74rem' }}
            >
              <Icon name="polyline" size={13} /> Vectorize
            </button>
          )}

          {/* Download — anonymized file (local, no server / disk write) */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.3rem', flexShrink: 0, position: 'relative' }}>
            <button
              className="tb-btn"
              style={{ background: '#3b5bdb', borderColor: '#3b5bdb', color: '#fff', fontWeight: 600 }}
              type="button"
              onClick={activePhoto.isVideo
                ? onExportVideo
                : (exportFormat === SVG_FORMAT ? onExportSvg : onExportPhoto)}
              disabled={busy || videoProcessing}
              title="Download anonymized copy"
            >
              <Icon name="download" size={15} /> Download
            </button>
          </div>
          </>
          )}
        </>
      ) : (
        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          {photosCount === 0 ? 'Load photos to get started' : 'Select a photo'}
        </span>
      )}
    </div>
  )
}
