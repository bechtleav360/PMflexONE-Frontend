import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import type { Matrix } from '../model/role.types'

const QUERY = /* GraphQL */ `
  query GetMatrices {
    matrices {
      id
      domainType
      objectId
    }
  }
`

const matrixSchema = z.object({
  id: z.string(),
  domainType: z.enum(['PORTFOLIO', 'PROGRAM', 'PROJECT', 'ADMIN']),
  objectId: z.string().nullable(),
})

const responseSchema = z.object({
  matrices: z.array(matrixSchema),
})

/**
 * Fetches the list of all matrices from the backend.
 * The response is validated with Zod at the API boundary.
 *
 * @returns A promise resolving to the array of matrices.
 */
export async function getMatrices(): Promise<Matrix[]> {
  const raw = await graphqlClient.request(QUERY)
  const parsed = responseSchema.parse(raw)
  return parsed.matrices
}
