import { memo } from 'react'
import { Icon } from '../components/Icon'

interface MobileTopBarProps {
  onAbout: () => void
  onOpenGallery?: () => void
  showGalleryButton?: boolean
  showLiveButton?: boolean
  onLiveMode?: () => void
  variant?: 'workspace' | 'live' | 'about'
  onClose?: () => void
  pipelineMsRef?: React.Ref<HTMLSpanElement>
  showViewReset?: boolean
  onResetView?: () => void
}

export const MobileTopBar = memo(function MobileTopBar({
  onAbout,
  onOpenGallery,
  showGalleryButton,
  showLiveButton,
  onLiveMode,
  variant = 'workspace',
  onClose,
  pipelineMsRef,
}: MobileTopBarProps) {
  const isLive = variant === 'live'
  const iconSize = 20

  return (
    <header className={`mobile-topbar-v2${isLive ? ' mobile-topbar-v2--live' : ''}`}>
      <div className="mobile-topbar-v2-left">
        {showGalleryButton && onOpenGallery && (
          <>
            <button
              className="mobile-topbar-v2-icon"
              type="button"
              onClick={onOpenGallery}
              aria-label="Open library"
            >
              <Icon name="photo_library" size={iconSize} />
            </button>
            {isLive && (
              <>
                <span className="mobile-topbar-v2-live-badge">LIVE</span>
                {pipelineMsRef && (
                  <span
                    ref={pipelineMsRef}
                    className="mobile-pipeline-ms mobile-pipeline-ms--live"
                    hidden
                  />
                )}
              </>
            )}
          </>
        )}
      </div>

      <div className="mobile-topbar-v2-center">
        <button className="mobile-topbar-v2-brand" type="button" onClick={onAbout} title="About">
          <img src="/brand/anonymizer-wordmark.png" alt="ANONYMIZER" />
        </button>
      </div>

      <div className="mobile-topbar-v2-right">
        {isLive && onClose && (
          <button className="mobile-topbar-v2-icon" type="button" onClick={onClose} aria-label="Close">
            <Icon name="close" size={iconSize} />
          </button>
        )}
        {!isLive && showLiveButton && onLiveMode && (
          <button className="mobile-topbar-v2-live-pill" type="button" onClick={onLiveMode}>
            <Icon name="videocam" size={16} />
            <span className="mobile-topbar-v2-live-full">LIVE MODE</span>
            <span className="mobile-topbar-v2-live-short">LIVE</span>
          </button>
        )}
      </div>
    </header>
  )
})
