import { useState } from 'react'

import type { MatrixPosition } from '@/entities/stakeholder'

/** Cardinal direction for keyboard-based matrix position movement. */
export type MatrixMoveDirection = 'up' | 'down' | 'left' | 'right'

const STEP = 0.05

function clamp(v: number): number {
  return Math.max(0, Math.min(1, v))
}

/**
 * State management hook for the influence-attitude matrix editor.
 *
 * Maintains both a `savedPosition` (last confirmed placement) and a
 * `pendingPosition` (live during drag or arrow-key navigation).
 * Call `confirmPosition()` to commit the pending position and
 * `cancelPosition()` to revert to the saved position.
 *
 * @param initialPosition - The initial matrix position, or `null` if unset.
 * @returns State and action handlers for the matrix editor.
 */
export function useInfluenceAttitudeMatrix(initialPosition: MatrixPosition | null) {
  const [savedPosition, setSavedPosition] = useState<MatrixPosition | null>(initialPosition)
  const [pendingPosition, setPendingPosition] = useState<MatrixPosition | null>(initialPosition)

  function setPosition(x: number, y: number): MatrixPosition {
    const pos = { x: clamp(x), y: clamp(y) }
    setPendingPosition(pos)
    return pos
  }

  function confirmPosition() {
    setSavedPosition(pendingPosition)
  }

  function cancelPosition() {
    setPendingPosition(savedPosition)
  }

  function movePoint(direction: MatrixMoveDirection): MatrixPosition {
    const cur = pendingPosition ?? { x: 0.5, y: 0.5 }
    const next: Record<MatrixMoveDirection, MatrixPosition> = {
      up: { x: cur.x, y: clamp(cur.y + STEP) },
      down: { x: cur.x, y: clamp(cur.y - STEP) },
      left: { x: clamp(cur.x - STEP), y: cur.y },
      right: { x: clamp(cur.x + STEP), y: cur.y },
    }
    const pos = next[direction]
    setPendingPosition(pos)
    return pos
  }

  return { savedPosition, pendingPosition, setPosition, confirmPosition, cancelPosition, movePoint }
}
