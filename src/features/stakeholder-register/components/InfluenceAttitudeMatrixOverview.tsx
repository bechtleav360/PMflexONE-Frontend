import { useMemo } from 'react'

import type { StakeholderEntry } from '@/entities/stakeholder'

import type { OverviewDot } from './InfluenceAttitudeMatrix'
import { InfluenceAttitudeMatrix } from './InfluenceAttitudeMatrix'

/** Props for {@link InfluenceAttitudeMatrixOverview}. */
export interface InfluenceAttitudeMatrixOverviewProps {
  entries: StakeholderEntry[]
  onCellClick?: (col: number, row: number) => void
  selectedCell?: { col: number; row: number } | null
}

/**
 * Read-only influence-attitude matrix overview showing positioned stakeholders.
 *
 * Derives overlay dots from the `entries` array and passes them to
 * {@link InfluenceAttitudeMatrix}. Cell clicks toggle the `selectedCell` highlight
 * which the parent page uses to filter the entry table.
 *
 * @param props - Component props.
 * @param props.entries - The stakeholder entries to display as dots on the matrix.
 * @param props.onCellClick - Callback invoked when the user clicks a 6×6 grid cell.
 * @param props.selectedCell - The currently highlighted cell, or `null` for no selection.
 * @returns A read-only matrix overview.
 */
export function InfluenceAttitudeMatrixOverview({
  entries,
  onCellClick,
  selectedCell,
}: InfluenceAttitudeMatrixOverviewProps) {
  const overviewDots = useMemo<OverviewDot[]>(
    () =>
      entries
        .filter((e) => e.matrixPosition != null)
        .map((e) => ({
          id: e.id,
          position: e.matrixPosition!,
          label: e.name,
        })),
    [entries],
  )

  return (
    <InfluenceAttitudeMatrix
      overviewDots={overviewDots}
      onCellClick={onCellClick}
      selectedCell={selectedCell}
    />
  )
}
