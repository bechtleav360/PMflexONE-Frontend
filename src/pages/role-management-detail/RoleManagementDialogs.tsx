import type { MatrixRole, MatrixTask } from '@/entities/role'
import {
  BulkCellEditDialog,
  DeleteRoleDialog,
  RoleDefinitionDialog,
  TemplateCellEditDialog,
} from '@/features/role-management'

interface SelectedCellCoord {
  roleId: string
  taskId: string
}

interface RoleManagementDialogsProps {
  /** Matrix ID for cache invalidation in role mutations. */
  matrixId: string
  /** All roles in the matrix. */
  roles: MatrixRole[]
  /** All tasks in the matrix. */
  tasks: MatrixTask[]
  /** Whether the add-role dialog is open. */
  isAddRoleOpen: boolean
  /** Whether the edit-role dialog is open. */
  isEditRoleOpen: boolean
  /** Whether the delete-role dialog is open. */
  isDeleteRoleOpen: boolean
  /** The currently selected role (for edit/delete/cell-edit). */
  selectedRole: MatrixRole | null
  /** The currently selected role ID (for edit dialog). */
  selectedRoleId: string | null
  /** The task name for the selected cell (for cell-edit dialog). */
  selectedTaskName: string | null
  /** The currently selected cell coordinates (triggers cell-edit dialog). */
  selectedCell: SelectedCellCoord | null
}

/**
 * All CRUD and cell-edit dialogs for the role management detail page.
 * Extracted to keep the main page component below the complexity threshold.
 *
 * @param props - Dialog state and data.
 * @returns The rendered dialog group.
 */
export function RoleManagementDialogs({
  matrixId,
  roles,
  tasks,
  isAddRoleOpen,
  isEditRoleOpen,
  isDeleteRoleOpen,
  selectedRole,
  selectedRoleId,
  selectedTaskName,
  selectedCell,
}: RoleManagementDialogsProps) {
  return (
    <>
      <RoleDefinitionDialog
        matrixId={matrixId}
        open={isAddRoleOpen}
        roleId={null}
      />
      <RoleDefinitionDialog
        matrixId={matrixId}
        open={isEditRoleOpen}
        roleId={selectedRoleId}
      />
      <DeleteRoleDialog
        open={isDeleteRoleOpen}
        role={selectedRole}
        matrixId={matrixId}
      />
      {selectedRole && selectedCell && (
        <TemplateCellEditDialog
          role={selectedRole}
          allTasks={tasks}
          taskName={selectedTaskName ?? selectedCell.taskId}
          roleName={selectedRole.name}
          matrixId={matrixId}
        />
      )}
      <BulkCellEditDialog
        roles={roles}
        allTasks={tasks}
        matrixId={matrixId}
      />
    </>
  )
}
