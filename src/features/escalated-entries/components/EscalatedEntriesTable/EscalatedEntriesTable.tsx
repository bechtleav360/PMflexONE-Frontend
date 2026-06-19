import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { ListView } from '@/shared/components'
import { Checkbox } from '@/shared/components/Checkbox'

import { useEscalatedEntriesColumns } from '../../hooks/useEscalatedEntriesColumns'
import type { EscalatedEntryListItem } from '../../types/escalatedEntry.types'

interface EscalatedEntriesTableProps {
  rows: EscalatedEntryListItem[]
  onRowClick?: (id: string) => void
  onEscalate?: (entry: EscalatedEntryListItem) => void
}

/**
 * Displays a list of escalated entries with an optional "Show Returned" toggle.
 *
 * @param props - Component props.
 * @param props.rows - All escalated entry items to display.
 * @param props.onRowClick - Optional callback invoked with the entry ID when a name cell is clicked.
 * @param props.onEscalate - Optional callback invoked when the user triggers further escalation.
 * @returns The escalated entries table with header and filter toggle.
 */
export function EscalatedEntriesTable({
  rows,
  onRowClick,
  onEscalate,
}: EscalatedEntriesTableProps) {
  const { t } = useTranslation()
  const [showReturned, setShowReturned] = useState(false)
  const columns = useEscalatedEntriesColumns(onRowClick, onEscalate)

  const visibleRows = showReturned ? rows : rows.filter((r) => r.status !== 'RETURNED')

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('features.escalatedEntries.table.title')}</h2>
        <label className="flex cursor-pointer items-center gap-2 text-sm select-none">
          <Checkbox
            checked={showReturned}
            onCheckedChange={(checked) => setShowReturned(checked === true)}
          />
          {t('features.escalatedEntries.table.showReturned')}
        </label>
      </div>
      <ListView<EscalatedEntryListItem>
        columns={columns}
        rows={visibleRows}
        getRowKey={(row) => row.id}
        emptyTitle={t('features.escalatedEntries.table.empty')}
      />
    </div>
  )
}
