import type { Dispatch, MutableRefObject, SetStateAction } from 'react'
import { Icon } from '../components/Icon'
import { EFFECTS } from '../lib/effects'
import { fmtBytes } from '../lib/media-files'
import {
  COLOR_PRESETS,
  DEFAULT_COLOR_ADJUSTMENTS,
  type BatchTaskId,
  type ColorAdjustments,
  type ColorPresetId,
  type GlitchSubEffect,
  type NormalizedRect,
  type NormalizeCodecEngine,
  type NormalizeCropMode,
  type NormalizeFormat,
  type NormalizeSettings,
  type PhotoItem,
} from '../types'

export interface NormalizeSummary {
  success: number
  failed: number
  canceled: boolean
  inputBytes: number
  outputBytes: number
  elapsedSeconds: number
  overwritten: number
}

export interface NormalizeProgress {
  total: number
  done: number
  currentFile: string
  success: number
  failed: number
  inputBytes: number
  outputBytes: number
  active: boolean
  startedAt: number
  etaSeconds: number
}

export interface EditorBatchPanelProps {
  batchPanelOpen: boolean
  setBatchPanelOpen: Dispatch<SetStateAction<boolean>>
  normalizeSummary: NormalizeSummary | null
  setNormalizeSummary: Dispatch<SetStateAction<NormalizeSummary | null>>
  normalizeProgress: NormalizeProgress
  normalizeProgressPercent: number
  normResultsCount: number
  exportNormalizeZip: () => void
  isExporting: boolean
  normalizePreviewPhotos: PhotoItem[]
  selectPhoto: (id: string) => void
  activeBatchTasks: Set<BatchTaskId>
  expandedBatchTasks: Set<BatchTaskId>
  toggleExpandBatchTask: (taskId: BatchTaskId) => void
  toggleBatchTask: (taskId: BatchTaskId) => void
  normalizeSettings: NormalizeSettings
  updateNormalizeSetting: <K extends keyof NormalizeSettings>(key: K, value: NormalizeSettings[K]) => void
  isNormalizing: boolean
  updateNormalizeCropMode: (mode: NormalizeCropMode) => void
  activePhoto: PhotoItem | null
  setNotice: (message: string) => void
  setIsNormalizeCropPicking: Dispatch<SetStateAction<boolean>>
  setNormalizeCropDraft: Dispatch<SetStateAction<NormalizedRect | null>>
  pointerSessionRef: MutableRefObject<{ mode: string }>
  isNormalizeCropPicking: boolean
  applyTemplateFromCurrentCrop: () => void
  activeNormalizeCrop: NormalizedRect | null
  detectFrameOnActivePhoto: () => void
  isBusy: boolean
  detectContentAwareCropOnActivePhoto: () => void
  colorAdj: ColorAdjustments
  setColorAdj: Dispatch<SetStateAction<ColorAdjustments>>
  setColorPreset: (presetId: ColorPresetId) => void
  applyColorAdjToActive: () => void
}

