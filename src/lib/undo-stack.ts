/**
 * Pure undo-stack semantics (no React, no DOM) so the logic is unit-testable in
 * isolation. The editor keeps at most a few full-canvas snapshots; the cap is
 * intentionally small to bound memory for large images.
 */

export const MAX_UNDO_SNAPSHOTS = 3

/** Push a snapshot to the front, keeping at most `max` entries. */
export function pushSnapshot<T>(stack: readonly T[], snapshot: T, max = MAX_UNDO_SNAPSHOTS): T[] {
  return [snapshot, ...stack].slice(0, max)
}

/** Pop the most recent snapshot, returning it plus the remaining stack. */
export function popSnapshot<T>(stack: readonly T[]): { snapshot: T | null; rest: T[] } {
  if (stack.length === 0) return { snapshot: null, rest: [] }
  const [snapshot, ...rest] = stack
  return { snapshot, rest }
}
