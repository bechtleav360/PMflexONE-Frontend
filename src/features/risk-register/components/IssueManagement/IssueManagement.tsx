import { useCallback, useState } from 'react'

import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, ButtonIcon } from '@/shared/components'

import { useIssueEntries } from '../../hooks/useIssueEntries'
import { useIssueEntryStatuses } from '../../hooks/useIssueEntryStatuses'
import { useIssueManagementState } from '../../hooks/useIssueManagementState'
import { useCreateIssueEntryDialogStore } from '../../store/useCreateIssueEntryDialogStore'
import type { IssueEntry } from '../../types/issueEntry.types'
import type { IssueManagementFilterState } from '../../types/registerRow.types'
import type { ScopeType } from '../../types/scopeType'
import { ISSUE_ENTRY_STATUS_LABELS } from '../../utils/statusConstants'
import { CreateIssueEntryDialog } from '../CreateIssueEntryDialog'
import { CreateProblemFromIssueDialog } from '../CreateProblemFromIssueDialog'
import { EditIssueEntryDialog } from '../EditIssueEntryDialog'
import { IssueManagementFilters } from '../IssueManagementFilters'
import { IssueManagementTable } from '../IssueManagementTable'

const INITIAL_FILTER: IssueManagementFilterState = {
  status: null,
  pestelCategory: null,
  includeTerminalStatuses: false,
}

/**
 * Fully-featured Issue Management container component.
 *
 * Owns data fetching for issue entries and delegates filter/sort state to
 * `useIssueManagementState`. All active filter fields (status, pestelCategory,
 * includeTerminalStatuses) are forwarded to `useIssueEntries` as server-side
 * variables so TanStack Query automatically refetches on any change. The
 * "Create problem from issue" escalation is handled via `CreateProblemFromIssueDialog`.
 *
 * @param props - Component props.
 * @param props.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param props.scopeId - The ID of the scoped entity.
 * @param props.onEscalate - Optional callback invoked when an entry is escalated.
 * @returns The fully composed issue management view.
 */
// eslint-disable-next-line max-lines-per-function -- container component; coordinates data fetching, filtering, sorting, and three CRUD dialogs
export function IssueManagement({
  scopeType,
  scopeId,
  onEscalate,
}: {
  scopeType: ScopeType
  scopeId: string
  onEscalate?: (entry: IssueEntry) => void
}) {
  const { t } = useTranslation()
  const openCreateIssue = useCreateIssueEntryDialogStore((s) => s.open)

  // serverFilter drives the query; declared before useIssueEntries
  const [serverFilter, setServerFilter] = useState<IssueManagementFilterState>(INITIAL_FILTER)

  const {
    data: issueEntries = [],
    isPending,
    isError,
  } = useIssueEntries({
    scopeType,
    scopeId,
    includeTerminalStatuses: serverFilter.includeTerminalStatuses,
    status: serverFilter.status,
    pestelCategory: serverFilter.pestelCategory,
  })
  const { data: issueStatuses = [] } = useIssueEntryStatuses()

  const {
    rows,
    filter,
    setFilter: setFilterState,
    sort,
    setSort,
  } = useIssueManagementState(issueEntries, serverFilter)

  // Sync filter changes into both the management state hook and the server query
  const setFilter = useCallback(
    (f: IssueManagementFilterState) => {
      setFilterState(f)
      setServerFilter(f)
    },
    [setFilterState],
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{t('pages.issueManagement.title')}</h2>
        <Button onClick={openCreateIssue}>
          <ButtonIcon icon={Plus} />
          {t('pages.issueManagement.addEntry')}
        </Button>
      </div>

      <IssueManagementFilters
        filter={filter}
        onFilterChange={setFilter}
        issueStatuses={issueStatuses.map((s) => ({
          value: s.status,
          label: t(ISSUE_ENTRY_STATUS_LABELS[s.status.toLowerCase()] ?? s.status),
        }))}
      />

      {isPending && (
        <p
          className="text-muted-foreground text-sm"
          role="status"
          aria-live="polite"
        >
          {t('pages.issueManagement.loading')}
        </p>
      )}

      {isError && (
        <p
          className="text-destructive text-sm"
          role="alert"
        >
          {t('pages.issueManagement.loadError')}
        </p>
      )}

      {!isPending && !isError && (
        <IssueManagementTable
          rows={rows}
          sort={sort}
          onSortChange={setSort}
          onEscalate={onEscalate}
        />
      )}

      <CreateIssueEntryDialog
        scopeType={scopeType}
        scopeId={scopeId}
      />
      <EditIssueEntryDialog
        scopeType={scopeType}
        scopeId={scopeId}
      />
      <CreateProblemFromIssueDialog
        scopeType={scopeType}
        scopeId={scopeId}
      />
    </div>
  )
}