/** Desktop batch panel — grid col 3: summary, progress, previews, and task cards. */
export function EditorBatchPanel(props: EditorBatchPanelProps) {
  const {
    batchPanelOpen,
    setBatchPanelOpen,
    normalizeSummary,
    setNormalizeSummary,
    normalizeProgress,
    normalizeProgressPercent,
    normResultsCount,
    exportNormalizeZip,
    isExporting,
    normalizePreviewPhotos,
    selectPhoto,
    activeBatchTasks,
    expandedBatchTasks,
    toggleExpandBatchTask,
    toggleBatchTask,
    normalizeSettings,
    updateNormalizeSetting,
    isNormalizing,
    updateNormalizeCropMode,
    activePhoto,
    setNotice,
    setIsNormalizeCropPicking,
    setNormalizeCropDraft,
    pointerSessionRef,
    isNormalizeCropPicking,
    applyTemplateFromCurrentCrop,
    activeNormalizeCrop,
    detectFrameOnActivePhoto,
    isBusy,
    detectContentAwareCropOnActivePhoto,
    colorAdj,
    setColorAdj,
    setColorPreset,
    applyColorAdjToActive,
  } = props

  return (
    <div className="batch-panel" style={{ width: batchPanelOpen ? 280 : 0 }}>
      {batchPanelOpen && (
        <div className="batch-panel-inner">
        <div className="norm-panel-head" style={{ flexShrink: 0 }}>
          <span>Batch tasks</span>
          <button className="icon-btn" type="button" onClick={() => setBatchPanelOpen(false)}><Icon name="close" size={14} /></button>
        </div>
        <div className="norm-panel-body">

          {/* Summary card */}
          {normalizeSummary && !normalizeProgress.active && (
            <div className="summary-card">
              <div className="summary-card-header">
                <span>{normalizeSummary.canceled ? 'Cancelled' : normalizeSummary.failed > 0 ? 'Done (with errors)' : 'Done'}</span>
                <button className="icon-btn" type="button" onClick={() => setNormalizeSummary(null)}>✕</button>
              </div>
              <div className="summary-stats">
                <div className="summary-stat"><span className="summary-stat-value">{normalizeSummary.success}</span><span className="summary-stat-label">done</span></div>
                {normalizeSummary.failed > 0 && <div className="summary-stat summary-stat-warn"><span className="summary-stat-value">{normalizeSummary.failed}</span><span className="summary-stat-label">errors</span></div>}
                <div className="summary-stat"><span className="summary-stat-value">{normalizeSummary.elapsedSeconds < 60 ? `${normalizeSummary.elapsedSeconds}s` : `${Math.floor(normalizeSummary.elapsedSeconds / 60)}m`}</span><span className="summary-stat-label">time</span></div>
              </div>
              {normalizeSummary.inputBytes > 0 && (
                <div className="summary-size-bar">
                  <div className="summary-size-labels"><span>Before: <strong>{fmtBytes(normalizeSummary.inputBytes)}</strong></span><span>After: <strong>{fmtBytes(normalizeSummary.outputBytes)}</strong></span></div>
                  <div className="summary-bar-track"><div className="summary-bar-after" style={{ width: `${Math.min(100, Math.round((normalizeSummary.outputBytes / normalizeSummary.inputBytes) * 100))}%` }} /></div>
                  {normalizeSummary.outputBytes < normalizeSummary.inputBytes
                    ? <div className="summary-saving">Saved <strong>{fmtBytes(normalizeSummary.inputBytes - normalizeSummary.outputBytes)}</strong> ({Math.round((1 - normalizeSummary.outputBytes / normalizeSummary.inputBytes) * 100)}%)</div>
                    : <div className="summary-saving summary-saving-grow">Size grew by {fmtBytes(normalizeSummary.outputBytes - normalizeSummary.inputBytes)}</div>}
                </div>
              )}
              {normResultsCount > 0 && (
                <button className="btn btn-sm" type="button" onClick={exportNormalizeZip} disabled={isExporting} style={{ marginTop: '0.3rem', width: '100%' }}>
                  Download ZIP ({normResultsCount})
                </button>
              )}
            </div>
          )}

          {/* Progress */}
          {normalizeProgress.active && (
            <div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${normalizeProgressPercent}%` }} /></div>
              <div className="meta-row">
                <span>{normalizeProgress.done}/{normalizeProgress.total}</span>
                <span>{normalizeProgress.etaSeconds > 0 ? `ETA ${normalizeProgress.etaSeconds}s` : normalizeProgressPercent + '%'}</span>
              </div>
              {normalizeProgress.currentFile && <div className="meta-file" title={normalizeProgress.currentFile}>{normalizeProgress.currentFile}</div>}
            </div>
          )}

          {/* Recent previews */}
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

          {/* ── Task cards ── */}

          {/* Format task */}
          {(() => {
            const taskId: BatchTaskId = 'format'
            const isActive = activeBatchTasks.has(taskId)
            const isExpanded = expandedBatchTasks.has(taskId)
            return (
              <div className="batch-task-card">
                <div className="batch-task-header" onClick={() => toggleExpandBatchTask(taskId)}>
                  <input type="checkbox" className="batch-task-checkbox" checked={isActive} onChange={(e) => { e.stopPropagation(); toggleBatchTask(taskId) }} onClick={(e) => e.stopPropagation()} />
                  <span className="batch-task-title"><Icon name="image" size={14} /> Format & Quality</span>
                  <span className={`batch-task-chevron${isExpanded ? ' open' : ''}`}><Icon name="expand_more" size={16} /></span>
                </div>
                {isExpanded && isActive && (
                  <div className="batch-task-body">
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
                  </div>
                )}
              </div>
            )
          })()}

          {/* Resize task */}
          {(() => {
            const taskId: BatchTaskId = 'resize'
            const isActive = activeBatchTasks.has(taskId)
            const isExpanded = expandedBatchTasks.has(taskId)
            return (
              <div className="batch-task-card">
                <div className="batch-task-header" onClick={() => toggleExpandBatchTask(taskId)}>
                  <input type="checkbox" className="batch-task-checkbox" checked={isActive} onChange={(e) => { e.stopPropagation(); toggleBatchTask(taskId) }} onClick={(e) => e.stopPropagation()} />
                  <span className="batch-task-title"><Icon name="photo_size_select_large" size={14} /> Resize</span>
                  <span className={`batch-task-chevron${isExpanded ? ' open' : ''}`}><Icon name="expand_more" size={16} /></span>
                </div>
                {isExpanded && isActive && (
                  <div className="batch-task-body">
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
                    {normalizeSettings.resizeAspectCrop && (
                      <div className="two-col">
                        <div><label className="field-label">W ratio</label><input className="field-input" type="number" min={1} max={100} value={normalizeSettings.resizeAspectW} onChange={(e) => updateNormalizeSetting('resizeAspectW', Number(e.target.value))} /></div>
                        <div><label className="field-label">H ratio</label><input className="field-input" type="number" min={1} max={100} value={normalizeSettings.resizeAspectH} onChange={(e) => updateNormalizeSetting('resizeAspectH', Number(e.target.value))} /></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })()}

          {/* Crop task */}
          {(() => {
            const taskId: BatchTaskId = 'crop'
            const isActive = activeBatchTasks.has(taskId)
            const isExpanded = expandedBatchTasks.has(taskId)
            return (
              <div className="batch-task-card">
                <div className="batch-task-header" onClick={() => toggleExpandBatchTask(taskId)}>
                  <input type="checkbox" className="batch-task-checkbox" checked={isActive} onChange={(e) => { e.stopPropagation(); toggleBatchTask(taskId) }} onClick={(e) => e.stopPropagation()} />
                  <span className="batch-task-title"><Icon name="crop" size={14} /> Crop</span>
                  <span className={`batch-task-chevron${isExpanded ? ' open' : ''}`}><Icon name="expand_more" size={16} /></span>
                </div>
                {isExpanded && isActive && (
                  <div className="batch-task-body">
                    <select className="field-select" value={normalizeSettings.cropMode} onChange={(e) => updateNormalizeCropMode(e.target.value as NormalizeCropMode)} disabled={isNormalizing}>
                      <option value="none">No crop</option>
                      <option value="uniform-percent">Uniform %</option>
                      <option value="sides-percent">% per side</option>
                      <option value="sides-px">Pixels per side</option>
                      <option value="template">Mouse template</option>
                    </select>
                    {normalizeSettings.cropMode === 'uniform-percent' && (
                      <div>
                        <span className="field-label">Crop: {normalizeSettings.cropUniformPercent.toFixed(1)}%</span>
                        <input className="field-range" type="range" min={0} max={49} step={0.1} value={normalizeSettings.cropUniformPercent} onChange={(e) => updateNormalizeSetting('cropUniformPercent', Number(e.target.value))} />
                      </div>
                    )}
                    {normalizeSettings.cropMode === 'sides-percent' && (
                      <div className="two-col">
                        {(['Left', 'Right', 'Top', 'Bottom'] as const).map((side) => (
                          <div key={side}>
                            <label className="field-label">{side} %</label>
                            <input className="field-input" type="number" min={0} max={99} step={0.1} value={normalizeSettings[`cropPercent${side}` as keyof NormalizeSettings] as number} onChange={(e) => updateNormalizeSetting(`cropPercent${side}` as keyof NormalizeSettings, Number(e.target.value) as never)} />
                          </div>
                        ))}
                      </div>
                    )}
                    {normalizeSettings.cropMode === 'sides-px' && (
                      <div className="two-col">
                        {(['Left', 'Right', 'Top', 'Bottom'] as const).map((side) => (
                          <div key={side}>
                            <label className="field-label">{side} px</label>
                            <input className="field-input" type="number" min={0} step={1} value={normalizeSettings[`cropPixels${side}` as keyof NormalizeSettings] as number} onChange={(e) => updateNormalizeSetting(`cropPixels${side}` as keyof NormalizeSettings, Number(e.target.value) as never)} />
                          </div>
                        ))}
                      </div>
                    )}
                    {normalizeSettings.cropMode === 'template' && (
                      <div className="crop-box">
                        <button className="btn btn-sm" type="button" onClick={() => { if (!activePhoto) { setNotice('Select a photo first.'); return } setIsNormalizeCropPicking((v) => !v); setNormalizeCropDraft(null); pointerSessionRef.current = { mode: 'idle' } }} disabled={isNormalizing}>
                          {isNormalizeCropPicking ? 'Cancel' : 'Draw with mouse'}
                        </button>
                        <div className="btn-row">
                          <button className="btn btn-sm" type="button" onClick={applyTemplateFromCurrentCrop} disabled={isNormalizing || !activeNormalizeCrop}>From preview</button>
                          <button className="btn btn-sm" type="button" onClick={detectFrameOnActivePhoto} disabled={isBusy || isNormalizing}>Auto frame</button>
                          <button className="btn btn-sm" type="button" onClick={detectContentAwareCropOnActivePhoto} disabled={isBusy || isNormalizing}>Smart crop</button>
                        </div>
                        {normalizeSettings.templateCropNormalized && (
                          <p className="tiny-note">x {Math.round(normalizeSettings.templateCropNormalized.x * 100)}% y {Math.round(normalizeSettings.templateCropNormalized.y * 100)}% w {Math.round(normalizeSettings.templateCropNormalized.width * 100)}% h {Math.round(normalizeSettings.templateCropNormalized.height * 100)}%</p>
                        )}
                        <button className="btn btn-sm" type="button" onClick={() => { updateNormalizeSetting('templateCropNormalized', null); setNormalizeCropDraft(null); setIsNormalizeCropPicking(false) }} disabled={isNormalizing}>Reset template</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })()}

          {/* Colors task */}
          {(() => {
            const taskId: BatchTaskId = 'colors'
            const isActive = activeBatchTasks.has(taskId)
            const isExpanded = expandedBatchTasks.has(taskId)
            return (
              <div className="batch-task-card">
                <div className="batch-task-header" onClick={() => toggleExpandBatchTask(taskId)}>
                  <input type="checkbox" className="batch-task-checkbox" checked={isActive} onChange={(e) => { e.stopPropagation(); toggleBatchTask(taskId) }} onClick={(e) => e.stopPropagation()} />
                  <span className="batch-task-title"><Icon name="palette" size={14} /> Adjust colors</span>
                  <span className={`batch-task-chevron${isExpanded ? ' open' : ''}`}><Icon name="expand_more" size={16} /></span>
                </div>
                {isExpanded && isActive && (
                  <div className="batch-task-body">
                    <div className="color-presets">
                      {COLOR_PRESETS.filter((p) => !['faded', 'newspaper', '4-colors'].includes(p.id)).map((p) => (
                        <button key={p.id} type="button" className={`color-preset-btn${colorAdj.preset === p.id ? ' active' : ''}`} onClick={() => setColorPreset(p.id)}>{p.label}</button>
                      ))}
                    </div>
                    <div className="color-sliders">
                      {([['brightness', 'Brightness'], ['contrast', 'Contrast'], ['saturation', 'Saturation'], ['shadows', 'Shadows'], ['highlights', 'Highlights']] as [keyof ColorAdjustments, string][]).map(([key, label]) => (
                        <div key={key} className="color-slider-row">
                          <span className="color-slider-label">{label}</span>
                          <input type="range" className="color-slider-input" min={-100} max={100} value={colorAdj[key] as number} onChange={(e) => setColorAdj((cur) => ({ ...cur, [key]: Number(e.target.value), preset: 'none' }))} />
                          <span className="color-slider-val">{(colorAdj[key] as number) > 0 ? '+' : ''}{colorAdj[key]}</span>
                        </div>
                      ))}
                    </div>
                    <div className="color-actions">
                      <button className="btn btn-sm btn-primary" type="button" onClick={applyColorAdjToActive} disabled={!activePhoto}>Apply to photo</button>
                      <button className="btn btn-sm" type="button" onClick={() => setColorAdj(DEFAULT_COLOR_ADJUSTMENTS)}>Reset</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })()}

          {/* Glitch & Transform task */}
          {(() => {
            const taskId: BatchTaskId = 'glitch'
            const isActive = activeBatchTasks.has(taskId)
            const isExpanded = expandedBatchTasks.has(taskId)
            return (
              <div className="batch-task-card">
                <div className="batch-task-header" onClick={() => toggleExpandBatchTask(taskId)}>
                  <input type="checkbox" className="batch-task-checkbox" checked={isActive} onChange={(e) => { e.stopPropagation(); toggleBatchTask(taskId) }} onClick={(e) => e.stopPropagation()} />
                  <span className="batch-task-title"><Icon name="auto_fix_high" size={14} /> Glitch & Transform</span>
                  <span className={`batch-task-chevron${isExpanded ? ' open' : ''}`}><Icon name="expand_more" size={16} /></span>
                </div>
                {isExpanded && isActive && (
                  <div className="batch-task-body">
                    <div>
                      <label className="field-label">Effect type</label>
                      <select className="field-select" value={normalizeSettings.glitchSubEffect} onChange={(e) => updateNormalizeSetting('glitchSubEffect', e.target.value as GlitchSubEffect)}>
                        <option value="halftone">Halftone</option>
                        <option value="pixel-shift">Pixel shift</option>
                        <option value="color-shift">Color shift</option>
                        <option value="glitch">Glitch (RGB)</option>
                      </select>
                    </div>
                    {(normalizeSettings.glitchSubEffect === 'glitch') && (
                      <div>
                        <span className="field-label">Amount: {normalizeSettings.glitchAmount}</span>
                        <input type="range" className="field-range" min={1} max={100} value={normalizeSettings.glitchAmount} onChange={(e) => updateNormalizeSetting('glitchAmount', Number(e.target.value))} />
                        <span className="field-label">Seed: {normalizeSettings.glitchSeed}</span>
                        <input type="range" className="field-range" min={1} max={200} value={normalizeSettings.glitchSeed} onChange={(e) => updateNormalizeSetting('glitchSeed', Number(e.target.value))} />
                      </div>
                    )}
                    {normalizeSettings.glitchSubEffect === 'halftone' && (
                      <div>
                        <span className="field-label">Dot size: {normalizeSettings.halftoneDotSize}px</span>
                        <input type="range" className="field-range" min={2} max={20} value={normalizeSettings.halftoneDotSize} onChange={(e) => updateNormalizeSetting('halftoneDotSize', Number(e.target.value))} />
                        <label className="field-label">Shape</label>
                        <select className="field-select" value={normalizeSettings.halftoneShape} onChange={(e) => updateNormalizeSetting('halftoneShape', e.target.value as NormalizeSettings['halftoneShape'])}>
                          <option value="circle">Circle</option>
                          <option value="square">Square</option>
                          <option value="triangle">Triangle</option>
                        </select>
                      </div>
                    )}
                    {(normalizeSettings.glitchSubEffect === 'pixel-shift' || normalizeSettings.glitchSubEffect === 'color-shift') && (
                      <div>
                        <span className="field-label">Intensity: {normalizeSettings.glitchAmount}</span>
                        <input type="range" className="field-range" min={1} max={60} value={normalizeSettings.glitchAmount} onChange={(e) => updateNormalizeSetting('glitchAmount', Number(e.target.value))} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })()}

          {/* Anonymize batch task */}
          {(() => {
            const taskId: BatchTaskId = 'anonymize'
            const isActive = activeBatchTasks.has(taskId)
            const isExpanded = expandedBatchTasks.has(taskId)
            return (
              <div className="batch-task-card">
                <div className="batch-task-header" onClick={() => toggleExpandBatchTask(taskId)}>
                  <input type="checkbox" className="batch-task-checkbox" checked={isActive} onChange={(e) => { e.stopPropagation(); toggleBatchTask(taskId) }} onClick={(e) => e.stopPropagation()} />
                  <span className="batch-task-title"><Icon name="face_retouching_natural" size={14} /> Auto-Anonymize</span>
                  <span className={`batch-task-chevron${isExpanded ? ' open' : ''}`}><Icon name="expand_more" size={16} /></span>
                </div>
                {isExpanded && isActive && (
                  <div className="batch-task-body">
                    <div>
                      <label className="field-label">Effect</label>
                      <select className="field-select" value={normalizeSettings.batchAnonymizeEffect} onChange={(e) => updateNormalizeSetting('batchAnonymizeEffect', e.target.value)} disabled={isNormalizing}>
                        {EFFECTS.map((ef) => (
                          <option key={ef.id} value={ef.id}>{ef.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="field-label">Strength: {normalizeSettings.batchAnonymizeStrength}%</span>
                      <div className="tb-quality-wrap" style={{ marginTop: '0.25rem' }}>
                        <input className="tb-quality-slider" type="range" min={10} max={100} value={normalizeSettings.batchAnonymizeStrength} onChange={(e) => updateNormalizeSetting('batchAnonymizeStrength', Number(e.target.value))} disabled={isNormalizing} />
                        <input className="tb-quality-num" type="number" min={10} max={100} value={normalizeSettings.batchAnonymizeStrength} onChange={(e) => updateNormalizeSetting('batchAnonymizeStrength', Math.min(100, Math.max(10, Number(e.target.value))))} disabled={isNormalizing} />
                      </div>
                    </div>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                      Detects faces automatically and applies the selected effect to all found zones.
                    </p>
                  </div>
                )}
              </div>
            )
          })()}

        </div>
        </div>
      )}
    </div>
  )
}
