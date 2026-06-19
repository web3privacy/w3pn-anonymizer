import { describe, it, expect } from 'vitest'
import type { ColorAdjustments, NormalizeSettings, PhotoItem } from '../types'
import { DEFAULT_COLOR_ADJUSTMENTS } from '../types'
import {
  selectBatchPhotos,
  resolveBatchConcurrency,
  resolvePhotoColorAdj,
  validateNormalizeBatchStart,
  formatBatchCompleteNotice,
} from './batch-normalize'

const baseSettings = {
  cropMode: 'none',
  templateCropNormalized: null,
} as NormalizeSettings

function photo(id: string, overrides: Partial<PhotoItem> = {}): PhotoItem {
  return {
    id,
    name: `${id}.jpg`,
    mimeType: 'image/jpeg',
    blob: new Blob(),
    previewUrl: `blob:${id}`,
    source: 'upload',
    isVideo: false,
    edited: false,
    ...overrides,
  }
}

describe('selectBatchPhotos', () => {
  it('returns all processable image photos when nothing is selected', () => {
    const photos = [
      photo('a'),
      photo('b', { isVideo: true }),
      photo('c'),
      photo('d', { isAudio: true }),
      photo('e', { isDocument: true }),
    ]
    expect(selectBatchPhotos(photos, new Set())).toEqual([photo('a'), photo('c')])
  })

  it('returns only selected processable image photos when selection is non-empty', () => {
    const photos = [photo('a'), photo('b'), photo('c', { isVideo: true }), photo('d')]
    expect(selectBatchPhotos(photos, new Set(['b', 'c', 'd']))).toEqual([photo('b'), photo('d')])
  })
})

describe('resolveBatchConcurrency', () => {
  it('clamps to 1–8 and floors non-integers', () => {
    expect(resolveBatchConcurrency(0)).toBe(1)
    expect(resolveBatchConcurrency(2.9)).toBe(2)
    expect(resolveBatchConcurrency(12)).toBe(8)
    expect(resolveBatchConcurrency(Number.NaN)).toBe(1)
  })
})

describe('resolvePhotoColorAdj', () => {
  it('uses per-photo override when present', () => {
    const override: ColorAdjustments = { ...DEFAULT_COLOR_ADJUSTMENTS, brightness: 20 }
    expect(resolvePhotoColorAdj('p1', DEFAULT_COLOR_ADJUSTMENTS, { p1: override })).toEqual(override)
  })

  it('falls back to global sliders only when they differ from defaults', () => {
    const global: ColorAdjustments = { ...DEFAULT_COLOR_ADJUSTMENTS, contrast: 10 }
    expect(resolvePhotoColorAdj('p1', global, {})).toEqual(global)
    expect(resolvePhotoColorAdj('p1', DEFAULT_COLOR_ADJUSTMENTS, {})).toBeNull()
  })
})

describe('validateNormalizeBatchStart', () => {
  it('blocks empty library and empty batch', () => {
    expect(validateNormalizeBatchStart([], baseSettings, [])).toBe('Load photos first.')
    expect(validateNormalizeBatchStart([photo('a')], baseSettings, [])).toBe('No photos selected for batch.')
  })

  it('requires a crop template when crop mode is template', () => {
    const settings = { ...baseSettings, cropMode: 'template' as const, templateCropNormalized: null }
    expect(validateNormalizeBatchStart([photo('a')], settings, [photo('a')])).toBe('Set a crop template first.')
  })
})

describe('formatBatchCompleteNotice', () => {
  it('reports savings when there are successes', () => {
    expect(formatBatchCompleteNotice(3, 1, 1000, 400)).toBe('Batch: 3 done · 1 errors. Saved ~60%')
  })

  it('reports no successes without savings', () => {
    expect(formatBatchCompleteNotice(0, 2, 500, 500)).toBe('Batch complete — no successes.')
  })
})
