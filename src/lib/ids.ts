import type { CustomImageAsset } from '../types'

/** Generate a unique id, preferring crypto.randomUUID with a timestamp fallback. */
export const createId = (): string =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

/** Deterministic 32-bit FNV-1a hash of a string/number seed. */
export const hashString = (value: string | number | undefined): number => {
  const text = String(value ?? 'custom-image')
  let hash = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** Deterministically pick a ready custom-image asset id from a seed. */
export const pickCustomImageAssetId = (
  assets: CustomImageAsset[],
  seed: string | number,
): string | undefined => {
  const ready = assets.filter((asset) => asset.imageBitmap)
  if (ready.length === 0) return undefined
  return ready[Math.abs(hashString(seed)) % ready.length]?.id
}

/** Stable seed for a brush stamp at a given image-space coordinate. */
export const brushStampSeed = (photoId: string, imageX: number, imageY: number): string =>
  `${photoId}:${Math.round(imageX)}:${Math.round(imageY)}`
