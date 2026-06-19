import { useMatrices, useRoleGroups } from '@/entities/role'
import { useRoleManagementStore } from '@/features/role-management'

/**
 * Encapsulates all data-fetching and store access for `RoleManagementPage`.
 * Keeps the page component a thin coordinator.
 *
 * @returns All state and derived values needed by the role management overview page.
 */
export function useRoleManagementPage() {
  const { data: matrices, isPending: matricesPending } = useMatrices()
  const { data: roleGroups, isPending: groupsPending } = useRoleGroups()

  const {
    isAddGroupOpen,
    isEditGroupOpen,
    isDeleteGroupOpen,
    selectedGroupId,
    openAddGroup,
    openEditGroup,
    openDeleteGroup,
  } = useRoleManagementStore()

  const templateMatrices = matrices?.filter((m) => m.objectId === null) ?? []
  const isLoading = matricesPending || groupsPending

  const editingGroup = roleGroups?.find((g) => g.id === selectedGroupId) ?? null
  const deletingGroup = roleGroups?.find((g) => g.id === selectedGroupId) ?? null

  return {
    matrices,
    roleGroups,
    templateMatrices,
    isLoading,
    editingGroup,
    deletingGroup,
    isAddGroupOpen,
    isEditGroupOpen,
    isDeleteGroupOpen,
    openAddGroup,
    openEditGroup,
    openDeleteGroup,
  }
}
