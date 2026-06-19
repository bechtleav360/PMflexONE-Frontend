import { useEffect, useRef, useState } from 'react'

import type { ComboboxOption } from './ComboboxTypes'

interface UseComboboxAsyncSearchParams {
  enabled: boolean
  open: boolean
  query: string
  onSearch: ((q: string) => Promise<ComboboxOption[]>) | undefined
  debounceMs: number
}

interface UseComboboxAsyncSearchResult {
  asyncOptions: ComboboxOption[]
  asyncLoading: boolean
}

/**
 * Debounces and executes the async `onSearch` callback whenever the query or
 * open state changes, then exposes the resolved options and loading flag.
 *
 * @param params - Hook configuration.
 * @param params.enabled - Whether async search is active for this combobox instance.
 * @param params.open - Whether the dropdown is currently open.
 * @param params.query - Current search query string.
 * @param params.onSearch - Async function that resolves matching options.
 * @param params.debounceMs - Milliseconds to debounce the search call.
 * @returns Resolved options and a loading indicator.
 */
export function useComboboxAsyncSearch({
  enabled,
  open,
  query,
  onSearch,
  debounceMs,
}: UseComboboxAsyncSearchParams): UseComboboxAsyncSearchResult {
  const [asyncOptions, setAsyncOptions] = useState<ComboboxOption[]>([])
  const [asyncLoading, setAsyncLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Tracks the latest request; stale responses from earlier queries are discarded.
  const generationRef = useRef(0)

  useEffect(() => {
    if (!enabled || !open || !onSearch) return

    if (debounceRef.current) clearTimeout(debounceRef.current)
    const generation = ++generationRef.current

    debounceRef.current = setTimeout(async () => {
      setAsyncLoading(true)
      try {
        const results = await onSearch(query)
        if (generationRef.current === generation) {
          setAsyncOptions(results)
        }
      } catch (err) {
        if (generationRef.current === generation) {
          // eslint-disable-next-line no-console -- async search errors need to surface; no other error channel available here #needsrefactor
          console.error('[Combobox] onSearch failed:', err)
          setAsyncOptions([])
        }
      } finally {
        if (generationRef.current === generation) {
          setAsyncLoading(false)
        }
      }
    }, debounceMs)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [enabled, open, query, onSearch, debounceMs])

  return { asyncOptions, asyncLoading }
}
