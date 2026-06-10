import { isLosslessFormat } from './image-encoders'
import type { NormalizeFormat } from '../types'

export interface SelectDrawSourceInput {
  source: HTMLCanvasElement
  batchPreview: HTMLCanvasElement | null
  batchPanelOpen: boolean
  transformPreview: HTMLCanvasElement | null
  adjFlyoutOpen: boolean
  transformPanelOpen: boolean
  qualityPreview: HTMLCanvasElement | null
  previewFormat: NormalizeFormat
}

/**
 * Choose which canvas to draw in the viewport. Priority:
 * batch preview → transform preview → quality preview → work canvas.
 */
export function selectBaseDrawSource(input: SelectDrawSourceInput): HTMLCanvasElement {
  const {
    source, batchPreview, batchPanelOpen, transformPreview,
    adjFlyoutOpen, transformPanelOpen, qualityPreview, previewFormat,
  } = input
  if (batchPreview && batchPreview.width > 0 && batchPanelOpen) return batchPreview
  if (transformPreview && transformPreview.width > 0 && (adjFlyoutOpen || transformPanelOpen)) {
    return transformPreview
  }
  if (qualityPreview && qualityPreview.width > 0 && !isLosslessFormat(previewFormat)) {
    return qualityPreview
  }
  return source
}

export interface ZoneOverlayVisibilityInput {
  showBoxes: boolean
  toolMode: string
  adjFlyoutOpen: boolean
  transformPanelOpen: boolean
  hasDistortPreview: boolean
  colorPanelOpen: boolean
  isColorNoop: boolean
  mobileGestureActive: boolean
}

/** Whether zone outlines should be drawn on the viewport canvas. */
export function shouldShowZoneOverlays(input: ZoneOverlayVisibilityInput): boolean {
  const previewing = (
    (input.adjFlyoutOpen || input.transformPanelOpen) && input.hasDistortPreview
  ) || (!input.isColorNoop && input.colorPanelOpen)
  return input.showBoxes
    && input.toolMode !== 'crop'
    && !previewing
    && !input.mobileGestureActive
}

/** Viewer background fill for the current theme. */
export const viewerBackgroundColor = (theme: 'dark' | 'light'): string =>
  theme === 'dark' ? '#080808' : '#e8e9ec'
