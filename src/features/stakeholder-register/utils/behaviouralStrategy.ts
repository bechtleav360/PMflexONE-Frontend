import type { BehaviouralStrategy, MatrixPosition } from '@/entities/stakeholder'

const THRESHOLD = 0.5

/**
 * Derives the behavioural strategy quadrant from a normalised matrix position.
 *
 * The threshold for "high" influence or affectedness is 0.5 (inclusive).
 * Quadrant mapping:
 * - x ≥ 0.5 && y ≥ 0.5 → `MANAGE_CLOSELY`
 * - x ≥ 0.5 && y < 0.5 → `KEEP_INFORMED`
 * - x < 0.5 && y ≥ 0.5 → `KEEP_SATISFIED`
 * - x < 0.5 && y < 0.5 → `MONITOR`
 *
 * @param pos - The normalised [0, 1] matrix position.
 * @returns The corresponding {@link BehaviouralStrategy} value.
 */
export function deriveBehaviouralStrategy(pos: MatrixPosition): BehaviouralStrategy {
  if (pos.x >= THRESHOLD && pos.y >= THRESHOLD) return 'MANAGE_CLOSELY'
  if (pos.x >= THRESHOLD) return 'KEEP_INFORMED'
  if (pos.y >= THRESHOLD) return 'KEEP_SATISFIED'
  return 'MONITOR'
}
