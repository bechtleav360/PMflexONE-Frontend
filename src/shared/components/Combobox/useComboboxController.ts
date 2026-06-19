import { useCallback, useState } from 'react'

import type { ComboboxOption, ComboboxProps } from './ComboboxTypes'
import { useComboboxAsyncSearch } from './useComboboxAsyncSearch'
import {
  DEFAULT_DEBOUNCE_MS,
  resolveAsyncProps,
  resolveComboboxOptions,
} from './useComboboxOptions'

interface UseComboboxControllerResult {
  open: boolean
  query: string
  displayedOptions: ComboboxOption[]
  selectedOption: ComboboxOption | null
  isLoading: boolean
  isAsync: boolean
  setOpen: (open: boolean) => void
  handleSelect: (value: string) => void
  handleCreate: (inputValue: string) => void
  handleQueryChange: (q: string) => void
}

/**
 * Encapsulates all state and side-effects for the Combobox component.
 *
 * @param props - The full ComboboxProps passed to the Combobox component.
 * @returns State values and event handlers consumed by ComboboxView.
 */
export function useComboboxController(props: ComboboxProps): UseComboboxControllerResult {
  const { value, defaultValue, onChange, onCreate, loading = false } = props

  const [internalValue, setInternalValue] = useState<string | null>(defaultValue ?? null)
  const resolvedValue = value !== undefined ? (value ?? null) : internalValue

  const [open, setOpenRaw] = useState(false)
  const [query, setQuery] = useState('')

  const asyncProps = resolveAsyncProps(props)
  const isAsync = asyncProps !== null
  const onSearch = asyncProps?.onSearch
  const debounceMs = asyncProps?.debounceMs ?? DEFAULT_DEBOUNCE_MS

  const { asyncOptions, asyncLoading } = useComboboxAsyncSearch({
    enabled: isAsync,
    open,
    query,
    onSearch,
    debounceMs,
  })

  const { displayedOptions, allKnownOptions, isLoading } = resolveComboboxOptions({
    props,
    query,
    asyncOptions,
    loading,
    asyncLoading,
  })

  const selectedOption: ComboboxOption | null = resolvedValue
    ? (allKnownOptions.find((o) => o.value === resolvedValue) ?? null)
    : null

  const setOpen = useCallback((nextOpen: boolean) => {
    setOpenRaw(nextOpen)
    if (!nextOpen) setQuery('')
  }, [])

  const commit = useCallback(
    (newValue: string | null) => {
      if (value === undefined) setInternalValue(newValue)
      onChange?.(newValue)
    },
    [value, onChange],
  )

  const handleSelect = useCallback(
    (selected: string) => {
      commit(selected === resolvedValue ? null : selected)
      setOpen(false)
    },
    [resolvedValue, commit, setOpen],
  )

  const handleCreate = useCallback(
    (inputValue: string) => {
      onCreate?.(inputValue)
      setOpen(false)
    },
    [onCreate, setOpen],
  )

  const handleQueryChange = useCallback((q: string) => setQuery(q), [])

  return {
    open,
    query,
    displayedOptions,
    selectedOption,
    isLoading,
    isAsync,
    setOpen,
    handleSelect,
    handleCreate,
    handleQueryChange,
  }
}
