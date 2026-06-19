import { Check, Plus } from 'lucide-react'

import { CommandGroup, CommandItem, CommandSeparator } from '@/shared/components/Command'
import { cn } from '@/shared/lib/utils'

import type { ComboboxOption } from './ComboboxTypes'

interface ComboboxOptionListProps {
  options: ComboboxOption[]
  selectedOption: ComboboxOption | null
  showCreate: boolean
  query: string
  createText?: (query: string) => string
  handleSelect: (value: string) => void
  handleCreate: (inputValue: string) => void
}

/**
 * Renders the option list inside a `ComboboxDropdown`, with optional grouping
 * and a "create" item appended when `showCreate` is true.
 *
 * Options are grouped by their `group` string when at least one option carries
 * one; otherwise all items render in a single flat `CommandGroup`.
 *
 * @param props - Component props.
 * @param props.options - Options to render.
 * @param props.selectedOption - Currently selected option or null.
 * @param props.showCreate - Whether to append a "create new" item.
 * @param props.query - Current search query (used as the create-item label).
 * @param props.createText - Optional formatter for the create-item label.
 * @param props.handleSelect - Called with the selected option value.
 * @param props.handleCreate - Called with the trimmed query when create is chosen.
 * @returns A flat list or grouped list of `CommandItem` elements.
 */
export function ComboboxOptionList({
  options,
  selectedOption,
  showCreate,
  query,
  createText,
  handleSelect,
  handleCreate,
}: ComboboxOptionListProps) {
  const groups = [...new Set(options.map((o) => o.group))]
  const hasGroups = groups.some(Boolean)

  const renderItem = (option: ComboboxOption) => (
    <CommandItem
      key={option.value}
      value={option.value}
      data-testid={`option-${option.value.toLowerCase()}`}
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
      {option.renderLabel?.() ?? option.label}
    </CommandItem>
  )

  if (!hasGroups) {
    return (
      <CommandGroup>
        {options.map(renderItem)}
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
    )
  }

  return (
    <>
      {groups.map((group, i) => {
        const groupOptions = options.filter((o) => o.group === group)
        return (
          <div key={group ?? '__ungrouped'}>
            {i > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>{groupOptions.map(renderItem)}</CommandGroup>
          </div>
        )
      })}
      {showCreate && (
        <>
          <CommandSeparator />
          <CommandGroup>
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
          </CommandGroup>
        </>
      )}
    </>
  )
}
