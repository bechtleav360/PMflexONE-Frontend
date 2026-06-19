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

import type { AssumptionListItem } from '../../types/assumption.types'

/** Props for {@link AssumptionRow}. */
interface AssumptionRowProps {
  assumption: AssumptionListItem
  /** Currently unused — kept for API compatibility. */
  isExpanded: boolean
  onView: (assumption: AssumptionListItem) => void
  onEdit: (assumption: AssumptionListItem) => void
  onAddNew: () => void
  onDeleteRequest: (assumption: AssumptionListItem) => void
}

/**
 * A single row in the assumptions list.
 *
 * Displays name, optional validation status badge, optional "Risk" chip,
 * and a kebab actions menu on hover.
 *
 * @param props - Component props.
 * @returns The rendered assumption row.
 */
export function AssumptionRow({
  assumption,
  onView,
  onEdit,
  onAddNew,
  onDeleteRequest,
}: AssumptionRowProps) {
  const { t } = useTranslation()

  return (
    <li className="group border-border bg-card flex items-center gap-2 rounded-md border px-3 py-2">
      <span className="flex-1 truncate text-sm font-medium">{assumption.name}</span>

      {assumption.validationStatus && (
        <Badge
          variant="secondary"
          className="shrink-0 text-xs"
        >
          {t(
            `features.planningObjects.assumptions.validationStatusValues.${assumption.validationStatus}`,
            {
              defaultValue: assumption.validationStatus,
            },
          )}
        </Badge>
      )}

      {(assumption.isRisk || !!assumption.linkedRisk) && (
        <Badge
          variant="warning"
          className="shrink-0 text-xs"
        >
          {t('features.planningObjects.assumptions.isRisk')}
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
          <DropdownMenuItem onSelect={() => onView(assumption)}>
            <Eye
              className="mr-2 size-4"
              aria-hidden="true"
            />
            {t('features.planningObjects.common.view')}
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => onEdit(assumption)}>
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
            onSelect={() => onDeleteRequest(assumption)}
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
