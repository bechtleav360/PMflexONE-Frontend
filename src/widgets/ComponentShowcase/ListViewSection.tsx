import * as React from 'react'

import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import {
  Badge,
  FilterBar,
  ListView,
  type TableColumn,
  type TableSortState,
} from '@/shared/components'
import { useFilterState } from '@/shared/hooks'
import type { FilterFieldDef } from '@/shared/types'

import { ShowcaseSection } from './ShowcaseSection'
import {
  createShowcaseTableRows,
  sortShowcaseTableRows,
  STATUS_VARIANTS,
  type ShowcaseTableRow,
} from './tableSectionUtils'

const PAGE_SIZE = 8

interface ShowcaseFilter extends Record<string, unknown> {
  name: string | null
  status: string | null
}

const DEFAULT_FILTER: ShowcaseFilter = { name: null, status: null }

// Builds column definitions for the ListView showcase demo table.
function getColumns(t: TFunction): TableColumn<ShowcaseTableRow>[] {
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
  ]
}

// Builds FilterBar field definitions for the showcase demo.
function buildFilterFields(t: TFunction): FilterFieldDef[] {
  return [
    {
      type: 'text-search',
      key: 'name',
      label: t('showcase.table.name'),
      placeholder: t('showcase.listView.filterNamePlaceholder'),
      defaultValue: null,
    },
    {
      type: 'select',
      key: 'status',
      label: t('showcase.table.status'),
      options: [
        { label: t('showcase.table.active'), value: 'active' },
        { label: t('showcase.table.scheduled'), value: 'scheduled' },
        { label: t('showcase.table.paused'), value: 'paused' },
      ],
      defaultValue: null,
    },
  ]
}

/**
 * Renders the ListView showcase demo with name and status FilterBar.
 *
 * @returns The list view showcase section.
 */
export function ListViewSection() {
  const { t } = useTranslation()
  const [sort, setSort] = React.useState<TableSortState | null>(null)
  const [page, setPage] = React.useState(1)
  // Aliased so the wrappers below can also call setPage(1) on each change.
  const {
    filter,
    setFilter: setFilterBase,
    resetFilter: resetFilterBase,
    isFiltered,
  } = useFilterState<ShowcaseFilter>(DEFAULT_FILTER)

  const rows = React.useMemo(() => createShowcaseTableRows(t), [t])
  const fields = React.useMemo(() => buildFilterFields(t), [t])
  const columns = React.useMemo(() => getColumns(t), [t])

  const filtered = React.useMemo(() => {
    return rows.filter((row) => {
      if (filter.name && !row.name.toLowerCase().includes(filter.name.toLowerCase())) return false
      if (filter.status && row.status !== filter.status) return false
      return true
    })
  }, [rows, filter])

  const sorted = React.useMemo(() => sortShowcaseTableRows(filtered, sort), [filtered, sort])
  const totalItems = sorted.length
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const safePage = Math.max(1, Math.min(page, totalPages))
  const paged = React.useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return sorted.slice(start, start + PAGE_SIZE)
  }, [safePage, sorted])

  function handleFilterChange(update: Partial<ShowcaseFilter>) {
    setFilterBase(update)
    setPage(1)
  }

  function handleReset() {
    resetFilterBase()
    setPage(1)
  }

  return (
    <ShowcaseSection title={t('showcase.listView.title')}>
      <div className="w-full basis-full">
        <p className="text-muted-foreground mb-4 text-sm">{t('showcase.listView.description')}</p>
        <FilterBar
          fields={fields}
          value={filter}
          onChange={handleFilterChange}
          onReset={handleReset}
          isFiltered={isFiltered}
          className="mb-4"
        />
        <ListView
          columns={columns}
          rows={paged}
          getRowKey={(row) => row.id}
          sort={sort}
          onSortChange={setSort}
          pagination={{
            page: safePage,
            pageSize: PAGE_SIZE,
            totalItems,
            onPageChange: setPage,
          }}
        />
      </div>
    </ShowcaseSection>
  )
}
