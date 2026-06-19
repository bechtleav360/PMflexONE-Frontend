import { Eye, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components'

import type { ConstraintListItem } from '../../types/constraint.types'

/** Props for {@link ConstraintRow}. */
interface ConstraintRowProps {
  constraint: ConstraintListItem
  /** Currently unused — kept for API compatibility. */
  isExpanded: boolean
  onView: (constraint: ConstraintListItem) => void
  onEdit: (constraint: ConstraintListItem) => void
  onAddNew: () => void
  onDeleteRequest: (constraint: ConstraintListItem) => void
}

/**
 * A single row in the constraints list.
 *
 * Displays name, and — when the constraint is time-bound — a badge showing
 * the deadline date (or "Zeitgebunden" without a date). A kebab actions menu
 * appears on hover.
 *
 * @param props - Component props.
 * @returns The rendered constraint row.
 */
export function ConstraintRow({
  constraint,
  onView,
  onEdit,
  onAddNew,
  onDeleteRequest,
}: ConstraintRowProps) {
  const { t, i18n } = useTranslation()

  return (
    <li className="group border-border bg-card flex items-center gap-2 rounded-md border px-3 py-2">
      <span className="flex-1 truncate text-sm font-medium">{constraint.name}</span>

      {constraint.timeConstrained && (
        <Badge
          variant="secondary"
          className="shrink-0 text-xs"
        >
          {constraint.dueDate
            ? t('features.planningObjects.constraints.timeBoundWithDate', {
                date: new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(
                  new Date(constraint.dueDate),
                ),
              })
            : t('features.planningObjects.constraints.timeBoundNoDate')}
        </Badge>
      )}

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
          <DropdownMenuItem onSelect={() => onView(constraint)}>
            <Eye
              className="mr-2 size-4"
              aria-hidden="true"
            />
            {t('features.planningObjects.common.view')}
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => onEdit(constraint)}>
            <Pencil
              className="mr-2 size-4"
              aria-hidden="true"
            />
            {t('features.planningObjects.common.edit')}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={onAddNew}>
            <Plus
              className="mr-2 size-4"
              aria-hidden="true"
            />
            {t('features.planningObjects.common.addNew')}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => onDeleteRequest(constraint)}
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
    </li>
  )
}
