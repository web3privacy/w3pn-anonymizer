import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../components/Icon'
import type { AppMobileBindings } from './bindings'
import { DEFAULT_CUSTOM_IMAGE_PRESET_ID, customImagePresetOptions } from '../lib/custom-image-presets'
import type { CustomImageSource } from '../types'

const PRESET_SOURCES: { id: CustomImageSource; label: string }[] = [
  ...customImagePresetOptions(),
  { id: 'custom', label: 'Custom uploads' },
]

function sourceLabel(source: CustomImageSource): string {
  return PRESET_SOURCES.find((s) => s.id === source)?.label ?? 'Custom uploads'
}

interface MobileCustomImagePickerPanelProps {
  b: AppMobileBindings
}

export function MobileCustomImagePickerPanel({ b }: MobileCustomImagePickerPanelProps) {
  const [sourceMenuOpen, setSourceMenuOpen] = useState(false)
  const bootstrappedRef = useRef(false)

  useEffect(() => {
    if (bootstrappedRef.current || b.customImageAssets.length > 0) return
    bootstrappedRef.current = true
    const source = b.customImageSource === 'custom' ? DEFAULT_CUSTOM_IMAGE_PRESET_ID : b.customImageSource
    void b.loadCustomImagePreset(source)
  }, [b.customImageAssets.length, b.customImageSource, b.loadCustomImagePreset])

  useEffect(() => {
    if (!sourceMenuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSourceMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sourceMenuOpen])

  const pickSource = (id: CustomImageSource) => {
    setSourceMenuOpen(false)
    b.setSelectedEffect('custom-image')
    if (id === 'custom') {
      void b.loadCustomImagePreset('custom')
      b.openCustomImagePicker()
      return
    }
    void b.loadCustomImagePreset(id)
  }

  return (
    <div className="mobile-custom-image-picker">
      <label className="mobile-emoji-random-row">
        <span className="mobile-emoji-random-label">
          <Icon name="shuffle" size={18} />
          <span>Random per face</span>
        </span>
        <span className={`mobile-switch${b.customImageRandom ? ' on' : ''}`}>
          <input
            type="checkbox"
            checked={b.customImageRandom}
            onChange={(e) => b.onToggleCustomRandom(e.target.checked)}
          />
          <span className="mobile-switch-track" />
          <span className="mobile-switch-knob" />
        </span>
      </label>

      <button
        type="button"
        className="mobile-custom-image-source-trigger"
        onClick={() => setSourceMenuOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={sourceMenuOpen}
      >
        <span className="mobile-custom-image-source-trigger-label">Library</span>
        <span className="mobile-custom-image-source-trigger-value">{sourceLabel(b.customImageSource)}</span>
        <Icon name="expand_more" size={20} />
      </button>

      {sourceMenuOpen && createPortal(
        <>
          <div
            className="mobile-custom-image-source-backdrop"
            onClick={() => setSourceMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            className="mobile-custom-image-source-sheet"
            role="listbox"
            aria-label="Image library"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mobile-custom-image-source-sheet-handle" aria-hidden="true" />
            <p className="mobile-custom-image-source-sheet-title">Choose library</p>
            {PRESET_SOURCES.map((s) => {
              const active = b.customImageSource === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`mobile-custom-image-source-option${active ? ' active' : ''}`}
                  onClick={() => pickSource(s.id)}
                >
                  <span>{s.label}</span>
                  {active && <Icon name="check" size={18} />}
                </button>
              )
            })}
            <button
              type="button"
              className="mobile-custom-image-source-option mobile-custom-image-source-upload"
              onClick={() => {
                setSourceMenuOpen(false)
                void b.loadCustomImagePreset('custom')
                b.openCustomImagePicker()
              }}
            >
              <Icon name="upload" size={18} />
              <span>Upload images</span>
            </button>
          </div>
        </>,
        document.body,
      )}

      <div className="mobile-custom-image-grid" role="listbox" aria-label="Choose image">
        {b.customImagePresetLoading ? (
          <div className="mobile-custom-image-loading" aria-busy="true" aria-live="polite">
            <span className="mobile-face-loader mobile-face-loader-lg" aria-hidden="true" />
            <span className="mobile-custom-image-loading-label">Loading library…</span>
          </div>
        ) : b.customImageAssets.length === 0 ? (
          <p className="mobile-custom-image-empty">Pick a library or upload your own images.</p>
        ) : (
          b.customImageAssets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              role="option"
              aria-selected={!b.customImageRandom && b.selectedCustomImageId === asset.id}
              className={`mobile-custom-image-thumb${!b.customImageRandom && b.selectedCustomImageId === asset.id ? ' active' : ''}`}
              onClick={() => b.onPickCustomImage(asset.id)}
            >
              <img src={asset.objectUrl} alt="" draggable={false} />
            </button>
          ))
        )}
      </div>
    </div>
  )
}
