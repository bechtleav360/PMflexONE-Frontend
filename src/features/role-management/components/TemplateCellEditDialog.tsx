import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import type { MatrixRole, MatrixTask, PermissionKey, TaskResource } from '@/entities/role'
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  RadioGroup,
} from '@/shared/components'

import { useEditRole } from '../hooks/useEditRole'
import { useExpandedKeys } from '../hooks/useExpandedKeys'
import { useRoleManagementStore } from '../store/roleManagementStore'
import { buildUpdatedTasks } from '../utils/buildUpdatedTasks'
import { PermissionOptionRow } from './PermissionOptionRow'

const PERMISSION_OPTIONS: PermissionKey[] = ['R', 'A', 'S', 'C', 'I', '—']

/**
 * Filters resources from a task that have operations for the given permission key.
 *
 * @param task - The matrix task to search, or undefined if not found.
 * @param key - The permission key to filter by.
 * @returns Matching resources, or empty array if task is undefined.
 */
function getResourcesForKey(task: MatrixTask | undefined, key: PermissionKey): TaskResource[] {
  if (!task) return []
  return task.resources.filter((r) => r.operationsByKey.some((opk) => opk.permissionKey === key))
}

interface TemplateCellEditDialogProps {
  /** The full role object (needed to reconstruct all tasks on submit). */
  role: MatrixRole
  /** All tasks in the matrix — used to add tasks absent from role.tasks when assigning a value. */
  allTasks: MatrixTask[]
  /** Human-readable task name shown in the dialog. */
  taskName: string
  /** Human-readable role name shown in the dialog. */
  roleName: string
  /** Matrix id used for cache invalidation. */
  matrixId: string
}

/**
 * Dialog for editing a single RASCI cell in the template matrix.
 * Opens when `store.isTemplateCellEditOpen` is true and `store.selectedCell` is set.
 * Shows 6 radio options (R, A, S, C, I, —) with the current value pre-selected.
 * Each option has an independently expandable panel listing the resources and their
 * operations for that permission key. `DialogContent` is keyed on the selected cell
 * so all local state resets automatically when the user opens a different cell.
 * On submit, calls `useEditRole` with the full updated tasks array (only the selected task changes).
 * On cancel, calls `store.closeAll()`.
 *
 * @param props - Component props.
 * @returns The rendered template cell edit dialog.
 */
export function TemplateCellEditDialog({
  role,
  allTasks,
  taskName,
  roleName,
  matrixId,
}: TemplateCellEditDialogProps) {
  const { t } = useTranslation()
  const { isTemplateCellEditOpen, selectedCell, closeAll } = useRoleManagementStore()
  const { mutateAsync, isPending } = useEditRole()
  const { expandedKeys, toggleExpanded } = useExpandedKeys()

  const [selectedValue, setSelectedValue] = useState<string>(selectedCell?.currentValue ?? '—')

  const isOpen = isTemplateCellEditOpen && selectedCell !== null
  const currentTask = allTasks.find((task) => task.id === selectedCell?.taskId)

  async function handleSubmit() {
    if (selectedCell === null) return
    const updatedTasks = buildUpdatedTasks(allTasks, role.tasks, selectedCell.taskId, selectedValue)
    await mutateAsync({
      id: role.id,
      matrixId,
      name: role.name,
      shortTitle: role.shortTitle,
      description: role.description ?? undefined,
      groupId: role.groupId,
      tasks: updatedTasks,
    })
    closeAll()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeAll()
      }}
    >
      <DialogContent
        key={`${selectedCell?.roleId}-${selectedCell?.taskId}`}
        className="sm:max-w-sm"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{t('pages.roleManagement.editCellTitle')}</DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <span className="text-muted-foreground font-medium">
              {t('pages.roleManagement.editCellRoleLabel')}
            </span>
            <span className="font-semibold">{roleName}</span>
            <span className="text-muted-foreground font-medium">
              {t('pages.roleManagement.editCellTaskLabel')}
            </span>
            <span>{taskName}</span>
          </div>

          <RadioGroup
            value={selectedValue}
            onValueChange={setSelectedValue}
            className="space-y-1"
          >
            {PERMISSION_OPTIONS.map((key) => (
              <PermissionOptionRow
                key={key}
                permKey={key}
                idPrefix="perm"
                resources={getResourcesForKey(currentTask, key)}
                isExpanded={expandedKeys.has(key)}
                onToggleExpand={toggleExpanded}
              />
            ))}
          </RadioGroup>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={closeAll}
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
