import { createPortal } from 'react-dom'
import { Icon } from './Icon'
import { EMOJI_POOL } from '../lib/effects'
import type { CustomImageAsset, CustomImageSource } from '../types'

const CUSTOM_IMAGE_SOURCES: { id: CustomImageSource; label: string }[] = [
  { id: 'custom', label: 'Custom' },
  { id: 'ui-faces-human', label: 'UI Faces' },
  { id: 'ui-faces-abstract', label: 'Abstract' },
  { id: 'cryptopunks', label: 'CryptoPunks' },
  { id: 'aavegotchi', label: 'Aavegotchi' },
  { id: 'celebrities', label: 'Celebrities' },
]

export interface EffectPickerDialogProps {
  open: boolean
  kind: 'emoji' | 'custom-image' | null
  onClose: () => void
  // Emoji
  emojiRandom: boolean
  selectedEmoji: string | null
  onToggleEmojiRandom: (random: boolean) => void
  onPickEmoji: (emoji: string) => void
  // Custom image
  customImageRandom: boolean
  customImageSource: CustomImageSource
  customImageAssets: CustomImageAsset[]
  selectedCustomImageId: string | null
  onToggleCustomRandom: (random: boolean) => void
  onChangeCustomSource: (source: CustomImageSource) => void
  onPickCustomImage: (assetId: string) => void
  onUploadCustomImages: () => void
}

export function EffectPickerDialog(props: EffectPickerDialogProps) {
  const { open, kind, onClose } = props
  if (!open || !kind) return null

  const isEmoji = kind === 'emoji'

  return createPortal(
    // Docked, non-modal strip: no dark backdrop, environment stays interactive.
    <div className="effect-picker-dock">
      <div
        className="effect-picker-dialog"
        role="dialog"
        aria-label={isEmoji ? 'Choose emoji' : 'Choose image'}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="effect-picker-head">
          <span className="effect-picker-title">{isEmoji ? 'EMOJI' : 'CUSTOM IMAGE'}</span>
          <button
            type="button"
            className={`effect-picker-random${(isEmoji ? props.emojiRandom : props.customImageRandom) ? ' active' : ''}`}
            onClick={() => (isEmoji
              ? props.onToggleEmojiRandom(!props.emojiRandom)
              : props.onToggleCustomRandom(!props.customImageRandom))}
            title="Assign a random one to every face"
          >
            <Icon name="shuffle" size={15} /> Random
          </button>
          <button type="button" className="effect-picker-ok" onClick={onClose} aria-label="Confirm selection">
            OK
          </button>
          <button type="button" className="effect-picker-close" onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </header>

        {isEmoji ? (
          <div className="effect-picker-grid effect-picker-grid--emoji">
            {EMOJI_POOL.map((emoji, i) => (
              <button
                key={`${emoji}-${i}`}
                type="button"
                className={`effect-picker-emoji${!props.emojiRandom && props.selectedEmoji === emoji ? ' active' : ''}`}
                onClick={() => props.onPickEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="effect-picker-sources">
              {CUSTOM_IMAGE_SOURCES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`effect-picker-source${props.customImageSource === s.id ? ' active' : ''}`}
                  onClick={() => props.onChangeCustomSource(s.id)}
                >
                  {s.label}
                </button>
              ))}
              <button type="button" className="effect-picker-source effect-picker-upload" onClick={props.onUploadCustomImages}>
                <Icon name="upload" size={14} /> Upload
              </button>
            </div>
            <div className="effect-picker-grid effect-picker-grid--image">
              {props.customImageAssets.length === 0 ? (
                <p className="effect-picker-empty">No images loaded yet. Pick a source or upload your own.</p>
              ) : (
                props.customImageAssets.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    className={`effect-picker-thumb${!props.customImageRandom && props.selectedCustomImageId === asset.id ? ' active' : ''}`}
                    onClick={() => props.onPickCustomImage(asset.id)}
                  >
                    <img src={asset.objectUrl} alt="" />
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
