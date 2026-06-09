import { useState } from 'react'
import { Icon } from '../components/Icon'
import { readEnableOpticalMode, writeEnableOpticalMode } from '../lib/optical-calibration'

interface MobileAboutProps {
  open: boolean
  onClose: () => void
  onFeedback?: () => void
}

const FEATURES = [
  { icon: 'visibility_off' as const, title: 'Face anonymization', desc: 'Blur, pixelate, or emoji-cover faces' },
  { icon: 'brush' as const, title: 'Brush & zones', desc: 'Paint or draw on sensitive areas' },
  { icon: 'auto_awesome' as const, title: 'Distort FX', desc: 'Halftone, glitch, pixel-shift, color-shift' },
  { icon: 'tune' as const, title: 'Color grading', desc: 'Brightness, contrast, saturation' },
  { icon: 'batch_prediction' as const, title: 'Batch export', desc: 'Resize, convert, and anonymize in bulk' },
  { icon: 'videocam' as const, title: 'Video processing', desc: 'Frame-by-frame local MP4, WebM, MOV' },
]

const LOCAL_ITEMS = [
  { title: '100% local', desc: 'all processing runs in your browser, no uploads' },
  { title: 'YuNet WASM detection', desc: 'face detection via ONNX Runtime WebAssembly' },
  { title: 'CPU timing proof', desc: 'shows processing time to verify local execution' },
  { title: 'No analytics, no cookies, no tracking', desc: 'zero third-party network requests' },
  { title: 'Self-hosted fonts', desc: 'Material Symbols served locally, no Google CDN' },
  { title: 'Content Security Policy', desc: 'blocks unintended outbound connections' },
]

export function MobileAbout({ open, onClose, onFeedback }: MobileAboutProps) {
  const [opticalEnabled, setOpticalEnabled] = useState(readEnableOpticalMode)

  if (!open) return null

  return (
    <div className="mobile-about-backdrop" onClick={onClose}>
      <div className="mobile-about" onClick={(e) => e.stopPropagation()}>
        <header className="mobile-about-header mobile-about-header--logoless">
          <span className="mobile-about-header-spacer" aria-hidden="true" />
          <span aria-hidden="true" />
          <button type="button" className="mobile-about-close" onClick={onClose} aria-label="Close">
            <Icon name="close" size={22} />
          </button>
        </header>

        <div className="mobile-about-scroll">
          <img src="/brand/anonymizer-logo.svg" alt="ANONYMIZER" className="mobile-about-hero-logo" />
          <p className="mobile-about-intro">
            A community project by{' '}
            <a href="https://www.web3privacy.info" target="_blank" rel="noreferrer">Web3Privacy Now</a>.
          </p>
          <p className="mobile-about-desc">
            Privacy-first image and video anonymization tool. All rendering, export, and face detection run entirely in your browser.
          </p>

          <h2 className="mobile-about-section-title">FEATURES</h2>
          <ul className="mobile-about-features">
            {FEATURES.map((f) => (
              <li key={f.title}>
                <Icon name={f.icon} size={18} />
                <div className="mobile-about-feature-title">{f.title}</div>
                <div className="mobile-about-feature-desc">{f.desc}</div>
              </li>
            ))}
          </ul>
          <div className="mobile-about-rule mobile-about-rule--features" aria-hidden="true" />

          <h2 className="mobile-about-section-title">OPEN-SOURCE &amp; LOCAL</h2>
          <ul className="mobile-about-local">
            {LOCAL_ITEMS.map((item) => (
              <li key={item.title}>
                <div className="mobile-about-local-title">{item.title}</div>
                <div className="mobile-about-local-desc">{item.desc}</div>
              </li>
            ))}
          </ul>

          <div className="mobile-about-rule mobile-about-rule--local" aria-hidden="true" />

          <h2 className="mobile-about-section-title">PREFERENCES</h2>
          <label className="mobile-about-toggle">
            <span className="mobile-about-toggle-label">
              <span className="mobile-about-toggle-title">Privacy Calibration</span>
              <span className="mobile-about-toggle-desc">Optical illusion animation on the home logo. Tap the logo to activate.</span>
            </span>
            <input
              type="checkbox"
              className="mobile-about-toggle-input"
              checked={opticalEnabled}
              onChange={(e) => {
                const v = e.currentTarget.checked
                setOpticalEnabled(v)
                writeEnableOpticalMode(v)
              }}
            />
            <span className="mobile-about-toggle-track" />
          </label>

          <footer className="mobile-about-footer">
            <p className="mobile-about-footer-text">Built with love by the Web3Privacy Now community.</p>
            {onFeedback && (
              <button type="button" className="mobile-about-feedback" onClick={onFeedback}>
                Give us Feedback
              </button>
            )}
            <div className="mobile-about-rule mobile-about-rule--feedback" aria-hidden="true" />
            <div className="mobile-about-footer-row">
              <img src="/brand/w3pn-logo.svg" alt="web3privacy now" className="mobile-about-w3pn" />
              <a
                href="https://github.com/web3privacy/w3pn-anonymizer"
                target="_blank"
                rel="noreferrer"
                className="mobile-about-contribute"
              >
                CONTRIBUTE ON GIT
              </a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
