import type { DomainType } from './role.types'

/** TanStack Query key factory for all role-related queries. */
export const roleQueryKeys = {
  matrices: () => ['matrices'] as const,
  matrix: (params: { matrixId?: string; domainType?: DomainType; objectId?: string | null }) =>
    ['matrix', params] as const,
  roleGroups: () => ['roleGroups'] as const,
  taskGroups: () => ['taskGroups'] as const,
  userPermissions: (resources: string[], objectId?: string) =>
    ['userPermissions', resources, objectId ?? null] as const,
} as const
