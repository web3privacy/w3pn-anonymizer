export type MobilePanel =
  | null
  | 'gallery'
  | 'batch'
  | 'tool-face'
  | 'tool-zone'
  | 'tool-crop'
  | 'tool-adjust'
  | 'tool-distort'
  | 'tool-effects'
  | 'tool-more'
  | 'export'
  | 'video-timeline'

export type MobileMode = 'home' | 'editor' | 'live' | 'video'

/** Where the photo editor should navigate back to (e.g. after live capture). */
export type MobileEditorReturnTo = 'live' | null

export type MobileToolCategory =
  | 'face'
  | 'gallery'
  | 'zone'
  | 'crop'
  | 'adjust'
  | 'distort'
  | 'effects'
  | 'more'

// Touch-first layout through tablet width; desktop shell above this breakpoint.
/** Keep in sync with @media breakpoints in mobile.css and index.html (1024px). */
export const MOBILE_BREAKPOINT_PX = 1024
