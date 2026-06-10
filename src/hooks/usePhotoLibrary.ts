import {
  useCallback,
  useRef,
  useState,
  type Dispatch,
  type DragEvent,
  type MutableRefObject,
  type RefObject,
  type SetStateAction,
} from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { bakePhotoToCanvas } from '../lib/bake-photo-export'
import { DEMO_MEDIA, EMPTY_VIDEO_DISTORT_SETTINGS, type VideoDistortSettingsSnapshot } from '../lib/editor-constants'
import { canvasToBlob, exportCanvasToBlob, stripMetadata, type PngDepth } from '../lib/export-canvas'
import { zonesWithFaceOffset } from '../lib/face-offset'
import { createId } from '../lib/ids'
import {
  buildAnonymizedExportName,
  isRasterImageFormat,
  originalsFromPhotoItems,
  photosNeedingSave,
  recordsToPhotoItems,
  resolveNextActiveAfterDelete,
  selectLibraryExportImages,
  validateRecordsForAdd,
  type InputRecord,
} from '../lib/photo-library'
import { isMediaFile, makeZipSafeName } from '../lib/media-files'
import { waitForUi } from '../lib/video-overlay-helpers'
import { extractPosterFrame, getVideoMetadata } from '../lib/video'
import type {
  ColorAdjustments,
  CustomImageAsset,
  CustomImageSource,
  NormalizeFormat,
  NormalizeResult,
  PhotoItem,
  Zone,
} from '../types'
import { DEFAULT_COLOR_ADJUSTMENTS } from '../types'

export type { InputRecord }

type PointerSession =
  | { mode: 'idle' }
  | { mode: 'brush'; lastPointer: { canvasX: number; canvasY: number; imageX: number; imageY: number } | null }
  | { mode: 'move-zone'; zoneId: string; offsetX: number; offsetY: number }
  | { mode: 'resize-zone'; zoneId: string }
  | { mode: 'create-zone'; startX: number; startY: number }
  | { mode: 'normalize-crop'; startX: number; startY: number }
  | { mode: 'crop-draw'; startX: number; startY: number }

