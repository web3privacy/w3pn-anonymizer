import { describe, it, expect } from 'vitest'
import { pushSnapshot, popSnapshot, MAX_UNDO_SNAPSHOTS } from './undo-stack'

describe('pushSnapshot', () => {
  it('adds to the front (most recent first)', () => {
    expect(pushSnapshot(['b', 'c'], 'a')).toEqual(['a', 'b', 'c'])
  })
  it('caps the stack at MAX_UNDO_SNAPSHOTS, dropping the oldest', () => {
    let stack: string[] = []
    for (const s of ['1', '2', '3', '4', '5']) stack = pushSnapshot(stack, s)
    expect(stack).toEqual(['5', '4', '3'])
    expect(stack.length).toBe(MAX_UNDO_SNAPSHOTS)
  })
  it('respects a custom cap', () => {
    expect(pushSnapshot(['a'], 'b', 1)).toEqual(['b'])
  })
  it('does not mutate the input', () => {
    const input = ['x']
    pushSnapshot(input, 'y')
    expect(input).toEqual(['x'])
  })
})

describe('popSnapshot', () => {
  it('returns null + empty rest for an empty stack', () => {
    expect(popSnapshot([])).toEqual({ snapshot: null, rest: [] })
  })
  it('returns the front element and the remaining stack', () => {
    expect(popSnapshot(['a', 'b', 'c'])).toEqual({ snapshot: 'a', rest: ['b', 'c'] })
  })
  it('does not mutate the input', () => {
    const input = ['a', 'b']
    popSnapshot(input)
    expect(input).toEqual(['a', 'b'])
  })
})
