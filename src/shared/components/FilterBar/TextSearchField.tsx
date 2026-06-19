import { useEffect, useRef, useState } from 'react'

import { Search } from 'lucide-react'

import type { FilterFieldDef } from '@/shared/types'

import { Input } from '../Input'
import { Label } from '../Label'

/** Debounce delay in milliseconds applied to the text-search control. */
const TEXT_SEARCH_DEBOUNCE_MS = 300

interface TextSearchFieldProps {
  field: Extract<FilterFieldDef, { type: 'text-search' }>
  externalValue: string
  onCommit: (value: string) => void
  id: string
}

/**
 * Debounced text-search input field.
 *
 * Maintains a local copy of the raw input value and fires `onCommit` after the
 * debounce window. External value changes (e.g. on reset) sync the local state.
 *
 * @param props - Component props.
 * @param props.field - The text-search field definition.
 * @param props.externalValue - The controlled value from the parent.
 * @param props.onCommit - Called with the debounced value after the user stops typing.
 * @param props.id - HTML id forwarded to the input element.
 * @returns A labeled text input with debounced change propagation.
 */
export function TextSearchField({ field, externalValue, onCommit, id }: TextSearchFieldProps) {
  const [localValue, setLocalValue] = useState(externalValue)
  const [prevExternal, setPrevExternal] = useState(externalValue)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  if (prevExternal !== externalValue) {
    setPrevExternal(externalValue)
    setLocalValue(externalValue)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value
    setLocalValue(next)
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => onCommit(next), TEXT_SEARCH_DEBOUNCE_MS)
  }

  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>{field.label}</Label>
      <div className="relative">
        <Search
          className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          id={id}
          type="text"
          value={localValue}
          placeholder={field.placeholder ?? ''}
          onChange={handleChange}
          className="w-88 pl-8"
        />
      </div>
    </div>
  )
}
