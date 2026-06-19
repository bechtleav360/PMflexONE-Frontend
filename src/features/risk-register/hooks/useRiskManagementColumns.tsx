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

import { RiskLevelBadge } from '../components/RiskLevelBadge'
import { useCreateIssueFromRiskDialogStore } from '../store/useCreateIssueFromRiskDialogStore'
import { useEditRiskEntryDialogStore } from '../store/useEditRiskEntryDialogStore'
import type { RiskEntry } from '../types/riskEntry.types'
import { resolveEscalationTarget } from '../utils/escalationUtils'
import { PESTEL_OPTIONS } from '../utils/pestelOptions'
import { canCreateIssueFromRisk, RISK_ENTRY_STATUS_LABELS } from '../utils/statusConstants'

// Builds risk data column definitions (id, type, name, pestel, riskLevel, status, date, owner).
function buildDataColumns(
  t: TFunction,
  pestelLabelMap: Record<string, string>,
): TableColumn<RiskEntry>[] {
  return [
    {
      id: 'entryNumber',
      header: t('pages.riskManagement.table.columns.id'),
      sortable: true,
      cell: (row) => <span className="font-mono text-xs">{row.entryNumber}</span>,
    },
    {
      id: 'type',
      header: t('pages.riskManagement.table.columns.type'),
      cell: (row) => (
        <span className="bg-secondary text-secondary-foreground inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium">
          {t(`pages.riskManagement.entryType.${row.type.toLowerCase()}`)}
        </span>
      ),
    },
    {
      id: 'name',
      header: t('pages.riskManagement.table.columns.name'),
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
      header: t('pages.riskManagement.table.columns.pestelCategory'),
      cell: (row) => (
        <span className="text-xs">{pestelLabelMap[row.pestelCategory] ?? row.pestelCategory}</span>
      ),
    },
    {
      id: 'riskLevel',
      header: t('pages.riskManagement.table.columns.riskLevel'),
      sortable: true,
      cell: (row) => (
        <RiskLevelBadge
          riskLevel={row.riskLevel}
          type={row.type}
        />
      ),
    },
    {
      id: 'status',
      header: t('pages.riskManagement.table.columns.status'),
      cell: (row) => (
        <span className="text-xs">
          {t(RISK_ENTRY_STATUS_LABELS[row.status.toLowerCase()] ?? row.status)}
        </span>
      ),
    },
    {
      id: 'identificationDate',
      header: t('pages.riskManagement.table.columns.identificationDate'),
      sortable: true,
      cell: (row) => <span className="text-xs tabular-nums">{row.identificationDate}</span>,
    },
    {
      id: 'owner',
      header: t('pages.riskManagement.table.columns.owner'),
      cell: (row) => (
        <span className="text-xs">
          {row.owner ? `${row.owner.firstName} ${row.owner.lastName}` : '—'}
        </span>
      ),
    },
  ]
}

// Builds risk action column definitions (escalation badge + row actions dropdown).
function buildActionColumns(
  t: TFunction,
  openEdit: (id: string) => void,
  openCreateIssueFromRisk: (id: string, name: string, version: number) => void,
  onEscalate?: (entry: RiskEntry) => void,
): TableColumn<RiskEntry>[] {
  return [
    {
      id: 'escalation',
      header: t('pages.riskManagement.table.columns.escalation'),
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
                aria-label={t('pages.riskManagement.table.rowActionsLabel', { name: row.name })}
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
                {t('pages.riskManagement.table.editAction')}
              </DropdownMenuItem>
              {canCreateIssueFromRisk(row) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => openCreateIssueFromRisk(row.id, row.name, row.version)}
                  >
                    <Plus
                      className="mr-2 size-4"
                      aria-hidden="true"
                    />
                    {t('pages.riskManagement.createIssueFromRisk.confirm')}
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
 * Returns the `TableColumn<RiskEntry>[]` definitions for the Risk Management table.
 *
 * All cell renderers close over the Zustand store callbacks (`openEdit`,
 * `openCreateIssueFromRisk`) and the optional `onEscalate` prop so that the
 * column array can be built once per render cycle without prop-drilling.
 *
 * @param onEscalate - Optional callback invoked when the user triggers escalation. Wrap in `useCallback` to prevent unnecessary column array rebuilds.
 * @returns Ordered array of column definitions.
 */
export function useRiskManagementColumns(
  onEscalate?: (entry: RiskEntry) => void,
): TableColumn<RiskEntry>[] {
  const { t } = useTranslation()
  const openEdit = useEditRiskEntryDialogStore((s) => s.open)
  const openCreateIssueFromRisk = useCreateIssueFromRiskDialogStore((s) => s.open)
  const pestelLabelMap = useMemo(
    () => Object.fromEntries(PESTEL_OPTIONS.map((o) => [o.value, t(o.labelKey)])),
    [t],
  )
  return useMemo(
    () => [
      ...buildDataColumns(t, pestelLabelMap),
      ...buildActionColumns(t, openEdit, openCreateIssueFromRisk, onEscalate),
    ],
    [t, pestelLabelMap, openEdit, openCreateIssueFromRisk, onEscalate],
  )
}
