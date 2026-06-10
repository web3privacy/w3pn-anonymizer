import { Icon } from '../components/Icon'
import type { ThemeMode } from '../types'

interface DesktopTopBarProps {
  theme: ThemeMode
  busy: boolean
  onAbout: () => void
  onLoadDemo: () => void
  onLiveCamera: () => void
  onToggleTheme: () => void
}

export function DesktopTopBar({
  theme, busy, onAbout, onLoadDemo, onLiveCamera, onToggleTheme,
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

      <button
        className="topbar-demo-btn"
        type="button"
        onClick={onLoadDemo}
        disabled={busy}
        title="Load demo photos"
      >
        Demo
      </button>

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

      <a
        className="topbar-github-link"
        href="https://github.com/web3privacy/w3pn-anonymizer"
        target="_blank"
        rel="noreferrer"
        title="View source on GitHub"
      >
        GitHub
      </a>

      <button
        className="theme-toggle-icon"
        type="button"
        onClick={onToggleTheme}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label="Toggle theme"
      >
        <Icon name={theme === 'dark' ? 'dark_mode' : 'light_mode'} size={18} />
      </button>
    </header>
  )
}
