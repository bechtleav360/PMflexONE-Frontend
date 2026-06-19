import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import type { MatrixRole, MatrixTask, PermissionKey } from '@/entities/role'
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  RadioGroup,
  RadioGroupItem,
} from '@/shared/components'

import { useEditRole } from '../hooks/useEditRole'
import { useRoleManagementStore } from '../store/roleManagementStore'

const PERMISSION_OPTIONS: PermissionKey[] = ['R', 'A', 'S', 'C', 'I', '—']

type BulkT = ReturnType<typeof useTranslation>['t']

function renderBulkPermissionRadioGroup(
  selectedValue: PermissionKey,
  onValueChange: (val: PermissionKey) => void,
  t: BulkT,
) {
  return (
    <RadioGroup
      value={selectedValue}
      onValueChange={(val) => onValueChange(val as PermissionKey)}
      className="space-y-1"
    >
      {PERMISSION_OPTIONS.map((key) => (
        <div
          key={key}
          className="hover:bg-muted/50 flex items-center gap-3 rounded px-2 py-1.5"
        >
          <RadioGroupItem
            value={key}
            id={`bulk-perm-${key}`}
          />
          <Label
            htmlFor={`bulk-perm-${key}`}
            className="flex w-full cursor-pointer items-center gap-2"
          >
            <span className="w-4 text-center font-mono font-semibold">{key}</span>
            <span className="text-muted-foreground text-xs">
              {t(`pages.roleManagement.rasciLegend.${key}`)}
            </span>
          </Label>
        </div>
      ))}
    </RadioGroup>
  )
}

function buildByRoleMap(bulkSelectedCells: Map<string, { roleId: string; taskId: string }>) {
  const byRole = new Map<string, Set<string>>()
  for (const cell of bulkSelectedCells.values()) {
    const taskIds = byRole.get(cell.roleId) ?? new Set<string>()
    taskIds.add(cell.taskId)
    byRole.set(cell.roleId, taskIds)
  }
  return byRole
}

function buildUpdatedTasks(
  role: MatrixRole,
  taskIds: Set<string>,
  allTasks: MatrixTask[],
  selectedValue: PermissionKey,
) {
  return allTasks
    .map((task) => {
      const existing = role.tasks.find((t) => t.taskId === task.id)
      const permissionKey = taskIds.has(task.id) ? selectedValue : (existing?.permissionKey ?? '—')
      return { taskId: task.id, permissionKey }
    })
    .filter((t) => t.permissionKey !== '—')
}

interface BulkCellEditDialogProps {
  /** All roles in the matrix, used to reconstruct updated tasks arrays. */
  roles: MatrixRole[]
  /** All tasks in the matrix — used to add tasks absent from role.tasks when assigning a value. */
  allTasks: MatrixTask[]
  /** Matrix id used for cache invalidation. */
  matrixId: string
}

/**
 * Dialog for bulk-editing multiple RASCI cells in the template matrix.
 * Opens when `store.isBulkEditOpen` is true and `bulkSelectedCells` is non-empty.
 * Groups selected cells by roleId, constructs one `editRole` mutation per affected
 * role, and fires them in parallel.
 *
 * @param root0 - Component props.
 * @param root0.roles - All roles in the matrix.
 * @param root0.allTasks - All tasks in the matrix.
 * @param root0.matrixId - Matrix ID used for cache invalidation.
 * @returns The rendered bulk-cell-edit dialog element.
 */
export function BulkCellEditDialog({ roles, allTasks, matrixId }: BulkCellEditDialogProps) {
  const { t } = useTranslation()
  const { isBulkEditOpen, bulkSelectedCells, bulkContextLabel, clearBulkSelection } =
    useRoleManagementStore()
  const { mutateAsync, isPending } = useEditRole()

  const [selectedValue, setSelectedValue] = useState<PermissionKey>('—')

  const cellCount = bulkSelectedCells.size
  const isOpen = isBulkEditOpen && cellCount > 0

  async function handleSubmit() {
    const byRole = buildByRoleMap(bulkSelectedCells)
    try {
      await Promise.all(
        Array.from(byRole.entries()).map(([roleId, taskIds]) => {
          const role = roles.find((r) => r.id === roleId)
          if (!role) return Promise.resolve()
          const updatedTasks = buildUpdatedTasks(role, taskIds, allTasks, selectedValue)
          return mutateAsync({
            id: role.id,
            matrixId,
            name: role.name,
            shortTitle: role.shortTitle,
            description: role.description ?? undefined,
            groupId: role.groupId,
            tasks: updatedTasks,
          })
        }),
      )
    } finally {
      clearBulkSelection()
      setSelectedValue('—')
    }
  }

  // Count affected roles for the summary line
  const affectedRoleCount = new Set(Array.from(bulkSelectedCells.values()).map((c) => c.roleId))
    .size

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          clearBulkSelection()
          setSelectedValue('—')
        }
      }}
    >
      <DialogContent
        className="sm:max-w-sm"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{t('pages.roleManagement.bulkEditTitle', 'Set RASCI Value')}</DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {bulkContextLabel && (
            <div className="border-primary/30 bg-primary/5 rounded-md border px-3 py-2 text-sm">
              <span className="font-medium">
                {t('pages.roleManagement.taskGroupBulkContext', 'Task group:')}
              </span>{' '}
              {bulkContextLabel}
            </div>
          )}
          <p className="text-muted-foreground text-sm">
            {t('pages.roleManagement.bulkEditSummary', {
              cellCount,
              roleCount: affectedRoleCount,
            })}
          </p>

          {renderBulkPermissionRadioGroup(selectedValue, setSelectedValue, t)}
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={clearBulkSelection}
            disabled={isPending}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            aria-disabled={isPending}
          >
            {t('common.save', 'Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
