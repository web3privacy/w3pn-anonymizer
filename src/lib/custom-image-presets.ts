import type { CustomImageSource } from '../types'

export interface CustomImagePresetDefinition {
  /** Value stored in app state (`CustomImageSource`). */
  id: Exclude<CustomImageSource, 'custom'>
  /** Folder under `public/custom-images/`. */
  folder: string
  /** User-facing name in the library picker. */
  label: string
  /** Short description for docs / tooltips. */
  description: string
  /** How images are sourced (for maintainers). */
  source?: string
}

/** Bundled preset libraries shipped with the app. Add new entries here + assets under public/custom-images/. */
export const CUSTOM_IMAGE_PRESETS: readonly CustomImagePresetDefinition[] = [
  {
    id: 'ui-faces-human',
    folder: 'human',
    label: 'UI Faces',
    description: 'RandomUser.me portrait avatars',
    source: 'randomuser.me',
  },
  {
    id: 'ui-faces-abstract',
    folder: 'abstract',
    label: 'Abstract',
    description: 'DiceBear abstract shapes',
    source: 'DiceBear API',
  },
  {
    id: 'cryptopunks',
    folder: 'punks',
    label: 'CryptoPunks',
    description: 'Larva Labs CryptoPunks',
    source: 'Larva Labs',
  },
  {
    id: 'aavegotchi',
    folder: 'aavegotchi',
    label: 'Aavegotchi',
    description: 'On-chain Aavegotchi characters',
    source: 'Goldsky / Polygon',
  },
  {
    id: 'celebrities',
    folder: 'celebrities',
    label: 'Celebrities',
    description: 'CC-licensed Wikimedia portraits',
    source: 'Wikimedia Commons',
  },
] as const

export const DEFAULT_CUSTOM_IMAGE_PRESET_ID: Exclude<CustomImageSource, 'custom'> = 'ui-faces-human'

export function customImagePresetById(id: CustomImageSource): CustomImagePresetDefinition | undefined {
  if (id === 'custom') return undefined
  return CUSTOM_IMAGE_PRESETS.find((p) => p.id === id)
}

export function customImageFolderForSource(source: CustomImageSource): string | undefined {
  return customImagePresetById(source)?.folder
}

export function customImagePresetOptions(): { id: CustomImageSource; label: string }[] {
  return CUSTOM_IMAGE_PRESETS.map((p) => ({ id: p.id, label: p.label }))
}
