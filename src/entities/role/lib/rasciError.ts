import type { RasciErrorCode } from '../model/role.types'

const errorKeyMap: Record<RasciErrorCode, string> = {
  ROLE_HAS_ASSIGNED_USERS: 'pages.roleManagement.errors.roleHasAssignedUsers',
  FIXED_ROLE_CANNOT_BE_DELETED: 'pages.roleManagement.errors.fixedRoleCannotBeDeleted',
  DEFAULT_ROLE_CANNOT_BE_DELETED: 'pages.roleManagement.errors.defaultRoleCannotBeDeleted',
  DIRECT_ASSIGNMENT_NOT_ALLOWED: 'pages.roleManagement.errors.directAssignmentNotAllowed',
  ROLE_NOT_MATERIALIZED: 'pages.roleManagement.errors.roleNotMaterialized',
  ORIGIN_ROLE_STILL_EXISTS: 'pages.roleManagement.errors.originRoleStillExists',
  NO_TEMPLATE_ROLE: 'pages.roleManagement.errors.noTemplateRole',
  TASK_NOT_IN_TEMPLATE: 'pages.roleManagement.errors.taskNotInTemplate',
  FIXED_TASK_CANNOT_BE_MODIFIED: 'pages.roleManagement.errors.fixedTaskCannotBeModified',
  TASK_MUTATION_NOT_ALLOWED_ON_TEMPLATE:
    'pages.roleManagement.errors.taskMutationNotAllowedOnTemplate',
  DEFAULT_ROLE_MUST_HAVE_AT_LEAST_ONE_USER:
    'pages.roleManagement.errors.defaultRoleMustHaveAtLeastOneUser',
  SCOPE_PROPAGATION_CONFIG_NOT_FOUND: 'pages.roleManagement.errors.scopePropagationConfigNotFound',
  CONFLICT: 'pages.roleManagement.errors.groupHasAssignedRoles',
}

/**
 * Maps a RasciErrorCode to its i18n key. Returns the generic fallback for unknown codes.
 * @param code - The error code string from the backend.
 * @returns The i18n translation key for the error.
 */
export function getRasciErrorKey(code: string): string {
  return errorKeyMap[code as RasciErrorCode] ?? 'pages.roleManagement.errors.unknown'
}

/**
 * Extracts the RASCI error code from an unknown error value.
 * Prefers `extensions.code` from the first GraphQL error (graphql-request ClientError),
 * then falls back to `error.message` for plain Error objects.
 * @param error - The unknown error thrown by a mutation.
 * @returns The extracted error code string.
 */
export function extractRasciErrorCode(error: unknown): string {
  if (error !== null && typeof error === 'object') {
    const clientErr = error as {
      response?: { errors?: Array<{ message?: string; extensions?: { code?: string } }> }
    }
    const firstError = clientErr.response?.errors?.[0]
    const code = firstError?.extensions?.code ?? firstError?.message
    if (code) return code
  }
  return String(error)
}
