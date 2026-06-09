import type { ReactNode } from 'react'

interface MobileEditorLayoutProps {
  chrome: ReactNode
  bottom: ReactNode
  floating?: ReactNode
  drawers?: ReactNode
  children?: ReactNode
}

/** Ensures DOM order: top chrome → canvas → bottom toolbar */
export function MobileEditorLayout({
  chrome,
  bottom,
  floating,
  drawers,
  children,
}: MobileEditorLayoutProps) {
  return (
    <>
      <div className="mobile-editor-chrome">{chrome}</div>
      {children}
      <div className="mobile-shell-bottom">{bottom}</div>
      {floating ? <div className="mobile-shell-floating">{floating}</div> : null}
      {drawers}
    </>
  )
}
