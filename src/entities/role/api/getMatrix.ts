import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { matrixDetailSchema } from '../model/role.schema'
import type { DomainType, MatrixDetail } from '../model/role.types'

const QUERY = /* GraphQL */ `
  query GetMatrix($matrixId: ID, $domainType: DomainType, $objectId: ID) {
    matrix(matrixId: $matrixId, domainType: $domainType, objectId: $objectId) {
      id
      domainType
      objectId
      roles {
        id
        name
        shortTitle
        description
        isFixed
        isDefault
        groupId
        tasks {
          taskId
          permissionKey
        }
      }
      tasks {
        id
        name
        description
        isFixed
        resources {
          name
          operationsByKey {
            permissionKey
            operations
          }
        }
        groupId
      }
    }
  }
`

const responseSchema = z.object({
  matrix: matrixDetailSchema,
})

/**
 * Parameters for fetching a matrix.
 * @property matrixId - The unique matrix identifier. Mutually exclusive with domainType/objectId lookup.
 * @property domainType - Domain type filter (PROJECT, PROGRAM, PORTFOLIO, ADMIN).
 * @property objectId - The object (project/program/portfolio) ID. Omit for template matrices.
 */
export interface GetMatrixParams {
  matrixId?: string
  domainType?: DomainType
  objectId?: string | null
}

/**
 * Fetches a single matrix by optional matrixId, domainType, or objectId.
 * The response is validated with Zod at the API boundary.
 *
 * @param params - Query parameters: matrixId, domainType, objectId.
 * @returns A promise resolving to the MatrixDetail.
 */
export async function getMatrix(params: GetMatrixParams): Promise<MatrixDetail> {
  const raw = await graphqlClient.request(QUERY, params)
  const parsed = responseSchema.parse(raw)
  return parsed.matrix
}
