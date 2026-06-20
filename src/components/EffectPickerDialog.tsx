import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
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
  asciiColor: string
  onChangeAsciiColor: (color: string) => void
}

const TITLES: Record<'emoji' | 'custom-image' | 'ascii', string> = {
  emoji: 'EMOJI',
  'custom-image': 'CUSTOM IMAGE',
  ascii: 'ASCII CHARACTERS',
}

export function EffectPickerDialog(props: EffectPickerDialogProps) {
  const { open, kind, onClose } = props
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const offsetRef = useRef(offset)
  const dragCleanupRef = useRef<(() => void) | null>(null)
  offsetRef.current = offset

  useEffect(() => {
    if (open) setOffset({ x: 0, y: 0 })
  }, [kind, open])

  useEffect(() => () => dragCleanupRef.current?.(), [])

  const startDrag = (event: ReactMouseEvent<HTMLElement>) => {
    if (window.innerWidth <= 768 || event.button !== 0 || (event.target as HTMLElement).closest('button')) return
    event.preventDefault()
    const start = { x: event.clientX, y: event.clientY, offset: offsetRef.current }
    const move = (moveEvent: MouseEvent) => setOffset({
      x: start.offset.x + moveEvent.clientX - start.x,
      y: Math.min(0, start.offset.y + moveEvent.clientY - start.y),
    })
    const cleanup = () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', cleanup)
      dragCleanupRef.current = null
    }
    dragCleanupRef.current?.()
    dragCleanupRef.current = cleanup
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', cleanup, { once: true })
  }

  if (!open || !kind) return null

  const isEmoji = kind === 'emoji'
  const isAscii = kind === 'ascii'

  return createPortal(
    <div className="effect-picker-dock">
      <div className={`effect-picker-positioner effect-picker-positioner--${kind}`} style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}>
        <div
          className={`effect-picker-dialog effect-picker-dialog--${kind}`}
          role="dialog"
          aria-label={isEmoji ? 'Choose emoji' : isAscii ? 'Choose ASCII characters' : 'Choose image'}
          onMouseDown={(e) => e.stopPropagation()}
        >
        <header
          className="effect-picker-head"
          onMouseDown={startDrag}
        >
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
            color={props.asciiColor}
            onColorChange={props.onChangeAsciiColor}
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
      </div>
    </div>,
    document.body,
  )
}
