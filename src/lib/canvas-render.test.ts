import { describe, it, expect } from 'vitest'
import { selectBaseDrawSource, shouldShowZoneOverlays, viewerBackgroundColor } from './canvas-render'

function canvas(w = 100, h = 100): HTMLCanvasElement {
  const c = { width: w, height: h } as HTMLCanvasElement
  return c
}

describe('selectBaseDrawSource', () => {
  const source = canvas()

  it('returns work source by default', () => {
    expect(selectBaseDrawSource({
      source, batchPreview: null, batchPanelOpen: false,
      transformPreview: null, adjFlyoutOpen: false, transformPanelOpen: false,
      qualityPreview: null, previewFormat: 'image/jpeg',
    })).toBe(source)
  })

  it('prefers batch preview when panel is open', () => {
    const batch = canvas()
    expect(selectBaseDrawSource({
      source, batchPreview: batch, batchPanelOpen: true,
      transformPreview: canvas(), adjFlyoutOpen: true, transformPanelOpen: false,
      qualityPreview: canvas(), previewFormat: 'image/jpeg',
    })).toBe(batch)
  })

  it('prefers transform preview over quality preview', () => {
    const transform = canvas()
    const quality = canvas()
    expect(selectBaseDrawSource({
      source, batchPreview: null, batchPanelOpen: false,
      transformPreview: transform, adjFlyoutOpen: true, transformPanelOpen: false,
      qualityPreview: quality, previewFormat: 'image/jpeg',
    })).toBe(transform)
  })

  it('uses quality preview for lossy formats when no transform flyout', () => {
    const quality = canvas()
    expect(selectBaseDrawSource({
      source, batchPreview: null, batchPanelOpen: false,
      transformPreview: null, adjFlyoutOpen: false, transformPanelOpen: false,
      qualityPreview: quality, previewFormat: 'image/jpeg',
    })).toBe(quality)
  })

  it('skips quality preview for lossless PNG', () => {
    const quality = canvas()
    expect(selectBaseDrawSource({
      source, batchPreview: null, batchPanelOpen: false,
      transformPreview: null, adjFlyoutOpen: false, transformPanelOpen: false,
      qualityPreview: quality, previewFormat: 'image/png',
    })).toBe(source)
  })

  it('ignores zero-width preview canvases', () => {
    const empty = canvas(0, 0)
    expect(selectBaseDrawSource({
      source, batchPreview: empty, batchPanelOpen: true,
      transformPreview: null, adjFlyoutOpen: false, transformPanelOpen: false,
      qualityPreview: null, previewFormat: 'image/jpeg',
    })).toBe(source)
  })
})

describe('shouldShowZoneOverlays', () => {
  const base = {
    showBoxes: true, toolMode: 'brush', adjFlyoutOpen: false, transformPanelOpen: false,
    hasDistortPreview: false, colorPanelOpen: false, isColorNoop: true, mobileGestureActive: false,
  }

  it('shows when all gates pass', () => {
    expect(shouldShowZoneOverlays(base)).toBe(true)
  })

  it('hides in crop mode', () => {
    expect(shouldShowZoneOverlays({ ...base, toolMode: 'crop' })).toBe(false)
  })

  it('hides during color preview', () => {
    expect(shouldShowZoneOverlays({ ...base, colorPanelOpen: true, isColorNoop: false })).toBe(false)
  })

  it('hides during distort preview flyout', () => {
    expect(shouldShowZoneOverlays({ ...base, transformPanelOpen: true, hasDistortPreview: true })).toBe(false)
  })

  it('hides during mobile gesture', () => {
    expect(shouldShowZoneOverlays({ ...base, mobileGestureActive: true })).toBe(false)
  })
})

describe('viewerBackgroundColor', () => {
  it('returns theme-specific fills', () => {
    expect(viewerBackgroundColor('dark')).toBe('#080808')
    expect(viewerBackgroundColor('light')).toBe('#e8e9ec')
  })
})
