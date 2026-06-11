import type {
  DetectionCategoryConfig,
  DetectorInput,
  DetectorOutput,
  ModelAvailabilityStatus,
  PrivacyDetection,
  PrivacyDetectionType,
  PrivacyDetector,
} from '../../types'
import { DETECTION_COLORS } from '../detection-config'
import { classesForModel } from '../detections/class-catalog'
import { createDetectionId } from '../detections/adapters'
import {
  centerBoxToBbox,
  letterboxCanvas,
  nmsPrivacyDetections,
  parseYoloV8Output,
  scaleBoxFromLetterbox,
  type YoloRawDetection,
} from './detectorUtils'

export type YoloModelMetadata = {
  id: string
  inputSize: number
  format: 'yolov8' | 'yolov11'
  classes: Record<string, string>
  mapToPrivacyTypes: Record<string, PrivacyDetectionType>
}

const MODEL_PATHS: Record<string, string> = {
  'yolo-coco': '/models/privacy/yolo-coco.onnx',
  'yolo-license-plate': '/models/privacy/yolo-license-plate.onnx',
  'yolo-privacy-custom': '/models/privacy/yolo-privacy-custom.onnx',
}

const METADATA_PATHS: Record<string, string> = {
  'yolo-coco': '/models/privacy/yolo-coco.metadata.json',
  'yolo-license-plate': '/models/privacy/yolo-license-plate.metadata.json',
  'yolo-privacy-custom': '/models/privacy/yolo-privacy-custom.metadata.json',
}

/** Which privacy types each model can satisfy. */
export const MODEL_SUPPORTED_TYPES: Record<string, PrivacyDetectionType[]> = {
  'yolo-coco': ['person', 'screen', 'document'],
  'yolo-license-plate': ['license_plate'],
  'yolo-privacy-custom': ['screen', 'tattoo', 'sign', 'document'],
}

type SessionCache = {
  metadata: YoloModelMetadata | null
  status: ModelAvailabilityStatus
  session: import('onnxruntime-web').InferenceSession | null
}

const cache = new Map<string, SessionCache>()

export function getYoloModelStatus(modelId: string): ModelAvailabilityStatus {
  return cache.get(modelId)?.status ?? 'missing'
}

export async function probeYoloModelAvailability(modelId: string): Promise<ModelAvailabilityStatus> {
  const metaPath = METADATA_PATHS[modelId]
  const modelPath = MODEL_PATHS[modelId]
  if (!metaPath || !modelPath) return 'missing'

  try {
    const metaRes = await fetch(metaPath, { method: 'HEAD' })
    const modelRes = await fetch(modelPath, { method: 'HEAD' })
    const modelLen = Number(modelRes.headers.get('content-length') ?? 0)
    const modelType = modelRes.headers.get('content-type') ?? ''
    const looksLikeOnnx = modelRes.ok
      && !modelType.includes('text/html')
      && (modelLen === 0 || modelLen > 50_000)
    if (!metaRes.ok || !looksLikeOnnx) {
      cache.set(modelId, { metadata: null, status: 'missing', session: null })
      return 'missing'
    }
    cache.set(modelId, { metadata: null, status: 'ready', session: null })
    return 'ready'
  } catch {
    cache.set(modelId, { metadata: null, status: 'missing', session: null })
    return 'missing'
  }
}

export async function probeAllYoloModels(): Promise<Record<string, ModelAvailabilityStatus>> {
  const ids = Object.keys(MODEL_PATHS)
  const out: Record<string, ModelAvailabilityStatus> = {}
  await Promise.all(ids.map(async (id) => {
    out[id] = await probeYoloModelAvailability(id)
  }))
  return out
}

async function loadMetadata(modelId: string): Promise<YoloModelMetadata | null> {
  const path = METADATA_PATHS[modelId]
  if (!path) return null
  try {
    const res = await fetch(path)
    if (!res.ok) return null
    return (await res.json()) as YoloModelMetadata
  } catch {
    return null
  }
}

