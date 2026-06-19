import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { CustomImagePickerPanel } from '../components/CustomImagePickerPanel'
import { EmojiPickerPanel } from '../components/EmojiPickerPanel'
import { AsciiCharsetPicker } from '../components/AsciiCharsetPicker'
import { EFFECTS } from '../lib/effects'
import type { AppMobileBindings } from './bindings'
import { MobileToolDrawer } from './MobileToolDrawer'
import { MobileVectorizePanel } from './MobileVectorizePanel'
import { isEffectApplied } from './categoryActivity'
import type { CustomImageSource } from '../types'

const EFFECTS_SLIDE_MS = 220

type EffectsSubView = 'emoji' | 'custom-image' | 'ascii' | 'vectorize'

interface MobileEffectsDrawerProps {
  b: AppMobileBindings
  liveMode?: boolean
}

export function MobileEffectsDrawer({ b, liveMode = false }: MobileEffectsDrawerProps) {
  const open = b.mobilePanel === 'tool-effects'
  const videoEditor = Boolean(b.activePhoto?.isVideo && !liveMode)
  const photoEditor = !liveMode && !videoEditor
  const [subView, setSubView] = useState<EffectsSubView | null>(null)
  const [slideToSub, setSlideToSub] = useState(false)
  const slideTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const lastSubViewRef = useRef<EffectsSubView | null>(null)
  const wasOpenRef = useRef(false)

  const [emojiDraft, setEmojiDraft] = useState({ emojiRandom: true, selectedEmoji: null as string | null })
  const [customImageDraft, setCustomImageDraft] = useState({
    customImageRandom: true,
    selectedCustomImageId: null as string | null,
    customImageSource: 'custom' as CustomImageSource,
  })

  const effectOptions = EFFECTS

  const clearSlideTimer = useCallback(() => {
    if (slideTimerRef.current) {
      clearTimeout(slideTimerRef.current)
      slideTimerRef.current = undefined
    }
  }, [])

  const openSubView = useCallback((view: EffectsSubView) => {
    clearSlideTimer()
    setSubView(view)
    setSlideToSub(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setSlideToSub(true))
    })
  }, [clearSlideTimer])

  const syncEmojiPreview = useCallback((draft: { emojiRandom: boolean; selectedEmoji: string | null }) => {
    b.onToggleEmojiRandom(draft.emojiRandom)
    if (!draft.emojiRandom && draft.selectedEmoji) {
      b.onPickEmoji(draft.selectedEmoji)
    }
  }, [b])

  const syncCustomImagePreview = useCallback((draft: {
    customImageRandom: boolean
    selectedCustomImageId: string | null
    customImageSource: CustomImageSource
  }) => {
    b.onToggleCustomRandom(draft.customImageRandom)
    if (!draft.customImageRandom && draft.selectedCustomImageId) {
      b.onPickCustomImage(draft.selectedCustomImageId)
    }
  }, [b])

  const armPhotoEffect = useCallback((effect: typeof EFFECTS[number]['id']) => {
    if (liveMode || videoEditor) {
      b.setSelectedEffect(effect)
      return
    }
    b.setEffectToolCustomized(true)
    b.updateSelectedZoneEffect(effect)
  }, [b, liveMode, videoEditor])

  const dismissToPreview = useCallback(() => {
    clearSlideTimer()
    setSubView(null)
    setSlideToSub(false)
    b.setVectorizePanelOpen(false)
    if (photoEditor) b.setEffectToolCustomized(true)
    b.setMobilePanel(null)
  }, [b, clearSlideTimer, photoEditor])

  const openEmojiPicker = useCallback(() => {
    lastSubViewRef.current = 'emoji'
    const draft = { emojiRandom: b.emojiRandom, selectedEmoji: b.selectedEmoji }
    setEmojiDraft(draft)
    armPhotoEffect('emoji')
    syncEmojiPreview(draft)
    openSubView('emoji')
  }, [armPhotoEffect, b.emojiRandom, b.selectedEmoji, openSubView, syncEmojiPreview])

  const openCustomImagePicker = useCallback(() => {
    lastSubViewRef.current = 'custom-image'
    const draft = {
      customImageRandom: b.customImageRandom,
      selectedCustomImageId: b.selectedCustomImageId,
      customImageSource: b.customImageSource,
    }
    setCustomImageDraft(draft)
    void b.loadCustomImagePreset(draft.customImageSource).then(() => {
      armPhotoEffect('custom-image')
      syncCustomImagePreview(draft)
    })
    openSubView('custom-image')
  }, [armPhotoEffect, b, openSubView, syncCustomImagePreview])

  const openAsciiPicker = useCallback(() => {
    lastSubViewRef.current = 'ascii'
    armPhotoEffect('ascii')
    openSubView('ascii')
  }, [armPhotoEffect, openSubView])

  const backToEffects = useCallback(() => {
    clearSlideTimer()
    lastSubViewRef.current = null
    if (subView === 'vectorize') {
      b.setVectorizePanelOpen(false)
    }
    setSlideToSub(false)
    slideTimerRef.current = setTimeout(() => setSubView(null), EFFECTS_SLIDE_MS)
  }, [b.setVectorizePanelOpen, clearSlideTimer, subView])

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      const last = lastSubViewRef.current
      if (last === 'emoji') openEmojiPicker()
      else if (last === 'custom-image') openCustomImagePicker()
      else if (last === 'ascii') openAsciiPicker()
    } else if (!open && wasOpenRef.current) {
      clearSlideTimer()
      setSubView(null)
      setSlideToSub(false)
      b.setVectorizePanelOpen(false)
    }
    wasOpenRef.current = open
  }, [open, clearSlideTimer, b, openEmojiPicker, openCustomImagePicker, openAsciiPicker])

  useEffect(() => () => clearSlideTimer(), [clearSlideTimer])

  const selectEffect = (efId: typeof EFFECTS[number]['id']) => {
    b.setActiveCategory('effects')
    if (efId === 'emoji') {
      openEmojiPicker()
      return
    }
    if (efId === 'custom-image') {
      openCustomImagePicker()
      return
    }
    if (efId === 'ascii') {
      openAsciiPicker()
      return
    }
    lastSubViewRef.current = null
    armPhotoEffect(efId)
    if (photoEditor) {
      dismissToPreview()
    } else {
      b.setMobilePanel(null)
    }
  }

  const inSub = subView !== null
  const title = subView === 'emoji'
    ? 'EMOJI'
    : subView === 'custom-image'
      ? 'CUSTOM IMAGE'
      : subView === 'ascii'
        ? 'ASCII CHARACTERS'
        : subView === 'vectorize'
          ? 'VECTORIZE'
          : (liveMode ? 'CHOOSE EFFECT' : 'Effects')

  const header = inSub ? (
    <div className="mobile-drawer-header-v2">
      <button type="button" className="mobile-drawer-header-v2-btn" onClick={backToEffects} aria-label="Back to effects">
        <Icon name="arrow_back" size={20} />
      </button>
      <h2 className="mobile-drawer-header-v2-title">{title}</h2>
      <button
        type="button"
        className="mobile-drawer-header-v2-btn mobile-drawer-header-v2-close"
        onClick={photoEditor ? dismissToPreview : () => b.setMobilePanel(null)}
        aria-label="Close"
      >
        <Icon name="close" size={20} />
      </button>
    </div>
  ) : undefined

  const handleDrawerClose = photoEditor ? dismissToPreview : () => b.setMobilePanel(null)

  return (
    <MobileToolDrawer open={open} onClose={handleDrawerClose} title={title} variant="tool" header={header}>
      <div className="mobile-distort-viewport mobile-effects-viewport">
        <div className={`mobile-distort-panels${slideToSub ? ' show-settings' : ''}`}>
          <div className="mobile-distort-panel mobile-effects-panel-list">
            {videoEditor && (
              <p className="mobile-distort-video-hint">Preview updates on each frame. Tap Anonymize to export.</p>
            )}
            <div className="ts-effect-grid mobile-effect-grid">
              {effectOptions.map((ef) => (
                <button
                  key={ef.id}
                  type="button"
                  className={`ts-effect-tile${isEffectApplied(ef.id, b, liveMode) ? ' active' : ''}`}
                  onClick={() => selectEffect(ef.id)}
                  title={ef.description}
                >
                  <span className="ts-effect-tile-icon">
                    <Icon name={ef.icon ?? 'blur_on'} size={18} />
                  </span>
                  <span className="ts-effect-tile-label">{ef.label.toUpperCase()}</span>
                </button>
              ))}
              {!liveMode && !b.activePhoto?.isVideo && (
                <button
                  type="button"
                  className={`ts-effect-tile${b.vectorizePanelOpen ? ' active' : ''}`}
                  onClick={() => {
                    lastSubViewRef.current = null
                    b.setVectorizePanelOpen(true)
                    openSubView('vectorize')
                  }}
                  title="Trace photo to SVG"
                >
                  <span className="ts-effect-tile-icon">
                    <Icon name="polyline" size={18} />
                  </span>
                  <span className="ts-effect-tile-label">VECTOR</span>
                </button>
              )}
            </div>
          </div>

          <div className="mobile-distort-panel mobile-effects-panel-sub">
            {subView === 'emoji' ? (
              <EmojiPickerPanel
                emojiRandom={emojiDraft.emojiRandom}
                selectedEmoji={emojiDraft.selectedEmoji}
                onToggleRandom={(v) => {
                  const next = { ...emojiDraft, emojiRandom: v }
                  setEmojiDraft(next)
                  syncEmojiPreview(next)
                }}
                onPickEmoji={(emoji) => {
                  const next = { emojiRandom: false, selectedEmoji: emoji }
                  setEmojiDraft(next)
                  syncEmojiPreview(next)
                }}
              />
            ) : subView === 'custom-image' ? (
              <CustomImagePickerPanel
                customImageRandom={customImageDraft.customImageRandom}
                customImageSource={customImageDraft.customImageSource}
                customImageAssets={b.customImageAssets}
                selectedCustomImageId={customImageDraft.selectedCustomImageId}
                loading={b.customImagePresetLoading}
                onToggleRandom={(v) => {
                  const next = { ...customImageDraft, customImageRandom: v }
                  setCustomImageDraft(next)
                  syncCustomImagePreview(next)
                }}
                onPickImage={(assetId) => {
                  const next = { ...customImageDraft, customImageRandom: false, selectedCustomImageId: assetId }
                  setCustomImageDraft(next)
                  syncCustomImagePreview(next)
                }}
                onSelectSource={(source) => {
                  const next = { ...customImageDraft, customImageSource: source }
                  setCustomImageDraft(next)
                  void b.loadCustomImagePreset(source).then(() => syncCustomImagePreview(next))
                }}
                onUpload={b.openCustomImagePicker}
                sourceMenuVariant="sheet"
              />
            ) : subView === 'ascii' ? (
              <AsciiCharsetPicker charset={b.asciiCharset} onChange={b.setAsciiCharset} />
            ) : subView === 'vectorize' ? (
              <MobileVectorizePanel b={b} />
            ) : (
              <div className="mobile-distort-settings-placeholder" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>
    </MobileToolDrawer>
  )
}
