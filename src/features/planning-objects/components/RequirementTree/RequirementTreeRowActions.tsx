import { Eye, ListPlus, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components'

/** Props for {@link RequirementTreeRowActions}. */
interface RequirementTreeRowActionsProps {
  requirementId: string
  onView: (id: string) => void
  onEdit: (id: string) => void
  onAddChild: (id: string) => void
  onAddSibling: (id: string) => void
  onDelete: (id: string) => void
}

/**
 * Kebab-menu actions for a single requirement tree row.
 *
 * @param props - Component props.
 * @param props.requirementId - ID forwarded to each action callback.
 * @param props.onView - Opens the requirement in view mode.
 * @param props.onEdit - Opens the requirement in edit mode.
 * @param props.onAddChild - Creates a child requirement.
 * @param props.onAddSibling - Creates a sibling requirement.
 * @param props.onDelete - Initiates requirement deletion.
 * @returns The rendered dropdown menu.
 */
export function RequirementTreeRowActions({
  requirementId,
  onView,
  onEdit,
  onAddChild,
  onAddSibling,
  onDelete,
}: RequirementTreeRowActionsProps) {
  const { t } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
          aria-label={t('features.planningObjects.common.rowActions')}
        >
          <MoreHorizontal
            className="size-3.5"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onView(requirementId)}>
          <Eye
            className="mr-2 size-4"
            aria-hidden="true"
          />
          {t('features.planningObjects.common.view')}
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => onEdit(requirementId)}>
          <Pencil
            className="mr-2 size-4"
            aria-hidden="true"
          />
          {t('features.planningObjects.common.edit')}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={() => onAddChild(requirementId)}>
          <Plus
            className="mr-2 size-4"
            aria-hidden="true"
          />
          {t('features.planningObjects.common.addChild')}
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => onAddSibling(requirementId)}>
          <ListPlus
            className="mr-2 size-4"
            aria-hidden="true"
          />
          {t('features.planningObjects.common.addSibling')}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={() => onDelete(requirementId)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2
            className="mr-2 size-4"
            aria-hidden="true"
          />
          {t('features.planningObjects.common.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
