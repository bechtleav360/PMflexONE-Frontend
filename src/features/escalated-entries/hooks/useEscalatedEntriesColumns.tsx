import { useMemo } from 'react'

import { MoreVertical } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EscalationStatusBadge,
} from '@/shared/components'
import type { TableColumn } from '@/shared/components'
import { formatDate } from '@/shared/lib/utils'

import { useDeEscalateEntryDialogStore } from '../store/useDeEscalateEntryDialogStore'
import type { EscalatedEntryListItem } from '../types/escalatedEntry.types'

/**
 * Returns the `TableColumn<EscalatedEntryListItem>[]` definitions for the Escalated Entries table.
 *
 * @param onRowClick - Optional callback invoked with the entry ID when a name cell is clicked. Wrap in `useCallback` to prevent unnecessary column array rebuilds.
 * @param onEscalate - Optional callback invoked when the user triggers further escalation on an entry. Wrap in `useCallback` to prevent unnecessary column array rebuilds.
 * @returns Ordered array of column definitions.
 */
// eslint-disable-next-line max-lines-per-function -- line count scales with the number of data columns (8 columns × JSX cell renderers), not with logic complexity
export function useEscalatedEntriesColumns(
  onRowClick?: (id: string) => void,
  onEscalate?: (entry: EscalatedEntryListItem) => void,
): TableColumn<EscalatedEntryListItem>[] {
  const { t } = useTranslation()
  const openDeEscalate = useDeEscalateEntryDialogStore((s) => s.open)

  return useMemo(
    () => [
      {
        id: 'entryNumber',
        header: t('features.escalatedEntries.table.columns.entryNumber'),
        cell: (row) => <span className="font-mono text-xs">{row.entryNumber}</span>,
      },
      {
        id: 'name',
        header: t('features.escalatedEntries.table.columns.name'),
        cell: (row) =>
          onRowClick ? (
            <button
              type="button"
              className="focus-visible:ring-ring cursor-pointer text-left font-medium focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
              onClick={() => onRowClick(row.id)}
            >
              {row.name}
            </button>
          ) : (
            <span className="font-medium">{row.name}</span>
          ),
      },
      {
        id: 'source',
        header: t('features.escalatedEntries.table.columns.source'),
        cell: (row) => (
          <span className="text-xs">{row.escalationChain ?? row.scope?.scopeType}</span>
        ),
      },
      {
        id: 'escalatedBy',
        header: t('features.escalatedEntries.table.columns.escalatedBy'),
        cell: (row) => (
          <span className="text-xs">
            {row.creator ? `${row.creator.firstName} ${row.creator.lastName}` : '—'}
          </span>
        ),
      },
      {
        id: 'date',
        header: t('features.escalatedEntries.table.columns.date'),
        cell: (row) => <span className="text-xs tabular-nums">{formatDate(row.escalatedAt)}</span>,
      },
      {
        id: 'status',
        header: t('features.escalatedEntries.table.columns.status'),
        cell: (row) => <EscalationStatusBadge status={row.status} />,
      },
      {
        id: 'sourceAssessment',
        header: t('features.escalatedEntries.table.columns.sourceAssessment'),
        cell: (row) => (
          <span className="text-xs tabular-nums">
            {row.probability != null && row.impact != null
              ? `${row.probability} / ${row.impact}`
              : '—'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        width: 52,
        cell: (row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('features.escalatedEntries.table.rowActionsLabel', {
                  name: row.name,
                })}
              >
                <MoreVertical
                  className="size-4"
                  aria-hidden="true"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEscalate && (
                <DropdownMenuItem
                  onSelect={() => onEscalate(row)}
                  disabled={row.status !== 'ACTIVE'}
                >
                  {t('features.escalatedEntries.actions.escalate')}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onSelect={() => openDeEscalate(row.id, row.version)}
                disabled={row.status !== 'ACTIVE'}
              >
                {t('features.escalatedEntries.actions.return')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, openDeEscalate, onRowClick, onEscalate],
  )
}
