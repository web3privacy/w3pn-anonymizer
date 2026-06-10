import { describe, it, expect } from 'vitest'
import { createId, hashString, pickCustomImageAssetId, brushStampSeed } from './ids'
import type { CustomImageAsset } from '../types'

describe('hashString', () => {
  it('is deterministic for the same input', () => {
    expect(hashString('abc')).toBe(hashString('abc'))
    expect(hashString(42)).toBe(hashString(42))
  })

  it('returns an unsigned 32-bit integer', () => {
    const h = hashString('some-long-seed-value')
    expect(Number.isInteger(h)).toBe(true)
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThanOrEqual(0xffffffff)
  })

  it('differs for different inputs', () => {
    expect(hashString('a')).not.toBe(hashString('b'))
  })

  it('handles undefined via the custom-image fallback', () => {
    expect(hashString(undefined)).toBe(hashString('custom-image'))
  })
})

describe('brushStampSeed', () => {
  it('rounds coordinates and joins with the photo id', () => {
    expect(brushStampSeed('photo1', 10.4, 20.6)).toBe('photo1:10:21')
  })

  it('is stable for the same rounded coordinates', () => {
    expect(brushStampSeed('p', 5.1, 5.2)).toBe(brushStampSeed('p', 5.4, 4.9))
  })
})

describe('pickCustomImageAssetId', () => {
  const asset = (id: string, ready: boolean): CustomImageAsset =>
    ({ id, name: id, imageBitmap: ready ? ({} as ImageBitmap) : null } as unknown as CustomImageAsset)

  it('returns undefined when no ready assets', () => {
    expect(pickCustomImageAssetId([], 'seed')).toBeUndefined()
    expect(pickCustomImageAssetId([asset('a', false)], 'seed')).toBeUndefined()
  })

  it('picks deterministically from ready assets', () => {
    const assets = [asset('a', true), asset('b', true), asset('c', true)]
    const first = pickCustomImageAssetId(assets, 'seed-1')
    expect(first).toBe(pickCustomImageAssetId(assets, 'seed-1'))
    expect(['a', 'b', 'c']).toContain(first)
  })

  it('ignores assets without an imageBitmap', () => {
    const assets = [asset('a', false), asset('b', true)]
    expect(pickCustomImageAssetId(assets, 'x')).toBe('b')
  })
})

describe('createId', () => {
  it('produces unique non-empty ids', () => {
    const a = createId()
    const b = createId()
    expect(a).toBeTruthy()
    expect(a).not.toBe(b)
  })
})
