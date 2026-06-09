/** Parsed from `/brand/spiral-logo.svg` — spiral + green diamond + inner black disc. */
export interface SpiralLogoPaths {
  spiral: string
  center: string
  /** Inner circle path (black disc inside the green diamond). */
  centerDisc: string
  mask: string
}

function splitCenterPath(d: string): { center: string; centerDisc: string } {
  const match = d.match(/^(.+?[Zz])\s*(M.+)$/s)
  if (!match) return { center: d, centerDisc: '' }
  return { center: match[1], centerDisc: match[2] }
}

function parseCenterPaths(paths: Element[]): { center: string; centerDisc: string } {
  const greenEl = paths.find(p => p.getAttribute('fill') === '#00FF78')
  const discEl = paths.find(p => (p.getAttribute('d') ?? '').startsWith('M205.132'))
  if (greenEl && discEl) {
    return {
      center: greenEl.getAttribute('d') ?? '',
      centerDisc: discEl.getAttribute('d') ?? '',
    }
  }
  const legacy = paths[paths.length - 1]?.getAttribute('d') ?? ''
  return splitCenterPath(legacy)
}

let cache: SpiralLogoPaths | null = null

export function loadSpiralLogoPaths(): Promise<SpiralLogoPaths> {
  if (cache) return Promise.resolve(cache)
  return fetch('/brand/spiral-logo.svg')
    .then(r => r.text())
    .then(text => {
      const doc = new DOMParser().parseFromString(text, 'image/svg+xml')
      const paths = [...doc.querySelectorAll('path')]
      const spiralEl = doc.querySelector('path[mask]') ?? paths[1] ?? paths[0]
      const { center, centerDisc } = parseCenterPaths(paths)
      cache = {
        spiral: spiralEl?.getAttribute('d') ?? '',
        center,
        centerDisc,
        mask: doc.querySelector('mask path')?.getAttribute('d') ?? paths[0]?.getAttribute('d') ?? '',
      }
      return cache
    })
}

export function getSpiralLogoPathsCache(): SpiralLogoPaths | null {
  return cache
}
