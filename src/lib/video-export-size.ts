export interface VideoExportSize {
  width: number
  height: number
}

export const VIDEO_MAX_EXPORT_DIMENSION = 8192

const clampVideoExportDimension = (value: number, fallback: number): number => {
  const raw = Number.isFinite(value) && value > 0 ? value : fallback
  const rounded = Math.max(2, Math.min(VIDEO_MAX_EXPORT_DIMENSION, Math.round(raw)))
  // H.264/VPx pipelines are most reliable with even dimensions.
  return rounded % 2 === 0 ? rounded : Math.max(2, rounded - 1)
}

export function resolveVideoExportSize(
  sourceWidth: number,
  sourceHeight: number,
  requested?: Partial<VideoExportSize> | null,
): VideoExportSize {
  const fallbackW = clampVideoExportDimension(sourceWidth, 2)
  const fallbackH = clampVideoExportDimension(sourceHeight, 2)
  return {
    width: clampVideoExportDimension(requested?.width ?? fallbackW, fallbackW),
    height: clampVideoExportDimension(requested?.height ?? fallbackH, fallbackH),
  }
}
