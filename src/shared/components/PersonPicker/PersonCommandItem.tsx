import { Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Avatar, AvatarFallback } from '@/shared/components/Avatar'
import { CommandItem } from '@/shared/components/Command'
import { avatarColorClass } from '@/shared/lib/avatarColor'
import { cn } from '@/shared/lib/utils'

import { initials } from './personPickerUtils'
import type { PersonResult } from './usePersonPickerRecents'

/**
 * Single row in the person picker dropdown.
 *
 * @param props - Component props.
 * @param props.person - The person to display.
 * @param props.isSelected - Whether this person is currently selected.
 * @param props.onSelect - Called with the person's ID when the row is activated.
 * @param props.showMail - Whether to show the person's email address (default `true`).
 * @param props.onRemove - Optional callback to remove this person from recents.
 * @returns The rendered command item row.
 */
export function PersonCommandItem({
  person,
  isSelected,
  onSelect,
  showMail = true,
  onRemove,
}: {
  person: PersonResult
  isSelected: boolean
  onSelect: (id: string) => void
  showMail?: boolean
  onRemove?: (id: string) => void
}) {
  const { t } = useTranslation()
  return (
    <CommandItem
      value={person.id}
      onSelect={onSelect}
      className="cursor-pointer"
    >
      <Check
        aria-hidden="true"
        className={cn('mr-2 h-4 w-4 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')}
      />
      <Avatar className="mr-2 size-6 shrink-0">
        <AvatarFallback
          aria-hidden="true"
          className={cn('text-[10px]', avatarColorClass(person.firstName, person.lastName))}
        >
          {initials(person.firstName, person.lastName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm">
          {person.firstName} {person.lastName}
        </span>
        {showMail && person.mail && (
          <span className="text-muted-foreground truncate text-xs">{person.mail}</span>
        )}
      </div>
      {onRemove && (
        <button
          type="button"
          aria-label={t('shared.personPicker.removeFromRecents', {
            name: `${person.firstName} ${person.lastName}`,
          })}
          className="text-muted-foreground hover:text-foreground ml-2 shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onRemove(person.id)
          }}
        >
          <X
            className="h-3 w-3"
            aria-hidden="true"
          />
        </button>
      )}
    </CommandItem>
  )
}
