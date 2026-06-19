import * as React from 'react'

import { useTranslation } from 'react-i18next'

import {
  Badge,
  Table,
  type TableColumn,
  type TableSelectionMode,
  type TableSelectionState,
  type TableSortState,
} from '@/shared/components'

import {
  createShowcaseTableRows,
  sortShowcaseTableRows,
  STATUS_VARIANTS,
  type ShowcaseTableRow,
} from './tableSectionUtils'

interface TableSectionTableProps {
  sort: TableSortState | null
  page: number
  pageSize: number
  enableColumnReordering: boolean
  enableColumnResizing: boolean
  selectionMode: TableSelectionMode
  selectedRowKeys: React.Key[]
  onSelectedRowKeysChange: (selectedRowKeys: React.Key[]) => void
  virtualized: boolean
  stickyHeader: boolean
  loading: boolean
  onSortChange: (sort: TableSortState | null) => void
  onPageChange: (page: number) => void
  loadingRowsCount: number
}

function getShowcaseTableColumns(
  t: ReturnType<typeof useTranslation>['t'],
  dateFormatter: Intl.DateTimeFormat,
): TableColumn<ShowcaseTableRow>[] {
  return [
    {
      id: 'name',
      header: t('showcase.table.name'),
      cell: (row) => row.name,
      sortable: true,
      sortKey: 'name',
      sortLabel: t('showcase.table.name'),
      width: 220,
    },
    {
      id: 'status',
      header: t('showcase.table.status'),
      cell: (row) => (
        <Badge variant={STATUS_VARIANTS[row.status]}>{t(`showcase.table.${row.status}`)}</Badge>
      ),
      sortable: true,
      sortKey: 'status',
      sortLabel: t('showcase.table.status'),
      align: 'center',
      width: 160,
    },
    {
      id: 'score',
      header: t('showcase.table.score'),
      cell: (row) => row.score,
      sortable: true,
      sortKey: 'score',
      sortLabel: t('showcase.table.score'),
      align: 'right',
      width: 120,
    },
    {
      id: 'updatedAt',
      header: t('showcase.table.updatedAt'),
      cell: (row) => dateFormatter.format(new Date(row.updatedAt)),
      sortable: true,
      sortKey: 'updatedAt',
      sortLabel: t('showcase.table.updatedAt'),
      width: 220,
    },
  ]
}

const SHOWCASE_TABLE_COLUMN_ORDER = ['name', 'status', 'score', 'updatedAt']
const SHOWCASE_TABLE_COLUMN_ORDER_PERSISTENCE_KEY = 'component-showcase-table-columns'

/**
 * Renders the showcase table preview.
 *
 * @param props - Component props.
 * @returns The configured shared table example.
 */
export function TableSectionTable(props: TableSectionTableProps) {
  const {
    sort,
    page,
    pageSize,
    enableColumnReordering,
    enableColumnResizing,
    selectionMode,
    selectedRowKeys,
    onSelectedRowKeysChange,
    virtualized,
    stickyHeader,
    loading,
    onSortChange,
    onPageChange,
    loadingRowsCount,
  } = props

  const { t, i18n } = useTranslation()

  const rows = React.useMemo(() => createShowcaseTableRows(t), [t])
  const dateFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language ?? 'en', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [i18n.language, i18n.resolvedLanguage],
  )
  const sortedRows = React.useMemo(() => sortShowcaseTableRows(rows, sort), [rows, sort])
  const totalItems = sortedRows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.max(1, Math.min(page, totalPages))
  const pagedRows = React.useMemo(() => {
    const start = (safePage - 1) * pageSize
    return sortedRows.slice(start, start + pageSize)
  }, [pageSize, safePage, sortedRows])
  const columns = React.useMemo(() => getShowcaseTableColumns(t, dateFormatter), [dateFormatter, t])
  const selection = React.useMemo<TableSelectionState<ShowcaseTableRow>>(
    () => ({
      mode: selectionMode,
      selectedRowKeys,
      onSelectedRowKeysChange,
    }),
    [onSelectedRowKeysChange, selectedRowKeys, selectionMode],
  )

  return (
    <Table
      columns={columns}
      rows={pagedRows}
      getRowKey={(row) => row.id}
      sort={sort}
      onSortChange={onSortChange}
      selection={selection}
      enableColumnReordering={enableColumnReordering}
      enableColumnResizing={enableColumnResizing}
      defaultColumnOrder={SHOWCASE_TABLE_COLUMN_ORDER}
      columnOrderPersistence={{
        key: SHOWCASE_TABLE_COLUMN_ORDER_PERSISTENCE_KEY,
      }}
      pagination={{
        page: safePage,
        pageSize,
        totalItems,
        onPageChange,
      }}
      virtualization={
        virtualized
          ? {
              enabled: true,
              height: 320,
              rowHeight: 56,
            }
          : undefined
      }
      stickyHeader={stickyHeader}
      loading={loading}
      loadingRowsCount={loadingRowsCount}
    />
  )
}
