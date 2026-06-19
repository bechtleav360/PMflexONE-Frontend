import { useCallback, useEffect, useState } from 'react'

import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useRiskEntryEditTarget } from '@/entities/risk-entry'
import { Button, ButtonIcon, ListView, type TableSortState } from '@/shared/components'

import { useRiskEntries } from '../../hooks/useRiskEntries'
import { useRiskEntryStatuses } from '../../hooks/useRiskEntryStatuses'
import { useRiskManagementColumns } from '../../hooks/useRiskManagementColumns'
import { useRiskManagementState } from '../../hooks/useRiskManagementState'
import { useCreateRiskEntryDialogStore } from '../../store/useCreateRiskEntryDialogStore'
import { useEditRiskEntryDialogStore } from '../../store/useEditRiskEntryDialogStore'
import type { RiskManagementFilterState } from '../../types/registerRow.types'
import type { RiskEntry } from '../../types/riskEntry.types'
import type { ScopeType } from '../../types/scopeType'
import type {
  RiskManagementSortField,
  RiskManagementSortState,
} from '../../utils/riskManagementSort'
import { RISK_ENTRY_STATUS_LABELS } from '../../utils/statusConstants'
import { CreateIssueFromRiskDialog } from '../CreateIssueFromRiskDialog'
import { CreateRiskEntryDialog } from '../CreateRiskEntryDialog'
import { EditRiskEntryDialog } from '../EditRiskEntryDialog'
import { RiskManagementFilters } from '../RiskManagementFilters'

/**
 * Maps a `TableSortState` (generic string field) back to the typed
 * `RiskManagementSortState`. Only fields recognised by the sort utility are
 * forwarded; null (triple-click clear) is silently ignored since the feature
 * does not support an unsorted state.
 *
 * @param next - Incoming sort state from the shared Table, or null.
 * @param setSort - Zustand/state setter from `useRiskManagementState`.
 */
function handleSortChange(
  next: TableSortState | null,
  setSort: (s: RiskManagementSortState) => void,
) {
  if (!next) return
  const validFields: RiskManagementSortField[] = ['entryNumber', 'riskLevel', 'identificationDate']
  if (validFields.includes(next.field as RiskManagementSortField)) {
    setSort({ field: next.field as RiskManagementSortField, direction: next.direction })
  }
}

const INITIAL_FILTER: RiskManagementFilterState = {
  type: null,
  status: null,
  pestelCategory: null,
  includeTerminalStatuses: false,
}

/**
 * Fully-featured Risk Management container component.
 *
 * Owns data fetching for risk/opportunity entries and delegates filter/sort state
 * to `useRiskManagementState`. All active filter fields (type, status,
 * pestelCategory, includeTerminalStatuses) are forwarded to `useRiskEntries` as
 * server-side variables so TanStack Query automatically refetches on any change.
 *
 * @param props - Component props.
 * @param props.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param props.scopeId - The ID of the scoped entity.
 * @param props.onEscalate - Optional callback invoked when an entry is escalated.
 * @returns The fully composed risk management view.
 */
// eslint-disable-next-line max-lines-per-function -- management component; line count driven by CRUD handler definitions and JSX structure
export function RiskManagement({
  scopeType,
  scopeId,
  onEscalate,
}: {
  scopeType: ScopeType
  scopeId: string
  onEscalate?: (entry: RiskEntry) => void
}) {
  const { t } = useTranslation()
  const openCreateRisk = useCreateRiskEntryDialogStore((s) => s.open)
  const openEditRisk = useEditRiskEntryDialogStore((s) => s.open)
  const editTargetId = useRiskEntryEditTarget((s) => s.editTargetId)
  const clearEditTarget = useRiskEntryEditTarget((s) => s.clearEditTarget)

  useEffect(() => {
    if (editTargetId !== null) {
      openEditRisk(editTargetId)
      clearEditTarget()
    }
  }, [editTargetId, openEditRisk, clearEditTarget])

  // serverFilter drives the query; it must be declared before useRiskEntries
  const [serverFilter, setServerFilter] = useState<RiskManagementFilterState>(INITIAL_FILTER)

  const {
    data: riskEntries = [],
    isPending,
    isError,
  } = useRiskEntries({
    scopeType,
    scopeId,
    includeTerminalStatuses: serverFilter.includeTerminalStatuses,
    type: serverFilter.type,
    status: serverFilter.status,
    pestelCategory: serverFilter.pestelCategory,
  })
  const { data: riskStatuses = [] } = useRiskEntryStatuses()

  const {
    rows,
    filter,
    setFilter: setFilterState,
    sort,
    setSort,
  } = useRiskManagementState(riskEntries, serverFilter)

  const columns = useRiskManagementColumns(onEscalate)

  // Sync filter changes into both the management state hook and the server query
  const setFilter = useCallback(
    (f: RiskManagementFilterState) => {
      setFilterState(f)
      setServerFilter(f)
    },
    [setFilterState],
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{t('pages.riskManagement.title')}</h2>
        <Button onClick={openCreateRisk}>
          <ButtonIcon icon={Plus} />
          {t('pages.riskManagement.addEntry')}
        </Button>
      </div>

      <RiskManagementFilters
        filter={filter}
        onFilterChange={setFilter}
        riskStatuses={riskStatuses.map((s) => ({
          value: s.status,
          label: t(RISK_ENTRY_STATUS_LABELS[s.status.toLowerCase()] ?? s.status),
        }))}
      />

      {isError && (
        <p
          className="text-destructive text-sm"
          role="alert"
        >
          {t('pages.riskManagement.loadError')}
        </p>
      )}

      {!isError && (
        <ListView<RiskEntry>
          columns={columns}
          rows={rows}
          getRowKey={(row) => row.id}
          sort={sort}
          onSortChange={(next) => handleSortChange(next, setSort)}
          loading={isPending}
          emptyTitle={t('pages.riskManagement.empty')}
        />
      )}

      <CreateRiskEntryDialog
        scopeType={scopeType}
        scopeId={scopeId}
      />
      <EditRiskEntryDialog
        scopeType={scopeType}
        scopeId={scopeId}
      />
      <CreateIssueFromRiskDialog
        scopeType={scopeType}
        scopeId={scopeId}
      />
    </div>
  )
}