export interface UsePhotoLibraryOptions {
  isMobile: boolean
  photos: PhotoItem[]
  photosRef: MutableRefObject<PhotoItem[]>
  activePhoto: PhotoItem | null
  activePhotoId: string | null
  dirtyByPhoto: Record<string, boolean>
  originalBlobByPhoto: Record<string, Blob>
  colorAdjByPhoto: Record<string, ColorAdjustments>
  zonesByPhoto: Record<string, Zone[]>
  distortSettingsByVideoId: Record<string, VideoDistortSettingsSnapshot>
  exportFormat: NormalizeFormat
  exportQuality: number
  exportPngDepth: PngDepth
  brushStrength: number
  detectFaceOffset: number
  customImageAssets: CustomImageAsset[]
  customImageSource: CustomImageSource
  workCanvasRef: RefObject<HTMLCanvasElement | null>
  workCtxRef: MutableRefObject<CanvasRenderingContext2D | null>
  dragCounterRef: MutableRefObject<number>
  pointerSessionRef: MutableRefObject<PointerSession>
  detectingRef: MutableRefObject<boolean>
  previewBakedRef: MutableRefObject<boolean>
  videoAbortRef: MutableRefObject<AbortController | null>
  mobileViewZoomRef: MutableRefObject<number>
  mobileViewPanRef: MutableRefObject<{ x: number; y: number }>
  mobileViewRotationRef: MutableRefObject<number>
  mobileCanvasEditRef: MutableRefObject<boolean>
  setPhotos: Dispatch<SetStateAction<PhotoItem[]>>
  setActivePhotoId: Dispatch<SetStateAction<string | null>>
  setOriginalBlobByPhoto: Dispatch<SetStateAction<Record<string, Blob>>>
  setSelectedForBatch: Dispatch<SetStateAction<Set<string>>>
  setNormalizeResults: Dispatch<SetStateAction<Record<string, NormalizeResult>>>
  setNormalizePreviewIds: Dispatch<SetStateAction<string[]>>
  setPhotoListLimit: Dispatch<SetStateAction<number>>
  setSidebarView: Dispatch<SetStateAction<'grid' | 'list'>>
  setNotice: (message: string) => void
  setIsBusy: (value: boolean) => void
  setIsApplyingAll: (value: boolean) => void
  setIsExporting: (value: boolean) => void
  setExportLibraryProgress: Dispatch<SetStateAction<{ done: number; total: number } | null>>
  setActiveDirty: (dirty: boolean) => void
  setIsDetecting: (value: boolean) => void
  setDetectionStep: (step: string) => void
  setDistortSettingsByVideoId: Dispatch<SetStateAction<Record<string, VideoDistortSettingsSnapshot>>>
  setSelectedZoneId: Dispatch<SetStateAction<string | null>>
  setDraftZone: Dispatch<SetStateAction<Zone | null>>
  setNormalizeCropDraft: Dispatch<SetStateAction<import('../types').NormalizedRect | null>>
  setIsNormalizeCropPicking: (value: boolean) => void
  setZonesAnonymized: (value: boolean) => void
  setEffectFlyoutOpen: (value: boolean) => void
  setAdjFlyoutOpen: (value: boolean) => void
  setTransformFlyoutOpen: (value: boolean) => void
  setLocalProcessingMs: Dispatch<SetStateAction<number | null>>
  setLastDetectFailed: (value: boolean) => void
  setZoneToolCustomized: (value: boolean) => void
  setEffectToolCustomized: (value: boolean) => void
  setColorAdj: Dispatch<SetStateAction<ColorAdjustments>>
  setColorAdjByPhoto: Dispatch<SetStateAction<Record<string, ColorAdjustments>>>
  setZonesByPhoto: Dispatch<SetStateAction<Record<string, Zone[]>>>
  setDirtyByPhoto: Dispatch<SetStateAction<Record<string, boolean>>>
  setAppliedByPhoto: Dispatch<SetStateAction<Record<string, boolean>>>
  setVideoFrameOverridesByPhoto: Dispatch<SetStateAction<Record<string, import('../lib/video').VideoFrameOverride[]>>>
  setVideoTimedZonesByPhoto: Dispatch<SetStateAction<Record<string, import('../lib/video').VideoTimedZone[]>>>
  setExportFormat: Dispatch<SetStateAction<NormalizeFormat>>
  setDetectSensitivity: Dispatch<SetStateAction<number>>
  setVideoProcessing: (value: boolean) => void
  setMobileViewZoom: (value: number) => void
  setMobileViewPan: (value: { x: number; y: number }) => void
  setMobileViewRotation: (value: number) => void
  setMobileViewTransformDirty: (value: boolean) => void
  setActiveImageSize: Dispatch<SetStateAction<{ width: number; height: number } | null>>
  showSaveError: (message: string) => void
  showMobileToast: (message: string) => void
  getWorkCtx: () => CanvasRenderingContext2D | null
  renderCanvas: () => void
  resetUndo: () => void
  snapshotVideoDistortSettings: () => VideoDistortSettingsSnapshot
  applyVideoDistortSettings: (settings: VideoDistortSettingsSnapshot) => void
}

export interface PhotoLibraryApi {
  isDragOver: boolean
  folderScanState: { found: number } | null
  lastAddedPhotoIdRef: RefObject<string | null>
  addRecords: (records: InputRecord[]) => void
  handleDragEnter: (e: DragEvent) => void
  handleDragLeave: (e: DragEvent) => void
  handleDragOver: (e: DragEvent) => void
  handleDrop: (e: DragEvent) => Promise<void>
  loadDemoPhotos: () => Promise<void>
  commitWorkCanvasToBlob: (photoId: string) => Promise<void>
  selectPhoto: (photoId: string) => Promise<void>
  saveActivePhoto: () => Promise<void>
  saveAllPhotos: () => Promise<void>
  resetPhotoToOriginal: () => Promise<void>
  exportActivePhoto: () => Promise<void>
  deletePhoto: (photoId: string) => void
  exportAllLibraryZip: (photoIds?: string[]) => Promise<void>
  exportAllLibraryIndividual: (photoIds?: string[]) => Promise<void>
}

