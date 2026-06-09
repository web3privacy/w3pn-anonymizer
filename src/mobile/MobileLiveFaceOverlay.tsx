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
 * Draws a removal box over each tracked live face. Tapping the corner toggle
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
  const boxRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())
  // Stable list of currently-tracked face ids (drives the React render).
  const [ids, setIds] = useState<string[]>([])
  const idsKeyRef = useRef('')

  useEffect(() => {
    let raf = 0
    // Cache the canvas rect; recompute only when its size/position changes.
    let cachedRect: DOMRect | null = null
    let cachedRootRect: DOMRect | null = null
    let frame = 0

    const update = () => {
      raf = requestAnimationFrame(update)
      const canvas = canvasRef.current
      const root = rootRef.current
      const zones = zonesRef.current ?? []

      // Keep the rendered id set in sync (cheap string compare, rare setState).
      const key = zones.map((z) => z.id).join(',')
      if (key !== idsKeyRef.current) {
        idsKeyRef.current = key
        setIds(zones.map((z) => z.id))
      }

      if (!canvas || !root || canvas.width === 0 || zones.length === 0) return

      // getBoundingClientRect forces reflow, so only sample it a few times/sec.
      frame += 1
      if (!cachedRect || frame % 6 === 0) {
        cachedRect = canvas.getBoundingClientRect()
        cachedRootRect = root.getBoundingClientRect()
      }
      const rect = cachedRect
      const rootRect = cachedRootRect!
      const bw = canvas.width
      const bh = canvas.height
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
        const rect = liveZoneDisplayRect(z, faceOffsetPercent)
        el.style.transform = `translate(${baseLeft + ox + rect.x * imgW}px, ${baseTop + oy + rect.y * imgH}px)`
        el.style.width = `${rect.width * imgW}px`
        el.style.height = `${rect.height * imgH}px`
      }
    }
    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [canvasRef, zonesRef, displayFit, faceOffsetPercent])

  return (
    <div ref={rootRef} className="mobile-live-face-overlay" aria-hidden={ids.length === 0}>
      {ids.map((id) => {
        const ignored = ignoredFaceIds.has(id)
        return (
          <div
            key={id}
            ref={(node) => { boxRefs.current.set(id, node) }}
            className={`mobile-live-face-box${ignored ? ' mobile-live-face-box--ignored' : ''}`}
          >
            <button
              type="button"
              className="mobile-live-face-toggle"
              onClick={() => onToggleFace(id)}
              aria-label={ignored ? 'Anonymize this face' : 'Keep this face un-anonymized'}
            >
              <Icon name={ignored ? 'add' : 'close'} size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
