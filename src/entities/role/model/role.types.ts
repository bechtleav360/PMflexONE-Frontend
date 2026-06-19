export type { PermissionKey } from '@/shared/lib/rasci'

/** The domain context an object or matrix belongs to. */
export type DomainType = 'PORTFOLIO' | 'PROGRAM' | 'PROJECT' | 'ADMIN'

/** CRUD-style operation that can be performed on a resource. */
export type OperationType = 'read' | 'create' | 'update' | 'delete' | 'link' | 'unlink'

/** Error codes returned by the backend for RASCI mutation failures. */
export type RasciErrorCode =
  | 'ROLE_HAS_ASSIGNED_USERS'
  | 'FIXED_ROLE_CANNOT_BE_DELETED'
  | 'DEFAULT_ROLE_CANNOT_BE_DELETED'
  | 'DIRECT_ASSIGNMENT_NOT_ALLOWED'
  | 'ROLE_NOT_MATERIALIZED'
  | 'ORIGIN_ROLE_STILL_EXISTS'
  | 'NO_TEMPLATE_ROLE'
  | 'TASK_NOT_IN_TEMPLATE'
  | 'FIXED_TASK_CANNOT_BE_MODIFIED'
  | 'TASK_MUTATION_NOT_ALLOWED_ON_TEMPLATE'
  | 'DEFAULT_ROLE_MUST_HAVE_AT_LEAST_ONE_USER'
  | 'SCOPE_PROPAGATION_CONFIG_NOT_FOUND'
  | 'CONFLICT'

/** Minimal matrix descriptor returned by the matrix list query. */
export interface Matrix {
  id: string
  domainType: DomainType
  objectId: string | null
}

/** Mapping of a task to its permission key for a given role. */
export interface RoleTaskPermission {
  taskId: string
  permissionKey: string
}

/** A role entry within a matrix, including its task permission assignments. */
export interface MatrixRole {
  id: string
  name: string
  shortTitle: string
  description: string | null
  isFixed: boolean
  isDefault: boolean
  groupId: string
  tasks: RoleTaskPermission[]
}

/** Aggregates operations allowed for a specific RASCI permission key on a resource. */
export interface ResourceKeyOperations {
  permissionKey: string
  operations: OperationType[]
}

/** A resource exposed by a task, with per-key operation sets. */
export interface TaskResource {
  name: string
  operationsByKey: ResourceKeyOperations[]
}

/** A task entry within a matrix, including its resource definitions. */
export interface MatrixTask {
  id: string
  name: string
  description: string | null
  isFixed: boolean
  resources: TaskResource[]
  groupId: string | null
}

/** Full matrix detail including all roles and tasks. */
export interface MatrixDetail {
  id: string
  domainType: DomainType
  objectId: string | null
  roles: MatrixRole[]
  tasks: MatrixTask[]
}

/** A named group that roles can be assigned to for visual grouping in the matrix. */
export interface RoleGroup {
  id: string
  name: string
  description: string | null
  sortOrder: number
  color: string | null
}

/** A named group that tasks can be assigned to for row grouping in the matrix. */
export interface TaskGroup {
  id: string
  name: string
  description: string | null
  sortOrder: number
}

/** Effective operations a user holds on a specific resource. */
export interface ResourcePermission {
  resource: string
  operations: OperationType[]
}

/** A resolved cell value combining current override and template source. */
export interface ResolvedCell {
  roleId: string
  taskId: string
  currentValue: string
  templateValue: string | null
  isOverridden: boolean
}

/** A resolved matrix column with its role, group membership, cells, and override/custom flags. */
export interface ResolvedMatrixColumn {
  role: MatrixRole
  group: RoleGroup | null
  cells: ResolvedCell[]
  hasAnyOverride: boolean
  isCustomRole: boolean
}

/** Access level derived from RASCI value. R/A/S/C → write; I → read; — → none */
export type AccessLevel = 'write' | 'read' | 'none'
