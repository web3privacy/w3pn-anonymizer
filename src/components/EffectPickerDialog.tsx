import { createPortal } from 'react-dom'
import { Icon } from './Icon'
import { CustomImagePickerPanel } from './CustomImagePickerPanel'
import { EmojiPickerPanel } from './EmojiPickerPanel'
import type { CustomImageAsset, CustomImageSource } from '../types'

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
  customImagePresetLoading?: boolean
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
    <div className="effect-picker-dock">
      <div
        className="effect-picker-dialog"
        role="dialog"
        aria-label={isEmoji ? 'Choose emoji' : 'Choose image'}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="effect-picker-head">
          <span className="effect-picker-title">{isEmoji ? 'EMOJI' : 'CUSTOM IMAGE'}</span>
          <button type="button" className="effect-picker-close" onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </header>

        {isEmoji ? (
          <EmojiPickerPanel
            emojiRandom={props.emojiRandom}
            selectedEmoji={props.selectedEmoji}
            onToggleRandom={props.onToggleEmojiRandom}
            onPickEmoji={props.onPickEmoji}
            showHint={false}
          />
        ) : (
          <CustomImagePickerPanel
            customImageRandom={props.customImageRandom}
            customImageSource={props.customImageSource}
            customImageAssets={props.customImageAssets}
            selectedCustomImageId={props.selectedCustomImageId}
            loading={props.customImagePresetLoading}
            onToggleRandom={props.onToggleCustomRandom}
            onPickImage={props.onPickCustomImage}
            onSelectSource={props.onChangeCustomSource}
            onUpload={props.onUploadCustomImages}
            sourceMenuVariant="dropdown"
          />
        )}
      </div>
    </div>,
    document.body,
  )
}
