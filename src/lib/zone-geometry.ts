import type { Zone, BoundingBox } from '../types'

/** Rebase retained masks into the actual (pixel-rounded) crop; discard only disjoint masks. */
export function cropZones(zones: Zone[], crop: BoundingBox): Zone[] {
  if (crop.width <= 0 || crop.height <= 0) return []
  const transform = (box: BoundingBox): BoundingBox | null => {
    const x = Math.max(box.x, crop.x), y = Math.max(box.y, crop.y)
    const right = Math.min(box.x + box.width, crop.x + crop.width)
    const bottom = Math.min(box.y + box.height, crop.y + crop.height)
    if (right <= x || bottom <= y) return null
    return { x: (x - crop.x) / crop.width, y: (y - crop.y) / crop.height,
      width: (right - x) / crop.width, height: (bottom - y) / crop.height }
  }
  return zones.flatMap((zone) => {
    const box = transform(zone)
    if (!box) return []
    const detected = zone.detectX != null && zone.detectY != null && zone.detectWidth != null && zone.detectHeight != null
      ? transform({ x: zone.detectX, y: zone.detectY, width: zone.detectWidth, height: zone.detectHeight }) : null
    // Clipping an ellipse changes its geometry; a rectangle conservatively retains all protected pixels.
    return [{ ...zone, ...box, maskShape: 'rectangle' as const,
      detectX: detected?.x, detectY: detected?.y, detectWidth: detected?.width, detectHeight: detected?.height }]
  })
}
