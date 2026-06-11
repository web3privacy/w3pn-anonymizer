import type { AppMobileBindings } from './bindings'
import { AnonymizerLogoMotion } from '../components/AnonymizerLogoMotion'
import { HomeModelPreloader } from '../components/HomeModelPreloader'
import { useOpticalCalibration } from '../hooks/useOpticalCalibration'
import { useModelPreload } from '../hooks/useModelPreload'

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
  const { mode, activate, cancel, isCalibratingLayout, isSessionActive, isSettling } = useOpticalCalibration()
  const preload = useModelPreload(b.detectorLoading)

  const enterLive = () => {
    b.setMobileMode('live')
    b.setMobilePanel(null)
  }

  return (
    <div className={`mobile-home-v2${b.isDragOver ? ' drag-active' : ''}${isCalibratingLayout ? ' home-v2--calibrating' : ''}${isSettling ? ' home-v2--settling' : ''}`}>
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
          {!isSessionActive ? (
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
          ) : (
            <div className="mobile-home-v2-wordmark-btn mobile-home-v2-cal-placeholder" aria-hidden="true">
              <img
                src="/brand/anonymizer-wordmark.png"
                alt=""
                className="mobile-home-v2-wordmark"
                draggable={false}
              />
            </div>
          )}
        </div>

        <div className={`mobile-home-v2-cta${isSessionActive ? ' mobile-home-v2-cal-placeholder' : ''}`} aria-hidden={isSessionActive}>
          {!isSessionActive && preload.ready && (
            <>
              <div className="mobile-home-v2-cta-row">
                <button
                  type="button"
                  className="mobile-cta-primary"
                  onClick={enterLive}
                  disabled={b.isBusy}
                >
                  TURN ON CAMERA
                </button>
                <button
                  type="button"
                  className="mobile-cta-secondary"
                  onClick={b.openUnifiedPicker}
                  disabled={b.isBusy}
                >
                  SELECT MEDIA
                </button>
              </div>
              <button
                type="button"
                className="mobile-cta-muted"
                onClick={b.loadDemoPhotos}
                disabled={b.isBusy}
              >
                LOAD DEMO
              </button>
            </>
          )}
          {!isSessionActive && !preload.ready && (
            <HomeModelPreloader status={preload} />
          )}
          {isSessionActive && (
            <>
              <div className="mobile-home-v2-cta-row">
                <span className="mobile-cta-primary mobile-home-v2-cal-spacer" />
                <span className="mobile-cta-secondary mobile-home-v2-cal-spacer" />
              </div>
              <span className="mobile-cta-muted mobile-home-v2-cal-spacer" />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
