import { useState } from 'react'

import { UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { ProjectWorkItem } from '@/entities/work-item'
import { usePersons } from '@/entities/work-item'
import {
  Avatar,
  AvatarFallback,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components'

import { useAssignWorkItemPerson } from '../../hooks/useAssignWorkItemPerson'
import { PersonList } from './PersonList'

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

interface CardAssigneePopoverProps {
  workItemId: string
  workItemVersion: number
  assignee: ProjectWorkItem['assignee']
}

/**
 * Avatar button that opens a popover for inline person assignment on a board card.
 * @param root0 - Component props.
 * @param root0.workItemId - The work item to assign.
 * @param root0.workItemVersion - Current version of the work item.
 * @param root0.assignee - Currently assigned person, or null.
 * @returns The assignee popover element.
 */
export function CardAssigneePopover({
  workItemId,
  workItemVersion,
  assignee,
}: CardAssigneePopoverProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { data: persons = [] } = usePersons()
  const assignMutation = useAssignWorkItemPerson()

  const assigneeInitials = assignee ? getInitials(assignee.firstName, assignee.lastName) : null
  const assigneeName = assignee ? `${assignee.firstName} ${assignee.lastName}` : null

  function handleAssignPerson(personId: string | null) {
    assignMutation.mutate({ id: workItemId, version: workItemVersion, assigneeId: personId })
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={
                assignee
                  ? t('features.workItem.board.changeAssignee', { name: assigneeName })
                  : t('features.workItem.board.assignPerson')
              }
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="focus-visible:ring-ring rounded-full focus-visible:ring-2 focus-visible:outline-none"
            >
              {assignee ? (
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-semibold">
                    {assigneeInitials}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <span className="border-muted-foreground/50 text-muted-foreground/60 hover:border-muted-foreground hover:text-muted-foreground flex h-6 w-6 items-center justify-center rounded-full border border-dashed transition-colors">
                  <UserRound className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          {assignee
            ? t('features.workItem.board.changeAssignee', { name: assigneeName })
            : t('features.workItem.board.assignPerson')}
        </TooltipContent>
      </Tooltip>

      <PopoverContent
        className="w-56 p-1"
        side="bottom"
        align="end"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <PersonList
          persons={persons}
          assigneeId={assignee?.id}
          onAssign={handleAssignPerson}
        />
      </PopoverContent>
    </Popover>
  )
}
