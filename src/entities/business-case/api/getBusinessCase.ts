import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { businessCaseNodeSchema } from '../types/businessCase.types'
import type { BusinessCaseNode } from '../types/businessCase.types'

const QUERY = /* GraphQL */ `
  query GetBusinessCase($id: ID!) {
    businessCase(id: $id) {
      id
      version
      status
      clientSummary
      projectRationale
      expectedBenefit
      options
      investmentCalculation
      keyRisks
      expectedNegativeSideEffect
      timeline
      createdAt
      updatedAt
      metadata
      creator {
        id
        firstName
        lastName
        mail
      }
      updater {
        id
        firstName
        lastName
        mail
      }
      project {
        id
        name
      }
    }
  }
`

const responseSchema = z.object({
  businessCase: businessCaseNodeSchema,
})

/**
 * Fetches a single Business Case by its own ID.
 * The response is validated with Zod at the API boundary.
 *
 * @param id - The Business Case identifier.
 * @returns A promise resolving to the full BusinessCaseNode.
 */
export async function getBusinessCase(id: string): Promise<BusinessCaseNode> {
  const raw = await graphqlClient.request(QUERY, { id })
  const parsed = responseSchema.parse(raw)
  return parsed.businessCase
}
