export const OPTICAL = {
  idleRotationDegPerSec: 4,
  spinUpDurationMs: 3000,
  illusionDurationMs: 20000,
  coolDownDurationMs: 4000,
  outerRotationDegPerSec: 110,
  innerRotationDegPerSec: -170,
  centerRotationDegPerSec: 4,
  pulseScale: { min: 1, max: 1.035 },
  ghostRingOpacity: { min: 0.08, max: 0.22 },
  blurRangePx: { min: 0, max: 2.5 },
  ghostRingCount: 5,
  pulsePeriodMs: 2800,
} as const

export type OpticalMode = 'idle' | 'spinUp' | 'illusion' | 'coolDown' | 'disabledReducedMotion'

const STORAGE_KEY = 'anonymizer-enable-optical-mode'

export function readEnableOpticalMode(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v !== 'false'
  } catch { return true }
}

export function writeEnableOpticalMode(enabled: boolean): void {
  try { localStorage.setItem(STORAGE_KEY, String(enabled)) } catch { /* ignore */ }
}
