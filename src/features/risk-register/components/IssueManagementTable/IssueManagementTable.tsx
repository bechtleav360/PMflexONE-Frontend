import { useTranslation } from 'react-i18next'

import { ListView } from '@/shared/components'

import { useIssueManagementColumns } from '../../hooks/useIssueManagementColumns'
import type {
  IssueManagementSortField,
  IssueManagementSortState,
} from '../../hooks/useIssueManagementState'
import type { IssueEntry } from '../../types/issueEntry.types'
import { narrowSortChange } from '../../utils/sortUtils'

const ISSUE_SORT_FIELDS: IssueManagementSortField[] = [
  'entryNumber',
  'urgency',
  'identificationDate',
]

/**
 * Renders issue management entries in a sortable ListView.
 *
 * @param props - Component props.
 * @param props.rows - Issue entries to display.
 * @param props.sort - Current sort state.
 * @param props.onSortChange - Callback invoked when the user changes the sort column or direction.
 * @param props.onEscalate - Optional callback invoked when the user triggers escalation on an entry.
 * @returns The issue management list view.
 */
export function IssueManagementTable({
  rows,
  sort,
  onSortChange,
  onEscalate,
}: {
  rows: IssueEntry[]
  sort?: IssueManagementSortState
  onSortChange?: (s: IssueManagementSortState) => void
  onEscalate?: (entry: IssueEntry) => void
}) {
  const { t } = useTranslation()
  const columns = useIssueManagementColumns(onEscalate)

  return (
    <ListView<IssueEntry>
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.id}
      sort={sort ?? null}
      onSortChange={(next) =>
        narrowSortChange<IssueManagementSortField>(next, onSortChange, ISSUE_SORT_FIELDS)
      }
      emptyTitle={t('pages.issueManagement.empty')}
      cardClassName="overflow-x-auto"
    />
  )
}
