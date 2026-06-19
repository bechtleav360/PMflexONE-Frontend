import { useCallback, useMemo, useState } from 'react'

/**
 * Generic hook for managing a flat filter object with partial-update and reset semantics.
 *
 * `isFiltered` is derived by JSON-serialising the current filter and comparing it to
 * the serialised default. This is correct for all flat filter objects whose values are
 * JSON-serialisable primitives or plain objects (e.g. date-range `{ from, to }`).
 *
 * @param defaultFilter - The baseline filter object. Its shape defines `TFilter`.
 *   Must be a stable reference (e.g. a module-level constant) — an inline object literal
 *   recreates `resetFilter` and invalidates the `isFiltered` memo on every render.
 * @returns An object containing the current filter, a merge-update setter, a reset
 *   function, and an `isFiltered` flag.
 */
export function useFilterState<TFilter extends Record<string, unknown>>(
  defaultFilter: TFilter,
): {
  filter: TFilter
  setFilter: (update: Partial<TFilter>) => void
  resetFilter: () => void
  isFiltered: boolean
} {
  const [filter, setFilterState] = useState<TFilter>(defaultFilter)

  const setFilter = useCallback((update: Partial<TFilter>) => {
    setFilterState((prev) => ({ ...prev, ...update }))
  }, [])

  const resetFilter = useCallback(() => {
    setFilterState(defaultFilter)
  }, [defaultFilter])

  const isFiltered = useMemo(
    () => JSON.stringify(filter) !== JSON.stringify(defaultFilter),
    [filter, defaultFilter],
  )

  return { filter, setFilter, resetFilter, isFiltered }
}
