import { createPortal } from 'react-dom'
import { Icon } from './Icon'
import { CustomImagePickerPanel } from './CustomImagePickerPanel'
import { EmojiPickerPanel } from './EmojiPickerPanel'
import { AsciiCharsetPicker } from './AsciiCharsetPicker'
import type { AsciiCharset, CustomImageAsset, CustomImageSource } from '../types'

export interface EffectPickerDialogProps {
  open: boolean
  kind: 'emoji' | 'custom-image' | 'ascii' | null
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
  // ASCII
  asciiCharset: AsciiCharset
  onChangeAsciiCharset: (charset: AsciiCharset) => void
}

const TITLES: Record<'emoji' | 'custom-image' | 'ascii', string> = {
  emoji: 'EMOJI',
  'custom-image': 'CUSTOM IMAGE',
  ascii: 'ASCII CHARACTERS',
}

export function EffectPickerDialog(props: EffectPickerDialogProps) {
  const { open, kind, onClose } = props
  if (!open || !kind) return null

  const isEmoji = kind === 'emoji'
  const isAscii = kind === 'ascii'

  return createPortal(
    <div className="effect-picker-dock">
      <div
        className="effect-picker-dialog"
        role="dialog"
        aria-label={isEmoji ? 'Choose emoji' : isAscii ? 'Choose ASCII characters' : 'Choose image'}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="effect-picker-head">
          <span className="effect-picker-title">{TITLES[kind]}</span>
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
        ) : isAscii ? (
          <AsciiCharsetPicker
            charset={props.asciiCharset}
            onChange={props.onChangeAsciiCharset}
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
