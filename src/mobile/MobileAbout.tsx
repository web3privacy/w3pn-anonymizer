import { useRef } from 'react'
import { Icon } from '../components/Icon'
import { useDialogFocusTrap } from './useDialogFocusTrap'

interface MobileAboutProps {
  open: boolean
  onClose: () => void
  onFeedback?: () => void
}

const FEATURES = [
  { icon: 'visibility_off' as const, title: 'Privacy detection', desc: 'Faces, people, plates, documents, PII text (YuNet + YOLO + OCR)' },
  { icon: 'grid_on' as const, title: 'Anonymization effects', desc: 'Blur, pixelate, blackout, emoji, ASCII, custom image, glitch, thermal…' },
  { icon: 'description' as const, title: 'Document mode', desc: 'PDF/TXT redaction — detect, review, export flattened PDF or tokenized text' },
  { icon: 'graphic_eq' as const, title: 'Audio anonymization', desc: 'Waveform editor with voice-modulation presets and local export' },
  { icon: 'photo_camera' as const, title: 'Live camera + mic', desc: 'Real-time face masking, video capture, and live voice mask presets' },
  { icon: 'auto_awesome' as const, title: 'Distort FX', desc: 'Halftone, glitch, pixel-shift, color-shift' },
  { icon: 'tune' as const, title: 'Color grading', desc: 'Brightness, contrast, saturation + presets' },
  { icon: 'batch_prediction' as const, title: 'Batch export', desc: 'Resize, convert, color-grade, and anonymize in bulk' },
  { icon: 'videocam' as const, title: 'Video processing', desc: 'Frame-by-frame local MP4, WebM, MOV with optional audio masking' },
  { icon: 'polyline' as const, title: 'SVG vectorize', desc: 'Trace photos to SVG with live preview presets' },
]

const LOCAL_ITEMS = [
  { title: '100% local', desc: 'all processing runs in your browser — no uploads' },
  { title: 'YuNet + YOLO + OCR', desc: 'face/object detection and sensitive-text OCR via ONNX Runtime WebAssembly + Tesseract.js' },
  { title: 'CPU timing proof', desc: 'shows processing time to verify local execution' },
  { title: 'No analytics, no cookies, no tracking', desc: 'zero third-party network requests' },
  { title: 'Self-hosted assets', desc: 'fonts, ONNX models, WASM, OCR data, and AudioWorklets served from the same origin' },
  { title: 'Content Security Policy', desc: 'blocks unintended outbound connections in production' },
]

export function MobileAbout({ open, onClose, onFeedback }: MobileAboutProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  useDialogFocusTrap(open, dialogRef, { initialFocusRef: closeButtonRef, onClose })

  if (!open) return null

  return (
    <div className="mobile-about-backdrop" onClick={onClose}>
      <div
        ref={dialogRef}
        className="mobile-about"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="What is this app"
        data-mobile-dialog="true"
        tabIndex={-1}
      >
        <header className="mobile-about-header mobile-about-header--logoless">
          <span className="mobile-about-header-spacer" aria-hidden="true" />
          <span aria-hidden="true" />
          <button ref={closeButtonRef} type="button" className="mobile-about-close" onClick={onClose} aria-label="Close">
            <Icon name="close" size={22} />
          </button>
        </header>

        <div className="mobile-about-scroll">
          <div className="mobile-about-band mobile-about-band--hero">
            <img src="/brand/anonymizer-wordmark.png" alt="ANONYMIZER" className="mobile-about-hero-logo" />
            <p className="mobile-about-intro">
              A community project by{' '}
              <a href="https://www.web3privacy.info" target="_blank" rel="noreferrer">Web3Privacy Now</a>.
            </p>
            <p className="mobile-about-desc">
              Privacy-first anonymization for photos, video, audio, documents, and live camera. Detection, rendering, and export run entirely in your browser.
            </p>
          </div>

          <div className="mobile-about-rule mobile-about-rule--intro" aria-hidden="true" />

          <div className="mobile-about-band">
            <h2 className="mobile-about-section-title">FEATURES</h2>
            <ul className="mobile-about-features">
              {FEATURES.map((f) => (
                <li key={f.title}>
                  <span className="mobile-about-feature-icon" aria-hidden="true">
                    <Icon name={f.icon} size={18} />
                  </span>
                  <div className="mobile-about-feature-copy">
                    <div className="mobile-about-feature-title">{f.title}</div>
                    <div className="mobile-about-feature-desc">{f.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mobile-about-rule mobile-about-rule--features" aria-hidden="true" />

          <div className="mobile-about-band">
            <h2 className="mobile-about-section-title">OPEN-SOURCE &amp; LOCAL</h2>
            <ul className="mobile-about-local">
              {LOCAL_ITEMS.map((item) => (
                <li key={item.title}>
                  <div className="mobile-about-local-copy">
                    <div className="mobile-about-local-title">{item.title}</div>
                    <div className="mobile-about-local-desc">{item.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mobile-about-rule mobile-about-rule--pre-footer" aria-hidden="true" />

          <footer className="mobile-about-footer">
            <div className="mobile-about-band">
              <p className="mobile-about-footer-text">Built with love by the Web3Privacy Now community.</p>
              {onFeedback && (
                <button type="button" className="mobile-about-feedback" onClick={onFeedback}>
                  Give us Feedback
                </button>
              )}
            </div>
            <div className="mobile-about-rule mobile-about-rule--feedback" aria-hidden="true" />
            <div className="mobile-about-band mobile-about-band--footer-row">
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
