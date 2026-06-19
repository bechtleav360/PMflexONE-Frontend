import { useCallback, useMemo, useState } from 'react'

import type { Project } from '@/entities/project'
import type { TablePaginationState, TableSortState } from '@/shared/components'
import { useFilterState } from '@/shared/hooks'

import { PROJECT_DEFAULT_FILTER, toProjectGraphqlFilter } from '../filter.config'
import type { ProjectListFilter } from '../filter.config'

const PAGE_SIZE = 25

/** All writable sort/page state plus derived rows exposed to callers. */
export interface ProjectListState {
  sort: TableSortState | null
  setSort: (v: TableSortState | null) => void
  page: number
  setPage: (v: number) => void
  rows: Project[]
  totalItems: number
  paginationProps: TablePaginationState | undefined
}

/**
 * Filter state and derived GraphQL filter for the project list.
 *
 * @property graphqlFilter - Ready to pass as the `filter` argument of `useListProjects`.
 */
export interface ProjectFilterState {
  filter: ProjectListFilter
  setFilter: (update: Partial<ProjectListFilter>) => void
  resetFilter: () => void
  isFiltered: boolean
  graphqlFilter: ReturnType<typeof toProjectGraphqlFilter>
}

/**
 * Manages filter state for the project list.
 *
 * Intended to be composed with {@link useProjectListState} at the page level.
 * Derives a `graphqlFilter` value suitable for passing to `useListProjects`.
 *
 * @returns Filter state and the derived GraphQL filter variable.
 */
export function useProjectFilterState(): ProjectFilterState {
  const { filter, setFilter, resetFilter, isFiltered } =
    useFilterState<ProjectListFilter>(PROJECT_DEFAULT_FILTER)
  const graphqlFilter = useMemo(() => toProjectGraphqlFilter(filter), [filter])
  return { filter, setFilter, resetFilter, isFiltered, graphqlFilter }
}

/**
 * Manages client-side sort and pagination state for the project list.
 *
 * All operations run in-memory on `allProjects` (≤ 500 rows per SC-005).
 * Pagination controls are suppressed (`paginationProps === undefined`) when
 * `totalItems ≤ PAGE_SIZE` so the Table renders no controls automatically.
 *
 * Compose with {@link useProjectFilterState} at the page level to get filter state;
 * pass the `graphqlFilter` to `useListProjects` and the returned data to this hook.
 *
 * @param allProjects - The full project array from the API (already server-filtered).
 * @returns Reactive state and derived row slice ready for the Table component.
 */
export function useProjectListState(allProjects: Project[]): ProjectListState {
  const [sort, setSortRaw] = useState<TableSortState | null>(null)
  const [page, setPage] = useState(1)

  const setSort = useCallback(
    (v: TableSortState | null) => {
      setSortRaw(v)
      setPage(1)
    },
    [setSortRaw, setPage],
  )

  const sorted = useMemo(() => {
    if (!sort) return allProjects
    return [...allProjects].sort((a, b) => {
      const aVal = (a[sort.field as keyof Project] ?? '') as string
      const bVal = (b[sort.field as keyof Project] ?? '') as string
      const cmp = aVal.localeCompare(bVal)
      return sort.direction === 'asc' ? cmp : -cmp
    })
  }, [allProjects, sort])

  const totalItems = sorted.length
  const rows = useMemo(() => sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [sorted, page])

  const paginationProps: TablePaginationState | undefined =
    totalItems > PAGE_SIZE
      ? { page, pageSize: PAGE_SIZE, totalItems, onPageChange: setPage }
      : undefined

  return {
    sort,
    setSort,
    page,
    setPage,
    rows,
    totalItems,
    paginationProps,
  }
}