async function getOrCreateSession(modelId: string): Promise<{
  session: import('onnxruntime-web').InferenceSession | null
  metadata: YoloModelMetadata | null
}> {
  let entry = cache.get(modelId)
  if (!entry) {
    entry = { metadata: null, status: 'missing', session: null }
    cache.set(modelId, entry)
  }

  if (entry.status === 'missing') {
    const status = await probeYoloModelAvailability(modelId)
    entry.status = status
    if (status !== 'ready') return { session: null, metadata: null }
  }

  if (entry.session && entry.metadata) {
    return { session: entry.session, metadata: entry.metadata }
  }

  entry.status = 'loading'
  const metadata = await loadMetadata(modelId)
  if (!metadata) {
    entry.status = 'missing'
    return { session: null, metadata: null }
  }

  try {
    const ort = await import('onnxruntime-web')
    ort.env.wasm.wasmPaths = '/onnx/'
    const session = await ort.InferenceSession.create(MODEL_PATHS[modelId]!, {
      executionProviders: ['wasm'],
    })
    entry.session = session
    entry.metadata = metadata
    entry.status = 'ready'
    return { session, metadata }
  } catch {
    entry.status = 'error'
    entry.session = null
    return { session: null, metadata: null }
  }
}

type ClassResolution =
  | { type: PrivacyDetectionType; objectClass?: undefined }
  | { type: 'object'; objectClass: string }
  | null

/** Decide how a detected class is emitted: featured type (if enabled) else generic 'object'. */
function resolveClass(
  className: string,
  metadata: YoloModelMetadata,
  enabledTypes: Set<PrivacyDetectionType>,
  enabledClasses: Set<string>,
): ClassResolution {
  const featured = metadata.mapToPrivacyTypes[className]
  if (featured && enabledTypes.has(featured)) return { type: featured }
  if (enabledClasses.has(className)) return { type: 'object', objectClass: className }
  return null
}

function rawToDetections(
  raw: YoloRawDetection[],
  metadata: YoloModelMetadata,
  meta: ReturnType<typeof letterboxCanvas>['meta'],
  input: DetectorInput,
  enabledTypes: Set<PrivacyDetectionType>,
  enabledClasses: Set<string>,
  minConfidence: number,
): PrivacyDetection[] {
  const detections: PrivacyDetection[] = []
  const classById = new Map<number, string>(
    Object.entries(metadata.classes).map(([id, name]) => [Number(id), name]),
  )

  for (const r of raw) {
    if (r.confidence < minConfidence) continue
    const className = classById.get(r.classId)
    if (!className) continue
    const resolved = resolveClass(className, metadata, enabledTypes, enabledClasses)
    if (!resolved) continue

    // YOLOv8 coordinates are in input-pixel space (0..inputSize); normalize to
    // 0..1 in letterbox space before mapping back to the source image.
    const inv = 1 / metadata.inputSize
    const normBox = centerBoxToBbox(r.cx * inv, r.cy * inv, r.w * inv, r.h * inv)
    const scaled = scaleBoxFromLetterbox(
      normBox,
      meta,
      metadata.inputSize,
      input.width,
      input.height,
    )

    detections.push({
      id: createDetectionId(resolved.type),
      type: resolved.type,
      bbox: scaled,
      confidence: r.confidence,
      sourceModel: metadata.id,
      frameTime: input.frameTime,
      color: DETECTION_COLORS[resolved.type],
      objectClass: resolved.objectClass,
    })
  }
  return detections
}

function modelsForRun(
  enabledTypes: PrivacyDetectionType[],
  enabledClasses: Set<string>,
): string[] {
  const models = new Set<string>()
  for (const [modelId, types] of Object.entries(MODEL_SUPPORTED_TYPES)) {
    if (types.some((t) => enabledTypes.includes(t))) models.add(modelId)
  }
  if (enabledClasses.size > 0) {
    for (const modelId of Object.keys(MODEL_SUPPORTED_TYPES)) {
      if (classesForModel(modelId).some((e) => enabledClasses.has(e.className))) {
        models.add(modelId)
      }
    }
  }
  return [...models]
}

