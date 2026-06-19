import * as React from 'react'

import { useTranslation } from 'react-i18next'

import type { TableSelectionMode, TableSortState } from '@/shared/components'

import { ShowcaseSection } from './ShowcaseSection'
import { TableSectionControls } from './TableSectionControls'
import { TableSectionTable } from './TableSectionTable'

const PAGE_SIZE = 12
const LOADING_ROWS_COUNT = 6

/**
 * Renders the showcase table demo.
 *
 * @returns The table showcase section.
 */
export function TableSection() {
  const { t } = useTranslation()
  const [sort, setSort] = React.useState<TableSortState | null>({
    field: 'updatedAt',
    direction: 'desc',
  })
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(PAGE_SIZE)
  const [selectionMode, setSelectionMode] = React.useState<TableSelectionMode>('multiple')
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([])
  const [columnReordering, setColumnReordering] = React.useState(true)
  const [columnResizing, setColumnResizing] = React.useState(true)
  const [virtualized, setVirtualized] = React.useState(true)
  const [stickyHeader, setStickyHeader] = React.useState(true)
  const [loading, setLoading] = React.useState(false)

  const handleSelectionModeChange = React.useCallback((mode: TableSelectionMode) => {
    setSelectionMode(mode)
    setSelectedRowKeys((currentSelectedRowKeys) => {
      if (mode === 'none') {
        return []
      }

      if (mode === 'single') {
        return currentSelectedRowKeys.slice(0, 1)
      }

      return currentSelectedRowKeys
    })
  }, [])

  return (
    <ShowcaseSection title={t('showcase.table.title')}>
      <div className="space-y-lg w-full basis-full">
        <p className="text-muted-foreground text-sm">{t('showcase.table.description')}</p>

        <TableSectionControls
          pageSize={pageSize}
          pageSizeOptions={[6, 12, 20]}
          selectionMode={selectionMode}
          columnReordering={columnReordering}
          columnResizing={columnResizing}
          virtualized={virtualized}
          stickyHeader={stickyHeader}
          loading={loading}
          onPageSizeChange={(nextPageSize) => {
            setPageSize(nextPageSize)
            setPage(1)
          }}
          onSelectionModeChange={handleSelectionModeChange}
          onColumnReorderingChange={setColumnReordering}
          onColumnResizingChange={setColumnResizing}
          onVirtualizedChange={setVirtualized}
          onStickyHeaderChange={setStickyHeader}
          onLoadingChange={setLoading}
          pageSizeLabel={t('shared.table.pageSizeLabel')}
          selectionModeLabel={t('showcase.table.selectionMode')}
          selectionModeNoneLabel={t('showcase.table.selectionModeNone')}
          selectionModeSingleLabel={t('showcase.table.selectionModeSingle')}
          selectionModeMultipleLabel={t('showcase.table.selectionModeMultiple')}
          columnReorderingLabel={t('showcase.table.columnReordering')}
          columnResizingLabel={t('showcase.table.columnResizing')}
          virtualizedLabel={t('showcase.table.virtualized')}
          stickyHeaderLabel={t('showcase.table.stickyHeader')}
          loadingLabel={t('showcase.table.loading')}
        />
        <TableSectionTable
          sort={sort}
          page={page}
          pageSize={pageSize}
          enableColumnReordering={columnReordering}
          enableColumnResizing={columnResizing}
          selectionMode={selectionMode}
          selectedRowKeys={selectedRowKeys}
          onSelectedRowKeysChange={setSelectedRowKeys}
          virtualized={virtualized}
          stickyHeader={stickyHeader}
          loading={loading}
          onSortChange={(nextSort) => {
            setSort(nextSort)
            setPage(1)
          }}
          onPageChange={setPage}
          loadingRowsCount={LOADING_ROWS_COUNT}
        />
      </div>
    </ShowcaseSection>
  )
}
