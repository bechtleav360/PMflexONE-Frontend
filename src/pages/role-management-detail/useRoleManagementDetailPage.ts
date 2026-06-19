import { useParams } from 'react-router-dom'

import { useMatrix, useRoleGroups, useTaskGroups } from '@/entities/role'
import { useRoleManagementStore } from '@/features/role-management'

import { createCellClickHandler } from './lib/createCellClickHandler'
import {
  anyPending,
  buildRoleGroupMap,
  buildTaskGroupMap,
  deriveOrderedGroupIds,
  extractMatrixData,
  groupTasks,
  sortRoles,
} from './lib/deriveMatrixData'

/**
 * Encapsulates all data-fetching, store access, computed values, and event handlers
 * for `RoleManagementDetailPage`. Keeps the page component a thin coordinator.
 *
 * @returns All state, handlers, and derived values needed by the detail page.
 */
export function useRoleManagementDetailPage() {
  const params = useParams<{ matrixId: string }>()
  const matrixId = params.matrixId
  const matrixQuery = matrixId ? { matrixId } : {}

  const { data: matrixDetail, isPending: matrixPending } = useMatrix(matrixQuery)
  const { data: roleGroupsRaw, isPending: groupsPending } = useRoleGroups()
  const { data: taskGroupsRaw, isPending: taskGroupsPending } = useTaskGroups()
  const roleGroups = roleGroupsRaw ?? []
  const taskGroups = taskGroupsRaw ?? []

  const {
    isAddRoleOpen,
    isEditRoleOpen,
    isDeleteRoleOpen,
    selectedRoleId,
    selectedCell,
    bulkSelectedCells,
    isBulkMode,
    isBulkEditOpen,
    openAddRole,
    openEditRole,
    openDeleteRole,
    openTemplateCellEdit,
    toggleBulkCell,
    toggleBulkMode,
    openBulkEdit,
    openBulkEditForTaskGroup,
    clearBulkSelection,
  } = useRoleManagementStore()

  const bulkCount = bulkSelectedCells.size
  const isLoading = anyPending(matrixPending, groupsPending, taskGroupsPending)
  // TODO: Remove once the Admin matrix concept is finalised
  const isReadOnly = matrixDetail?.domainType === 'ADMIN'

  const handleCellClick = createCellClickHandler({
    isReadOnly,
    isBulkMode,
    bulkCount,
    clearBulkSelection,
    toggleBulkCell,
    openTemplateCellEdit,
  })

  const { roles: rawRoles, tasks } = extractMatrixData(matrixDetail)
  const roleGroupMap = buildRoleGroupMap(roleGroups)
  const roles = sortRoles(rawRoles, roleGroupMap)

  const selectedRoleForCell = selectedCell?.roleId ?? selectedRoleId
  const selectedRole = roles.find((r) => r.id === selectedRoleForCell) ?? null
  const selectedTask = selectedCell ? tasks.find((t) => t.id === selectedCell.taskId) : null

  const orderedGroupIds = deriveOrderedGroupIds(roles)
  const taskGroupMap = buildTaskGroupMap(taskGroups)
  const { tasksByGroup, ungroupedTasks, orderedTaskGroupIds } = groupTasks(tasks)

  return {
    matrixId,
    matrixDetail,
    isLoading,
    isReadOnly,
    roles,
    tasks,
    roleGroupMap,
    taskGroupMap,
    tasksByGroup,
    ungroupedTasks,
    orderedGroupIds,
    orderedTaskGroupIds,
    selectedRole,
    selectedTask,
    selectedRoleId,
    selectedCell,
    bulkSelectedCells,
    bulkCount,
    isBulkMode,
    isBulkEditOpen,
    isAddRoleOpen,
    isEditRoleOpen,
    isDeleteRoleOpen,
    openAddRole,
    openEditRole,
    openDeleteRole,
    openBulkEdit,
    openBulkEditForTaskGroup,
    clearBulkSelection,
    toggleBulkMode,
    handleCellClick,
  }
}
