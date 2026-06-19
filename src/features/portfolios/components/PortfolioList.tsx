import * as React from 'react'

import { LayoutList, Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Button, ListView, type TableColumn, type TableSortState } from '@/shared/components'

import type { Portfolio } from '../types/portfolio.types'

/** Props for the {@link PortfolioList} component. */
export interface PortfolioListProps {
  /** Pre-filtered and pre-sorted portfolios to display in the table. */
  rows: Portfolio[]
  isPending: boolean
  /** Whether the data fetch failed. */
  isError?: boolean
  /** Current sort state, or null when unsorted. */
  sort: TableSortState | null
  onSortChange: (sort: TableSortState | null) => void
  onEdit: (portfolio: Portfolio) => void
  onDelete: (portfolio: Portfolio) => void
  /** className forwarded to the Card wrapper. */
  cardClassName?: string
  /** Called when the user clicks the programs button for a portfolio row. */
  onShowPrograms?: (portfolio: Portfolio) => void
}

function getPortfolioColumns(
  t: ReturnType<typeof useTranslation>['t'],
  onEdit: (portfolio: Portfolio) => void,
  onDelete: (portfolio: Portfolio) => void,
  onShowPrograms?: (portfolio: Portfolio) => void,
): TableColumn<Portfolio>[] {
  return [
    {
      id: 'name',
      header: t('pages.portfolios.list.columns.title'),
      cell: (row) => (
        <Link
          to={`/portfolios/${row.id}`}
          className="font-medium hover:underline focus-visible:underline"
        >
          {row.name}
        </Link>
      ),
      sortable: true,
      sortKey: 'name',
      sortLabel: t('pages.portfolios.list.columns.title'),
    },
    {
      id: 'startYear',
      header: t('pages.portfolios.list.columns.startYear'),
      cell: (row) =>
        row.startYear !== null ? String(row.startYear) : t('pages.portfolios.list.noYear'),
      align: 'center',
      width: 140,
      sortable: true,
      sortKey: 'startYear',
      sortLabel: t('pages.portfolios.list.columns.startYear'),
    },
    {
      id: 'endYear',
      header: t('pages.portfolios.list.columns.endYear'),
      cell: (row) =>
        row.endYear !== null ? String(row.endYear) : t('pages.portfolios.list.noYear'),
      align: 'center',
      width: 140,
      sortable: true,
      sortKey: 'endYear',
      sortLabel: t('pages.portfolios.list.columns.endYear'),
    },
    {
      id: 'actions',
      header: t('pages.portfolios.list.columns.actions'),
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          {onShowPrograms && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('pages.portfolios.list.programsAriaLabel', { name: row.name })}
              onClick={() => {
                onShowPrograms(row)
              }}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('pages.portfolios.list.editAriaLabel', { name: row.name })}
            onClick={() => {
              onEdit(row)
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('pages.portfolios.list.deleteAriaLabel', { name: row.name })}
            onClick={() => {
              onDelete(row)
            }}
          >
            <Trash2 className="text-destructive h-4 w-4" />
          </Button>
        </div>
      ),
      align: 'right',
      width: onShowPrograms ? 128 : 96,
      reorderable: false,
    },
  ]
}

/**
 * Displays the list of portfolios using the shared Table component.
 *
 * Expects `rows` to be pre-filtered and pre-sorted by the caller.
 *
 * @param props - Component props.
 * @param props.rows - Pre-filtered and pre-sorted portfolios to display.
 * @param props.isPending - Whether the data is currently loading.
 * @param props.sort - Current sort state, or null when unsorted.
 * @param props.onSortChange - Called when the user changes the sort column or direction.
 * @param props.onEdit - Called when the user clicks the edit button for a portfolio row.
 * @param props.onDelete - Called when the user clicks the delete button for a portfolio row.
 * @returns The portfolio table with loading, empty, and sort states.
 */
export function PortfolioList({
  rows,
  isPending,
  sort,
  onSortChange,
  onEdit,
  onDelete,
  cardClassName,
  onShowPrograms,
}: PortfolioListProps) {
  const { t } = useTranslation()
  const columns = React.useMemo(
    () => getPortfolioColumns(t, onEdit, onDelete, onShowPrograms),
    [t, onEdit, onDelete, onShowPrograms],
  )

  return (
    <ListView<Portfolio>
      cardClassName={cardClassName}
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.id}
      loading={isPending}
      loadingRowsCount={5}
      emptyTitle={t('shared.table.noDataTitle')}
      emptyDescription={t('shared.table.noDataDescription')}
      sort={sort}
      onSortChange={onSortChange}
      enableColumnReordering
      stickyHeader
      containerClassName="flex-1 overflow-auto"
    />
  )
}
