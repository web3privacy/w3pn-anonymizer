import type {
  DetectionCategoryConfig,
  DetectorInput,
  DetectorOutput,
  FaceBox,
  PrivacyDetectionType,
  PrivacyDetector,
} from '../../types'
import { detectFaces as legacyDetectFaces, initializeDetector, setDetectionProgressCallback } from '../detector'
import { faceBoxToPrivacyDetection } from '../detections/adapters'
import { canvasToDetectorInput } from './detectorUtils'

export { setDetectionProgressCallback }

const YUNET_MIN_TILE_DIM = 800

export const yunetFaceDetector: PrivacyDetector = {
  id: 'yunet-face',
  runtime: 'browser',
  supportedTypes: ['face'],

  async load() {
    await initializeDetector()
  },

  async detect(input: DetectorInput, config: DetectionCategoryConfig[]): Promise<DetectorOutput> {
    const faceEnabled = config.some((c) => c.type === 'face' && c.enabled)
    if (!faceEnabled) return { detections: [] }

    const canvas = input.canvas
    if (!canvas) return { detections: [], warnings: ['No canvas input for YuNet'] }

    const faceConfig = config.find((c) => c.type === 'face')
    const threshold = faceConfig?.confidenceThreshold ?? 0.65
    const robust = input.robust ?? (canvas.width > YUNET_MIN_TILE_DIM || canvas.height > YUNET_MIN_TILE_DIM)

    const t0 = performance.now()
    const boxes = await legacyDetectFaces(canvas, robust, threshold)
    const detections = boxes.map((b) =>
      faceBoxToPrivacyDetection(b, input.width, input.height, input.frameTime),
    )

    return {
      detections,
      timings: { yunet: performance.now() - t0 },
    }
  },
}

/** Convenience: detect faces and return legacy FaceBox[] (compat). */
export async function detectFaceBoxes(
  source: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement,
  robust = false,
  confidence?: number,
): Promise<FaceBox[]> {
  return legacyDetectFaces(source, robust, confidence)
}

export function buildDetectorInputFromSource(
  source: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement,
  frameTime?: number,
  robust?: boolean,
): DetectorInput {
  const { canvas, width, height } = canvasToDetectorInput(source)
  return { canvas, width, height, frameTime, robust }
}

export function isTypeEnabled(config: DetectionCategoryConfig[], type: PrivacyDetectionType): boolean {
  return config.some((c) => c.type === type && c.enabled)
}
