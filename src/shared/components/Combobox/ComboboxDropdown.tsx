import { Loader2 } from 'lucide-react'

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandLoading,
} from '@/shared/components/Command'
import { PopoverContent } from '@/shared/components/Popover'

import { ComboboxOptionList } from './ComboboxOptionList'
import type { ComboboxOption } from './ComboboxTypes'

interface ComboboxDropdownProps {
  query: string
  displayedOptions: ComboboxOption[]
  selectedOption: ComboboxOption | null
  isLoading: boolean
  searchPlaceholder: string
  noResultsText: string
  loadingText: string
  createText?: (query: string) => string
  showCreate: boolean
  handleSelect: (value: string) => void
  handleCreate: (inputValue: string) => void
  handleQueryChange: (q: string) => void
}

/**
 * Dropdown panel rendered inside a `Popover` for the `Combobox`.
 *
 * Contains the `Command` search input and option list. Extracted from
 * `ComboboxView` to keep that component under the `max-lines-per-function`
 * threshold.
 *
 * @param props - Rendering props and event handlers (see `ComboboxDropdownProps`).
 * @returns A `PopoverContent` containing a searchable `Command` list.
 */
export function ComboboxDropdown({
  query,
  displayedOptions,
  selectedOption,
  isLoading,
  searchPlaceholder,
  noResultsText,
  loadingText,
  createText,
  showCreate,
  handleSelect,
  handleCreate,
  handleQueryChange,
}: ComboboxDropdownProps) {
  return (
    <PopoverContent
      className="w-(--radix-popover-trigger-width) p-0"
      align="start"
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder={searchPlaceholder}
          value={query}
          onValueChange={handleQueryChange}
        />
        <CommandList>
          {isLoading && (
            <CommandLoading>
              <div
                role="status"
                aria-label={loadingText}
                className="text-muted-foreground gap-sm py-lg flex items-center justify-center text-sm"
              >
                <Loader2
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin"
                />
              </div>
            </CommandLoading>
          )}
          {!isLoading && (
            <>
              <CommandEmpty>{noResultsText}</CommandEmpty>
              <ComboboxOptionList
                options={displayedOptions}
                selectedOption={selectedOption}
                showCreate={showCreate}
                query={query}
                createText={createText}
                handleSelect={handleSelect}
                handleCreate={handleCreate}
              />
            </>
          )}
        </CommandList>
      </Command>
    </PopoverContent>
  )
}
