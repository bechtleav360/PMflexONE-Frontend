import type React from 'react'

import { useTranslation } from 'react-i18next'

import type { PermissionKey, TaskResource } from '@/entities/role'
import { RasciValueBadge, Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components'

import { useRasciMatrixStore } from '../store/rasciMatrixStore'

interface RasciCellProps {
  /** The role ID for this cell. */
  roleId: string
  /** The task ID for this cell. */
  taskId: string
  /** The human-readable role name. */
  roleName: string
  /** The human-readable task name. */
  taskName: string
  /** The current RASCI permission key value. */
  currentValue: PermissionKey
  /** Whether this cell has been overridden from the template value. */
  isOverridden: boolean
  /** The original template value, shown in the override tooltip. */
  templateValue: PermissionKey | null
  /** Whether the current user can edit this cell. */
  canEdit: boolean
  /** Resources for this cell's task — used to build the tooltip. */
  taskResources: TaskResource[]
}

function formatResourceLines(
  resources: TaskResource[],
  key: PermissionKey,
  t: (k: string, fallback: string) => string,
): string[] {
  return resources
    .map((r) => {
      const opk = r.operationsByKey.find((o) => o.permissionKey === key)
      if (!opk) return null
      const ops = opk.operations.map((op) => t(`pages.rasciMatrix.operations.${op}`, op)).join(', ')
      return `${r.name}: ${ops}`
    })
    .filter((line): line is string => line !== null)
}

const OVERRIDE_MARKER = '*'

type CellT = ReturnType<typeof useTranslation>['t']

function renderCellTooltipContent(
  currentValue: PermissionKey,
  currentLines: string[],
  isOverridden: boolean,
  templateValue: PermissionKey | null,
  templateLines: string[],
  t: CellT,
) {
  return (
    <TooltipContent className="max-w-56 space-y-1.5 whitespace-normal">
      <div className="space-y-0.5">
        <div className="font-semibold">{t(`pages.roleManagement.rasciLegend.${currentValue}`)}</div>
        {currentLines.map((line) => (
          <div
            key={line}
            className="opacity-75"
          >
            {line}
          </div>
        ))}
      </div>
      {isOverridden && templateValue && (
        <div className="border-primary-foreground/20 space-y-0.5 border-t pt-1">
          <div className="font-medium">
            {t('pages.rasciMatrix.templateValue', {
              value: t(`pages.roleManagement.rasciLegend.${templateValue}`),
            })}
          </div>
          {templateLines
            .filter((line) => !currentLines.includes(line))
            .map((line) => (
              <div
                key={line}
                className="opacity-75"
              >
                {line}
              </div>
            ))}
        </div>
      )}
    </TooltipContent>
  )
}

/**
 * A single RASCI matrix cell rendered as a `<td>`.
 * Shows the permission key value via `RasciValueBadge` and an override marker
 * when the cell has been overridden from the template. Clicking the button
 * opens the override dialog via the RASCI matrix store.
 *
 * @param root0 - Cell configuration props.
 * @param root0.roleId - The role ID for this cell.
 * @param root0.taskId - The task ID for this cell.
 * @param root0.roleName - The human-readable role name.
 * @param root0.taskName - The human-readable task name.
 * @param root0.currentValue - The current RASCI permission key value.
 * @param root0.isOverridden - Whether this cell has been overridden from the template.
 * @param root0.templateValue - The original template value shown in the override tooltip.
 * @param root0.canEdit - Whether the current user can edit this cell.
 * @param root0.taskResources - Resources for this cell's task, used to build the tooltip.
 * @returns The rendered table cell.
 */
export function RasciCell({
  roleId,
  taskId,
  roleName,
  taskName,
  currentValue,
  isOverridden,
  templateValue,
  canEdit,
  taskResources,
}: RasciCellProps) {
  const { t } = useTranslation()
  const { openOverrideDialog, toggleBulkCell, bulkSelectedCells, isBulkMode, clearBulkSelection } =
    useRasciMatrixStore()

  const cellKey = `${roleId}:${taskId}`
  const isSelected = bulkSelectedCells.has(cellKey)

  const ariaLabel = t('pages.rasciMatrix.cellAriaLabel', {
    roleName,
    taskName,
    value: currentValue,
  })

  function handleClick(e: React.MouseEvent) {
    if (!canEdit) return
    if (isBulkMode || e.metaKey || e.ctrlKey) {
      toggleBulkCell({ roleId, taskId })
    } else {
      if (bulkSelectedCells.size > 0) clearBulkSelection()
      openOverrideDialog({
        roleId,
        taskId,
        roleName,
        taskName,
        currentValue,
        isOverridden,
        templateValue,
      })
    }
  }

  const currentLines = formatResourceLines(taskResources, currentValue, t)
  const templateLines = templateValue ? formatResourceLines(taskResources, templateValue, t) : []

  const overrideTooltipText = isOverridden
    ? templateValue
      ? t('pages.rasciMatrix.overrideTooltipWithValue', {
          value: t(`pages.roleManagement.rasciLegend.${templateValue}`),
          defaultValue: 'Abweichend vom Template (Template: {{value}})',
        })
      : t('pages.rasciMatrix.overrideTooltip', 'Abweichend vom Template')
    : null

  return (
    <td className="border-border border p-0 text-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={ariaLabel}
            disabled={!canEdit}
            onClick={handleClick}
            className={[
              'relative flex min-h-[44px] w-full min-w-[44px] items-center justify-center transition-colors',
              'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
              canEdit
                ? isSelected
                  ? 'bg-primary/20 ring-primary cursor-pointer ring-2 ring-inset'
                  : 'bg-accent/10 hover:bg-accent/60 cursor-pointer'
                : 'cursor-default disabled:pointer-events-none',
            ].join(' ')}
          >
            <RasciValueBadge value={currentValue} />
            {isOverridden && (
              <span
                data-testid="override-marker"
                aria-label={overrideTooltipText ?? t('pages.rasciMatrix.overrideMarker')}
                className="text-destructive absolute top-0.5 right-1 text-xs leading-none font-bold"
              >
                {OVERRIDE_MARKER}
              </span>
            )}
          </button>
        </TooltipTrigger>
        {renderCellTooltipContent(
          currentValue,
          currentLines,
          isOverridden,
          templateValue,
          templateLines,
          t,
        )}
      </Tooltip>
    </td>
  )
}
