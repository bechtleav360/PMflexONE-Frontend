import { useMemo, useState } from 'react'

import type { TableSortState } from '@/shared/components'
import { useFilterState } from '@/shared/hooks'

import { PORTFOLIO_DEFAULT_FILTER, toPortfolioGraphqlFilter } from '../filter.config'
import type { PortfolioListFilter } from '../filter.config'
import type { Portfolio } from '../types/portfolio.types'

/** All writable sort state plus derived rows exposed to callers. */
export interface PortfolioListState {
  sort: TableSortState | null
  setSort: (v: TableSortState | null) => void
  rows: Portfolio[]
  totalItems: number
}

/**
 * Filter state and derived GraphQL filter for the portfolio list.
 *
 * @property graphqlFilter - Ready to pass as the `filter` argument of `usePortfolios`.
 */
export interface PortfolioFilterState {
  filter: PortfolioListFilter
  setFilter: (update: Partial<PortfolioListFilter>) => void
  resetFilter: () => void
  isFiltered: boolean
  graphqlFilter: ReturnType<typeof toPortfolioGraphqlFilter>
}

/**
 * Manages filter state for the portfolio list.
 *
 * Intended to be composed with {@link usePortfolioListState} at the page level.
 * Derives a `graphqlFilter` value suitable for passing to `usePortfolios`.
 *
 * @returns Filter state and the derived GraphQL filter variable.
 */
export function usePortfolioFilterState(): PortfolioFilterState {
  const { filter, setFilter, resetFilter, isFiltered } =
    useFilterState<PortfolioListFilter>(PORTFOLIO_DEFAULT_FILTER)
  const graphqlFilter = useMemo(() => toPortfolioGraphqlFilter(filter), [filter])
  return { filter, setFilter, resetFilter, isFiltered, graphqlFilter }
}

/**
 * Manages client-side sort state for the portfolio list.
 *
 * All operations run in-memory on `allPortfolios`.
 * Nulls always sort last regardless of sort direction.
 *
 * Compose with {@link usePortfolioFilterState} at the page level to get filter state;
 * pass the `graphqlFilter` to `usePortfolios` and the returned data to this hook.
 *
 * @param allPortfolios - The full portfolio array from the API (already server-filtered).
 * @returns Reactive state and derived rows ready for the Table component.
 */
export function usePortfolioListState(allPortfolios: Portfolio[]): PortfolioListState {
  const [sort, setSort] = useState<TableSortState | null>(null)

  const rows = useMemo(() => {
    if (!sort) return allPortfolios
    return [...allPortfolios].sort((a, b) => {
      const field = sort.field as keyof Portfolio
      const aVal = a[field]
      const bVal = b[field]
      if (aVal === null && bVal === null) return 0
      if (aVal === null) return 1
      if (bVal === null) return -1
      const cmp =
        typeof aVal === 'number' && typeof bVal === 'number'
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal))
      return sort.direction === 'asc' ? cmp : -cmp
    })
  }, [allPortfolios, sort])

  return {
    sort,
    setSort,
    rows,
    totalItems: rows.length,
  }
}
