import { Icon } from '../components/Icon'

interface DesktopTopBarProps {
  busy: boolean
  onAbout: () => void
  onLoadDemo: () => void
  showDemo: boolean
  onLiveCamera: () => void
  onFeedback: () => void
}

export function DesktopTopBar({
  busy, onAbout, onLoadDemo, showDemo, onLiveCamera, onFeedback,
}: DesktopTopBarProps) {
  return (
    <header className="topbar">
      <button className="brand brand--typographic" type="button" onClick={onAbout} title="About W3PN Anonymizer">
        <img src="/brand/anonymizer-header.png" alt="ANONYMIZER" className="brand-wordmark-img" />
        <span className="brand-chevron"><Icon name="expand_more" size={14} /></span>
      </button>

      <span className="topbar-tagline">
        <span>open source</span>
        {' · private · no data collected'}
      </span>

      <div className="topbar-gap" />

      {showDemo && (
        <button
          className="topbar-demo-btn"
          type="button"
          onClick={onLoadDemo}
          disabled={busy}
          title="Load demo photos"
        >
          Demo
        </button>
      )}

      <button
        className="topbar-live-btn"
        type="button"
        onClick={onLiveCamera}
        disabled={busy}
        title="Turn on live camera"
      >
        <Icon name="videocam" size={14} />
        Live mode
      </button>

      <button
        className="topbar-demo-btn"
        type="button"
        onClick={onFeedback}
        title="Give feedback"
      >
        Give Feedback
      </button>

      <a
        className="topbar-github-link"
        href="https://github.com/web3privacy/w3pn-anonymizer"
        target="_blank"
        rel="noreferrer"
        title="View source on GitHub"
      >
        GitHub
      </a>
    </header>
  )
}
