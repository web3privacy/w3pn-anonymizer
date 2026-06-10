import { useCallback, useRef, useState, type RefObject } from 'react'
import { pushSnapshot, popSnapshot } from '../lib/undo-stack'

export interface UseUndoStackParams {
  /** The working canvas whose pixels are snapshotted. */
  workCanvasRef: RefObject<HTMLCanvasElement | null>
  /** Lazily-resolved 2D context for the working canvas. */
  getWorkCtx: () => CanvasRenderingContext2D | null
  /** Re-render the visible canvas after a restore. */
  renderCanvas: () => void
  /** Mark the active photo dirty after a restore. */
  setActiveDirty: (dirty: boolean) => void
}

export interface UndoStackApi {
  /** Number of snapshots currently held (drives UI enablement). */
  undoCount: number
  /** Capture the current canvas state. */
  pushUndo: () => void
  /** Restore the most recent snapshot. */
  undo: () => void
  /** Clear all snapshots (e.g. when switching/resetting a photo). */
  resetUndo: () => void
}

/**
 * Encapsulates the editor's bounded canvas undo stack. Extracted from App.tsx
 * so the snapshot bookkeeping lives in one tested place; behavior is identical
 * to the previous inline implementation.
 */
export function useUndoStack({
  workCanvasRef,
  getWorkCtx,
  renderCanvas,
  setActiveDirty,
}: UseUndoStackParams): UndoStackApi {
  const [undoCount, setUndoCount] = useState(0)
  const undoStackRef = useRef<ImageData[]>([])

  const pushUndo = useCallback(() => {
    const wc = workCanvasRef.current
    if (!wc || wc.width === 0) return
    const ctx = getWorkCtx()
    if (!ctx) return
    const snap = ctx.getImageData(0, 0, wc.width, wc.height)
    undoStackRef.current = pushSnapshot(undoStackRef.current, snap)
    setUndoCount(undoStackRef.current.length)
  }, [workCanvasRef, getWorkCtx])

  const undo = useCallback(() => {
    const { snapshot, rest } = popSnapshot(undoStackRef.current)
    if (!snapshot) return
    undoStackRef.current = rest
    setUndoCount(rest.length)
    const wc = workCanvasRef.current
    const ctx = getWorkCtx()
    if (!wc || !ctx) return
    ctx.putImageData(snapshot, 0, 0)
    setActiveDirty(true)
    renderCanvas()
  }, [workCanvasRef, getWorkCtx, renderCanvas, setActiveDirty])

  const resetUndo = useCallback(() => {
    undoStackRef.current = []
    setUndoCount(0)
  }, [])

  return { undoCount, pushUndo, undo, resetUndo }
}
