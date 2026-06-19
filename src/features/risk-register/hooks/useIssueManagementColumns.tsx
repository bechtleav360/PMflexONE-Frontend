import { useMemo } from 'react'

import type { TFunction } from 'i18next'
import { MoreVertical, Pencil, Plus } from 'lucide-react'
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

import { useCreateProblemFromIssueDialogStore } from '../store/useCreateProblemFromIssueDialogStore'
import { useEditIssueEntryDialogStore } from '../store/useEditIssueEntryDialogStore'
import type { IssueEntry } from '../types/issueEntry.types'
import { resolveEscalationTarget } from '../utils/escalationUtils'
import { PESTEL_OPTIONS } from '../utils/pestelOptions'
import { canCreateProblemFromIssue, ISSUE_ENTRY_STATUS_LABELS } from '../utils/statusConstants'

// Builds issue data column definitions (id, name, pestel, urgency, impact, status, date, owner).
function buildDataColumns(
  t: TFunction,
  pestelLabelMap: Record<string, string>,
): TableColumn<IssueEntry>[] {
  return [
    {
      id: 'entryNumber',
      header: t('pages.issueManagement.table.columns.id'),
      sortable: true,
      cell: (row) => <span className="font-mono text-xs">{row.entryNumber}</span>,
    },
    {
      id: 'name',
      header: t('pages.issueManagement.table.columns.name'),
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
      header: t('pages.issueManagement.table.columns.pestelCategory'),
      cell: (row) => (
        <span className="text-xs">{pestelLabelMap[row.pestelCategory] ?? row.pestelCategory}</span>
      ),
    },
    {
      id: 'urgency',
      header: t('pages.issueManagement.table.columns.urgency'),
      sortable: true,
      cell: (row) => <span className="text-xs tabular-nums">{row.urgency ?? '—'}</span>,
    },
    {
      id: 'impact',
      header: t('pages.issueManagement.table.columns.impact'),
      cell: (row) => <span className="text-xs tabular-nums">{row.impact ?? '—'}</span>,
    },
    {
      id: 'status',
      header: t('pages.issueManagement.table.columns.status'),
      cell: (row) => (
        <span className="text-xs">{t(ISSUE_ENTRY_STATUS_LABELS[row.status] ?? row.status)}</span>
      ),
    },
    {
      id: 'identificationDate',
      header: t('pages.issueManagement.table.columns.identificationDate'),
      sortable: true,
      cell: (row) => <span className="text-xs tabular-nums">{row.identificationDate}</span>,
    },
    {
      id: 'owner',
      header: t('pages.issueManagement.table.columns.owner'),
      cell: (row) => (
        <span className="text-xs">
          {row.owner != null ? `${row.owner.firstName} ${row.owner.lastName}` : '—'}
        </span>
      ),
    },
  ]
}

// Builds issue action column definitions (escalation badge + row actions dropdown).
function buildActionColumns(
  t: TFunction,
  openEdit: (id: string) => void,
  openCreateProblemFromIssue: (id: string, name: string, version: number) => void,
  onEscalate?: (entry: IssueEntry) => void,
): TableColumn<IssueEntry>[] {
  return [
    {
      id: 'escalation',
      header: t('pages.issueManagement.table.columns.escalation'),
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
                aria-label={t('pages.issueManagement.table.rowActionsLabel', { name: row.name })}
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
                {t('pages.issueManagement.table.editAction')}
              </DropdownMenuItem>
              {canCreateProblemFromIssue(row) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => openCreateProblemFromIssue(row.id, row.name, row.version)}
                  >
                    <Plus
                      className="mr-2 size-4"
                      aria-hidden="true"
                    />
                    {t('pages.issueManagement.createProblemFromIssue.confirm')}
                  </DropdownMenuItem>
                </>
              )}
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
 * Returns the `TableColumn<IssueEntry>[]` definitions for the Issue Management table.
 *
 * All cell renderers close over the Zustand store callbacks (`openEdit`,
 * `openCreateProblemFromIssue`) and the optional `onEscalate` prop so that the
 * column array can be built once per render cycle without prop-drilling.
 *
 * @param onEscalate - Optional callback invoked when the user triggers escalation. Wrap in `useCallback` to prevent unnecessary column array rebuilds.
 * @returns Ordered array of column definitions.
 */
export function useIssueManagementColumns(
  onEscalate?: (entry: IssueEntry) => void,
): TableColumn<IssueEntry>[] {
  const { t } = useTranslation()
  const openEdit = useEditIssueEntryDialogStore((s) => s.open)
  const openCreateProblemFromIssue = useCreateProblemFromIssueDialogStore((s) => s.open)
  const pestelLabelMap = useMemo(
    () => Object.fromEntries(PESTEL_OPTIONS.map((o) => [o.value, t(o.labelKey)])),
    [t],
  )
  return useMemo(
    () => [
      ...buildDataColumns(t, pestelLabelMap),
      ...buildActionColumns(t, openEdit, openCreateProblemFromIssue, onEscalate),
    ],
    [t, pestelLabelMap, openEdit, openCreateProblemFromIssue, onEscalate],
  )
}
