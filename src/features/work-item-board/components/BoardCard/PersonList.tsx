import { Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { usePersons } from '@/entities/work-item'
import { Avatar, AvatarFallback } from '@/shared/components'

/**
 * Returns uppercase two-letter initials from a first and last name.
 * @param firstName - The person's first name.
 * @param lastName - The person's last name.
 * @returns Two-character uppercase initials string.
 */
function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

/** Props for the PersonList component. */
export interface PersonListProps {
  persons: ReturnType<typeof usePersons>['data']
  assigneeId: string | undefined
  onAssign: (id: string | null) => void
}

/**
 * Scrollable list of persons for inline board-card assignee selection.
 * @param root0 - Component props.
 * @param root0.persons - Available persons to display.
 * @param root0.assigneeId - Currently assigned person's ID, if any.
 * @param root0.onAssign - Called with a person ID to assign, or null to unassign.
 * @returns The person list element.
 */
export function PersonList({ persons = [], assigneeId, onAssign }: PersonListProps) {
  const { t } = useTranslation()
  return (
    <>
      <p className="text-muted-foreground px-2 py-1 text-xs font-semibold tracking-wide uppercase">
        {t('features.workItem.board.assignTo')}
      </p>
      <div className="max-h-48 overflow-y-auto">
        {persons.map((person) => (
          <button
            key={person.id}
            type="button"
            onClick={() => onAssign(person.id)}
            className="hover:bg-accent focus-visible:ring-ring flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:outline-none"
          >
            <Avatar className="h-5 w-5 shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-[9px] font-semibold">
                {getInitials(person.firstName, person.lastName)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">
              {person.firstName} {person.lastName}
            </span>
            {assigneeId === person.id && <Check className="text-primary ml-auto h-3 w-3" />}
          </button>
        ))}
      </div>
      {assigneeId && (
        <>
          <div className="bg-border my-1 h-px" />
          <button
            type="button"
            onClick={() => onAssign(null)}
            className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:outline-none"
          >
            <X className="h-4 w-4 shrink-0" />
            {t('features.workItem.board.unassign')}
          </button>
        </>
      )}
    </>
  )
}
