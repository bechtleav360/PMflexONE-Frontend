import { useMemo } from 'react'

import { Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, ListView, type TableColumn, type TableSortState } from '@/shared/components'

import type { Program } from '../types/program.types'
import { ProgramStatusBadge } from './ProgramStatusBadge'

/** Props for {@link ProgramList}. */
interface ProgramListProps {
  /** Sorted program rows to display. */
  rows: Program[]
  /** Whether the data fetch is in-flight; shows skeleton rows when `true`. */
  isPending: boolean
  /** Whether the data fetch failed; switches the empty message to an error description. */
  isError: boolean
  sort: TableSortState | null
  onSortChange: (sort: TableSortState | null) => void
  onEdit: (program: Program) => void
  /** When set, the Portfolio column is hidden (the list is already scoped to that portfolio). */
  portfolioId?: string
  /** When set, the program name becomes a clickable element that calls this callback. */
  onSelect?: (program: Program) => void
  /** Enables sticky header and flex-scroll layout. Pass only when inside a full-height flex container. */
  scrollable?: boolean
  /** className forwarded to the Card wrapper. */
  cardClassName?: string
}

function getProgramColumns(
  t: ReturnType<typeof useTranslation>['t'],
  locale: string,
  onEdit: (program: Program) => void,
  showPortfolio: boolean,
  onSelect?: (program: Program) => void,
): TableColumn<Program>[] {
  const columns: TableColumn<Program>[] = [
    {
      id: 'name',
      header: t('pages.programs.list.columns.name'),
      cell: (row) =>
        onSelect ? (
          <button
            type="button"
            className="text-left hover:underline focus:underline"
            onClick={() => {
              onSelect(row)
            }}
          >
            {row.name}
          </button>
        ) : (
          row.name
        ),
      sortable: true,
      sortKey: 'name',
      sortLabel: t('pages.programs.list.columns.name'),
    },
  ]

  if (showPortfolio) {
    columns.push({
      id: 'portfolio',
      header: t('pages.programs.list.columns.portfolio'),
      cell: (row) => row.portfolio?.item.name ?? '—',
      sortable: true,
      sortKey: 'portfolio',
      sortLabel: t('pages.programs.list.columns.portfolio'),
    })
  }

  columns.push(
    {
      id: 'status',
      header: t('pages.programs.list.columns.status'),
      cell: (row) => <ProgramStatusBadge status={row.status} />,
      sortable: true,
      sortKey: 'status',
      sortLabel: t('pages.programs.list.columns.status'),
      width: 140,
    },
    {
      id: 'createdAt',
      header: t('pages.programs.list.columns.createdAt'),
      cell: (row) => new Date(row.createdAt).toLocaleDateString(locale),
      sortable: true,
      sortKey: 'createdAt',
      sortLabel: t('pages.programs.list.columns.createdAt'),
      width: 160,
    },
    {
      id: 'updatedAt',
      header: t('pages.programs.list.columns.updatedAt'),
      cell: (row) => new Date(row.updatedAt).toLocaleDateString(locale),
      sortable: true,
      sortKey: 'updatedAt',
      sortLabel: t('pages.programs.list.columns.updatedAt'),
      width: 160,
    },
    {
      id: 'actions',
      header: t('pages.programs.list.columns.actions'),
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('pages.programs.list.editAriaLabel', { name: row.name })}
            onClick={() => {
              onEdit(row)
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      ),
      align: 'right',
      width: 64,
      reorderable: false,
    },
  )

  return columns
}

/**
 * Sortable table of programs.
 *
 * Renders a {@link Table} with name, optional portfolio, status badge, dates,
 * and an edit action column. All sorting is client-side; pass sorted `rows`
 * from {@link useProgramListState}.
 *
 * @param props - Component props.
 * @param props.rows - Sorted program rows to display.
 * @param props.isPending - Whether the data fetch is in-flight.
 * @param props.isError - Whether the data fetch failed.
 * @param props.sort - The currently active sort state.
 * @param props.onSortChange - Callback to change the sort state.
 * @param props.onEdit - Callback invoked when the user clicks the edit button for a row.
 * @param props.portfolioId - When set, hides the Portfolio column.
 * @param props.onSelect - Optional callback invoked when the user clicks a program row.
 * @param props.scrollable - Enables sticky header and flex-scroll layout for full-height pages.
 * @returns The rendered program table.
 */
export function ProgramList({
  rows,
  isPending,
  isError,
  sort,
  onSortChange,
  onEdit,
  portfolioId,
  onSelect,
  scrollable,
  cardClassName,
}: ProgramListProps) {
  const { t, i18n } = useTranslation()
  const showPortfolio = portfolioId === undefined

  const columns = useMemo(
    () => getProgramColumns(t, i18n.language, onEdit, showPortfolio, onSelect),
    [t, i18n.language, onEdit, showPortfolio, onSelect],
  )

  return (
    <ListView<Program>
      cardClassName={cardClassName}
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.id}
      loading={isPending}
      loadingRowsCount={5}
      emptyTitle={t('shared.table.noDataTitle')}
      emptyDescription={
        isError ? t('shared.table.noDataDescription') : t('pages.programs.list.empty')
      }
      sort={sort}
      onSortChange={onSortChange}
      enableColumnReordering
      stickyHeader={scrollable}
      containerClassName={scrollable ? 'flex-1 overflow-auto' : undefined}
    />
  )
}
