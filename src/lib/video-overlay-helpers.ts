import { type VideoContentLayout, videoOverlayLayerStyle } from './video-layout'

export const waitForUi = () => new Promise<void>((resolve) => window.setTimeout(resolve, 0))

export const syncVideoOverlayCanvasDisplay = (
  overlay: HTMLCanvasElement,
  layout: VideoContentLayout | null,
) => {
  Object.assign(overlay.style, {
    width: '100%',
    height: '100%',
    ...(videoOverlayLayerStyle(layout) ?? {}),
  })
}

export const paintVideoPreviewOverlay = (
  overlay: HTMLCanvasElement,
  source: CanvasImageSource,
  sourceW: number,
  sourceH: number,
  layout: VideoContentLayout | null,
) => {
  overlay.width = sourceW
  overlay.height = sourceH
  overlay.getContext('2d')!.drawImage(source, 0, 0)
  syncVideoOverlayCanvasDisplay(overlay, layout)
  overlay.classList.add('visible')
}

export const waitForVideoFrame = (video: HTMLVideoElement): Promise<void> =>
  new Promise((resolve) => {
    if (video.seeking) {
      video.addEventListener('seeked', () => resolve(), { once: true })
      return
    }
    // Paused video does not present new frames — rVFC never fires.
    if (video.paused || video.ended) {
      requestAnimationFrame(() => resolve())
      return
    }
    if (typeof video.requestVideoFrameCallback === 'function') {
      video.requestVideoFrameCallback(() => resolve())
      return
    }
    requestAnimationFrame(() => resolve())
  })
