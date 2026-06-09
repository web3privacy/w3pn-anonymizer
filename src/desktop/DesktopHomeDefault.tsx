import { AnonymizerLogoMotion } from '../components/AnonymizerLogoMotion'
import { useOpticalCalibration } from '../hooks/useOpticalCalibration'

interface DesktopHomeDefaultProps {
  isDragOver: boolean
  isBusy: boolean
  onAbout: () => void
  onSelectMedia: () => void
  onLoadDemo: () => void
  onLiveCamera: () => void
}

export function DesktopHomeDefault({
  isDragOver,
  isBusy,
  onAbout,
  onSelectMedia,
  onLoadDemo,
  onLiveCamera,
}: DesktopHomeDefaultProps) {
  const { mode, activate, cancel, isActive } = useOpticalCalibration()
  const pasteHint = navigator.platform.includes('Mac') ? '\u2318V' : 'Ctrl+V'

  return (
    <div className={`desktop-home-v2${isDragOver ? ' drag-active' : ''}`}>
      <header className="desktop-home-v2-header">
        <a href="https://www.web3privacy.info" target="_blank" rel="noreferrer" className="desktop-home-v2-w3pn-link" aria-label="Web3Privacy Now">
          <img src="/brand/w3pn-logo.svg" alt="web3privacy now" className="desktop-home-v2-w3pn" />
        </a>
        <button type="button" className="desktop-home-v2-about-link" onClick={onAbout}>
          WHAT IS THIS APP?
        </button>
      </header>

      <div className="desktop-home-v2-center">
        <AnonymizerLogoMotion
          mode={mode}
          onActivate={activate}
          onCancel={cancel}
          className="desktop-home-v2-spiral"
        />
        {!isActive && (
          <>
            <img src="/brand/anonymizer-wordmark.png" alt="ANONYMIZER" className="desktop-home-v2-wordmark" />
            <p className="desktop-home-v2-paste-hint">
              Drop files anywhere &middot; paste with <kbd>{pasteHint}</kbd> &middot; drag folders from the library sidebar after import
            </p>
          </>
        )}
      </div>

      <div className="desktop-home-v2-actions">
        <div className="desktop-home-v2-actions-row">
          <button type="button" className="desktop-home-v2-btn desktop-home-v2-btn--primary" onClick={onLiveCamera} disabled={isBusy || isActive}>
            TURN ON CAMERA
          </button>
          <button type="button" className="desktop-home-v2-btn desktop-home-v2-btn--secondary" onClick={onSelectMedia} disabled={isBusy || isActive}>
            SELECT MEDIA
          </button>
        </div>
        <button type="button" className="desktop-home-v2-btn desktop-home-v2-btn--ghost" onClick={onLoadDemo} disabled={isBusy || isActive}>
          LOAD DEMO
        </button>
      </div>

      {isDragOver && (
        <div className="desktop-home-v2-drop-overlay" aria-hidden="true">
          Drop to add photos or folders
        </div>
      )}
    </div>
  )
}
