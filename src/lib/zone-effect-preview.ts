/** One decoded original and one staging canvas for the active photo only. */
export class ZoneEffectPreview {
  private generation = 0
  private original: Blob | null = null
  private bitmap: ImageBitmap | null = null
  private canvas: HTMLCanvasElement | null = null

  invalidate(): void { this.generation += 1 }

  dispose(): void {
    this.invalidate()
    this.bitmap?.close()
    this.bitmap = null
    this.original = null
    if (this.canvas) { this.canvas.width = 0; this.canvas.height = 0 }
    this.canvas = null
  }

  async render(
    original: Blob,
    count: number,
    applyZone: (ctx: CanvasRenderingContext2D, index: number) => void,
    commit: (canvas: HTMLCanvasElement) => void,
  ): Promise<boolean> {
    const generation = ++this.generation
    if (this.original !== original || !this.bitmap) {
      const bitmap = await createImageBitmap(original)
      if (generation !== this.generation) { bitmap.close(); return false }
      this.bitmap?.close()
      this.bitmap = bitmap
      this.original = original
    }
    // Each in-flight render owns its staging surface. A replacement may start
    // during a yield, so never let obsolete work mutate a newer preview.
    const canvas = this.canvas ?? document.createElement('canvas')
    this.canvas = null
    const bitmap = this.bitmap
    if (canvas.width !== bitmap.width) canvas.width = bitmap.width
    if (canvas.height !== bitmap.height) canvas.height = bitmap.height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return false
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(bitmap, 0, 0)
    let sliceStart = performance.now()
    for (let index = 0; index < count; index += 1) {
      if (generation !== this.generation) { canvas.width = 0; return false }
      applyZone(ctx, index)
      if (index + 1 < count && performance.now() - sliceStart >= 8) {
        await new Promise<void>((resolve) => setTimeout(resolve, 0))
        sliceStart = performance.now()
      }
    }
    if (generation !== this.generation) { canvas.width = 0; return false }
    commit(canvas)
    this.canvas = canvas
    return true
  }
}
