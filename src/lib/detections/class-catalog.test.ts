import { describe, expect, it } from 'vitest'
import {
  COCO_CLASSES,
  classesForModel,
  getAvailableExtraClasses,
  prettyClassName,
} from './class-catalog'
import type { ModelAvailabilityStatus } from '../../types'

describe('class-catalog', () => {
  it('has the full 80-class COCO list', () => {
    expect(COCO_CLASSES).toHaveLength(80)
    expect(COCO_CLASSES[0]).toBe('person')
    expect(COCO_CLASSES).toContain('cell phone')
    expect(COCO_CLASSES).toContain('toothbrush')
  })

  it('marks featured COCO classes so they stay out of the extra list', () => {
    const entries = classesForModel('yolo-coco')
    expect(entries.find((e) => e.className === 'person')?.featuredType).toBe('person')
    expect(entries.find((e) => e.className === 'tv')?.featuredType).toBe('screen')
    expect(entries.find((e) => e.className === 'car')?.featuredType).toBeUndefined()
  })

  it('returns extra classes only from ready models, excluding featured', () => {
    const status: Record<string, ModelAvailabilityStatus> = {
      'yolo-coco': 'ready',
      'yolo-license-plate': 'ready',
    }
    const extra = getAvailableExtraClasses(status)
    const names = extra.map((e) => e.className)
    expect(names).toContain('car')
    expect(names).toContain('dog')
    expect(names).not.toContain('person') // featured → person
    expect(names).not.toContain('license_plate') // featured → license_plate
  })

  it('returns nothing when no model is ready', () => {
    expect(getAvailableExtraClasses({ 'yolo-coco': 'loading' })).toHaveLength(0)
  })

  it('title-cases class names', () => {
    expect(prettyClassName('cell phone')).toBe('Cell Phone')
    expect(prettyClassName('car')).toBe('Car')
  })
})
