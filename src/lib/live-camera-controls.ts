export interface LiveTrackCapabilities {
  torch: boolean
  exposure: boolean
  zoom: boolean
  exposureMin: number
  exposureMax: number
  exposureStep: number
  zoomMin: number
  zoomMax: number
  zoomStep: number
}

export function readLiveTrackCapabilities(track: MediaStreamTrack | null): LiveTrackCapabilities {
  const empty: LiveTrackCapabilities = {
    torch: false,
    exposure: false,
    zoom: false,
    exposureMin: -2,
    exposureMax: 2,
    exposureStep: 0.1,
    zoomMin: 1,
    zoomMax: 1,
    zoomStep: 0.1,
  }
  if (!track?.getCapabilities) return empty
  const caps = track.getCapabilities() as MediaTrackCapabilities & {
    torch?: boolean
    exposureCompensation?: { min: number; max: number; step?: number }
    zoom?: { min: number; max: number; step?: number }
  }
  return {
    torch: Boolean(caps.torch),
    exposure: caps.exposureCompensation != null,
    exposureMin: caps.exposureCompensation?.min ?? -2,
    exposureMax: caps.exposureCompensation?.max ?? 2,
    exposureStep: caps.exposureCompensation?.step ?? 0.1,
    zoom: caps.zoom != null,
    zoomMin: caps.zoom?.min ?? 1,
    zoomMax: caps.zoom?.max ?? 1,
    zoomStep: caps.zoom?.step ?? 0.1,
  }
}

export async function applyLiveTrackSettings(
  track: MediaStreamTrack | null,
  settings: { torch?: boolean; exposureCompensation?: number; zoom?: number },
): Promise<void> {
  if (!track?.applyConstraints) return
  const caps = readLiveTrackCapabilities(track)
  const advanced: Record<string, unknown>[] = [{}]
  const base: MediaTrackConstraints = {}

  if (settings.torch != null && caps.torch) {
    advanced[0].torch = settings.torch
  }
  if (settings.exposureCompensation != null && caps.exposure) {
    (base as MediaTrackConstraints & { exposureCompensation?: number }).exposureCompensation = settings.exposureCompensation
  }
  if (settings.zoom != null && caps.zoom) {
    (base as MediaTrackConstraints & { zoom?: number }).zoom = settings.zoom
  }

  try {
    const constraints = {
      ...base,
      advanced: advanced,
    } as MediaTrackConstraints
    await track.applyConstraints(constraints)
  } catch {
    // Device may reject unsupported combinations — ignore
  }
}
