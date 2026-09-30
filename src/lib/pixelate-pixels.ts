/** Match the GL mosaic's block-center bilinear samples, including bottom-
 * anchored Y blocks and clamped partial edge blocks. Fast for small face ROIs. */
export function pixelatePixels(source: Uint8ClampedArray, width: number, height: number, block: number): Uint8ClampedArray {
  const output = new Uint8ClampedArray(source.length)
  const words = new Uint32Array(output.buffer)
  const colorBytes = new Uint8ClampedArray(4)
  const colorWord = new Uint32Array(colorBytes.buffer)
  for (let bottom = 0; bottom < height; bottom += block) {
    const top = Math.max(0, height - bottom - block)
    const endY = height - bottom
    const sampleY = Math.max(0, Math.min(height - 1, height - bottom - block / 2 - 0.5))
    const y0 = Math.floor(sampleY)
    const y1 = Math.min(height - 1, y0 + 1)
    const fy = sampleY - y0
    for (let left = 0; left < width; left += block) {
      const endX = Math.min(width, left + block)
      const sampleX = Math.max(0, Math.min(width - 1, left + block / 2 - 0.5))
      const x0 = Math.floor(sampleX)
      const x1 = Math.min(width - 1, x0 + 1)
      const fx = sampleX - x0
      for (let channel = 0; channel < 4; channel += 1) {
        const a = source[(y0 * width + x0) * 4 + channel]
        const b = source[(y0 * width + x1) * 4 + channel]
        const c = source[(y1 * width + x0) * 4 + channel]
        const d = source[(y1 * width + x1) * 4 + channel]
        colorBytes[channel] = Math.round((a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy)
      }
      for (let y = top; y < endY; y += 1) words.fill(colorWord[0], y * width + left, y * width + endX)
    }
  }
  return output
}
