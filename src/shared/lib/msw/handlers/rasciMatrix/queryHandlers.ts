import { graphql, HttpResponse } from 'msw'

import {
  findOrCreateObjectMatrix,
  namedMatrices,
  objectMatrices,
  roleGroups,
  taskGroups,
  templateMatrix,
} from './seed'

/** MSW handler for the `GetMatrix` query. */
export const getMatrixHandler = graphql.query('GetMatrix', ({ variables }) => {
  const { matrixId, objectId } = variables as {
    matrixId?: string
    domainType?: string
    objectId?: string | null
  }

  if (matrixId && namedMatrices[matrixId]) {
    return HttpResponse.json({ data: { matrix: namedMatrices[matrixId] } })
  }

  if (!objectId) {
    return HttpResponse.json({ data: { matrix: templateMatrix } })
  }

  const matrix = findOrCreateObjectMatrix(objectId)
  return HttpResponse.json({ data: { matrix } })
})

/** MSW handler for the `GetRoleGroups` query. */
export const getRoleGroupsHandler = graphql.query('GetRoleGroups', () =>
  HttpResponse.json({ data: { roleGroups } }),
)

/** MSW handler for the `GetTaskGroups` query. */
export const getTaskGroupsHandler = graphql.query('GetTaskGroups', () =>
  HttpResponse.json({ data: { taskGroups } }),
)

/** MSW handler for the `GetUserPermissions` query — returns full permissions for all requested resources. */
export const getUserPermissionsHandler = graphql.query('GetUserPermissions', ({ variables }) => {
  const { resources } = variables as { resources: string[] }
  const userPermissions = resources.map((resource) => ({
    resource,
    operations: ['read', 'create', 'update', 'delete', 'link', 'unlink'] as const,
  }))
  return HttpResponse.json({ data: { userPermissions } })
})

/** MSW handler for the `GetMatrices` query — returns a deduplicated list of all known matrices. */
export const getMatricesHandler = graphql.query('GetMatrices', () => {
  const namedEntries = Object.values(namedMatrices).map(({ id, domainType, objectId }) => ({
    id,
    domainType,
    objectId,
  }))
  const objectEntries = Object.values(objectMatrices).map(({ id, domainType, objectId }) => ({
    id,
    domainType,
    objectId,
  }))
  const seen = new Set<string>()
  const matrices = [...namedEntries, ...objectEntries].filter(({ id }) => {
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })
  return HttpResponse.json({ data: { matrices } })
})
