import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import type { DomainType, MatrixTask, PermissionKey, TaskResource } from '@/entities/role'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  RadioGroup,
} from '@/shared/components'

import { useChangeObjectRolePermission } from '../hooks/useChangeObjectRolePermission'
import { useExpandedKeys } from '../hooks/useExpandedKeys'
import { useResetTaskPermission } from '../hooks/useResetTaskPermission'
import { useRasciMatrixStore } from '../store/rasciMatrixStore'
import { CellInfoGrid } from './CellInfoGrid'
import { OverrideDialogFooter } from './OverrideDialogFooter'
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

interface OverrideValueDialogProps {
  /** Whether the dialog is currently open. */
  open: boolean
  /** The object ID (project / program / portfolio). */
  objectId: string
  /** The domain type of the object. */
  domainType: DomainType
  /** All tasks in the matrix — used to derive resource details for the selected cell's task. */
  tasks: MatrixTask[]
}

/**
 * Dialog for overriding a RASCI cell value on an object matrix.
 * Shows 6 radio options (R, A, S, C, I, —) with the current value pre-selected.
 * Each option has an independently expandable panel listing the resources and their
 * operations for that permission key. `DialogContent` is keyed on the selected cell
 * so all local state resets automatically when the user opens a different cell.
 * On submit: calls `useChangeObjectRolePermission`.
 * On cancel / close: calls `store.closeAll()`.
 * When the cell is overridden: also shows a "Reset this cell" button.
 *
 * @param props - Dialog configuration.
 * @returns The rendered override value dialog.
 */
export function OverrideValueDialog({
  open,
  objectId,
  domainType,
  tasks,
}: OverrideValueDialogProps) {
  const { t } = useTranslation()
  const { selectedCell, closeAll } = useRasciMatrixStore()
  const { mutateAsync: changePermission, isPending: isChangePending } =
    useChangeObjectRolePermission()
  const { mutateAsync: resetTask, isPending: isResetPending } = useResetTaskPermission()
  const { expandedKeys, toggleExpanded } = useExpandedKeys()

  const [selectedValue, setSelectedValue] = useState<PermissionKey>(
    (selectedCell?.currentValue as PermissionKey | undefined) ?? '—',
  )

  const isPending = isChangePending || isResetPending
  const currentTask = tasks.find((task) => task.id === selectedCell?.taskId)

  async function handleSubmit() {
    if (selectedCell === null) return
    await changePermission({
      objectId,
      domainType,
      roleId: selectedCell.roleId,
      taskId: selectedCell.taskId,
      permissionKey: selectedValue,
    })
    closeAll()
  }

  async function handleReset() {
    if (selectedCell === null) return
    await resetTask({
      objectId,
      domainType,
      roleId: selectedCell.roleId,
      taskId: selectedCell.taskId,
    })
    closeAll()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) closeAll()
      }}
    >
      <DialogContent
        key={`${selectedCell?.roleId}-${selectedCell?.taskId}`}
        className="sm:max-w-sm"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{t('pages.rasciMatrix.overrideDialogTitle')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <CellInfoGrid
            roleName={selectedCell?.roleName}
            taskName={selectedCell?.taskName}
          />
          <RadioGroup
            value={selectedValue}
            onValueChange={(val) => {
              setSelectedValue(val as PermissionKey)
            }}
            className="space-y-1"
          >
            {PERMISSION_OPTIONS.map((key) => (
              <PermissionOptionRow
                key={key}
                permKey={key}
                idPrefix="override-perm"
                resources={getResourcesForKey(currentTask, key)}
                isExpanded={expandedKeys.has(key)}
                onToggleExpand={toggleExpanded}
              />
            ))}
          </RadioGroup>
        </DialogBody>
        <OverrideDialogFooter
          isPending={isPending}
          selectedCell={selectedCell}
          onSave={handleSubmit}
          onCancel={closeAll}
          onReset={handleReset}
        />
      </DialogContent>
    </Dialog>
  )
}
