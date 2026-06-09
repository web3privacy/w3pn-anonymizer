import { Icon } from '../components/Icon'
import { VECTORIZE_PRESETS, type VectorizePreset } from '../lib/vectorize'
import type { AppMobileBindings } from './bindings'

interface MobileVectorizePanelProps {
  b: AppMobileBindings
}

export function MobileVectorizePanel({ b }: MobileVectorizePanelProps) {
  const params = b.vectorizeParams

  const setPreset = (preset: VectorizePreset) => {
    b.setVectorizeParams({ ...params, preset })
  }

  return (
    <div className="mobile-vectorize-panel">
      <p className="mobile-vectorize-hint">
        Traces the photo to SVG locally. Adjust settings below; preview updates on the canvas.
      </p>

      <label className="mobile-vectorize-field-label" htmlFor="mobile-vectorize-preset">Preset</label>
      <select
        id="mobile-vectorize-preset"
        className="mobile-vectorize-select"
        value={params.preset}
        onChange={(e) => setPreset(e.target.value as VectorizePreset)}
      >
        {VECTORIZE_PRESETS.map((p) => (
          <option key={p.id} value={p.id} title={p.desc}>{p.label}</option>
        ))}
      </select>

      {params.preset === 'default' && (
        <>
          <div className="mobile-slider-row-v2">
            <span className="mobile-slider-row-v2-label">Colors</span>
            <input
              type="range"
              min={2}
              max={64}
              value={params.colorCount}
              onChange={(e) => b.updateVectorizeParam('colorCount', Number(e.target.value))}
            />
            <span className="mobile-slider-row-v2-val">{params.colorCount}</span>
          </div>

          <div className="mobile-slider-row-v2">
            <span className="mobile-slider-row-v2-label">Smooth</span>
            <input
              type="range"
              min={0.5}
              max={10}
              step={0.5}
              value={params.minPathLength}
              onChange={(e) => b.updateVectorizeParam('minPathLength', Number(e.target.value))}
            />
            <span className="mobile-slider-row-v2-val">{params.minPathLength.toFixed(1)}</span>
          </div>

          <div className="mobile-slider-row-v2">
            <span className="mobile-slider-row-v2-label">Corners</span>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={params.cornerThreshold}
              onChange={(e) => b.updateVectorizeParam('cornerThreshold', Number(e.target.value))}
            />
            <span className="mobile-slider-row-v2-val">{params.cornerThreshold.toFixed(1)}</span>
          </div>
        </>
      )}

      {b.vectorizing && (
        <div className="mobile-vectorize-progress" aria-live="polite">
          <span className="mobile-vectorize-progress-label">Tracing…</span>
          <div className="mobile-vectorize-progress-bar" />
        </div>
      )}

      {b.svgPreviewSize != null && !b.vectorizing && (
        <p className="mobile-vectorize-size">Preview ~{Math.round(b.svgPreviewSize / 1024)} KB</p>
      )}

      <button
        type="button"
        className="mobile-distort-apply-btn mobile-vectorize-download"
        onClick={() => { void b.exportAsSvg() }}
        disabled={b.isBusy || b.vectorizing}
      >
        <Icon name="download" size={16} />
        DOWNLOAD SVG
      </button>
    </div>
  )
}
