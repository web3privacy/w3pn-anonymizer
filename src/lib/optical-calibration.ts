export const OPTICAL = {
  idleRotationDegPerSec: 4,
  spinUpDurationMs: 3000,
  illusionDurationMs: 20000,
  /** Wind-down: decelerate layers, fade ghosts, crossfade back to idle spiral. */
  coolDownDurationMs: 9800,
  /** Crossfade idle spiral in during the last stretch of coolDown. */
  settleCrossfadeMs: 3000,
  /** Ease-out exponent — higher = longer gentle tail when slowing to idle. */
  coolDownEasePower: 5.2,
  /** After crossfade, shrink tablet/desktop layout back to default logo size. */
  layoutSettleMs: 950,
  outerRotationDegPerSec: 110,
  innerRotationDegPerSec: -170,
  centerRotationDegPerSec: 4,
  pulseScale: { min: 1, max: 1.035 },
  /** Counter-rotating layers breathe in opposition during illusion (± fraction). */
  layerBreathScaleDelta: 0.065,
  layerBreathPeriodMs: 5200,
  ghostRingOpacity: { min: 0.08, max: 0.22 },
  blurRangePx: { min: 0, max: 2.5 },
  ghostRingCount: 5,
  pulsePeriodMs: 2800,
} as const

export type OpticalMode = 'idle' | 'spinUp' | 'illusion' | 'coolDown' | 'settling' | 'disabledReducedMotion'

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
