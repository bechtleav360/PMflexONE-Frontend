import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

const QUERY = /* GraphQL */ `
  query LookupProjectInitiationRequestStatus {
    lookupProjectInitiationRequestStatus {
      value
      label
    }
  }
`

const statusLabelSchema = z.object({
  value: z.string(),
  label: z.string(),
})

const responseSchema = z.object({
  lookupProjectInitiationRequestStatus: z.array(statusLabelSchema),
})

/** Stable TanStack Query key for the PIR status lookup query. */
export const lookupProjectInitiationRequestStatusQueryKey = [
  'lookupProjectInitiationRequestStatus',
] as const

/**
 * Fetches the canonical status display labels for project initiation requests.
 * Results are cached with a long stale time since labels rarely change.
 *
 * @returns A promise resolving to an array of `{ value, label }` pairs.
 */
export async function lookupProjectInitiationRequestStatus(): Promise<
  { value: string; label: string }[]
> {
  const raw = await graphqlClient.request(QUERY)
  const parsed = responseSchema.parse(raw)
  return parsed.lookupProjectInitiationRequestStatus
}
