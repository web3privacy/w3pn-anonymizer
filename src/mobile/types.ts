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
export const MOBILE_BREAKPOINT_PX = 1024
