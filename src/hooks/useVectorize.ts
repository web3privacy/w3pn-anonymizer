import { useCallback, useEffect, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from 'react'
import { saveAs } from 'file-saver'
import { canvasToSvg, canvasToSvgBlob, DEFAULT_VECTORIZE_PARAMS, type VectorizeParams } from '../lib/vectorize'
import type { PhotoItem } from '../types'

export interface UseVectorizeParams {
  workCanvasRef: RefObject<HTMLCanvasElement | null>
  activePhoto: PhotoItem | null | undefined
  setIsBusy: (busy: boolean) => void
  setNotice: (message: string) => void
}

export interface VectorizeApi {
  vectorizePanelOpen: boolean
  setVectorizePanelOpen: Dispatch<SetStateAction<boolean>>
  vectorizePreviewActive: boolean
  vectorizeParams: VectorizeParams
  setVectorizeParams: Dispatch<SetStateAction<VectorizeParams>>
  svgPreview: string | null
  svgPreviewUrl: string | null
  svgPreviewSize: number | null
  vectorizing: boolean
  runVectorizePreview: (params: VectorizeParams) => Promise<void>
  updateVectorizeParam: <K extends keyof VectorizeParams>(key: K, value: VectorizeParams[K]) => void
  exportAsSvg: () => Promise<void>
  applyVectorizePreview: () => Promise<boolean>
  clearVectorizePreview: () => void
}

/**
 * Owns the SVG vectorize panel: debounced live preview, object-URL lifecycle,
 * and SVG export. The heavy tracing runs in a Web Worker (see lib/vectorize).
 * Extracted from App.tsx unchanged; runs fully locally in the browser.
 */
export function useVectorize({
  workCanvasRef,
  activePhoto,
  setIsBusy,
  setNotice,
}: UseVectorizeParams): VectorizeApi {
  const [vectorizePanelOpen, setVectorizePanelOpen] = useState(false)
  const [vectorizeParams, setVectorizeParams] = useState<VectorizeParams>({ ...DEFAULT_VECTORIZE_PARAMS })
  const [svgPreview, setSvgPreview] = useState<string | null>(null)
  const [svgPreviewUrl, setSvgPreviewUrl] = useState<string | null>(null)
  const [svgPreviewSize, setSvgPreviewSize] = useState<number | null>(null)
  const [vectorizing, setVectorizing] = useState(false)
  const [vectorizePreviewActive, setVectorizePreviewActive] = useState(false)
  const vectorizeDebounceRef = useRef<ReturnType<typeof setTimeout>>()
  const vectorizePreviewUrlRef = useRef<string | null>(null)
  const vectorizePreviewSeqRef = useRef(0)
  const vectorizePanelWasOpenRef = useRef(false)

  const clearVectorizePreview = useCallback(() => {
    vectorizePreviewSeqRef.current += 1
    if (vectorizeDebounceRef.current) clearTimeout(vectorizeDebounceRef.current)
    if (vectorizePreviewUrlRef.current) {
      URL.revokeObjectURL(vectorizePreviewUrlRef.current)
      vectorizePreviewUrlRef.current = null
    }
    setSvgPreview(null)
    setSvgPreviewUrl(null)
    setSvgPreviewSize(null)
    setVectorizing(false)
    setVectorizePreviewActive(false)
  }, [])

  const runVectorizePreview = useCallback(async (params: VectorizeParams) => {
    const wc = workCanvasRef.current
    if (!wc || wc.width === 0) return
    const seq = ++vectorizePreviewSeqRef.current
    setVectorizing(true)
    try {
      const svg = await canvasToSvg(wc, params)
      if (seq !== vectorizePreviewSeqRef.current) return
      const nextUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
      if (vectorizePreviewUrlRef.current) URL.revokeObjectURL(vectorizePreviewUrlRef.current)
      vectorizePreviewUrlRef.current = nextUrl
      setSvgPreview(svg)
      setSvgPreviewUrl(nextUrl)
      setSvgPreviewSize(new Blob([svg]).size)
      setVectorizePreviewActive(true)
    } catch (err) {
      console.warn('SVG vectorization preview failed:', err)
      if (seq !== vectorizePreviewSeqRef.current) return
      if (vectorizePreviewUrlRef.current) {
        URL.revokeObjectURL(vectorizePreviewUrlRef.current)
        vectorizePreviewUrlRef.current = null
      }
      setSvgPreview(null)
      setSvgPreviewUrl(null)
      setSvgPreviewSize(null)
      setVectorizePreviewActive(false)
    } finally {
      if (seq === vectorizePreviewSeqRef.current) setVectorizing(false)
    }
  }, [workCanvasRef])

  const updateVectorizeParam = useCallback(<K extends keyof VectorizeParams>(key: K, value: VectorizeParams[K]) => {
    setVectorizeParams((prev) => {
      const next = { ...prev, [key]: value }
      if (vectorizeDebounceRef.current) clearTimeout(vectorizeDebounceRef.current)
      vectorizeDebounceRef.current = setTimeout(() => runVectorizePreview(next), 400)
      return next
    })
  }, [runVectorizePreview])

  // Trigger preview when panel opens or photo changes while panel is open.
  useEffect(() => {
    if (vectorizePanelOpen && activePhoto && !activePhoto.isVideo) {
      runVectorizePreview(vectorizeParams)
    }
  }, [vectorizePanelOpen, activePhoto?.id, activePhoto?.isVideo, runVectorizePreview, vectorizeParams])

  // Closing the panel without Apply drops the overlay — only Apply bakes to canvas.
  useEffect(() => {
    if (vectorizePanelWasOpenRef.current && !vectorizePanelOpen && vectorizePreviewActive) {
      clearVectorizePreview()
    }
    vectorizePanelWasOpenRef.current = vectorizePanelOpen
  }, [vectorizePanelOpen, vectorizePreviewActive, clearVectorizePreview])

  // Drop preview when switching away from a still image.
  useEffect(() => {
    if (!activePhoto || activePhoto.isVideo) clearVectorizePreview()
  }, [activePhoto?.id, activePhoto?.isVideo, clearVectorizePreview])

  useEffect(() => () => {
    if (vectorizeDebounceRef.current) clearTimeout(vectorizeDebounceRef.current)
    if (vectorizePreviewUrlRef.current) URL.revokeObjectURL(vectorizePreviewUrlRef.current)
  }, [])

  const applyVectorizePreview = useCallback(async () => {
    const wc = workCanvasRef.current
    if (!wc || wc.width === 0 || !svgPreviewUrl) return false
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('SVG preview failed to load'))
      img.src = svgPreviewUrl
    })
    const ctx = wc.getContext('2d', { willReadFrequently: true })
    if (!ctx) return false
    ctx.clearRect(0, 0, wc.width, wc.height)
    ctx.drawImage(img, 0, 0, wc.width, wc.height)
    clearVectorizePreview()
    return true
  }, [clearVectorizePreview, svgPreviewUrl, workCanvasRef])

  const exportAsSvg = useCallback(async () => {
    if (!activePhoto) return
    const wc = workCanvasRef.current
    if (!wc || wc.width === 0) return
    setIsBusy(true)
    try {
      const blob = svgPreview
        ? new Blob([svgPreview], { type: 'image/svg+xml' })
        : await canvasToSvgBlob(wc, vectorizeParams)
      const baseName = activePhoto.name.split('/').pop() ?? activePhoto.name
      const outName = baseName.replace(/\.[^.]+$/, '') + '-vector.svg'
      saveAs(blob, outName)
      setNotice(`Exported SVG: ${outName} (${Math.round(blob.size / 1024)} KB)`)
    } catch { setNotice('SVG vectorization failed.') }
    finally { setIsBusy(false) }
  }, [activePhoto, vectorizeParams, svgPreview, workCanvasRef, setIsBusy, setNotice])

  return {
    vectorizePanelOpen,
    setVectorizePanelOpen,
    vectorizePreviewActive,
    vectorizeParams,
    setVectorizeParams,
    svgPreview,
    svgPreviewUrl,
    svgPreviewSize,
    vectorizing,
    runVectorizePreview,
    updateVectorizeParam,
    exportAsSvg,
    applyVectorizePreview,
    clearVectorizePreview,
  }
}
