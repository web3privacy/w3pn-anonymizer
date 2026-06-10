import { EMOJI_POOL } from '../lib/effects'
import { Icon } from './Icon'

export interface EmojiPickerPanelProps {
  emojiRandom: boolean
  selectedEmoji: string | null
  onToggleRandom: (random: boolean) => void
  onPickEmoji: (emoji: string) => void
  /** Hide helper copy in compact desktop dock. */
  showHint?: boolean
}

export function EmojiPickerPanel({
  emojiRandom,
  selectedEmoji,
  onToggleRandom,
  onPickEmoji,
  showHint = true,
}: EmojiPickerPanelProps) {
  return (
    <div className="mobile-emoji-picker">
      <label className="mobile-emoji-random-row">
        <span className="mobile-emoji-random-label">
          <Icon name="shuffle" size={18} />
          <span>Random per face</span>
        </span>
        <span className={`mobile-switch${emojiRandom ? ' on' : ''}`}>
          <input
            type="checkbox"
            checked={emojiRandom}
            onChange={(e) => onToggleRandom(e.target.checked)}
          />
          <span className="mobile-switch-track" />
          <span className="mobile-switch-knob" />
        </span>
      </label>
      {showHint && (
        <p className="mobile-emoji-hint">
          {emojiRandom
            ? 'Each detected face gets a different emoji. Turn off random to pick one emoji for all.'
            : 'Click an emoji to use it on every face.'}
        </p>
      )}
      <div className="mobile-emoji-grid" role="listbox" aria-label="Choose emoji">
        {EMOJI_POOL.map((emoji, i) => (
          <button
            key={`${emoji}-${i}`}
            type="button"
            role="option"
            aria-selected={!emojiRandom && selectedEmoji === emoji}
            className={`mobile-emoji-btn${!emojiRandom && selectedEmoji === emoji ? ' active' : ''}`}
            onClick={() => onPickEmoji(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
