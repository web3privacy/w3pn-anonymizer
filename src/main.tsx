import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import '@fontsource-variable/archivo/wdth.css'
import './index.css'
import './button-system.css'

function syncViewportHeight() {
  const viewport = window.visualViewport
  const height = Math.round(Math.max(
    viewport?.height ?? 0,
    window.innerHeight,
    document.documentElement.clientHeight,
  ))
  document.documentElement.style.setProperty('--app-viewport-height', `${height}px`)
}

syncViewportHeight()
window.addEventListener('resize', syncViewportHeight, { passive: true })
window.visualViewport?.addEventListener('resize', syncViewportHeight, { passive: true })
window.visualViewport?.addEventListener('scroll', syncViewportHeight, { passive: true })

function dismissNativeBoot() {
  const boot = document.getElementById('native-boot')
  if (!boot) return

  boot.classList.add('native-boot--hide')
  window.setTimeout(() => boot.remove(), 220)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

requestAnimationFrame(dismissNativeBoot)
