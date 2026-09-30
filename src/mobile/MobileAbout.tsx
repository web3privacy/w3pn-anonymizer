import { useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { useDialogFocusTrap } from './useDialogFocusTrap'

interface MobileAboutProps {
  open: boolean
  onClose: () => void
  onFeedback?: () => void
}

const STEPS = [
  { label: 'Choose your media', icon: 'add_photo_alternate', title: 'Start with a moment worth sharing.', description: 'Open a photo, video, audio recording or document. Your files stay on this device while you work.' },
  { label: 'Detect & protect', icon: 'frame_inspect', title: 'Find the details that identify someone.', description: 'Detect faces and other sensitive content, choose a masking effect, and add your own regions wherever you need them.' },
  { label: 'Review & export', icon: 'download', title: 'Take a closer look. Then share a copy.', description: 'Check the result, adjust the masks, and export. In video, use the timeline to review moments that need extra attention.' },
]
const CAPABILITIES = [
  { icon: 'image', title: 'Photos', description: 'Detect faces, people, plates, documents and sensitive text. Mask with pixelate, blur, blackout, emoji, ASCII or your own images.' },
  { icon: 'videocam', title: 'Video & live camera', description: 'Choose how often to check a video, run additional passes and review its timeline. Mask faces in the live camera and record locally.' },
  { icon: 'graphic_eq', title: 'Audio & voice', description: 'Explore local voice-modulation presets, edit a waveform and export an altered recording. Voice masking is also available with the live microphone.' },
  { icon: 'description', title: 'Documents', description: 'Detect and review sensitive text in PDFs and text files. Export flattened redacted PDFs or text with replacement tokens.' },
]

export function MobileAbout({ open, onClose, onFeedback }: MobileAboutProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const [step, setStep] = useState(1)
  useDialogFocusTrap(open, dialogRef, { initialFocusRef: closeButtonRef, onClose })
  if (!open) return null
  return (
    <div className="mobile-about-backdrop about-backdrop" onClick={onClose}>
      <div ref={dialogRef} className="about-page" role="dialog" aria-modal="true" aria-label="What is this app" data-mobile-dialog="true" tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <header className="about-header">
          <img src="/brand/anonymizer-header.png" alt="ANONYMIZER" />
          <span className="about-header-label">A tool by Web3Privacy Now</span>
          <button ref={closeButtonRef} className="about-close" type="button" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button>
        </header>
        <div className="mobile-about-scroll about-scroll">
          <main className="about-content">
            <section className="about-hero" aria-labelledby="about-title">
              <div className="about-hero-copy">
                <span className="about-eyebrow"><Icon name="shield" size={15} /> Open source. Local by design.</span>
                <h1 id="about-title">Share the moment.<br /><span>Keep identities private.</span></h1>
                <p className="about-lead">A little more control over what you reveal. Anonymizer helps you protect identities in photos, video, audio and documents, right in your browser.</p>
                <div className="about-hero-actions">
                  <button type="button" className="about-action about-action--primary" onClick={onClose}>Back to the app <Icon name="arrow_forward" size={16} /></button>
                  <a href="#about-how" className="about-text-link">See how it works <Icon name="south" size={15} /></a>
                </div>
                <p className="about-quiet">A community project by <a href="https://www.web3privacy.info" target="_blank" rel="noreferrer">Web3Privacy Now</a>.</p>
              </div>
              <div className={`about-demo about-demo--step-${step}`} role="img" aria-label={step === 0 ? 'Illustration of an original portrait' : step === 1 ? 'Illustration of face detection and a pixelated face' : 'Illustration of a reviewed, masked copy ready to export'}>
                <div className="about-demo-bar"><span className="about-demo-dot" /> <span>{step === 0 ? 'ORIGINAL' : step === 1 ? 'LOCAL DETECTION' : 'REVIEWED COPY'}</span><Icon name={step === 2 ? 'task_alt' : 'image'} size={16} /></div>
                <div className="about-demo-art">
                  <svg viewBox="0 0 400 310" aria-hidden="true">
                    <path className="about-demo-grid" d="M0 62H400M0 124H400M0 186H400M0 248H400M80 0V310M160 0V310M240 0V310M320 0V310" />
                    <circle cx="200" cy="112" r="49" className="about-demo-head" />
                    <path d="M115 280v-25c0-55 36-85 85-85s85 30 85 85v25" className="about-demo-body" />
                    <path d="M182 106h4m28 0h4m-33 24q15 8 30 0" className="about-demo-face" />
                  </svg>
                  <div className="about-demo-mask">{Array.from({ length: 36 }, (_, i) => <span key={i} style={{ opacity: .35 + (i * 7 % 13) / 20 }} />)}</div>
                  <div className="about-demo-box"><span>FACE</span><i /><i /><i /><i /></div>
                  <div className="about-demo-scan" />
                </div>
                <div className="about-demo-foot"><Icon name="lock" size={14} /><span>Your media stays on your device</span><span className="about-demo-example">Illustration</span></div>
              </div>
            </section>

            <section id="about-how" className="about-section" aria-labelledby="about-how-title">
              <div className="about-section-heading"><span className="about-eyebrow">01 / HOW IT WORKS</span><h2 id="about-how-title">You stay in control.</h2></div>
              <div className="about-steps" role="group" aria-label="Explore how Anonymizer works">
                {STEPS.map((item, index) => <button key={item.label} type="button" className={`about-step${step === index ? ' active' : ''}`} aria-pressed={step === index} onClick={() => setStep(index)}><span className="about-step-number">0{index + 1}</span><Icon name={item.icon} size={20} /><span>{item.label}</span><Icon name="arrow_forward" size={16} /></button>)}
              </div>
              <div className="about-step-copy" aria-live="polite"><h3>{STEPS[step].title}</h3><p>{STEPS[step].description}</p></div>
              <div className="about-review-note"><Icon name="visibility" size={18} /><p>Automatic detection is a starting point. Review masks and the exported copy before sharing. Blur, visual effects and voice changes do not guarantee anonymity.</p></div>
            </section>

            <section className="about-section" aria-labelledby="about-tools-title">
              <div className="about-section-heading"><span className="about-eyebrow">02 / YOUR TOOLKIT</span><h2 id="about-tools-title">Different media. One workspace.</h2></div>
              <div className="about-capabilities">{CAPABILITIES.map((item) => <article key={item.title}><Icon name={item.icon} size={23} /><h3>{item.title}</h3><p>{item.description}</p></article>)}</div>
              <div className="about-extras"><span><Icon name="batch_prediction" size={17} /> Batch resize & export</span><span><Icon name="tune" size={17} /> Color grading</span><span><Icon name="auto_awesome" size={17} /> Halftone & distort effects</span><span><Icon name="polyline" size={17} /> SVG vectorize</span></div>
            </section>

            <section className="about-section about-local" aria-labelledby="about-local-title">
              <div><span className="about-eyebrow">03 / LOCAL BY DESIGN</span><h2 id="about-local-title">Your files.<br />Your device.</h2><p>Detection, editing and media export happen locally. There is no media-upload step and no analytics tracking your work.</p></div>
              <div className="about-local-details"><div className="about-local-item"><Icon name="cloud_off" size={20} /><div><h3>No media uploads</h3><p>Models and app assets are downloaded; your source media is processed on your device.</p></div></div><div className="about-local-item"><Icon name="code" size={20} /><div><h3>Open to inspection</h3><p>Open-source code, self-hosted fonts and models, and local processing without an account.</p></div></div><details><summary>Under the hood <Icon name="expand_more" size={16} /></summary><p>YuNet and YOLO run through ONNX Runtime WebAssembly; Tesseract handles sensitive-text OCR. Optional models load when needed. Video uses private temporary browser storage during processing.</p><p>Local timing indicates how long an operation took. Timing alone is not proof of privacy. Production connection rules restrict unintended network requests. Feedback is sent only when you submit its form.</p></details></div>
            </section>

            <footer className="about-footer"><div><img src="/brand/w3pn-logo.svg" alt="Web3Privacy Now" /><p>Built by a community that cares about privacy.<br />Help us make the tools better.</p></div><div className="about-footer-actions">{onFeedback && <button type="button" className="about-action" onClick={onFeedback}><Icon name="chat_bubble_outline" size={17} /> Give feedback</button>}<a className="about-action" href="https://github.com/web3privacy/w3pn-anonymizer" target="_blank" rel="noreferrer"><Icon name="code" size={17} /> Contribute</a><a className="about-text-link" href="https://web3privacy.info/donate" target="_blank" rel="noreferrer">Support Web3Privacy <Icon name="north_east" size={15} /></a></div></footer>
          </main>
        </div>
      </div>
    </div>
  )
}
