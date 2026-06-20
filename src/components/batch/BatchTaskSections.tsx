import { Icon } from '../Icon'
import { EFFECTS, getDefaultEffectStrength, mapPixelateBlockSize, pixelateStrengthForBlockSize } from '../../lib/effects'
import type {
  AnonymizeEffectId,
  BatchTaskId,
  ColorAdjustments,
  ColorPresetId,
  GlitchSubEffect,
  NormalizeCodecEngine,
  NormalizeFormat,
  NormalizeSettings,
  PhotoItem,
} from '../../types'
import { DEFAULT_COLOR_ADJUSTMENTS } from '../../types'
import type { MobileBatchState } from '../../mobile/bindings'

export interface BatchTaskSectionsProps {
  batch: MobileBatchState
  toggleBatchTask: (id: BatchTaskId) => void
  toggleExpandBatchTask: (id: BatchTaskId) => void
  updateNormalizeSetting: <K extends keyof NormalizeSettings>(key: K, value: NormalizeSettings[K]) => void
  setNormalizeSummary: (v: MobileBatchState['normalizeSummary']) => void
  exportNormalizeZip: () => void
  selectPhoto: (id: string) => void
  colorAdj: ColorAdjustments
  setColorPreset: (id: ColorPresetId) => void
  setColorAdj: React.Dispatch<React.SetStateAction<ColorAdjustments>>
  applyColorAdjToActive: () => void
  activePhoto: PhotoItem | null
  setNotice: (msg: string) => void
  setIsNormalizeCropPicking: React.Dispatch<React.SetStateAction<boolean>>
  setNormalizeCropDraft: React.Dispatch<React.SetStateAction<import('../../types').NormalizedRect | null>>
  isNormalizeCropPicking: boolean
  activeNormalizeCrop: import('../../types').NormalizedRect | null
  applyTemplateFromCurrentCrop: () => void
  detectFrameOnActivePhoto: () => void
  detectContentAwareCropOnActivePhoto: () => void
  pointerSessionRef: React.MutableRefObject<{ mode: string }>
  isBusy: boolean
  fmtBytes: (b: number) => string
}

