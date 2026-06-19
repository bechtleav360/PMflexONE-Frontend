// Public API for the Support Services Management feature

// Components
export { DeletePlanningRoleDialog } from './components/DeletePlanningRoleDialog'
export { DeleteSupportServiceDialog } from './components/DeleteSupportServiceDialog'
export { FirstChildWarningDialog } from './components/FirstChildWarningDialog'
export { PlanningRoleFormDialog } from './components/PlanningRoleFormDialog'
export { PlanningRoleInlineCreate } from './components/PlanningRoleInlineCreate'
export { SupportServiceFormDialog } from './components/SupportServiceFormDialog'
export { SupportServiceListView } from './components/SupportServiceListView'
export { SupportServiceTreeView } from './components/SupportServiceTreeView'
export { SupportServiceViewToggle } from './components/SupportServiceViewToggle'
export type { SupportServiceViewTab } from './components/SupportServiceViewToggle'

// Hooks
export { useAddUserToPlanningRole } from './hooks/useAddUserToPlanningRole'
export { useCreatePlanningRole } from './hooks/useCreatePlanningRole'
export { useCreateSupportService } from './hooks/useCreateSupportService'
export { useDeletePlanningRole } from './hooks/useDeletePlanningRole'
export { useDeleteSupportService } from './hooks/useDeleteSupportService'
export { useMoveSupportService } from './hooks/useMoveSupportService'
export { usePlanningRoles } from './hooks/usePlanningRoles'
export { useRemoveUserFromPlanningRole } from './hooks/useRemoveUserFromPlanningRole'
export { useSupportService, useSupportServiceTree } from './hooks/useSupportServices'
export { useSupportServiceReorder } from './hooks/useSupportServiceReorder'
export { useUpdatePlanningRole } from './hooks/useUpdatePlanningRole'
export { useUpdatePlanningRoleUserAssignment } from './hooks/useUpdatePlanningRoleUserAssignment'
export { useUpdateSupportService } from './hooks/useUpdateSupportService'

// Types
export type {
  PlanningRole,
  SupportService,
  SupportServiceFormValues,
} from './types/supportService.types'

// Utils
export { buildSupportServiceTree } from './utils/buildSupportServiceTree'
export { getExcludedParentIds } from './utils/getSupportServiceDescendants'
