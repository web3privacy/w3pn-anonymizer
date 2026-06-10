import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { EFFECTS, EMOJI_POOL } from '../lib/effects'
import type { AppMobileBindings } from './bindings'
import { MobileCustomImagePickerPanel } from './MobileCustomImagePickerPanel'
import { MobileToolDrawer } from './MobileToolDrawer'
import { MobileVectorizePanel } from './MobileVectorizePanel'
import { isEffectApplied } from './categoryActivity'

const EFFECTS_SLIDE_MS = 220

type EffectsSubView = 'emoji' | 'custom-image' | 'vectorize'

interface MobileEffectsDrawerProps {
  b: AppMobileBindings
  liveMode?: boolean
}

function MobileEmojiPickerPanel({ b }: { b: AppMobileBindings }) {
  return (
    <div className="mobile-emoji-picker">
      <label className="mobile-emoji-random-row">
        <span className="mobile-emoji-random-label">
          <Icon name="shuffle" size={18} />
          <span>Random per face</span>
        </span>
        <span className={`mobile-switch${b.emojiRandom ? ' on' : ''}`}>
          <input
            type="checkbox"
            checked={b.emojiRandom}
            onChange={(e) => b.onToggleEmojiRandom(e.target.checked)}
          />
          <span className="mobile-switch-track" />
          <span className="mobile-switch-knob" />
        </span>
      </label>
      <p className="mobile-emoji-hint">
        {b.emojiRandom
          ? 'Each detected face gets a different emoji. Turn off random to pick one emoji for all.'
          : 'Tap an emoji to use it on every face.'}
      </p>
      <div className="mobile-emoji-grid" role="listbox" aria-label="Choose emoji">
        {EMOJI_POOL.map((emoji, i) => (
          <button
            key={`${emoji}-${i}`}
            type="button"
            role="option"
            aria-selected={!b.emojiRandom && b.selectedEmoji === emoji}
            className={`mobile-emoji-btn${!b.emojiRandom && b.selectedEmoji === emoji ? ' active' : ''}`}
            onClick={() => b.onPickEmoji(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}

export function MobileEffectsDrawer({ b, liveMode = false }: MobileEffectsDrawerProps) {
  const open = b.mobilePanel === 'tool-effects'
  const videoEditor = Boolean(b.activePhoto?.isVideo && !liveMode)
  const [subView, setSubView] = useState<EffectsSubView | null>(null)
  const [slideToSub, setSlideToSub] = useState(false)
  const slideTimerRef = useRef<ReturnType<typeof setTimeout>>()

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

  const backToEffects = useCallback(() => {
    clearSlideTimer()
    if (subView === 'vectorize') {
      b.setVectorizePanelOpen(false)
    }
    setSlideToSub(false)
    slideTimerRef.current = setTimeout(() => setSubView(null), EFFECTS_SLIDE_MS)
  }, [clearSlideTimer, subView, b.setVectorizePanelOpen])

  useEffect(() => {
    if (!open) {
      clearSlideTimer()
      setSubView(null)
      setSlideToSub(false)
      b.setVectorizePanelOpen(false)
    }
  }, [open, clearSlideTimer, b.setVectorizePanelOpen])

  useEffect(() => () => clearSlideTimer(), [clearSlideTimer])

  const close = () => {
    clearSlideTimer()
    setSubView(null)
    setSlideToSub(false)
    b.setMobilePanel(null)
  }

  const selectEffect = (efId: typeof EFFECTS[number]['id']) => {
    b.setActiveCategory('effects')
    if (liveMode || videoEditor) {
      b.setSelectedEffect(efId)
    } else {
      b.setEffectToolCustomized(true)
      b.updateSelectedZoneEffect(efId)
    }
    if (efId === 'emoji') {
      openSubView('emoji')
    } else if (efId === 'custom-image') {
      openSubView('custom-image')
    }
    // Keep drawer open so the user sees the effect on the image behind the sheet.
  }

  const inSub = subView !== null
  const title = subView === 'emoji'
    ? 'EMOJI'
    : subView === 'custom-image'
      ? 'CUSTOM IMAGE'
      : subView === 'vectorize'
        ? 'VECTORIZE'
        : (liveMode ? 'CHOOSE EFFECT' : 'Effects')

  const header = inSub ? (
    <div className="mobile-drawer-header-v2">
      <button type="button" className="mobile-drawer-header-v2-btn" onClick={backToEffects} aria-label="Back to effects">
        <Icon name="arrow_back" size={20} />
      </button>
      <h2 className="mobile-drawer-header-v2-title">{title}</h2>
      <button type="button" className="mobile-drawer-header-v2-btn mobile-drawer-header-v2-close" onClick={close} aria-label="Close">
        <Icon name="close" size={20} />
      </button>
    </div>
  ) : undefined

  return (
    <MobileToolDrawer open={open} onClose={close} title={title} variant="tool" header={header}>
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
              <MobileEmojiPickerPanel b={b} />
            ) : subView === 'custom-image' ? (
              <MobileCustomImagePickerPanel b={b} />
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
