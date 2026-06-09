import type { AppMobileBindings } from './bindings'
import { AnonymizerLogoMotion } from '../components/AnonymizerLogoMotion'
import { useOpticalCalibration } from '../hooks/useOpticalCalibration'

interface MobileHomeDefaultProps {
  b: Pick<
    AppMobileBindings,
    | 'isDragOver'
    | 'setAboutOpen'
    | 'loadDemoPhotos'
    | 'isBusy'
    | 'detectorLoading'
    | 'openUnifiedPicker'
    | 'setMobileMode'
    | 'setMobilePanel'
  >
}

export function MobileHomeDefault({ b }: MobileHomeDefaultProps) {
  const { mode, activate, cancel, isActive } = useOpticalCalibration()
  const homeBusy = b.isBusy || b.detectorLoading || isActive

  const enterLive = () => {
    if (b.detectorLoading) return
    b.setMobileMode('live')
    b.setMobilePanel(null)
  }

  return (
    <div className={`mobile-home-v2${b.isDragOver ? ' drag-active' : ''}${isActive ? ' home-v2--calibrating' : ''}`}>
      <header className="mobile-home-v2-header">
        <a
          href="https://www.web3privacy.info"
          target="_blank"
          rel="noreferrer"
          className="mobile-home-v2-w3pn-link"
          aria-label="Web3Privacy Now"
        >
          <img src="/brand/w3pn-logo.svg" alt="web3privacy now" className="mobile-home-v2-w3pn" />
        </a>
        <button
          type="button"
          className="mobile-home-v2-about-link"
          onClick={() => b.setAboutOpen(true)}
        >
          WHAT IS THIS APP?
        </button>
      </header>

      <div className="mobile-home-v2-hero">
        <div className="mobile-home-v2-center">
          <div className="mobile-home-v2-spiral-wrap">
            <AnonymizerLogoMotion
              mode={mode}
              onActivate={activate}
              onCancel={cancel}
            />
          </div>
          {!isActive && (
            <button
              type="button"
              className="mobile-home-v2-wordmark-btn"
              onClick={() => b.setAboutOpen(true)}
              aria-label="What is this app?"
            >
              <img
                src="/brand/anonymizer-wordmark.png"
                alt="ANONYMIZER"
                className="mobile-home-v2-wordmark"
                draggable={false}
              />
            </button>
          )}
        </div>

        {!isActive && (
          <div className="mobile-home-v2-cta">
            <div className="mobile-home-v2-cta-row">
              <button
                type="button"
                className="mobile-cta-primary"
                onClick={enterLive}
                disabled={homeBusy}
              >
                TURN ON CAMERA
              </button>
              <button
                type="button"
                className="mobile-cta-secondary"
                onClick={b.openUnifiedPicker}
                disabled={homeBusy}
              >
                SELECT MEDIA
              </button>
            </div>
            <button
              type="button"
              className="mobile-cta-muted"
              onClick={b.loadDemoPhotos}
              disabled={homeBusy}
            >
              LOAD DEMO
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
