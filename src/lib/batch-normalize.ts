import type { BatchTaskId, ColorAdjustments, NormalizeSettings, PhotoItem } from '../types'

/** Photos eligible for batch normalize (non-video), honoring explicit selection. */
export function selectBatchPhotos(photos: PhotoItem[], selectedForBatch: Set<string>): PhotoItem[] {
  return selectedForBatch.size > 0
    ? photos.filter((p) => selectedForBatch.has(p.id) && !p.isVideo)
    : photos.filter((p) => !p.isVideo)
}

export function resolveBatchConcurrency(batchConcurrency: number): number {
  return Math.max(1, Math.min(8, Math.floor(Number.isFinite(batchConcurrency) ? batchConcurrency : 1)))
}

export function shouldRunFormatStep(activeBatchTasks: Set<BatchTaskId>): boolean {
  return activeBatchTasks.has('format') || activeBatchTasks.has('resize') || activeBatchTasks.has('crop')
}

export function isColorAdjActive(colorAdj: ColorAdjustments): boolean {
  return colorAdj.brightness !== 0 || colorAdj.contrast !== 0
    || colorAdj.saturation !== 0 || colorAdj.shadows !== 0
    || colorAdj.highlights !== 0 || colorAdj.preset !== 'none'
}

/** Per-photo color override wins; otherwise global sliders apply when any are non-default. */
export function resolvePhotoColorAdj(
  photoId: string,
  colorAdj: ColorAdjustments,
  colorAdjByPhoto: Record<string, ColorAdjustments>,
): ColorAdjustments | null {
  return colorAdjByPhoto[photoId] ?? (isColorAdjActive(colorAdj) ? colorAdj : null)
}

export function validateNormalizeBatchStart(
  photos: PhotoItem[],
  settings: NormalizeSettings,
  batch: PhotoItem[],
): string | null {
  if (photos.length === 0) return 'Load photos first.'
  if (settings.cropMode === 'template' && !settings.templateCropNormalized) return 'Set a crop template first.'
  if (batch.length === 0) return 'No photos selected for batch.'
  return null
}

export function computeBatchEta(completed: number, batchLength: number, startedAt: number, now = Date.now()): number {
  const elapsed = Math.max(1, (now - startedAt) / 1000)
  return completed > 0 ? Math.max(0, Math.round((batchLength - completed) / (completed / elapsed))) : 0
}

export function formatBatchCompleteNotice(
  success: number,
  failed: number,
  inputBytes: number,
  outputBytes: number,
): string {
  if (success === 0) return 'Batch complete — no successes.'
  const saved = inputBytes > 0 ? Math.round((1 - outputBytes / inputBytes) * 100) : 0
  return `Batch: ${success} done${failed > 0 ? ` · ${failed} errors` : ''}. Saved ~${saved}%`
}
