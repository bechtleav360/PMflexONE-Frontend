import type { ComboboxOption, ComboboxProps } from './ComboboxTypes'

interface UseComboboxOptionsParams {
  props: ComboboxProps
  query: string
  asyncOptions: ComboboxOption[]
  loading: boolean
  asyncLoading: boolean
}

interface UseComboboxOptionsResult {
  isAsync: boolean
  displayedOptions: ComboboxOption[]
  allKnownOptions: ComboboxOption[]
  isLoading: boolean
  onSearch: ((q: string) => Promise<ComboboxOption[]>) | undefined
  debounceMs: number
  staticOptions: ComboboxOption[]
}

/** Default debounce delay in milliseconds for async combobox searches. */
export const DEFAULT_DEBOUNCE_MS = 300

type AsyncProps = { onSearch: (q: string) => Promise<ComboboxOption[]>; debounceMs?: number }

/**
 * Extracts async search props from a ComboboxProps union, or returns null for static mode.
 *
 * @param props - The full ComboboxProps union.
 * @returns The async props subset if `onSearch` is present, otherwise null.
 */
export function resolveAsyncProps(props: ComboboxProps): AsyncProps | null {
  if ('onSearch' in props && typeof props.onSearch === 'function') {
    return props as AsyncProps
  }
  return null
}

function filterStatic(options: ComboboxOption[], query: string): ComboboxOption[] {
  const q = query.trim().toLowerCase()
  return q === '' ? options : options.filter((o) => o.label.toLowerCase().includes(q))
}

function getStaticOptions(props: ComboboxProps, isAsync: boolean): ComboboxOption[] {
  if (isAsync) return []
  return ('options' in props && props.options) || []
}

/**
 * Extracts seed options from async props for label resolution before any search is performed.
 *
 * @param props - The full ComboboxProps union.
 * @param isAsync - Whether the combobox is in async mode.
 * @returns The seed options array, or an empty array in static mode.
 */
function getSeedOptions(props: ComboboxProps, isAsync: boolean): ComboboxOption[] {
  if (!isAsync) return []
  if ('seedOptions' in props && Array.isArray(props.seedOptions)) {
    return props.seedOptions
  }
  return []
}

/**
 * Derives the current option list, loading state, and mode flags from raw props.
 *
 * @param params - Hook parameters.
 * @param params.props - Full ComboboxProps.
 * @param params.query - Current search query string.
 * @param params.asyncOptions - Options resolved by the async search hook.
 * @param params.loading - External loading flag from props.
 * @param params.asyncLoading - Internal loading flag from the async search hook.
 * @returns Derived option arrays, loading state, and mode metadata.
 */
export function resolveComboboxOptions({
  props,
  query,
  asyncOptions,
  loading,
  asyncLoading,
}: UseComboboxOptionsParams): UseComboboxOptionsResult {
  const asyncProps = resolveAsyncProps(props)
  const isAsync = asyncProps !== null
  const onSearch = asyncProps?.onSearch
  const debounceMs = asyncProps?.debounceMs ?? DEFAULT_DEBOUNCE_MS

  const staticOptions = getStaticOptions(props, isAsync)
  const displayedOptions = isAsync ? asyncOptions : filterStatic(staticOptions, query)
  const seedOptions = getSeedOptions(props, isAsync)
  const allKnownOptions = isAsync
    ? [...seedOptions, ...asyncOptions.filter((o) => !seedOptions.some((s) => s.value === o.value))]
    : staticOptions
  const isLoading = loading || (isAsync && asyncLoading)

  return {
    isAsync,
    displayedOptions,
    allKnownOptions,
    isLoading,
    onSearch,
    debounceMs,
    staticOptions,
  }
}