export function BatchTaskSections(props: BatchTaskSectionsProps) {
  const {
    batch,
    toggleBatchTask,
    toggleExpandBatchTask,
    updateNormalizeSetting,
    setNormalizeSummary,
    exportNormalizeZip,
    selectPhoto,
    colorAdj,
    setColorAdj,
    applyColorAdjToActive,
    activePhoto,
    setNotice,
    setIsNormalizeCropPicking,
    setNormalizeCropDraft,
    isNormalizeCropPicking,
    activeNormalizeCrop,
    applyTemplateFromCurrentCrop,
    detectFrameOnActivePhoto,
    pointerSessionRef,
    isBusy,
  } = props

  const {
    activeBatchTasks,
    expandedBatchTasks,
    normalizeSettings,
    normalizeProgress,
    normalizeProgressPercent,
    normalizeSummary,
    normalizePreviewPhotos,
    normResultsCount,
    isNormalizing,
    isExporting,
  } = batch

  const renderTask = (
    taskId: BatchTaskId,
    title: string,
    icon: string,
    body: React.ReactNode,
  ) => {
    const isActive = activeBatchTasks.has(taskId)
    const isExpanded = expandedBatchTasks.has(taskId)
    return (
      <div className="batch-task-card" key={taskId}>
        <div className="batch-task-header" onClick={() => toggleExpandBatchTask(taskId)}>
          <input
            type="checkbox"
            className="batch-task-checkbox"
            checked={isActive}
            onChange={(e) => { e.stopPropagation(); toggleBatchTask(taskId) }}
            onClick={(e) => e.stopPropagation()}
          />
          <span className="batch-task-title"><Icon name={icon} size={14} /> {title}</span>
          <span className={`batch-task-chevron${isExpanded ? ' open' : ''}`}><Icon name="expand_more" size={16} /></span>
        </div>
        {isExpanded && <div className={`batch-task-body${isActive ? '' : ' inactive'}`}>{body}</div>}
      </div>
    )
  }

  return (
    <>
      {normalizeSummary && !normalizeProgress.active && (
        <div className="summary-card">
          <div className="summary-card-header">
            <span>{normalizeSummary.canceled ? 'Cancelled' : normalizeSummary.failed > 0 ? 'Done (with errors)' : 'Done'}</span>
            <button className="icon-btn" type="button" onClick={() => setNormalizeSummary(null)}>✕</button>
          </div>
          <div className="summary-stats">
            <div className="summary-stat"><span className="summary-stat-value">{normalizeSummary.success}</span><span className="summary-stat-label">done</span></div>
            {normalizeSummary.failed > 0 && (
              <div className="summary-stat summary-stat-warn">
                <span className="summary-stat-value">{normalizeSummary.failed}</span>
                <span className="summary-stat-label">errors</span>
              </div>
            )}
          </div>
          {normResultsCount > 0 && (
            <button className="btn btn-sm" type="button" onClick={exportNormalizeZip} disabled={isExporting} style={{ marginTop: '0.3rem', width: '100%' }}>
              Download ZIP ({normResultsCount})
            </button>
          )}
        </div>
      )}

      {normalizeProgress.active && (
        <div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${normalizeProgressPercent}%` }} /></div>
          <div className="meta-row">
            <span>{normalizeProgress.done}/{normalizeProgress.total}</span>
            <span>{normalizeProgress.etaSeconds > 0 ? `ETA ${normalizeProgress.etaSeconds}s` : `${normalizeProgressPercent}%`}</span>
          </div>
          {normalizeProgress.currentFile && (
            <div className="meta-file" title={normalizeProgress.currentFile}>{normalizeProgress.currentFile}</div>
          )}
        </div>
      )}

      {normalizePreviewPhotos.length > 0 && (
        <div>
          <div className="section-label">Recent results</div>
          <div className="norm-preview-grid">
            {normalizePreviewPhotos.map((p) => (
              <button key={p.id} type="button" className="norm-preview-thumb" onClick={() => selectPhoto(p.id)}>
                <img src={p.previewUrl} alt={p.name} loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      )}

      {renderTask('format', 'Format & Quality', 'image', (
        <>
          <div>
            <label className="field-label">Output format</label>
            <select className="field-select" value={normalizeSettings.outputFormat} onChange={(e) => updateNormalizeSetting('outputFormat', e.target.value as NormalizeFormat)} disabled={isNormalizing}>
              <option value="image/jpeg">JPG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WebP</option>
              <option value="image/bmp">BMP</option>
              <option value="image/gif">GIF</option>
              <option value="image/tiff">TIFF</option>
            </select>
          </div>
          {(normalizeSettings.outputFormat === 'image/jpeg' || normalizeSettings.outputFormat === 'image/webp') && (
            <div>
              <span className="field-label">Quality</span>
              <div className="tb-quality-wrap" style={{ marginTop: '0.25rem' }}>
                <input className="tb-quality-slider" type="range" min={25} max={100} value={normalizeSettings.quality} onChange={(e) => updateNormalizeSetting('quality', Number(e.target.value))} disabled={isNormalizing} />
                <input className="tb-quality-num" type="number" min={25} max={100} value={normalizeSettings.quality} onChange={(e) => updateNormalizeSetting('quality', Math.min(100, Math.max(25, Number(e.target.value))))} disabled={isNormalizing} />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>%</span>
              </div>
            </div>
          )}
          <div className="two-col">
            <div>
              <label className="field-label">Codec</label>
              <select className="field-select" value={normalizeSettings.codecEngine} onChange={(e) => updateNormalizeSetting('codecEngine', e.target.value as NormalizeCodecEngine)} disabled={isNormalizing}>
                <option value="canvas">Canvas</option>
                <option value="worker-codec">Worker</option>
              </select>
            </div>
            <div>
              <label className="field-label">Workers</label>
              <input className="field-input" type="number" min={1} max={8} value={normalizeSettings.batchConcurrency} onChange={(e) => updateNormalizeSetting('batchConcurrency', Number(e.target.value))} disabled={isNormalizing} />
            </div>
          </div>
          <label className="checkbox-row">
            <input type="checkbox" checked={normalizeSettings.overwriteOriginals} onChange={(e) => updateNormalizeSetting('overwriteOriginals', e.target.checked)} disabled={isNormalizing} />
            Overwrite originals
          </label>
        </>
      ))}

      {renderTask('resize', 'Resize', 'photo_size_select_large', (
        <>
          <select className="field-select" value={normalizeSettings.resizeMode} onChange={(e) => updateNormalizeSetting('resizeMode', e.target.value as NormalizeSettings['resizeMode'])} disabled={isNormalizing}>
            <option value="keep">Keep original</option>
            <option value="max-bound">Max W / H</option>
            <option value="exact">Exact size</option>
          </select>
          {normalizeSettings.resizeMode === 'max-bound' && (
            <div className="two-col">
              <div><label className="field-label">Max W</label><input className="field-input" type="number" min={1} max={25000} value={normalizeSettings.maxWidth} onChange={(e) => updateNormalizeSetting('maxWidth', Number(e.target.value))} disabled={isNormalizing} /></div>
              <div><label className="field-label">Max H</label><input className="field-input" type="number" min={1} max={25000} value={normalizeSettings.maxHeight} onChange={(e) => updateNormalizeSetting('maxHeight', Number(e.target.value))} disabled={isNormalizing} /></div>
            </div>
          )}
          {normalizeSettings.resizeMode === 'exact' && (
            <div className="two-col">
              <div><label className="field-label">W</label><input className="field-input" type="number" min={1} max={25000} value={normalizeSettings.targetWidth} onChange={(e) => updateNormalizeSetting('targetWidth', Number(e.target.value))} disabled={isNormalizing} /></div>
              <div><label className="field-label">H</label><input className="field-input" type="number" min={1} max={25000} value={normalizeSettings.targetHeight} onChange={(e) => updateNormalizeSetting('targetHeight', Number(e.target.value))} disabled={isNormalizing} /></div>
            </div>
          )}
          <label className="checkbox-row">
            <input type="checkbox" checked={normalizeSettings.resizeAspectCrop} onChange={(e) => updateNormalizeSetting('resizeAspectCrop', e.target.checked)} />
            Auto-crop to aspect ratio
          </label>
        </>
      ))}

      {renderTask('crop', 'Crop', 'crop', (
        <>
          <select className="field-select" value={normalizeSettings.cropMode} onChange={(e) => updateNormalizeSetting('cropMode', e.target.value as NormalizeSettings['cropMode'])} disabled={isNormalizing}>
            <option value="none">None</option>
            <option value="uniform-percent">Uniform %</option>
            <option value="sides-percent">Sides %</option>
            <option value="sides-px">Sides px</option>
            <option value="template">Template</option>
          </select>
          {normalizeSettings.cropMode === 'template' && (
            <div className="crop-box">
              <button className="btn btn-sm" type="button" onClick={() => {
                if (!activePhoto) { setNotice('Select a photo first.'); return }
                setIsNormalizeCropPicking((v) => !v)
                setNormalizeCropDraft(null)
                pointerSessionRef.current = { mode: 'idle' }
              }} disabled={isNormalizing}>
                {isNormalizeCropPicking ? 'Cancel' : 'Draw crop'}
              </button>
              <div className="btn-row">
                <button className="btn btn-sm" type="button" onClick={applyTemplateFromCurrentCrop} disabled={isNormalizing || !activeNormalizeCrop}>From preview</button>
                <button className="btn btn-sm" type="button" onClick={detectFrameOnActivePhoto} disabled={isBusy || isNormalizing}>Auto frame</button>
              </div>
            </div>
          )}
        </>
      ))}

      {renderTask('colors', 'Adjust colors', 'palette', (
        <>
          <div className="color-sliders">
            {([['brightness', 'Brightness'], ['contrast', 'Contrast'], ['saturation', 'Saturation']] as const).map(([key, label]) => (
              <div key={key} className="color-slider-row">
                <span className="color-slider-label">{label}</span>
                <input type="range" className="color-slider-input" min={-100} max={100} value={colorAdj[key]} onChange={(e) => setColorAdj((cur) => ({ ...cur, [key]: Number(e.target.value), preset: 'none' }))} />
                <span className="color-slider-val">{colorAdj[key] > 0 ? '+' : ''}{colorAdj[key]}</span>
              </div>
            ))}
          </div>
          <div className="color-actions">
            <button className="btn btn-sm btn-primary" type="button" onClick={applyColorAdjToActive} disabled={!activePhoto}>Apply to photo</button>
            <button className="btn btn-sm" type="button" onClick={() => setColorAdj(DEFAULT_COLOR_ADJUSTMENTS)}>Reset</button>
          </div>
        </>
      ))}

      {renderTask('glitch', 'Glitch & Transform', 'auto_fix_high', (
        <>
          <div>
            <label className="field-label">Effect type</label>
            <select className="field-select" value={normalizeSettings.glitchSubEffect} onChange={(e) => updateNormalizeSetting('glitchSubEffect', e.target.value as GlitchSubEffect)}>
              <option value="halftone">Halftone</option>
              <option value="pixel-shift">Pixel shift</option>
              <option value="color-shift">Color shift</option>
              <option value="glitch">Glitch (RGB)</option>
            </select>
          </div>
          <div>
            <span className="field-label">Intensity: {normalizeSettings.glitchAmount}</span>
            <input type="range" className="field-range" min={1} max={100} value={normalizeSettings.glitchAmount} onChange={(e) => updateNormalizeSetting('glitchAmount', Number(e.target.value))} />
          </div>
        </>
      ))}

      {renderTask('anonymize', 'Auto-Anonymize', 'face_retouching_natural', (
        <>
          <div>
            <label className="field-label">Effect</label>
            <select className="field-select" value={normalizeSettings.batchAnonymizeEffect} onChange={(e) => {
              const effect = e.target.value as AnonymizeEffectId
              updateNormalizeSetting('batchAnonymizeEffect', effect)
              updateNormalizeSetting('batchAnonymizeStrength', Math.round(getDefaultEffectStrength(effect) * 100))
            }} disabled={isNormalizing}>
              {EFFECTS.map((ef) => (
                <option key={ef.id} value={ef.id}>{ef.label}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="field-label">Strength: {normalizeSettings.batchAnonymizeEffect === 'pixelate' ? `${mapPixelateBlockSize(normalizeSettings.batchAnonymizeStrength / 100)} px` : `${normalizeSettings.batchAnonymizeStrength}%`}</span>
            <input type="range" className="field-range" min={normalizeSettings.batchAnonymizeEffect === 'pixelate' ? 4 : 10} max={normalizeSettings.batchAnonymizeEffect === 'pixelate' ? 52 : 100} value={normalizeSettings.batchAnonymizeEffect === 'pixelate' ? mapPixelateBlockSize(normalizeSettings.batchAnonymizeStrength / 100) : normalizeSettings.batchAnonymizeStrength} onChange={(e) => updateNormalizeSetting('batchAnonymizeStrength', normalizeSettings.batchAnonymizeEffect === 'pixelate' ? Math.round(pixelateStrengthForBlockSize(Number(e.target.value)) * 100) : Number(e.target.value))} disabled={isNormalizing} />
          </div>
        </>
      ))}
    </>
  )
}