async function runYoloModel(
  modelId: string,
  input: DetectorInput,
  config: DetectionCategoryConfig[],
  enabledClasses: Set<string>,
): Promise<PrivacyDetection[]> {
  const enabledTypes = new Set(
    config.filter((c) => c.enabled).map((c) => c.type),
  )
  const { session, metadata } = await getOrCreateSession(modelId)
  if (!session || !metadata || !input.canvas) return []

  const { canvas: lbCanvas, meta } = letterboxCanvas(input.canvas, metadata.inputSize)
  const ort = await import('onnxruntime-web')
  const tensorData = new Float32Array(3 * metadata.inputSize * metadata.inputSize)
  const ctx = lbCanvas.getContext('2d')!
  const img = ctx.getImageData(0, 0, metadata.inputSize, metadata.inputSize)
  const plane = metadata.inputSize * metadata.inputSize
  for (let i = 0; i < plane; i++) {
    const j = i * 4
    tensorData[i] = img.data[j] / 255
    tensorData[plane + i] = img.data[j + 1] / 255
    tensorData[2 * plane + i] = img.data[j + 2] / 255
  }

  const inputName = session.inputNames[0] ?? 'images'
  const feeds = {
    [inputName]: new ort.Tensor('float32', tensorData, [1, 3, metadata.inputSize, metadata.inputSize]),
  }
  const results = await session.run(feeds)
  const outputName = session.outputNames[0]
  const output = results[outputName]
  if (!output?.data) return []

  const data = output.data as Float32Array
  // Derive shape from the actual output tensor, not metadata. YOLOv8 exports
  // [1, 4+numClasses, numAnchors]; metadata.classes is only a sparse filter map.
  const dims = output.dims as readonly number[]
  let numChannels: number
  let numAnchors: number
  if (dims.length === 3) {
    numChannels = dims[1]
    numAnchors = dims[2]
  } else {
    // Fallback: assume class count from metadata when dims are unavailable.
    numChannels = 4 + Object.keys(metadata.classes).length
    numAnchors = data.length / numChannels
  }
  const numClasses = Math.max(1, numChannels - 4)
  const minConf = Math.min(
    ...config.filter((c) => c.enabled).map((c) => c.confidenceThreshold),
    0.25,
  )
  const raw = parseYoloV8Output(data, numClasses, numAnchors, minConf)
  return rawToDetections(raw, metadata, meta, input, enabledTypes, enabledClasses, minConf)
}

export const yoloDetector: PrivacyDetector = {
  id: 'yolo-multi',
  runtime: 'browser',
  supportedTypes: ['person', 'license_plate', 'screen', 'tattoo', 'sign', 'document'],

  async load() {
    await probeAllYoloModels()
  },

  async detect(input: DetectorInput, config: DetectionCategoryConfig[]): Promise<DetectorOutput> {
    const enabled = config.filter((c) => c.enabled && c.type !== 'face' && c.type !== 'manual_zone')
    const enabledClasses = new Set(input.enabledClasses ?? [])
    if (enabled.length === 0 && enabledClasses.size === 0) return { detections: [] }

    const enabledTypes = enabled.map((c) => c.type)
    const modelIds = modelsForRun(enabledTypes, enabledClasses)
    const warnings: string[] = []
    const all: PrivacyDetection[] = []
    const timings: Record<string, number> = {}

    for (const modelId of modelIds) {
      const status = getYoloModelStatus(modelId)
      if (status === 'missing') {
        warnings.push(`Model ${modelId} is not bundled yet (coming soon).`)
        continue
      }
      const t0 = performance.now()
      try {
        const dets = await runYoloModel(modelId, input, config, enabledClasses)
        all.push(...dets)
        timings[modelId] = performance.now() - t0
      } catch (err) {
        warnings.push(`Model ${modelId} failed: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    return {
      detections: nmsPrivacyDetections(all),
      timings,
      warnings: warnings.length ? warnings : undefined,
    }
  },

  dispose() {
    for (const entry of cache.values()) {
      void entry.session?.release()
    }
    cache.clear()
  },
}

export async function checkYoloNeeded(
  config: DetectionCategoryConfig[],
  enabledClasses?: string[],
): Promise<boolean> {
  const enabled = config.filter((c) => c.enabled && c.type !== 'face' && c.type !== 'manual_zone')
  return enabled.length > 0 || (enabledClasses?.length ?? 0) > 0
}
