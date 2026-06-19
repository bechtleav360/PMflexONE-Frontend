import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { businessCaseStatusSchema } from '../types/businessCase.types'
import type { BusinessCaseStatus } from '../types/businessCase.types'

const QUERY = /* GraphQL */ `
  query BusinessCaseStatuses {
    businessCaseStatuses {
      status
      description
      displayOrder
    }
  }
`

const responseSchema = z.object({
  businessCaseStatuses: z.array(businessCaseStatusSchema),
})

/**
 * Fetches all defined Business Case status values with their display labels and sort order.
 * Results should be cached with a long stale time since status definitions rarely change.
 *
 * @returns A promise resolving to an array of BusinessCaseStatus entries.
 */
export async function lookupBusinessCaseStatuses(): Promise<BusinessCaseStatus[]> {
  const raw = await graphqlClient.request(QUERY)
  const parsed = responseSchema.parse(raw)
  return parsed.businessCaseStatuses
}