export function usePhotoLibrary(options: UsePhotoLibraryOptions): PhotoLibraryApi {
  const {
    isMobile,
    photos,
    photosRef,
    activePhoto,
    activePhotoId,
    dirtyByPhoto,
    originalBlobByPhoto,
    colorAdjByPhoto,
    zonesByPhoto,
    distortSettingsByVideoId,
    exportFormat,
    exportQuality,
    exportPngDepth,
    brushStrength,
    detectFaceOffset,
    customImageAssets,
    customImageSource,
    workCanvasRef,
    workCtxRef,
    dragCounterRef,
    pointerSessionRef,
    detectingRef,
    previewBakedRef,
    videoAbortRef,
    mobileViewZoomRef,
    mobileViewPanRef,
    mobileViewRotationRef,
    mobileCanvasEditRef,
    setPhotos,
    setActivePhotoId,
    setOriginalBlobByPhoto,
    setSelectedForBatch,
    setNormalizeResults,
    setNormalizePreviewIds,
    setPhotoListLimit,
    setSidebarView,
    setNotice,
    setIsBusy,
    setIsApplyingAll,
    setIsExporting,
    setExportLibraryProgress,
    setActiveDirty,
    setIsDetecting,
    setDetectionStep,
    setDistortSettingsByVideoId,
    setSelectedZoneId,
    setDraftZone,
    setNormalizeCropDraft,
    setIsNormalizeCropPicking,
    setZonesAnonymized,
    setEffectFlyoutOpen,
    setAdjFlyoutOpen,
    setTransformFlyoutOpen,
    setLocalProcessingMs,
    setLastDetectFailed,
    setZoneToolCustomized,
    setEffectToolCustomized,
    setColorAdj,
    setColorAdjByPhoto,
    setZonesByPhoto,
    setDirtyByPhoto,
    setAppliedByPhoto,
    setVideoFrameOverridesByPhoto,
    setVideoTimedZonesByPhoto,
    setExportFormat,
    setDetectSensitivity,
    setVideoProcessing,
    setMobileViewZoom,
    setMobileViewPan,
    setMobileViewRotation,
    setMobileViewTransformDirty,
    setActiveImageSize,
    showSaveError,
    showMobileToast,
    getWorkCtx,
    renderCanvas,
    resetUndo,
    snapshotVideoDistortSettings,
    applyVideoDistortSettings,
  } = options

  const [isDragOver, setIsDragOver] = useState(false)
  const [folderScanState, setFolderScanState] = useState<{ found: number } | null>(null)
  const lastAddedPhotoIdRef = useRef<string | null>(null)

  const resetMobileViewTransform = useCallback(() => {
    setMobileViewZoom(1)
    setMobileViewPan({ x: 0, y: 0 })
    setMobileViewRotation(0)
    mobileViewZoomRef.current = 1
    mobileViewPanRef.current = { x: 0, y: 0 }
    mobileViewRotationRef.current = 0
    setMobileViewTransformDirty(false)
    mobileCanvasEditRef.current = false
  }, [
    mobileCanvasEditRef, mobileViewPanRef, mobileViewRotationRef, mobileViewZoomRef,
    setMobileViewPan, setMobileViewRotation, setMobileViewTransformDirty, setMobileViewZoom,
  ])

  const applyPhotoSwitchUiReset = useCallback(() => {
    setSelectedZoneId(null)
    setDraftZone(null)
    setNormalizeCropDraft(null)
    setIsNormalizeCropPicking(false)
    pointerSessionRef.current = { mode: 'idle' }
    resetUndo()
    setZonesAnonymized(false)
    previewBakedRef.current = false
    setEffectFlyoutOpen(false)
    setLocalProcessingMs(null)
    setLastDetectFailed(false)
    setZoneToolCustomized(false)
    setEffectToolCustomized(false)
    setAdjFlyoutOpen(false)
    setTransformFlyoutOpen(false)
    if (isMobile) resetMobileViewTransform()
  }, [
    isMobile, pointerSessionRef, previewBakedRef, resetMobileViewTransform, resetUndo,
    setAdjFlyoutOpen, setDraftZone, setEffectFlyoutOpen, setEffectToolCustomized,
    setIsNormalizeCropPicking, setLastDetectFailed, setLocalProcessingMs, setNormalizeCropDraft,
    setSelectedZoneId, setTransformFlyoutOpen, setZoneToolCustomized, setZonesAnonymized,
  ])

  const addRecords = useCallback((records: InputRecord[]) => {
    const validation = validateRecordsForAdd(records, photosRef.current.length)
    if (!validation.ok) { setNotice(validation.message); return }
    if (validation.notice) setNotice(validation.notice)

    const incoming = recordsToPhotoItems(validation.records, createId, (file) => URL.createObjectURL(file))
    const originals = originalsFromPhotoItems(incoming)
    setOriginalBlobByPhoto((cur) => ({ ...cur, ...originals }))

    for (const p of incoming) {
      if (p.isVideo) {
        extractPosterFrame(p.blob).then(({ blob: posterBlob, width, height }) => {
          const posterUrl = URL.createObjectURL(posterBlob)
          setPhotos((cur) => {
            const target = cur.find((ph) => ph.id === p.id)
            if (!target) {
              URL.revokeObjectURL(posterUrl)
              return cur
            }
            return cur.map((ph) => {
              if (ph.id !== p.id) return ph
              URL.revokeObjectURL(ph.previewUrl)
              return { ...ph, previewUrl: posterUrl, videoWidth: width, videoHeight: height }
            })
          })
        }).catch(() => { /* poster extraction failed — keep video blob URL as preview */ })
        getVideoMetadata(p.blob).then((meta) => {
          setPhotos((cur) => {
            if (!cur.some((ph) => ph.id === p.id)) return cur
            return cur.map((ph) => {
              if (ph.id !== p.id) return ph
              return { ...ph, videoDuration: meta.duration, videoWidth: meta.width, videoHeight: meta.height, videoFps: meta.fps }
            })
          })
        }).catch(() => {})
      }
    }

    setPhotos((cur) => {
      const next = [...cur, ...incoming]
      photosRef.current = next
      if (!activePhotoId && incoming.length > 0) setActivePhotoId(incoming[0].id)
      if (next.length > 700) setSidebarView('list')
      return next
    })
    if (incoming.length > 0) lastAddedPhotoIdRef.current = incoming[incoming.length - 1].id
    setSelectedForBatch((cur) => { const next = new Set(cur); incoming.forEach((p) => next.add(p.id)); return next })
    setNormalizeResults({})
    setNormalizePreviewIds([])
    setPhotoListLimit((cur) => Math.max(cur, Math.min(400, cur + incoming.length)))
    setNotice(`Loaded ${incoming.length} media file${incoming.length === 1 ? '' : 's'}.`)
  }, [
    activePhotoId, photosRef, setActivePhotoId, setNormalizePreviewIds, setNormalizeResults,
    setOriginalBlobByPhoto, setPhotoListLimit, setPhotos, setSelectedForBatch, setSidebarView, setNotice,
  ])

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    dragCounterRef.current++
    setIsDragOver(true)
  }, [dragCounterRef])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    dragCounterRef.current--
    if (dragCounterRef.current <= 0) { dragCounterRef.current = 0; setIsDragOver(false) }
  }, [dragCounterRef])

  const handleDragOver = useCallback((e: DragEvent) => { e.preventDefault() }, [])

  const handleDrop = useCallback(async (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current = 0
    setIsDragOver(false)

    const items = Array.from(e.dataTransfer.items ?? [])
    const entries = items
      .filter((i) => i.kind === 'file')
      .map((i) => i.webkitGetAsEntry?.())
      .filter(Boolean) as FileSystemEntry[]

    if (entries.length === 0) { setNotice('No images found in dropped content.'); return }

    const hasDir = entries.some((en) => en.isDirectory)

    if (!hasDir) {
      const files: File[] = []
      await Promise.all(entries.map((en) =>
        new Promise<void>((res) => {
          (en as FileSystemFileEntry).file((f) => { if (isMediaFile(f)) files.push(f); res() }, () => res())
        })
      ))
      if (files.length === 0) { setNotice('No images found in dropped files.'); return }
      addRecords(files.map((f) => ({ file: f, name: f.name, source: 'upload' as const })))
      return
    }

    setFolderScanState({ found: 0 })
    const records: InputRecord[] = []

    const readDir = async (dir: FileSystemDirectoryEntry, prefix = '') => {
      const reader = dir.createReader()
      for (;;) {
        const batch: FileSystemEntry[] = await new Promise((res, rej) => reader.readEntries(res, rej))
        if (batch.length === 0) break
        for (const entry of batch) {
          if (entry.isFile) {
            const file = await new Promise<File>((res, rej) => (entry as FileSystemFileEntry).file(res, rej))
            if (isMediaFile(file)) {
              records.push({ file, name: `${prefix}${entry.name}`, source: 'upload' as const })
              setFolderScanState({ found: records.length })
            }
          } else if (entry.isDirectory) {
            await readDir(entry as FileSystemDirectoryEntry, `${prefix}${entry.name}/`)
          }
        }
      }
    }

    try {
      for (const entry of entries) {
        if (entry.isDirectory) {
          await readDir(entry as FileSystemDirectoryEntry)
        } else if (entry.isFile) {
          const file = await new Promise<File>((res, rej) => (entry as FileSystemFileEntry).file(res, rej))
          if (isMediaFile(file)) {
            records.push({ file, name: entry.name, source: 'upload' as const })
            setFolderScanState({ found: records.length })
          }
        }
      }
    } catch {
      setFolderScanState(null)
      setNotice('Error reading dropped folder.')
      return
    }

    setFolderScanState(null)
    if (records.length === 0) { setNotice('No images found in dropped folder.'); return }
    addRecords(records)
  }, [addRecords, dragCounterRef, setNotice])

  const loadDemoPhotos = useCallback(async () => {
    setIsBusy(true)
    try {
      const fetched = await Promise.all(DEMO_MEDIA.map(async (url, i) => {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Demo ${url} failed`)
        const blob = await res.blob()
        const ext = url.split('.').pop() ?? 'jpg'
        const name = url.split('/').pop() ?? `demo-${i + 1}.${ext}`
        const mime = blob.type || (ext === 'webm' ? 'video/webm' : ext === 'webp' ? 'image/webp' : ext === 'png' ? 'image/png' : 'image/jpeg')
        return { file: new File([blob], name, { type: mime }), name, source: 'upload' as const }
      }))
      addRecords(fetched)
    } catch { setNotice('Failed to load demo photos.') }
    finally { setIsBusy(false) }
  }, [addRecords, setIsBusy, setNotice])

  const commitWorkCanvasToBlob = useCallback(async (photoId: string) => {
    const wc = workCanvasRef.current
    if (!wc || wc.width === 0) return
    const photo = photos.find((p) => p.id === photoId)
    if (!photo) return
    try {
      const blob = await canvasToBlob(wc, photo.mimeType || 'image/jpeg')
      const nextUrl = URL.createObjectURL(blob)
      setPhotos((cur) => cur.map((p) => {
        if (p.id !== photoId) return p
        window.setTimeout(() => URL.revokeObjectURL(p.previewUrl), 0)
        return { ...p, blob, previewUrl: nextUrl, edited: true }
      }))
    } catch (e) { console.warn('Auto-commit failed', e) }
  }, [photos, setPhotos, workCanvasRef])

  const selectPhoto = useCallback(async (photoId: string) => {
    if (photoId === activePhotoId) return
    detectingRef.current = false
    setIsDetecting(false)
    setDetectionStep('')
    if (activePhotoId && (dirtyByPhoto[activePhotoId] ?? false)) {
      await commitWorkCanvasToBlob(activePhotoId)
      setActiveDirty(false)
    }
    const leavingVideo = photos.find((p) => p.id === activePhotoId)?.isVideo
    if (activePhotoId && leavingVideo) {
      setDistortSettingsByVideoId((cur) => ({
        ...cur,
        [activePhotoId]: snapshotVideoDistortSettings(),
      }))
    }
    setActivePhotoId(photoId)
    applyPhotoSwitchUiReset()
    const saved = colorAdjByPhoto[photoId]
    setColorAdj(saved ? { ...saved } : DEFAULT_COLOR_ADJUSTMENTS)
    const photo = photos.find((p) => p.id === photoId)
    if (photo) {
      const fmt = photo.mimeType as NormalizeFormat
      if (isRasterImageFormat(fmt)) setExportFormat(fmt)
      if (photo.isVideo) {
        applyVideoDistortSettings(distortSettingsByVideoId[photoId] ?? EMPTY_VIDEO_DISTORT_SETTINGS)
        setDetectSensitivity((s) => (s <= 1 ? 10 : s))
      }
    }
  }, [
    activePhotoId, applyPhotoSwitchUiReset, applyVideoDistortSettings, colorAdjByPhoto,
    commitWorkCanvasToBlob, detectingRef, dirtyByPhoto, distortSettingsByVideoId, photos,
    setActiveDirty, setActivePhotoId, setColorAdj, setDetectSensitivity, setDetectionStep,
    setDistortSettingsByVideoId, setExportFormat, setIsDetecting, snapshotVideoDistortSettings,
  ])

  const saveActivePhoto = useCallback(async () => {
    if (!activePhoto) return
    const workCanvas = workCanvasRef.current
    if (!workCanvas || workCanvas.width === 0) return
    setIsBusy(true)
    try {
      const blob = await canvasToBlob(workCanvas, activePhoto.mimeType || 'image/jpeg')
      setPhotos((cur) => cur.map((p) => {
        if (p.id !== activePhoto.id) return p
        const nextUrl = URL.createObjectURL(blob)
        window.setTimeout(() => URL.revokeObjectURL(p.previewUrl), 0)
        return { ...p, blob, previewUrl: nextUrl, edited: true }
      }))
      setActiveDirty(false)
      if (activePhoto.fileHandle) {
        try {
          const w = await activePhoto.fileHandle.createWritable()
          await w.write(blob)
          await w.close()
          setNotice(`Saved: ${activePhoto.name.split('/').pop()}`)
        } catch (writeErr) {
          const msg = writeErr instanceof Error ? writeErr.message : String(writeErr)
          setNotice(`File write failed: ${msg}`)
        }
      } else {
        showSaveError('No permissions — work only in desktop app mode')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setNotice(`Save failed: ${msg}`)
    }
    finally { setIsBusy(false) }
  }, [activePhoto, setActiveDirty, setIsBusy, setNotice, setPhotos, showSaveError, workCanvasRef])

  const saveAllPhotos = useCallback(async () => {
    const edited = photosNeedingSave(photos, dirtyByPhoto)
    if (edited.length === 0) { setNotice('No edited photos to save.'); return }
    setIsApplyingAll(true)
    let saved = 0, skipped = 0, errors = 0
    try {
      for (let i = 0; i < edited.length; i++) {
        const photo = edited[i]
        setNotice(`Saving ${i + 1}/${edited.length}: ${photo.name.split('/').pop()}`)
        await waitForUi()
        if (photo.fileHandle) {
          try {
            const cleanBlob = await stripMetadata(photo.blob)
            const w = await photo.fileHandle.createWritable()
            await w.write(cleanBlob)
            await w.close()
            saved++
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            console.error('Write failed', photo.name, err)
            setNotice(`Write failed for ${photo.name.split('/').pop()}: ${msg}`)
            errors++
            await waitForUi()
          }
        } else {
          skipped++
        }
      }
      const parts: string[] = []
      if (saved > 0) parts.push(`${saved} saved to disk`)
      if (skipped > 0) parts.push(`${skipped} in session`)
      if (errors > 0) parts.push(`${errors} failed`)
      setNotice(parts.join(' · '))
    } catch (err) {
      console.error(err)
      setNotice('Save all failed.')
    } finally {
      setIsApplyingAll(false)
    }
  }, [dirtyByPhoto, photos, setIsApplyingAll, setNotice])

  const resetPhotoToOriginal = useCallback(async () => {
    if (!activePhoto) return
    const orig = originalBlobByPhoto[activePhoto.id]
    if (!orig) { setNotice('No original backup for this photo.'); return }
    setIsBusy(true)
    try {
      if (activePhoto.isVideo) {
        const [poster, meta] = await Promise.all([
          extractPosterFrame(orig).catch(() => null),
          getVideoMetadata(orig).catch(() => null),
        ])
        const nextUrl = poster ? URL.createObjectURL(poster.blob) : activePhoto.previewUrl
        setPhotos((cur) => cur.map((p) => {
          if (p.id !== activePhoto.id) return p
          if (nextUrl !== p.previewUrl) window.setTimeout(() => URL.revokeObjectURL(p.previewUrl), 0)
          return {
            ...p,
            blob: orig,
            previewUrl: nextUrl,
            edited: false,
            mimeType: orig.type || p.mimeType,
            videoDuration: meta?.duration ?? p.videoDuration,
            videoWidth: meta?.width ?? poster?.width ?? p.videoWidth,
            videoHeight: meta?.height ?? poster?.height ?? p.videoHeight,
            videoFps: meta?.fps ?? p.videoFps,
          }
        }))
        setVideoFrameOverridesByPhoto((cur) => { const next = { ...cur }; delete next[activePhoto.id]; return next })
        setVideoTimedZonesByPhoto((cur) => { const next = { ...cur }; delete next[activePhoto.id]; return next })
        setActiveDirty(false)
        resetUndo()
        setNotice('Reset video to original.')
        return
      }
      const bmp = await createImageBitmap(orig)
      const origW = bmp.width, origH = bmp.height
      const wc = workCanvasRef.current!
      if (wc.width !== origW || wc.height !== origH) {
        wc.width = origW; wc.height = origH
        workCtxRef.current = null
      }
      const ctx = getWorkCtx()
      if (ctx) { ctx.clearRect(0, 0, origW, origH); ctx.drawImage(bmp, 0, 0) }
      bmp.close()

      const nextUrl = URL.createObjectURL(orig)
      setPhotos((cur) => cur.map((p) => {
        if (p.id !== activePhoto.id) return p
        window.setTimeout(() => URL.revokeObjectURL(p.previewUrl), 0)
        return { ...p, blob: orig, previewUrl: nextUrl, edited: false }
      }))
      setColorAdj(DEFAULT_COLOR_ADJUSTMENTS)
      setColorAdjByPhoto((cur) => { const next = { ...cur }; delete next[activePhoto.id]; return next })
      setZonesByPhoto((cur) => { const next = { ...cur }; delete next[activePhoto.id]; return next })
      setAppliedByPhoto((cur) => { const next = { ...cur }; delete next[activePhoto.id]; return next })
      setActiveDirty(false)
      resetUndo()
      setActiveImageSize({ width: origW, height: origH })
      renderCanvas()
      setNotice('Reset to original.')
    } catch { setNotice('Reset failed.') }
    finally { setIsBusy(false) }
  }, [
    activePhoto, getWorkCtx, originalBlobByPhoto, renderCanvas, resetUndo, setActiveDirty,
    setActiveImageSize, setAppliedByPhoto, setColorAdj, setColorAdjByPhoto, setIsBusy, setNotice,
    setPhotos, setVideoFrameOverridesByPhoto, setVideoTimedZonesByPhoto, setZonesByPhoto,
    workCanvasRef, workCtxRef,
  ])

  const exportActivePhoto = useCallback(async () => {
    if (!activePhoto) return
    const workCanvas = workCanvasRef.current
    if (!workCanvas || workCanvas.width === 0) return
    setIsBusy(true)
    try {
      const blob = await exportCanvasToBlob(workCanvas, exportFormat, exportQuality, exportPngDepth)
      const outName = buildAnonymizedExportName(activePhoto.name, exportFormat)
      saveAs(blob, outName)
      setNotice(`Exported: ${outName}`)
    } catch { setNotice('Export failed.') }
    finally { setIsBusy(false) }
  }, [activePhoto, exportFormat, exportPngDepth, exportQuality, setIsBusy, setNotice, workCanvasRef])

  const deletePhoto = useCallback((photoId: string) => {
    const nextActivePhoto = resolveNextActiveAfterDelete(photos, photoId, activePhotoId)
    const deletingActive = activePhotoId === photoId

    setPhotos((cur) => {
      const p = cur.find((x) => x.id === photoId)
      if (p) URL.revokeObjectURL(p.previewUrl)
      return cur.filter((x) => x.id !== photoId)
    })
    setSelectedForBatch((cur) => { const next = new Set(cur); next.delete(photoId); return next })
    setOriginalBlobByPhoto((cur) => { const next = { ...cur }; delete next[photoId]; return next })
    setZonesByPhoto((cur) => { const next = { ...cur }; delete next[photoId]; return next })
    setDirtyByPhoto((cur) => { const next = { ...cur }; delete next[photoId]; return next })
    setColorAdjByPhoto((cur) => { const next = { ...cur }; delete next[photoId]; return next })
    setAppliedByPhoto((cur) => { const next = { ...cur }; delete next[photoId]; return next })
    setVideoFrameOverridesByPhoto((cur) => {
      const next = { ...cur }
      delete next[photoId]
      return next
    })
    if (deletingActive) {
      setActivePhotoId(nextActivePhoto?.id ?? null)
      applyPhotoSwitchUiReset()
      detectingRef.current = false
      setIsDetecting(false)
      setDetectionStep('')
      setActiveDirty(false)
      if (videoAbortRef.current) { videoAbortRef.current.abort(); videoAbortRef.current = null }
      setVideoProcessing(false)
      if (nextActivePhoto) {
        const saved = colorAdjByPhoto[nextActivePhoto.id]
        setColorAdj(saved ? { ...saved } : DEFAULT_COLOR_ADJUSTMENTS)
        const fmt = nextActivePhoto.mimeType as NormalizeFormat
        if (!nextActivePhoto.isVideo && isRasterImageFormat(fmt)) {
          setExportFormat(fmt)
        }
        if (nextActivePhoto.isVideo) {
          applyVideoDistortSettings(distortSettingsByVideoId[nextActivePhoto.id] ?? EMPTY_VIDEO_DISTORT_SETTINGS)
          setDetectSensitivity((s) => (s <= 1 ? 10 : s))
        }
      }
    }
  }, [
    activePhotoId, applyPhotoSwitchUiReset, applyVideoDistortSettings, colorAdjByPhoto,
    detectingRef, distortSettingsByVideoId, photos, setActiveDirty, setActivePhotoId,
    setAppliedByPhoto, setColorAdj, setColorAdjByPhoto, setDetectSensitivity, setDetectionStep,
    setDirtyByPhoto, setExportFormat, setIsDetecting, setOriginalBlobByPhoto, setPhotos,
    setSelectedForBatch, setVideoFrameOverridesByPhoto, setVideoProcessing, setZonesByPhoto,
    videoAbortRef,
  ])

  const exportAllLibraryZip = useCallback(async (photoIds?: string[]) => {
    const { images, skippedVideos } = selectLibraryExportImages(photos, photoIds)
    if (images.length === 0) {
      showMobileToast('No photos in library to export.')
      return
    }
    setIsExporting(true)
    setExportLibraryProgress({ done: 0, total: images.length })
    try {
      const zip = new JSZip()
      const usage = new Map<string, number>()
      let done = 0
      for (const photo of images) {
        setExportLibraryProgress({ done, total: images.length })
        const canvas = await bakePhotoToCanvas({
          photo,
          sourceBlob: originalBlobByPhoto[photo.id] ?? photo.blob,
          zones: zonesWithFaceOffset(zonesByPhoto[photo.id] ?? [], detectFaceOffset),
          colorAdj: colorAdjByPhoto[photo.id],
          brushStrength,
          activeWorkCanvas: photo.id === activePhotoId ? workCanvasRef.current : null,
          isActivePhoto: photo.id === activePhotoId,
          effectOptionsForZone: (zone) => ({
            customImages: customImageAssets,
            customImageSource,
            customImageAssetId: zone.customImageAssetId,
            zoneId: zone.id,
            seed: `${photo.id}:${zone.id}`,
          }),
        })
        const blob = await exportCanvasToBlob(canvas, exportFormat, exportQuality, exportPngDepth)
        const outName = buildAnonymizedExportName(photo.name, exportFormat)
        zip.file(makeZipSafeName(outName, usage), blob)
        done += 1
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, `anonymizer-library-${new Date().toISOString().slice(0, 10)}.zip`)
      showMobileToast(
        skippedVideos > 0
          ? `Downloaded ${images.length} photos · ${skippedVideos} video${skippedVideos !== 1 ? 's' : ''} skipped`
          : `Downloaded ${images.length} photo${images.length !== 1 ? 's' : ''} as ZIP`,
      )
    } catch {
      showMobileToast('ZIP export failed.')
    } finally {
      setIsExporting(false)
      setExportLibraryProgress(null)
    }
  }, [
    activePhotoId, brushStrength, colorAdjByPhoto, customImageAssets, customImageSource,
    detectFaceOffset, exportFormat, exportPngDepth, exportQuality, originalBlobByPhoto,
    photos, setExportLibraryProgress, setIsExporting, showMobileToast, workCanvasRef, zonesByPhoto,
  ])

  const exportAllLibraryIndividual = useCallback(async (photoIds?: string[]) => {
    const { images, skippedVideos } = selectLibraryExportImages(photos, photoIds)
    if (images.length === 0) {
      showMobileToast('No photos in library to export.')
      return
    }
    setIsExporting(true)
    setExportLibraryProgress({ done: 0, total: images.length })
    try {
      let done = 0
      for (const photo of images) {
        setExportLibraryProgress({ done, total: images.length })
        const canvas = await bakePhotoToCanvas({
          photo,
          sourceBlob: originalBlobByPhoto[photo.id] ?? photo.blob,
          zones: zonesWithFaceOffset(zonesByPhoto[photo.id] ?? [], detectFaceOffset),
          colorAdj: colorAdjByPhoto[photo.id],
          brushStrength,
          activeWorkCanvas: photo.id === activePhotoId ? workCanvasRef.current : null,
          isActivePhoto: photo.id === activePhotoId,
          effectOptionsForZone: (zone) => ({
            customImages: customImageAssets,
            customImageSource,
            customImageAssetId: zone.customImageAssetId,
            zoneId: zone.id,
            seed: `${photo.id}:${zone.id}`,
          }),
        })
        const blob = await exportCanvasToBlob(canvas, exportFormat, exportQuality, exportPngDepth)
        const outName = buildAnonymizedExportName(photo.name, exportFormat)
        saveAs(blob, outName)
        done += 1
      }
      showMobileToast(
        skippedVideos > 0
          ? `Downloaded ${images.length} files · ${skippedVideos} video${skippedVideos !== 1 ? 's' : ''} skipped`
          : `Downloaded ${images.length} file${images.length !== 1 ? 's' : ''}`,
      )
    } catch {
      showMobileToast('Export failed.')
    } finally {
      setIsExporting(false)
      setExportLibraryProgress(null)
    }
  }, [
    activePhotoId, brushStrength, colorAdjByPhoto, customImageAssets, customImageSource,
    detectFaceOffset, exportFormat, exportPngDepth, exportQuality, originalBlobByPhoto,
    photos, setExportLibraryProgress, setIsExporting, showMobileToast, workCanvasRef, zonesByPhoto,
  ])

  return {
    isDragOver,
    folderScanState,
    lastAddedPhotoIdRef,
    addRecords,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    loadDemoPhotos,
    commitWorkCanvasToBlob,
    selectPhoto,
    saveActivePhoto,
    saveAllPhotos,
    resetPhotoToOriginal,
    exportActivePhoto,
    deletePhoto,
    exportAllLibraryZip,
    exportAllLibraryIndividual,
  }
}
