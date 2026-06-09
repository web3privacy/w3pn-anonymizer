import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { preloadDetector } from './lib/detector'
import '@fontsource-variable/archivo/wdth.css'
import './index.css'

preloadDetector()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
