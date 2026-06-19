// Types
export type {
  DomainType,
  OperationType,
  PermissionKey,
  RasciErrorCode,
  Matrix,
  RoleTaskPermission,
  MatrixRole,
  ResourceKeyOperations,
  TaskResource,
  MatrixTask,
  MatrixDetail,
  RoleGroup,
  TaskGroup,
  ResourcePermission,
  ResolvedCell,
  ResolvedMatrixColumn,
  AccessLevel,
} from './model/role.types'

// Schemas and inferred types
export {
  permissionKeySchema,
  roleTaskPermissionSchema,
  addRoleInputSchema,
  addObjectRoleInputSchema,
  changePermissionInputSchema,
  createRoleGroupInputSchema,
  matrixDetailSchema,
  roleGroupSchema,
  taskGroupSchema,
  resourcePermissionSchema,
} from './model/role.schema'
export type {
  AddRoleInput,
  AddObjectRoleInput,
  ChangePermissionInput,
  CreateRoleGroupInput,
} from './model/role.schema'

// Query keys
export { roleQueryKeys } from './model/role.queryKeys'

// Lib utilities
export { resolveMatrix } from './lib/resolveMatrix'
export { getAccessLevel } from './lib/accessLevel'
export { getRasciErrorKey, extractRasciErrorCode } from './lib/rasciError'

// UI
export { ResourcesTable } from './ui/ResourcesTable'

// Hooks
export { useMatrices } from './hooks/useMatrices'
export { useMatrix } from './hooks/useMatrix'
export type { UseMatrixParams } from './hooks/useMatrix'
export { useRoleGroups } from './hooks/useRoleGroups'
export { useTaskGroups } from './hooks/useTaskGroups'
export { useUserPermissions } from './hooks/useUserPermissions'
