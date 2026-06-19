import { useTranslation } from 'react-i18next'

import { ListView } from '@/shared/components'

import { useProblemManagementColumns } from '../../hooks/useProblemManagementColumns'
import type {
  ProblemManagementSortField,
  ProblemManagementSortState,
} from '../../hooks/useProblemManagementState'
import type { ProblemEntry } from '../../types/problemEntry.types'
import { narrowSortChange } from '../../utils/sortUtils'

const PROBLEM_SORT_FIELDS: ProblemManagementSortField[] = ['entryNumber', 'identificationDate']

/**
 * Renders problem management entries in a sortable ListView.
 *
 * @param props - Component props.
 * @param props.rows - Problem entries to display.
 * @param props.sort - Current sort state.
 * @param props.onSortChange - Callback invoked when the user changes the sort column or direction.
 * @param props.onEscalate - Optional callback invoked when the user triggers escalation on an entry.
 * @returns The problem management list view.
 */
export function ProblemManagementListView({
  rows,
  sort,
  onSortChange,
  onEscalate,
}: {
  rows: ProblemEntry[]
  sort?: ProblemManagementSortState
  onSortChange?: (s: ProblemManagementSortState) => void
  onEscalate?: (entry: ProblemEntry) => void
}) {
  const { t } = useTranslation()
  const columns = useProblemManagementColumns(onEscalate)

  return (
    <ListView<ProblemEntry>
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.id}
      sort={sort ?? null}
      onSortChange={(next) =>
        narrowSortChange<ProblemManagementSortField>(next, onSortChange, PROBLEM_SORT_FIELDS)
      }
      emptyTitle={t('pages.problemManagement.empty')}
    />
  )
}
