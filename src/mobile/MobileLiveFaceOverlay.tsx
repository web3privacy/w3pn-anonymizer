import { useEffect, useRef, useState, type RefObject } from 'react'
import { Icon } from '../components/Icon'
import { liveZoneDisplayRect } from '../lib/face-offset'
import type { LiveZoneInfo } from '../lib/live-camera'

interface MobileLiveFaceOverlayProps {
  canvasRef: RefObject<HTMLCanvasElement | null>
  zonesRef: RefObject<LiveZoneInfo[]>
  ignoredFaceIds: Set<string>
  displayFit: 'contain' | 'cover'
  faceOffsetPercent: number
  onToggleFace: (id: string) => void
}

/**
 * Draws a removal box over each tracked live face. Tapping anywhere on the box
 * opts a face OUT of anonymization (kept un-blurred, remembered by track id).
 *
 * Perf: the React tree only re-renders when the SET of face ids changes. Box
 * positions are written straight to the DOM in the rAF loop (no setState, no
 * reconciliation per frame) so the overlay never competes with the camera loop.
 */
export function MobileLiveFaceOverlay({
  canvasRef,
  zonesRef,
  ignoredFaceIds,
  displayFit,
  faceOffsetPercent,
  onToggleFace,
}: MobileLiveFaceOverlayProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const boxRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map())
  const [ids, setIds] = useState<string[]>([])
  const idsKeyRef = useRef('')

  useEffect(() => {
    let raf = 0
    let cachedRect: DOMRect | null = null
    let cachedRootRect: DOMRect | null = null
    let layoutDirty = true

    const invalidateLayout = () => {
      layoutDirty = true
    }

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(invalidateLayout) : null
    const canvas = canvasRef.current
    const root = rootRef.current
    if (ro && canvas) ro.observe(canvas)
    if (ro && root) ro.observe(root)

    const update = () => {
      raf = requestAnimationFrame(update)
      const canvasEl = canvasRef.current
      const rootEl = rootRef.current
      const zones = zonesRef.current ?? []

      const key = zones.map((z) => z.id).join(',')
      if (key !== idsKeyRef.current) {
        idsKeyRef.current = key
        setIds(zones.map((z) => z.id))
      }

      if (!canvasEl || !rootEl || canvasEl.width === 0 || zones.length === 0) return

      if (layoutDirty || !cachedRect || !cachedRootRect) {
        cachedRect = canvasEl.getBoundingClientRect()
        cachedRootRect = rootEl.getBoundingClientRect()
        layoutDirty = false
      }
      const rect = cachedRect
      const rootRect = cachedRootRect
      const bw = canvasEl.width
      const bh = canvasEl.height
      const scale = displayFit === 'cover'
        ? Math.max(rect.width / bw, rect.height / bh)
        : Math.min(rect.width / bw, rect.height / bh)
      const imgW = bw * scale
      const imgH = bh * scale
      const ox = (rect.width - imgW) / 2
      const oy = (rect.height - imgH) / 2
      const baseLeft = rect.left - rootRect.left
      const baseTop = rect.top - rootRect.top

      for (const z of zones) {
        const el = boxRefs.current.get(z.id)
        if (!el) continue
        const zoneRect = liveZoneDisplayRect(z, faceOffsetPercent)
        el.style.transform = `translate(${baseLeft + ox + zoneRect.x * imgW}px, ${baseTop + oy + zoneRect.y * imgH}px)`
        el.style.width = `${zoneRect.width * imgW}px`
        el.style.height = `${zoneRect.height * imgH}px`
      }
    }
    raf = requestAnimationFrame(update)
    return () => {
      cancelAnimationFrame(raf)
      ro?.disconnect()
    }
  }, [canvasRef, zonesRef, displayFit, faceOffsetPercent])

  return (
    <div ref={rootRef} className="mobile-live-face-overlay" aria-hidden={ids.length === 0}>
      {ids.map((id) => {
        const ignored = ignoredFaceIds.has(id)
        return (
          <button
            key={id}
            type="button"
            ref={(node) => { boxRefs.current.set(id, node) }}
            className={`mobile-live-face-box${ignored ? ' mobile-live-face-box--ignored' : ''}`}
            onClick={() => onToggleFace(id)}
            aria-label={ignored ? 'Restore anonymization for this face' : 'Exclude this face from anonymization'}
          >
            <span className="mobile-live-face-toggle" aria-hidden="true">
              <Icon name={ignored ? 'add' : 'close'} size={14} />
            </span>
          </button>
        )
      })}
    </div>
  )
}
