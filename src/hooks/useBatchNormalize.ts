import {
  useCallback,
  useEffect,
  useRef,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import { applyColorAdjustments, applyEffectRect, applyGlitchEffect, pickUniqueEmojis } from '../lib/effects'
import { exportCanvasToBlob } from '../lib/export-canvas'
import { pickCustomImageAssetId } from '../lib/ids'
import { detectImagePrivacyDetections } from '../lib/detections/run-image-detection'
import { normalizedBoxToPixel } from '../lib/detections/adapters'
import { expandPixelBox } from '../lib/face-offset'
import { normalizeSinglePhoto } from '../lib/normalize'
import { waitForUi } from '../lib/video-overlay-helpers'
import {
  computeBatchEta,
  formatBatchCompleteNotice,
  isBatchProcessablePhoto,
  resolveBatchConcurrency,
  resolvePhotoColorAdj,
  selectBatchPhotos,
  shouldRunFormatStep,
  validateNormalizeBatchStart,
} from '../lib/batch-normalize'
import type {
  AnonymizeEffectId,
  BatchTaskId,
  ColorAdjustments,
  CustomImageAsset,
  CustomImageSource,
  DetectionCategoryConfig,
  ModelAvailabilityStatus,
  NormalizeResult,
  NormalizeSettings,
  PhotoItem,
  AsciiCharset,
} from '../types'

export type NormalizeProgressState = {
  total: number
  done: number
  currentFile: string
  success: number
  failed: number
  inputBytes: number
  outputBytes: number
  active: boolean
  startedAt: number
  etaSeconds: number
}

export type NormalizeSummaryState = {
  success: number
  failed: number
  canceled: boolean
  inputBytes: number
  outputBytes: number
  elapsedSeconds: number
  overwritten: number
}

export interface DetectSettingsSnapshot {
  confidence: number
  thorough: boolean
  faceOffset: number
  detectionConfig: DetectionCategoryConfig[]
  modelStatus: Record<string, ModelAvailabilityStatus>
  enabledClasses: string[]
}

export interface UseBatchNormalizeParams {
  photos: PhotoItem[]
  selectedForBatch: Set<string>
  normalizeSettings: NormalizeSettings
  activeBatchTasks: Set<BatchTaskId>
  colorAdj: ColorAdjustments
  colorAdjByPhoto: Record<string, ColorAdjustments>
  customImageAssets: CustomImageAsset[]
  customImageSource: CustomImageSource
  emojiRandom: boolean
  selectedEmoji: string | null
  customImageRandom: boolean
  selectedCustomImageId: string | null
  asciiCharset: AsciiCharset
  activePhotoId: string | null
  workCanvasRef: RefObject<HTMLCanvasElement | null>
  renderCanvas: () => void
  detectSettingsRef: RefObject<DetectSettingsSnapshot>
  setNotice: (message: string) => void
  setIsNormalizing: (value: boolean) => void
  setNormalizeProgress: Dispatch<SetStateAction<NormalizeProgressState>>
  setNormalizeResults: Dispatch<SetStateAction<Record<string, NormalizeResult>>>
  setPhotos: Dispatch<SetStateAction<PhotoItem[]>>
  setNormalizePreviewIds: Dispatch<SetStateAction<string[]>>
  setNormalizeSummary: Dispatch<SetStateAction<NormalizeSummaryState | null>>
}

export interface BatchNormalizeApi {
  runNormalizeBatch: () => Promise<void>
  cancelNormalizeBatch: () => void
}

export function useBatchNormalize({
  photos,
  selectedForBatch,
  normalizeSettings,
  activeBatchTasks,
  colorAdj,
  colorAdjByPhoto,
  customImageAssets,
  customImageSource,
  emojiRandom,
  selectedEmoji,
  customImageRandom,
  selectedCustomImageId,
  asciiCharset,
  activePhotoId,
  workCanvasRef,
  renderCanvas,
  detectSettingsRef,
  setNotice,
  setIsNormalizing,
  setNormalizeProgress,
  setNormalizeResults,
  setPhotos,
  setNormalizePreviewIds,
  setNormalizeSummary,
}: UseBatchNormalizeParams): BatchNormalizeApi {
  const normalizeCancelRef = useRef(false)

  const cancelNormalizeBatch = useCallback(() => {
    normalizeCancelRef.current = true
  }, [])

  useEffect(() => () => {
    normalizeCancelRef.current = true
  }, [])

  const runNormalizeBatch = useCallback(async () => {
    const s = normalizeSettings
    const batch = selectBatchPhotos(photos, selectedForBatch)
    const preflightError = validateNormalizeBatchStart(photos, s, batch)
    if (preflightError) {
      setNotice(preflightError)
      return
    }
    const concurrency = activeBatchTasks.has('anonymize') ? 1 : resolveBatchConcurrency(s.batchConcurrency)
    normalizeCancelRef.current = false
    setIsNormalizing(true)
    setNormalizeResults({})
    setNormalizePreviewIds([])
    setNormalizeSummary(null)
    const startedAt = Date.now()
    setNormalizeProgress({
      total: batch.length,
      done: 0,
      currentFile: '',
      success: 0,
      failed: 0,
      inputBytes: 0,
      outputBytes: 0,
      active: true,
      startedAt,
      etaSeconds: 0,
    })

    const localResults: Record<string, NormalizeResult> = {}
    const toRevoke: string[] = []
    const updatedMap = new Map<string, PhotoItem>(photos.map((p) => [p.id, p]))
    let success = 0
    let failed = 0
    let inputBytes = 0
    let outputBytes = 0
    let completed = 0
    let overwritten = 0
    let queueIndex = 0

    const processNext = async (workerId: number) => {
      while (!normalizeCancelRef.current) {
        const idx = queueIndex++
        if (idx >= batch.length) return
        const photo = batch[idx]
        setNormalizeProgress((cur) => ({ ...cur, currentFile: `[w${workerId}] ${photo.name}` }))
        try {
          const doFormat = shouldRunFormatStep(activeBatchTasks)
          let result = doFormat
            ? await normalizeSinglePhoto(photo, s)
            : {
                photoId: photo.id,
                outputName: photo.name,
                outputMimeType: photo.mimeType as NormalizeResult['outputMimeType'],
                blob: photo.blob,
                beforeWidth: 0,
                beforeHeight: 0,
                afterWidth: 0,
                afterHeight: 0,
                beforeBytes: photo.blob.size,
                afterBytes: photo.blob.size,
              }

          if (activeBatchTasks.has('colors')) {
            const photoColorAdj = resolvePhotoColorAdj(photo.id, colorAdj, colorAdjByPhoto)
            if (photoColorAdj) {
              const bmp = await createImageBitmap(result.blob)
              const tmp = document.createElement('canvas')
              tmp.width = bmp.width
              tmp.height = bmp.height
              const tmpCtx = tmp.getContext('2d', { willReadFrequently: true })!
              tmpCtx.drawImage(bmp, 0, 0)
              bmp.close()
              applyColorAdjustments(tmpCtx, photoColorAdj, tmp)
              const coloredBlob = await exportCanvasToBlob(tmp, s.outputFormat, s.quality, 'full')
              result = { ...result, blob: coloredBlob, afterBytes: coloredBlob.size }
            }
          }

          if (activeBatchTasks.has('glitch')) {
            const bmp = await createImageBitmap(result.blob)
            const tmp = document.createElement('canvas')
            tmp.width = bmp.width
            tmp.height = bmp.height
            const tmpCtx = tmp.getContext('2d', { willReadFrequently: true })!
            tmpCtx.drawImage(bmp, 0, 0)
            bmp.close()
            const glitched = await applyGlitchEffect(tmp, {
              subEffect: s.glitchSubEffect,
              amount: s.glitchAmount,
              seed: s.glitchSeed,
              halftoneDotSize: s.halftoneDotSize,
              halftoneShape: s.halftoneShape,
            })
            const glitchedBlob = await exportCanvasToBlob(glitched, s.outputFormat, s.quality, 'full')
            result = { ...result, blob: glitchedBlob, afterBytes: glitchedBlob.size }
          }

          if (activeBatchTasks.has('anonymize')) {
            const bmp = await createImageBitmap(result.blob)
            const tmp = document.createElement('canvas')
            tmp.width = bmp.width
            tmp.height = bmp.height
            const tmpCtx = tmp.getContext('2d', { willReadFrequently: true })!
            tmpCtx.drawImage(bmp, 0, 0)
            bmp.close()
            try {
              const detect = detectSettingsRef.current
              if (detect) {
                const { detections } = await detectImagePrivacyDetections(tmp, {
                  detectionConfig: detect.detectionConfig,
                  modelStatus: detect.modelStatus,
                  confidence: detect.confidence,
                  thorough: detect.thorough,
                  enabledClasses: detect.enabledClasses,
                })
                if (detections.length > 0) {
                  const batchEffect = s.batchAnonymizeEffect as AnonymizeEffectId
                  const strength = Math.min(1, Math.max(0.01, s.batchAnonymizeStrength / 100))
                  const batchEmojis = pickUniqueEmojis(detections.length)
                  const W = tmp.width
                  const H = tmp.height
                  detections.forEach((det, i) => {
                    let box = normalizedBoxToPixel(det.bbox, W, H)
                    if (det.type === 'face') {
                      box = expandPixelBox(box.x, box.y, box.width, box.height, W, H, detect.faceOffset)
                      box = {
                        x: box.x * W,
                        y: box.y * H,
                        width: box.width * W,
                        height: box.height * H,
                      }
                    }
                    const zoneId = `${photo.id}-${i}`
                    const emoji = !emojiRandom && selectedEmoji ? selectedEmoji : batchEmojis[i]
                    const customImageAssetId = !customImageRandom && selectedCustomImageId
                      ? selectedCustomImageId
                      : pickCustomImageAssetId(customImageAssets, zoneId)
                    applyEffectRect(
                      tmpCtx,
                      batchEffect,
                      box.x,
                      box.y,
                      box.width,
                      box.height,
                      strength,
                      emoji,
                      {
                        customImages: customImageAssets,
                        customImageSource,
                        zoneId,
                        seed: zoneId,
                        customImageAssetId,
                        asciiCharset,
                      },
                    )
                  })
                }
              }
            } catch (err) {
              console.error('Batch anonymize detection failed', photo.name, err)
              throw err
            }
            const anonBlob = await exportCanvasToBlob(tmp, s.outputFormat, s.quality, 'full')
            result = { ...result, blob: anonBlob, afterBytes: anonBlob.size }
          }

          localResults[photo.id] = result
          success++
          inputBytes += result.beforeBytes
          outputBytes += result.afterBytes
          const nextUrl = URL.createObjectURL(result.blob)
          toRevoke.push(photo.previewUrl)
          updatedMap.set(photo.id, {
            ...photo,
            name: result.outputName,
            mimeType: result.outputMimeType,
            blob: result.blob,
            previewUrl: nextUrl,
            edited: true,
          })
          setNormalizePreviewIds((cur) => [photo.id, ...cur.filter((id) => id !== photo.id)].slice(0, 9))
          if (photo.fileHandle && s.overwriteOriginals) {
            try {
              const w = await photo.fileHandle.createWritable()
              await w.write(result.blob)
              await w.close()
              overwritten++
            } catch (err) {
              console.error('Overwrite failed', photo.name, err)
            }
          }
        } catch (err) {
          console.error('Normalize failed', photo.name, err)
          failed++
          inputBytes += photo.blob.size
          updatedMap.set(photo.id, photo)
        } finally {
          completed++
          const eta = computeBatchEta(completed, batch.length, startedAt)
          setNormalizeProgress((cur) => ({
            ...cur,
            done: completed,
            success,
            failed,
            inputBytes,
            outputBytes,
            etaSeconds: eta,
          }))
          await waitForUi()
        }
      }
    }

    await Promise.all(Array.from({ length: concurrency }, (_, i) => processNext(i + 1)))
    const canceled = normalizeCancelRef.current
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000))
    setNormalizeProgress((cur) => ({
      ...cur,
      active: false,
      currentFile: canceled ? 'Cancelled.' : '',
      done: completed,
      success,
      failed,
      inputBytes,
      outputBytes,
      etaSeconds: 0,
    }))
    setIsNormalizing(false)
    if (Object.keys(localResults).length > 0) {
      setNormalizeResults((cur) => ({ ...cur, ...localResults }))
      setPhotos((cur) => cur.map((p) => (isBatchProcessablePhoto(p) ? updatedMap.get(p.id) ?? p : p)))
      toRevoke.forEach((url) => URL.revokeObjectURL(url))
      if (activePhotoId && localResults[activePhotoId]) {
        const updated = updatedMap.get(activePhotoId)
        if (updated) {
          createImageBitmap(updated.blob).then((bmp) => {
            const wc = workCanvasRef.current
            if (wc) {
              wc.width = bmp.width
              wc.height = bmp.height
              wc.getContext('2d')!.drawImage(bmp, 0, 0)
              bmp.close()
              renderCanvas()
            }
          }).catch(() => {})
        }
      }
    }
    setNormalizeSummary({ success, failed, canceled, inputBytes, outputBytes, elapsedSeconds, overwritten })
    if (canceled) {
      setNotice(`Cancelled after ${completed}/${batch.length}.`)
      return
    }
    setNotice(formatBatchCompleteNotice(success, failed, inputBytes, outputBytes))
  }, [
    activeBatchTasks,
    activePhotoId,
    colorAdj,
    colorAdjByPhoto,
    customImageAssets,
    customImageSource,
    emojiRandom,
    selectedEmoji,
    customImageRandom,
    selectedCustomImageId,
    asciiCharset,
    detectSettingsRef,
    normalizeSettings,
    photos,
    renderCanvas,
    selectedForBatch,
    setIsNormalizing,
    setNormalizePreviewIds,
    setNormalizeProgress,
    setNormalizeResults,
    setNormalizeSummary,
    setNotice,
    setPhotos,
    workCanvasRef,
  ])

  return { runNormalizeBatch, cancelNormalizeBatch }
}
