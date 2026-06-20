import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './Icon'
import { DEFAULT_CUSTOM_IMAGE_PRESET_ID, customImagePresetOptions } from '../lib/custom-image-presets'
import type { CustomImageAsset, CustomImageSource } from '../types'

const PRESET_SOURCES: { id: CustomImageSource; label: string }[] = [
  ...customImagePresetOptions(),
  { id: 'custom', label: 'Custom uploads' },
]

function sourceLabel(source: CustomImageSource): string {
  return PRESET_SOURCES.find((s) => s.id === source)?.label ?? 'Custom uploads'
}

export interface CustomImagePickerPanelProps {
  customImageRandom: boolean
  customImageSource: CustomImageSource
  customImageAssets: CustomImageAsset[]
  selectedCustomImageId: string | null
  loading?: boolean
  onToggleRandom: (random: boolean) => void
  onPickImage: (assetId: string) => void
  onSelectSource: (source: CustomImageSource) => void
  onUpload: () => void
  /** Bottom sheet on mobile; compact dropdown anchored to the library row on desktop. */
  sourceMenuVariant?: 'sheet' | 'dropdown'
}

export function CustomImagePickerPanel({
  customImageRandom,
  customImageSource,
  customImageAssets,
  selectedCustomImageId,
  loading = false,
  onToggleRandom,
  onPickImage,
  onSelectSource,
  onUpload,
  sourceMenuVariant = 'sheet',
}: CustomImagePickerPanelProps) {
  const [sourceMenuOpen, setSourceMenuOpen] = useState(false)
  const bootstrappedRef = useRef(false)

  useEffect(() => {
    if (bootstrappedRef.current || customImageAssets.length > 0) return
    bootstrappedRef.current = true
    const source = customImageSource === 'custom' ? DEFAULT_CUSTOM_IMAGE_PRESET_ID : customImageSource
    onSelectSource(source)
  }, [customImageAssets.length, customImageSource, onSelectSource])

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
    if (id === 'custom') {
      onSelectSource('custom')
      onUpload()
      return
    }
    onSelectSource(id)
  }

  const sourceMenu = sourceMenuOpen ? (
    <>
      <div
        className={`mobile-custom-image-source-backdrop${sourceMenuVariant === 'dropdown' ? ' mobile-custom-image-source-backdrop--dropdown' : ''}`}
        onClick={() => setSourceMenuOpen(false)}
        aria-hidden="true"
      />
      <div
        className={`mobile-custom-image-source-sheet${sourceMenuVariant === 'dropdown' ? ' mobile-custom-image-source-sheet--dropdown' : ''}`}
        role="listbox"
        aria-label="Image library"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {sourceMenuVariant === 'sheet' && (
          <div className="mobile-custom-image-source-sheet-handle" aria-hidden="true" />
        )}
        <p className="mobile-custom-image-source-sheet-title">Choose library</p>
        {PRESET_SOURCES.map((s) => {
          const active = customImageSource === s.id
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
            onSelectSource('custom')
            onUpload()
          }}
        >
          <Icon name="upload" size={18} />
          <span>Upload images</span>
        </button>
      </div>
    </>
  ) : null

  return (
    <div className="mobile-custom-image-picker">
      <label className="mobile-emoji-random-row">
        <span className="mobile-emoji-random-label">
          <Icon name="shuffle" size={18} />
          <span>Random per face</span>
        </span>
        <span className={`mobile-switch${customImageRandom ? ' on' : ''}`}>
          <input
            type="checkbox"
            checked={customImageRandom}
            onChange={(e) => onToggleRandom(e.target.checked)}
          />
          <span className="mobile-switch-track" />
          <span className="mobile-switch-knob" />
        </span>
      </label>

      <div className="mobile-custom-image-source-wrap">
        <button
          type="button"
          className="mobile-custom-image-source-trigger"
          onClick={() => setSourceMenuOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={sourceMenuOpen}
        >
          <span className="mobile-custom-image-source-trigger-label">Library</span>
          <span className="mobile-custom-image-source-trigger-value">{sourceLabel(customImageSource)}</span>
          <Icon name="expand_more" size={20} />
        </button>
        {sourceMenu && (sourceMenuVariant === 'dropdown'
          ? sourceMenu
          : createPortal(sourceMenu, document.body))}
      </div>

      <div
        className="mobile-custom-image-grid"
        role="listbox"
        aria-label="Choose image"
        onWheel={(event) => {
          const grid = event.currentTarget
          if (grid.scrollWidth <= grid.clientWidth) return
          const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
          if (delta === 0) return
          grid.scrollLeft += delta
          event.preventDefault()
        }}
      >
        {loading ? (
          <div className="mobile-custom-image-loading" aria-busy="true" aria-live="polite">
            <span className="mobile-face-loader mobile-face-loader-lg" aria-hidden="true" />
            <span className="mobile-custom-image-loading-label">Loading library…</span>
          </div>
        ) : customImageAssets.length === 0 ? (
          <p className="mobile-custom-image-empty">Pick a library or upload your own images.</p>
        ) : (
          customImageAssets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              role="option"
              aria-selected={!customImageRandom && selectedCustomImageId === asset.id}
              className={`mobile-custom-image-thumb${!customImageRandom && selectedCustomImageId === asset.id ? ' active' : ''}`}
              onClick={() => onPickImage(asset.id)}
            >
              <img src={asset.objectUrl} alt="" draggable={false} />
            </button>
          ))
        )}
      </div>
    </div>
  )
}
