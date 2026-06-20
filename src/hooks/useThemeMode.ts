import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { MOBILE_BREAKPOINT_PX } from '../mobile/types'
import type { ThemeMode } from '../types'

const MOBILE_THEME_QUERY = `(max-width: ${MOBILE_BREAKPOINT_PX}px)`

const getInitialTheme = (): ThemeMode => {
  if (typeof window !== 'undefined' && window.matchMedia(MOBILE_THEME_QUERY).matches) {
    return 'dark'
  }
  const s = localStorage.getItem('anonymizer-theme')
  if (s === 'light' || s === 'dark') return s
  return 'dark'
}

export interface ThemeModeApi {
  theme: ThemeMode
  setTheme: Dispatch<SetStateAction<ThemeMode>>
  /** The public app is temporarily locked to dark mode. */
  effectiveTheme: ThemeMode
}

/**
 * Owns the desktop/mobile theme: persisted selection, the effective theme, and
 * applying `data-theme` to the document. Extracted from App.tsx unchanged.
 */
export function useThemeMode(isMobile: boolean): ThemeModeApi {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)
  const effectiveTheme: ThemeMode = 'dark'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effectiveTheme)
    if (!isMobile) localStorage.setItem('anonymizer-theme', theme)
  }, [effectiveTheme, isMobile, theme])

  return { theme, setTheme, effectiveTheme }
}
