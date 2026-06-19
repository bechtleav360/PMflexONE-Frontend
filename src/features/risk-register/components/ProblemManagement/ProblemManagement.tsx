import { useCallback, useState } from 'react'

import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, ButtonIcon } from '@/shared/components'

import { useProblemEntries } from '../../hooks/useProblemEntries'
import { useProblemEntryStatuses } from '../../hooks/useProblemEntryStatuses'
import { useProblemManagementState } from '../../hooks/useProblemManagementState'
import { useCreateProblemEntryDialogStore } from '../../store/useCreateProblemEntryDialogStore'
import type { ProblemEntry } from '../../types/problemEntry.types'
import type { ProblemManagementFilterState } from '../../types/registerRow.types'
import type { ScopeType } from '../../types/scopeType'
import { PROBLEM_ENTRY_STATUS_LABELS } from '../../utils/statusConstants'
import { CreateProblemEntryDialog } from '../CreateProblemEntryDialog'
import { EditProblemEntryDialog } from '../EditProblemEntryDialog'
import { ProblemManagementFilters } from '../ProblemManagementFilters'
import { ProblemManagementListView } from '../ProblemManagementListView'

const INITIAL_FILTER: ProblemManagementFilterState = {
  status: null,
  pestelCategory: null,
  includeTerminalStatuses: false,
}

/**
 * Fully-featured Problem Management container component (ITIL problem lifecycle).
 *
 * Owns data fetching for problem entries and delegates filter/sort state to
 * `useProblemManagementState`. All active filter fields (status, pestelCategory,
 * includeTerminalStatuses) are forwarded to `useProblemEntries` as server-side
 * variables so TanStack Query automatically refetches on any change.
 * Assessment is impact-only per FA3.
 *
 * @param props - Component props.
 * @param props.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param props.scopeId - The ID of the scoped entity.
 * @param props.onEscalate - Optional callback invoked when an entry is escalated.
 * @returns The fully composed problem management view.
 */
export function ProblemManagement({
  scopeType,
  scopeId,
  onEscalate,
}: {
  scopeType: ScopeType
  scopeId: string
  onEscalate?: (entry: ProblemEntry) => void
}) {
  const { t } = useTranslation()
  const openCreateProblem = useCreateProblemEntryDialogStore((s) => s.open)
  const [serverFilter, setServerFilter] = useState<ProblemManagementFilterState>(INITIAL_FILTER)

  const {
    data: problemEntries = [],
    isPending,
    isError,
  } = useProblemEntries({
    scopeType,
    scopeId,
    includeTerminalStatuses: serverFilter.includeTerminalStatuses,
    status: serverFilter.status,
    pestelCategory: serverFilter.pestelCategory,
  })
  const { data: problemStatuses = [] } = useProblemEntryStatuses()

  const {
    rows,
    filter,
    setFilter: setFilterState,
    sort,
    setSort,
  } = useProblemManagementState(problemEntries, serverFilter)

  const setFilter = useCallback(
    (f: ProblemManagementFilterState) => {
      setFilterState(f)
      setServerFilter(f)
    },
    [setFilterState],
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('pages.problemManagement.title')}</h1>
        <Button onClick={openCreateProblem}>
          <ButtonIcon icon={Plus} />
          {t('pages.problemManagement.addEntry')}
        </Button>
      </div>

      <ProblemManagementFilters
        filter={filter}
        onFilterChange={setFilter}
        problemStatuses={problemStatuses.map((s) => ({
          value: s.status,
          label: t(PROBLEM_ENTRY_STATUS_LABELS[s.status.toLowerCase()] ?? s.status),
        }))}
      />

      {isPending && (
        <p
          className="text-muted-foreground text-sm"
          role="status"
          aria-live="polite"
        >
          {t('pages.problemManagement.loading')}
        </p>
      )}

      {isError && (
        <p
          className="text-destructive text-sm"
          role="alert"
        >
          {t('pages.problemManagement.loadError')}
        </p>
      )}

      {!isPending && !isError && (
        <ProblemManagementListView
          rows={rows}
          sort={sort}
          onSortChange={setSort}
          onEscalate={onEscalate}
        />
      )}

      <CreateProblemEntryDialog
        scopeType={scopeType}
        scopeId={scopeId}
      />
      <EditProblemEntryDialog
        scopeType={scopeType}
        scopeId={scopeId}
      />
    </div>
  )
}
