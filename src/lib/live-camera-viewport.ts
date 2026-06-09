export type LiveAspectRatio = 'native' | '16:9' | '4:3' | '1:1'
export type LiveDisplayFit = 'contain' | 'cover'

export interface LiveCameraSettings {
  aspectRatio: LiveAspectRatio
  displayFit: LiveDisplayFit
  torch: boolean
  exposureCompensation: number
  zoom: number
}

export const DEFAULT_LIVE_CAMERA_SETTINGS: LiveCameraSettings = {
  aspectRatio: 'native',
  displayFit: 'contain',
  torch: false,
  exposureCompensation: 0,
  zoom: 1,
}

export function targetAspectRatio(r: LiveAspectRatio): number | null {
  switch (r) {
    case '1:1': return 1
    case '16:9': return 16 / 9
    case '4:3': return 4 / 3
    default: return null
  }
}

export function computeSourceCrop(
  vw: number,
  vh: number,
  aspect: LiveAspectRatio,
): { sx: number; sy: number; sw: number; sh: number } {
  const target = targetAspectRatio(aspect)
  if (!target || vw <= 0 || vh <= 0) {
    return { sx: 0, sy: 0, sw: vw, sh: vh }
  }
  const srcAspect = vw / vh
  if (srcAspect > target) {
    const sh = vh
    const sw = vh * target
    return { sx: (vw - sw) / 2, sy: 0, sw, sh }
  }
  const sw = vw
  const sh = vw / target
  return { sx: 0, sy: (vh - sh) / 2, sw, sh }
}
