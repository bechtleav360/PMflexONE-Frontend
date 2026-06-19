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

/** Props for {@link GoalTreeRowActions}. */
interface GoalTreeRowActionsProps {
  goalId: string
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onAddChild?: (id: string) => void
  onAddSibling?: (id: string) => void
  onDelete?: (id: string) => void
}

/**
 * Kebab-menu actions for a single goal tree row.
 *
 * All action callbacks are optional; menu items are omitted when not provided.
 * Separators are inserted automatically between action groups.
 *
 * @param props - Component props.
 * @param props.goalId - ID forwarded to each action callback.
 * @param props.onView - Opens the goal in view mode.
 * @param props.onEdit - Opens the goal in edit mode.
 * @param props.onAddChild - Creates a child goal.
 * @param props.onAddSibling - Creates a sibling goal.
 * @param props.onDelete - Initiates goal deletion.
 * @returns The rendered dropdown menu.
 */
// eslint-disable-next-line complexity -- optional action props create many conditional branches; inherent to the optional-menu-item pattern
export function GoalTreeRowActions({
  goalId,
  onView,
  onEdit,
  onAddChild,
  onAddSibling,
  onDelete,
}: GoalTreeRowActionsProps) {
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
        {onView && (
          <DropdownMenuItem onSelect={() => onView(goalId)}>
            <Eye
              className="mr-2 size-4"
              aria-hidden="true"
            />
            {t('features.planningObjects.common.view')}
          </DropdownMenuItem>
        )}

        {onEdit && (
          <DropdownMenuItem onSelect={() => onEdit(goalId)}>
            <Pencil
              className="mr-2 size-4"
              aria-hidden="true"
            />
            {t('features.planningObjects.common.edit')}
          </DropdownMenuItem>
        )}

        {(onAddChild || onAddSibling) && (onView || onEdit) && <DropdownMenuSeparator />}

        {onAddChild && (
          <DropdownMenuItem onSelect={() => onAddChild(goalId)}>
            <Plus
              className="mr-2 size-4"
              aria-hidden="true"
            />
            {t('features.planningObjects.common.addChild')}
          </DropdownMenuItem>
        )}

        {onAddSibling && (
          <DropdownMenuItem onSelect={() => onAddSibling(goalId)}>
            <ListPlus
              className="mr-2 size-4"
              aria-hidden="true"
            />
            {t('features.planningObjects.common.addSibling')}
          </DropdownMenuItem>
        )}

        {onDelete && (onView || onEdit || onAddChild || onAddSibling) && <DropdownMenuSeparator />}

        {onDelete && (
          <DropdownMenuItem
            onSelect={() => onDelete(goalId)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2
              className="mr-2 size-4"
              aria-hidden="true"
            />
            {t('features.planningObjects.common.delete')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
