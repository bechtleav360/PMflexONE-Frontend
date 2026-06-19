import { useMemo } from 'react'

import type { TFunction } from 'i18next'
import { MoreVertical, Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EscalationStatusBadge,
} from '@/shared/components'
import type { TableColumn } from '@/shared/components'

import { useEditProblemEntryDialogStore } from '../store/useEditProblemEntryDialogStore'
import type { ProblemEntry } from '../types/problemEntry.types'
import { resolveEscalationTarget } from '../utils/escalationUtils'
import { PESTEL_OPTIONS } from '../utils/pestelOptions'
import { PROBLEM_ENTRY_STATUS_LABELS } from '../utils/statusConstants'

// Builds problem data column definitions (id, name, pestel, impact, status, date, owner).
function buildDataColumns(
  t: TFunction,
  pestelLabelMap: Record<string, string>,
): TableColumn<ProblemEntry>[] {
  return [
    {
      id: 'entryNumber',
      header: t('pages.problemManagement.table.columns.id'),
      sortable: true,
      cell: (row) => <span className="font-mono text-xs">{row.entryNumber}</span>,
    },
    {
      id: 'name',
      header: t('pages.problemManagement.table.columns.name'),
      cell: (row) => {
        const activeEscalation = row.activeEscalations[0]
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">{row.name}</span>
            {activeEscalation && (
              <span className="text-muted-foreground text-xs">
                {t('features.escalatedEntries.actions.escalatedTo', {
                  targetName: resolveEscalationTarget(activeEscalation),
                })}
              </span>
            )}
          </div>
        )
      },
    },
    {
      id: 'pestelCategory',
      header: t('pages.problemManagement.table.columns.pestelCategory'),
      cell: (row) => (
        <span className="text-xs">{pestelLabelMap[row.pestelCategory] ?? row.pestelCategory}</span>
      ),
    },
    {
      id: 'impact',
      header: t('pages.problemManagement.table.columns.impact'),
      cell: (row) => <span className="text-xs tabular-nums">{row.impact ?? '—'}</span>,
    },
    {
      id: 'status',
      header: t('pages.problemManagement.table.columns.status'),
      cell: (row) => (
        <span className="text-xs">{t(PROBLEM_ENTRY_STATUS_LABELS[row.status] ?? row.status)}</span>
      ),
    },
    {
      id: 'identificationDate',
      header: t('pages.problemManagement.table.columns.identificationDate'),
      sortable: true,
      cell: (row) => <span className="text-xs tabular-nums">{row.identificationDate}</span>,
    },
    {
      id: 'owner',
      header: t('pages.problemManagement.table.columns.owner'),
      cell: (row) => (
        <span className="text-xs">
          {row.owner != null ? `${row.owner.firstName} ${row.owner.lastName}` : '—'}
        </span>
      ),
    },
  ]
}

// Builds problem action column definitions (escalation badge + row actions dropdown).
function buildActionColumns(
  t: TFunction,
  openEdit: (id: string) => void,
  onEscalate?: (entry: ProblemEntry) => void,
): TableColumn<ProblemEntry>[] {
  return [
    {
      id: 'escalation',
      header: t('pages.problemManagement.table.columns.escalation'),
      cell: (row) => {
        const activeEscalation = row.activeEscalations[0]
        return activeEscalation ? <EscalationStatusBadge status={activeEscalation.status} /> : null
      },
    },
    {
      id: 'actions',
      header: '',
      width: 52,
      cell: (row) => {
        const activeEscalation = row.activeEscalations[0]
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('pages.problemManagement.table.rowActionsLabel', { name: row.name })}
              >
                <MoreVertical
                  className="size-4"
                  aria-hidden="true"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => openEdit(row.id)}
                disabled={!!activeEscalation}
              >
                <Pencil
                  className="mr-2 size-4"
                  aria-hidden="true"
                />
                {t('pages.problemManagement.table.editAction')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => onEscalate?.(row)}
                disabled={!!activeEscalation}
              >
                {t('features.escalatedEntries.actions.escalate')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

/**
 * Returns the `TableColumn<ProblemEntry>[]` definitions for the Problem Management table.
 *
 * @param onEscalate - Optional callback invoked when the user triggers escalation. Wrap in `useCallback` to prevent unnecessary column array rebuilds.
 * @returns Ordered array of column definitions.
 */
export function useProblemManagementColumns(
  onEscalate?: (entry: ProblemEntry) => void,
): TableColumn<ProblemEntry>[] {
  const { t } = useTranslation()
  const openEdit = useEditProblemEntryDialogStore((s) => s.open)
  const pestelLabelMap = useMemo(
    () => Object.fromEntries(PESTEL_OPTIONS.map((o) => [o.value, t(o.labelKey)])),
    [t],
  )
  return useMemo(
    () => [...buildDataColumns(t, pestelLabelMap), ...buildActionColumns(t, openEdit, onEscalate)],
    [t, pestelLabelMap, openEdit, onEscalate],
  )
}
