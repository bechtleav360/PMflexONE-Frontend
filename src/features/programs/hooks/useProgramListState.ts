import { useMemo, useState } from 'react'

import type { TableSortState } from '@/shared/components'
import { useFilterState } from '@/shared/hooks'

import { PROGRAM_DEFAULT_FILTER, toProgramGraphqlFilter } from '../filter.config'
import type { ProgramListFilter } from '../filter.config'
import type { Program } from '../types/program.types'

type StringProgramSortKey = 'name' | 'status' | 'createdAt' | 'updatedAt'
const STRING_SORT_KEYS = new Set<string>(['name', 'status', 'createdAt', 'updatedAt'])

/**
 * State returned by {@link useProgramListState}.
 *
 * @property sort - The currently active sort state, or `null` when unsorted.
 * @property setSort - Callback to change the sort state.
 * @property rows - The program array sorted according to the current `sort` state.
 */
export interface ProgramListState {
  sort: TableSortState | null
  setSort: (v: TableSortState | null) => void
  rows: Program[]
}

/**
 * Filter state and derived GraphQL filter for the program list.
 *
 * @property graphqlFilter - Ready to pass as the `filter` argument of `usePrograms`.
 */
export interface ProgramFilterState {
  filter: ProgramListFilter
  setFilter: (update: Partial<ProgramListFilter>) => void
  resetFilter: () => void
  isFiltered: boolean
  graphqlFilter: ReturnType<typeof toProgramGraphqlFilter>
}

function getProgramSortValue(program: Program, field: string): string | null {
  if (field === 'portfolio') return program.portfolio?.item.name ?? null
  if (!STRING_SORT_KEYS.has(field)) return null
  return program[field as StringProgramSortKey] ?? null
}

function comparePrograms(a: Program, b: Program, field: string, direction: string): number {
  const aVal = getProgramSortValue(a, field)
  const bVal = getProgramSortValue(b, field)
  if (aVal === null && bVal === null) return 0
  if (aVal === null) return 1
  if (bVal === null) return -1
  const cmp = aVal.localeCompare(bVal)
  return direction === 'asc' ? cmp : -cmp
}

/**
 * Manages filter state for the program list.
 *
 * Intended to be composed with {@link useProgramListState} at the page level.
 * Derives a `graphqlFilter` value suitable for passing to `usePrograms`.
 *
 * @returns Filter state and the derived GraphQL filter variable.
 */
export function useProgramFilterState(): ProgramFilterState {
  const { filter, setFilter, resetFilter, isFiltered } =
    useFilterState<ProgramListFilter>(PROGRAM_DEFAULT_FILTER)
  const graphqlFilter = useMemo(() => toProgramGraphqlFilter(filter), [filter])
  return { filter, setFilter, resetFilter, isFiltered, graphqlFilter }
}

/**
 * Manages client-side sort state for a program list.
 *
 * All sorting is performed in-memory; the hook does not trigger any network
 * requests. The `portfolio` sort key resolves to the nested
 * `portfolio.item.name` value; all other keys resolve directly on `Program`.
 *
 * Compose with {@link useProgramFilterState} at the page level to get filter state;
 * pass the `graphqlFilter` to `usePrograms` and the returned data to this hook.
 *
 * @param allPrograms - The full, server-filtered array of programs to sort.
 * @returns A {@link ProgramListState} object with the current sort state,
 *   a setter, and the derived sorted rows array.
 */
export function useProgramListState(allPrograms: Program[]): ProgramListState {
  const [sort, setSort] = useState<TableSortState | null>(null)

  const rows = useMemo(() => {
    if (!sort) return allPrograms
    return [...allPrograms].sort((a, b) => comparePrograms(a, b, sort.field, sort.direction))
  }, [allPrograms, sort])

  return { sort, setSort, rows }
}
