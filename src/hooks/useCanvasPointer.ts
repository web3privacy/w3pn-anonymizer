import {
  useCallback,
  useRef,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react'
import {
  clamp,
  makeNormalizedRect,
  zoneContainsNormalized,
  type DrawTransform,
  type PointerMap,
} from '../lib/canvas-geometry'
import {
  clearOverlayCanvas,
  computeBrushRadius,
  computeBrushSizeFromWheel,
  computeBrushStrengthFromWheel,
  computeEraserPatchBounds,
  drawBrushSizeRing,
  isNearZoneResizeHandle,
  shouldApplyBrushStroke,
} from '../lib/canvas-pointer'
import { CLEAR_DETECT_FIELDS, zonesWithFaceOffset } from '../lib/face-offset'
import { applyEffectBrush, previewEffectBrush } from '../lib/effects'
import { createId } from '../lib/ids'
import type {
  AnonymizeEffectId,
  EffectRenderOptions,
  NormalizedRect,
  NormalizeCropMode,
  NormalizeSettings,
  PhotoItem,
  ToolMode,
  Zone,
} from '../types'

export type PointerSession =
  | { mode: 'idle' }
  | { mode: 'brush'; lastPointer: PointerMap | null }
  | { mode: 'move-zone'; zoneId: string; offsetX: number; offsetY: number }
  | { mode: 'resize-zone'; zoneId: string }
  | { mode: 'create-zone'; startX: number; startY: number }
  | { mode: 'normalize-crop'; startX: number; startY: number }
  | { mode: 'crop-draw'; startX: number; startY: number }

export interface BrushStamp {
  seed: string
  emoji: string
  customImageAssetId?: string
}

export interface UseCanvasPointerParams {
  canvasRef: RefObject<HTMLCanvasElement | null>
  overlayCanvasRef: RefObject<HTMLCanvasElement | null>
  workCanvasRef: RefObject<HTMLCanvasElement | null>
  transformRef: MutableRefObject<DrawTransform>
  brushSizeRef: MutableRefObject<number>
  brushDebounceRef: MutableRefObject<ReturnType<typeof setTimeout> | null>
  eraserActiveRef: MutableRefObject<boolean>
  renderCanvasRef: MutableRefObject<() => void>
  mobileCanvasEditRef: MutableRefObject<boolean>

  activePhoto: PhotoItem | null
  toolMode: ToolMode
  batchPanelOpen: boolean
  isMobile: boolean
  isNormalizeCropPicking: boolean
  normalizeSettingsCropMode: NormalizeCropMode
  normalizeCropDraft: NormalizedRect | null
  draftZone: Zone | null
  effectiveZones: Zone[]
  detectFaceOffset: number
  selectedEffect: AnonymizeEffectId
  brushStrength: number
  originalBlobByPhoto: Record<string, Blob>

  getWorkCtx: () => CanvasRenderingContext2D | null
  mapPointerToImage: (clientX: number, clientY: number, clampToBounds?: boolean) => PointerMap | null
  resolveBrushStamp: (pointer: PointerMap) => BrushStamp
  resolveEmoji: () => string
  resolveCustomImageAssetId: (seed: string | number) => string | undefined
  customEffectOptions: (
    zone?: Zone | null,
    seed?: string | number,
    customImageAssetId?: string,
  ) => EffectRenderOptions
  renderCanvas: () => void
  setActiveDirty: (dirty: boolean) => void
  setNotice: (msg: string) => void
  pushUndo: () => void
  setActiveZones: (updater: (zones: Zone[]) => Zone[]) => void
  setSelectedZoneId: (id: string | null) => void
  setDraftZone: (zone: Zone | null | ((cur: Zone | null) => Zone | null)) => void
  setCropDraft: (draft: { x: number; y: number; w: number; h: number } | null) => void
  setNormalizeCropDraft: (draft: NormalizedRect | null) => void
  setIsNormalizeCropPicking: (updater: boolean | ((cur: boolean) => boolean)) => void
  updateNormalizeSetting: <K extends keyof NormalizeSettings>(
    key: K,
    value: NormalizeSettings[K],
  ) => void
  setBrushSize: (size: number) => void
  setBrushStrength: (strength: number) => void
}

export interface CanvasPointerApi {
  pointerSessionRef: MutableRefObject<PointerSession>
  handleCanvasPointerDown: (event: ReactPointerEvent<HTMLCanvasElement>) => void
  handleCanvasPointerMove: (event: ReactPointerEvent<HTMLCanvasElement>) => void
  handleCanvasPointerUp: () => void
  handleCanvasWheel: (event: React.WheelEvent<HTMLCanvasElement>) => void
  stopBrushLoop: () => void
  clearEraserSourceCache: () => void
  cleanupBrushTimers: () => void
}

/**
 * Canvas pointer/brush interactions for the editor viewer — brush strokes, eraser,
 * zone drag/resize, crop, and batch normalize crop picking.
 */
export function useCanvasPointer({
  canvasRef,
  overlayCanvasRef,
  workCanvasRef,
  transformRef,
  brushSizeRef,
  brushDebounceRef,
  eraserActiveRef,
  renderCanvasRef,
  mobileCanvasEditRef,
  activePhoto,
  toolMode,
  batchPanelOpen,
  isMobile,
  isNormalizeCropPicking,
  normalizeSettingsCropMode,
  normalizeCropDraft,
  draftZone,
  effectiveZones,
  detectFaceOffset,
  selectedEffect,
  brushStrength,
  originalBlobByPhoto,
  getWorkCtx,
  mapPointerToImage,
  resolveBrushStamp,
  resolveEmoji,
  resolveCustomImageAssetId,
  customEffectOptions,
  renderCanvas,
  setActiveDirty,
  setNotice,
  pushUndo,
  setActiveZones,
  setSelectedZoneId,
  setDraftZone,
  setCropDraft,
  setNormalizeCropDraft,
  setIsNormalizeCropPicking,
  updateNormalizeSetting,
  setBrushSize,
  setBrushStrength,
}: UseCanvasPointerParams): CanvasPointerApi {
  const pointerSessionRef = useRef<PointerSession>({ mode: 'idle' })
  const brushRafRef = useRef<number | null>(null)
  const brushActiveRef = useRef(false)
  const brushLastApplyRef = useRef(0)
  const brushEmojiRef = useRef('')
  const brushStampLockRef = useRef<BrushStamp | null>(null)
  const eraserSourceCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const eraserSourcePhotoIdRef = useRef<string | null>(null)

  const clearEraserSourceCache = useCallback(() => {
    eraserSourcePhotoIdRef.current = null
    eraserSourceCanvasRef.current = null
  }, [])

  const stopBrushLoop = useCallback(() => {
    brushActiveRef.current = false
    if (brushRafRef.current !== null) {
      cancelAnimationFrame(brushRafRef.current)
      brushRafRef.current = null
    }
  }, [])

  const startBrushLoop = useCallback(() => {
    brushActiveRef.current = true
  }, [])

  const cleanupBrushTimers = useCallback(() => {
    if (brushRafRef.current !== null) cancelAnimationFrame(brushRafRef.current)
    if (brushDebounceRef.current !== null) clearTimeout(brushDebounceRef.current)
  }, [brushDebounceRef])

  const getEraserSourceCanvas = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    if (!activePhoto || activePhoto.isVideo) return null
    const workCanvas = workCanvasRef.current
    if (eraserSourcePhotoIdRef.current === activePhoto.id && eraserSourceCanvasRef.current) {
      const cached = eraserSourceCanvasRef.current
      if (!workCanvas || (cached.width === workCanvas.width && cached.height === workCanvas.height)) {
        return cached
      }
      eraserSourcePhotoIdRef.current = null
      eraserSourceCanvasRef.current = null
    }
    const tryBlob = async (blob: Blob): Promise<HTMLCanvasElement | null> => {
      const bmp = await createImageBitmap(blob)
      if (workCanvas && (bmp.width !== workCanvas.width || bmp.height !== workCanvas.height)) {
        bmp.close()
        return null
      }
      const sourceCanvas = document.createElement('canvas')
      sourceCanvas.width = bmp.width
      sourceCanvas.height = bmp.height
      const sourceCtx = sourceCanvas.getContext('2d')
      if (!sourceCtx) {
        bmp.close()
        return null
      }
      sourceCtx.drawImage(bmp, 0, 0)
      bmp.close()
      return sourceCanvas
    }
    const original = originalBlobByPhoto[activePhoto.id]
    let sourceCanvas = original ? await tryBlob(original).catch(() => null) : null
    if (!sourceCanvas) {
      sourceCanvas = await tryBlob(activePhoto.blob).catch(() => null)
    }
    if (!sourceCanvas) return null
    eraserSourceCanvasRef.current = sourceCanvas
    eraserSourcePhotoIdRef.current = activePhoto.id
    return sourceCanvas
  }, [activePhoto, originalBlobByPhoto, workCanvasRef])

  const applyOriginalEraserAtPointer = useCallback((pointer: PointerMap) => {
    const workCanvas = workCanvasRef.current
    if (!activePhoto || !workCanvas || workCanvas.width === 0) return
    const ctx = getWorkCtx()
    if (!ctx) return
    const t = transformRef.current
    const radius = computeBrushRadius(brushSizeRef.current, t.scale)

    const drawFromSource = (sourceCanvas: HTMLCanvasElement | null) => {
      if (!sourceCanvas) return
      const { x0, y0, w, h } = computeEraserPatchBounds(
        pointer.imageX,
        pointer.imageY,
        radius,
        workCanvas.width,
        workCanvas.height,
      )
      ctx.save()
      ctx.beginPath()
      ctx.arc(pointer.imageX, pointer.imageY, radius, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(sourceCanvas, x0, y0, w, h, x0, y0, w, h)
      ctx.restore()
      setActiveDirty(true)
      renderCanvasRef.current()
    }

    const cached = eraserSourcePhotoIdRef.current === activePhoto.id ? eraserSourceCanvasRef.current : null
    if (cached) {
      drawFromSource(cached)
      return
    }
    void getEraserSourceCanvas().then(drawFromSource).catch(() => setNotice('Eraser source is not ready.'))
  }, [activePhoto, getEraserSourceCanvas, getWorkCtx, brushSizeRef, renderCanvasRef, setActiveDirty, setNotice, transformRef, workCanvasRef])

  const applyBrushAtPointer = useCallback((pointer: PointerMap) => {
    const workCanvas = workCanvasRef.current
    if (!activePhoto || !workCanvas || workCanvas.width === 0) return
    const ctx = getWorkCtx()
    if (!ctx) return
    const t = transformRef.current
    if (t.scale <= 0) return
    const radius = computeBrushRadius(brushSizeRef.current, t.scale)
    if (eraserActiveRef.current) {
      applyOriginalEraserAtPointer(pointer)
      return
    }
    const stamp = brushStampLockRef.current ?? resolveBrushStamp(pointer)
    applyEffectBrush(
      ctx,
      selectedEffect,
      pointer.imageX,
      pointer.imageY,
      radius,
      brushStrength,
      stamp.emoji,
      customEffectOptions(null, stamp.seed, stamp.customImageAssetId),
    )
    setActiveDirty(true)
    renderCanvasRef.current()
  }, [
    activePhoto,
    applyOriginalEraserAtPointer,
    brushSizeRef,
    brushStrength,
    customEffectOptions,
    eraserActiveRef,
    getWorkCtx,
    renderCanvasRef,
    resolveBrushStamp,
    selectedEffect,
    setActiveDirty,
    transformRef,
    workCanvasRef,
  ])

  const drawBrushPreview = useCallback((pointer: PointerMap | null) => {
    const overlay = overlayCanvasRef.current
    if (!overlay) return
    const octx = overlay.getContext('2d')
    if (!octx) return

    clearOverlayCanvas(overlay, octx)

    if (!pointer || !activePhoto || toolMode !== 'brush') return
    const workCanvas = workCanvasRef.current
    if (!workCanvas || workCanvas.width === 0) return

    const t = transformRef.current
    const sz = brushSizeRef.current

    if (!eraserActiveRef.current) {
      const stamp = pointerSessionRef.current.mode === 'brush' && brushStampLockRef.current
        ? brushStampLockRef.current
        : resolveBrushStamp(pointer)
      previewEffectBrush(
        octx,
        workCanvas,
        selectedEffect,
        pointer.canvasX,
        pointer.canvasY,
        sz,
        brushStrength,
        stamp.emoji,
        t,
        customEffectOptions(null, stamp.seed, stamp.customImageAssetId),
      )
    }

    drawBrushSizeRing(octx, pointer.canvasX, pointer.canvasY, sz)
  }, [
    activePhoto,
    brushSizeRef,
    brushStrength,
    customEffectOptions,
    eraserActiveRef,
    overlayCanvasRef,
    resolveBrushStamp,
    selectedEffect,
    toolMode,
    transformRef,
    workCanvasRef,
  ])

  const handleCanvasPointerDown = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (batchPanelOpen) {
      if (!activePhoto || normalizeSettingsCropMode !== 'template' || !isNormalizeCropPicking) return
      const mapped = mapPointerToImage(event.clientX, event.clientY)
      if (!mapped) return
      canvasRef.current?.setPointerCapture(event.pointerId)
      pointerSessionRef.current = { mode: 'normalize-crop', startX: mapped.normalizedX, startY: mapped.normalizedY }
      setNormalizeCropDraft(makeNormalizedRect(mapped.normalizedX, mapped.normalizedY, mapped.normalizedX + 0.001, mapped.normalizedY + 0.001))
      return
    }
    if (!activePhoto) return
    if (isMobile && !mobileCanvasEditRef.current && toolMode !== 'crop') return
    const mapped = mapPointerToImage(
      event.clientX,
      event.clientY,
      toolMode === 'crop' || toolMode === 'brush',
    )
    if (!mapped) return
    event.preventDefault()
    canvasRef.current?.setPointerCapture(event.pointerId)
    if (toolMode === 'crop') {
      pointerSessionRef.current = { mode: 'crop-draw', startX: mapped.normalizedX, startY: mapped.normalizedY }
      setCropDraft({ x: mapped.normalizedX, y: mapped.normalizedY, w: 0.001, h: 0.001 })
      return
    }
    if (toolMode === 'brush') {
      pushUndo()
      const stamp = resolveBrushStamp(mapped)
      brushStampLockRef.current = stamp
      brushEmojiRef.current = stamp.emoji
      pointerSessionRef.current = { mode: 'brush', lastPointer: mapped }
      brushLastApplyRef.current = 0
      startBrushLoop()
      applyBrushAtPointer(mapped)
      return
    }
    const t = transformRef.current
    for (let i = effectiveZones.length - 1; i >= 0; i--) {
      const zone = effectiveZones[i]
      if (!zoneContainsNormalized(zone, mapped.normalizedX, mapped.normalizedY)) continue
      setSelectedZoneId(zone.id)
      const nearHandle = isNearZoneResizeHandle(mapped.canvasX, mapped.canvasY, zone, t)
      pointerSessionRef.current = nearHandle
        ? { mode: 'resize-zone', zoneId: zone.id }
        : { mode: 'move-zone', zoneId: zone.id, offsetX: mapped.normalizedX - zone.x, offsetY: mapped.normalizedY - zone.y }
      return
    }
    pointerSessionRef.current = { mode: 'create-zone', startX: mapped.normalizedX, startY: mapped.normalizedY }
    const zoneId = createId()
    setDraftZone({
      id: zoneId,
      x: mapped.normalizedX,
      y: mapped.normalizedY,
      width: 0.001,
      height: 0.001,
      effect: selectedEffect,
      emoji: resolveEmoji(),
      detectionType: 'manual_zone',
      customImageAssetId: selectedEffect === 'custom-image'
        ? resolveCustomImageAssetId(zoneId)
        : undefined,
    })
    setSelectedZoneId(null)
  }, [
    activePhoto,
    applyBrushAtPointer,
    batchPanelOpen,
    canvasRef,
    effectiveZones,
    isMobile,
    isNormalizeCropPicking,
    mapPointerToImage,
    mobileCanvasEditRef,
    normalizeSettingsCropMode,
    pushUndo,
    resolveBrushStamp,
    resolveCustomImageAssetId,
    resolveEmoji,
    selectedEffect,
    setCropDraft,
    setDraftZone,
    setNormalizeCropDraft,
    setSelectedZoneId,
    startBrushLoop,
    toolMode,
    transformRef,
  ])

  const handleCanvasPointerMove = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    const session = pointerSessionRef.current
    const mapped = mapPointerToImage(
      event.clientX,
      event.clientY,
      session.mode === 'brush' || session.mode === 'crop-draw',
    )

    if (batchPanelOpen) {
      if (session.mode === 'normalize-crop' && mapped) {
        setNormalizeCropDraft(makeNormalizedRect(session.startX, session.startY, mapped.normalizedX, mapped.normalizedY))
        renderCanvas()
      }
      return
    }

    if (toolMode === 'brush') drawBrushPreview(mapped)

    if (session.mode === 'crop-draw' && mapped) {
      setCropDraft({
        x: Math.min(session.startX, mapped.normalizedX),
        y: Math.min(session.startY, mapped.normalizedY),
        w: Math.abs(mapped.normalizedX - session.startX),
        h: Math.abs(mapped.normalizedY - session.startY),
      })
      renderCanvas()
      return
    }

    if (session.mode === 'idle' || !mapped) { renderCanvas(); return }
    if (session.mode === 'brush') {
      if (brushActiveRef.current && mapped) {
        const now = performance.now()
        if (shouldApplyBrushStroke(now, brushLastApplyRef.current, isMobile)) {
          brushLastApplyRef.current = now
          applyBrushAtPointer(mapped)
        }
      }
      return
    }
    if (session.mode === 'create-zone') {
      setDraftZone((cur) => cur ? {
        ...cur,
        x: Math.min(session.startX, mapped.normalizedX),
        y: Math.min(session.startY, mapped.normalizedY),
        width: Math.abs(mapped.normalizedX - session.startX),
        height: Math.abs(mapped.normalizedY - session.startY),
      } : null)
      renderCanvas()
      return
    }
    if (session.mode === 'move-zone') {
      setActiveZones((zones) => zones.map((z) => {
        if (z.id !== session.zoneId) return z
        const eff = zonesWithFaceOffset([z], detectFaceOffset)[0]
        return {
          ...z,
          ...CLEAR_DETECT_FIELDS,
          x: clamp(mapped.normalizedX - session.offsetX, 0, 1 - eff.width),
          y: clamp(mapped.normalizedY - session.offsetY, 0, 1 - eff.height),
          width: eff.width,
          height: eff.height,
        }
      }))
      renderCanvas()
      return
    }
    if (session.mode === 'resize-zone') {
      setActiveZones((zones) => zones.map((z) => {
        if (z.id !== session.zoneId) return z
        const eff = zonesWithFaceOffset([z], detectFaceOffset)[0]
        return {
          ...z,
          ...CLEAR_DETECT_FIELDS,
          x: eff.x,
          y: eff.y,
          width: clamp(mapped.normalizedX - eff.x, 0.02, 1 - eff.x),
          height: clamp(mapped.normalizedY - eff.y, 0.02, 1 - eff.y),
        }
      }))
      renderCanvas()
    }
  }, [
    applyBrushAtPointer,
    batchPanelOpen,
    detectFaceOffset,
    drawBrushPreview,
    isMobile,
    mapPointerToImage,
    renderCanvas,
    setActiveZones,
    setCropDraft,
    setDraftZone,
    setNormalizeCropDraft,
    toolMode,
  ])

  const handleCanvasPointerUp = useCallback(() => {
    if (batchPanelOpen) {
      const s = pointerSessionRef.current
      if (s.mode === 'normalize-crop' && normalizeCropDraft && normalizeCropDraft.width >= 0.01 && normalizeCropDraft.height >= 0.01) {
        updateNormalizeSetting('templateCropNormalized', normalizeCropDraft)
        setNotice('Crop template saved.')
      } else if (s.mode === 'normalize-crop') {
        setNotice('Selection too small — try again.')
      }
      setNormalizeCropDraft(null)
      setIsNormalizeCropPicking(false)
      pointerSessionRef.current = { mode: 'idle' }
      renderCanvas()
      return
    }
    const s = pointerSessionRef.current
    if (s.mode === 'brush') {
      stopBrushLoop()
      brushStampLockRef.current = null
      const overlay = overlayCanvasRef.current
      if (overlay) {
        const octx = overlay.getContext('2d')
        if (octx) octx.clearRect(0, 0, overlay.width, overlay.height)
      }
    }
    if (s.mode === 'crop-draw') {
      pointerSessionRef.current = { mode: 'idle' }
      renderCanvas()
      return
    }
    if (s.mode === 'create-zone' && draftZone && draftZone.width > 0.01 && draftZone.height > 0.01) {
      const committed = { ...draftZone, id: createId() }
      setActiveZones((zones) => [...zones, committed])
      setSelectedZoneId(committed.id)
    }
    setDraftZone(null)
    pointerSessionRef.current = { mode: 'idle' }
    renderCanvas()
  }, [
    batchPanelOpen,
    draftZone,
    normalizeCropDraft,
    overlayCanvasRef,
    renderCanvas,
    setActiveZones,
    setDraftZone,
    setIsNormalizeCropPicking,
    setNormalizeCropDraft,
    setNotice,
    setSelectedZoneId,
    stopBrushLoop,
    updateNormalizeSetting,
  ])

  const handleCanvasWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    if (toolMode !== 'brush') return
    e.preventDefault()
    if (e.altKey) {
      setBrushStrength(computeBrushStrengthFromWheel(e.deltaY, brushStrength))
      return
    }
    const next = computeBrushSizeFromWheel(e.deltaY, e.ctrlKey, brushSizeRef.current)
    brushSizeRef.current = next
    const canvas = canvasRef.current
    if (canvas) {
      const bounds = canvas.getBoundingClientRect()
      const cx = e.clientX - bounds.left
      const cy = e.clientY - bounds.top
      const overlay = overlayCanvasRef.current
      if (overlay) {
        const octx = overlay.getContext('2d')
        if (octx) {
          clearOverlayCanvas(overlay, octx)
          drawBrushSizeRing(octx, cx, cy, next)
        }
      }
    }
    if (brushDebounceRef.current) clearTimeout(brushDebounceRef.current)
    brushDebounceRef.current = setTimeout(() => { setBrushSize(next) }, 200)
  }, [brushDebounceRef, brushSizeRef, brushStrength, canvasRef, overlayCanvasRef, setBrushSize, setBrushStrength, toolMode])

  return {
    pointerSessionRef,
    handleCanvasPointerDown,
    handleCanvasPointerMove,
    handleCanvasPointerUp,
    handleCanvasWheel,
    stopBrushLoop,
    clearEraserSourceCache,
    cleanupBrushTimers,
  }
}
