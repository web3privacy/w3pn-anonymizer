import sharp from 'sharp'

/** Max edge length for bundled preset avatars (square PNG). */
export const PRESET_IMAGE_SIZE = 256

/**
 * Normalize any input buffer to a square PNG at most PRESET_IMAGE_SIZE px.
 * Uses cover crop so all library avatars share the same framing.
 */
export async function normalizePresetImage(input, opts = {}) {
  const { fit = 'cover' } = opts
  return sharp(input, { failOn: 'none' })
    .rotate()
    .resize(PRESET_IMAGE_SIZE, PRESET_IMAGE_SIZE, {
      fit,
      position: 'centre',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer()
}
