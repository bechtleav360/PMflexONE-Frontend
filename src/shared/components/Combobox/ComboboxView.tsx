import { Check, ChevronsUpDown, Loader2, Plus } from 'lucide-react'

import { Button } from '@/shared/components/Button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from '@/shared/components/Command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/Popover'
import { cn } from '@/shared/lib/utils'

import type { ComboboxOption } from './ComboboxTypes'

interface ComboboxViewProps {
  open: boolean
  query: string
  displayedOptions: ComboboxOption[]
  selectedOption: ComboboxOption | null
  isLoading: boolean
  placeholder: string
  searchPlaceholder: string
  noResultsText: string
  loadingText: string
  createText?: (query: string) => string
  showCreate: boolean
  disabled?: boolean
  className?: string
  listClassName?: string
  id?: string
  setOpen: (open: boolean) => void
  handleSelect: (value: string) => void
  handleCreate: (inputValue: string) => void
  handleQueryChange: (q: string) => void
}

interface ComboboxListContentProps {
  displayedOptions: ComboboxOption[]
  selectedOption: ComboboxOption | null
  query: string
  showCreate: boolean
  noResultsText: string
  createText?: (query: string) => string
  handleSelect: (value: string) => void
  handleCreate: (inputValue: string) => void
}

function ComboboxListContent({
  displayedOptions,
  selectedOption,
  query,
  showCreate,
  noResultsText,
  createText,
  handleSelect,
  handleCreate,
}: ComboboxListContentProps) {
  return (
    <>
      <CommandEmpty>{noResultsText}</CommandEmpty>
      <CommandGroup>
        {displayedOptions.map((option) => (
          <CommandItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            onSelect={handleSelect}
          >
            <Check
              aria-hidden="true"
              className={cn(
                'mr-sm h-4 w-4',
                selectedOption?.value === option.value ? 'opacity-100' : 'opacity-0',
              )}
            />
            {option.label}
          </CommandItem>
        ))}
        {showCreate && (
          <CommandItem
            value={`__create__${query.trim()}`}
            onSelect={() => handleCreate(query.trim())}
          >
            <Plus
              aria-hidden="true"
              className="mr-sm h-4 w-4"
            />
            {createText ? createText(query.trim()) : query.trim()}
          </CommandItem>
        )}
      </CommandGroup>
    </>
  )
}

/**
 * Pure rendering layer for the Combobox. All logic lives in useComboboxController.
 *
 * @param props - Rendering props and event handlers.
 * @param props.open - Whether the dropdown popover is open.
 * @param props.query - Current search query string.
 * @param props.displayedOptions - Options to render in the list.
 * @param props.selectedOption - Currently selected option or null.
 * @param props.isLoading - Whether a loading indicator should be shown.
 * @param props.placeholder - Trigger button placeholder text.
 * @param props.searchPlaceholder - Search input placeholder text.
 * @param props.noResultsText - Text shown when the list is empty.
 * @param props.loadingText - Accessible label announced to screen readers while loading.
 * @param props.createText - Optional function returning the create-option label.
 * @param props.showCreate - Whether to render the create option.
 * @param props.disabled - Whether the trigger button is disabled.
 * @param props.className - Additional classes for the trigger button.
 * @param props.listClassName - Optional class for the options list container.
 * @param props.id - HTML id forwarded to the trigger button.
 * @param props.setOpen - Callback to open/close the popover.
 * @param props.handleSelect - Callback fired when an option is selected.
 * @param props.handleCreate - Callback fired when the create option is selected.
 * @param props.handleQueryChange - Callback fired when the search query changes.
 * @returns A trigger button paired with a Popover containing a searchable Command list.
 */
export function ComboboxView({
  open,
  query,
  displayedOptions,
  selectedOption,
  isLoading,
  placeholder,
  searchPlaceholder,
  noResultsText,
  loadingText,
  createText,
  showCreate,
  disabled,
  className,
  listClassName,
  id,
  setOpen,
  handleSelect,
  handleCreate,
  handleQueryChange,
}: ComboboxViewProps) {
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="secondary"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          disabled={disabled}
          className={cn('w-full justify-between font-normal', className)}
        >
          <span className={cn('truncate', !selectedOption && 'text-muted-foreground')}>
            {selectedOption
              ? (selectedOption.renderLabel?.() ?? selectedOption.label)
              : placeholder}
          </span>
          <ChevronsUpDown
            aria-hidden="true"
            className="ml-sm h-4 w-4 shrink-0 opacity-50"
          />
        </Button>
      </PopoverTrigger>
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
          <CommandList className={listClassName}>
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
              <ComboboxListContent
                displayedOptions={displayedOptions}
                selectedOption={selectedOption}
                query={query}
                showCreate={showCreate}
                noResultsText={noResultsText}
                createText={createText}
                handleSelect={handleSelect}
                handleCreate={handleCreate}
              />
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
