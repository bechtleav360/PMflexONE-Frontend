import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  LOOKUP_PROGRAM_STATUS,
  PROGRAM_STATUS_KEY,
  programStatusLookupSchema,
} from '../api/programsApi'

const responseSchema = z.object({
  lookupProgramStatus: z.array(programStatusLookupSchema),
})

/**
 * Query hook that fetches the list of valid program statuses from the lookup table.
 *
 * Results are cached indefinitely (`staleTime: Infinity`) because the status
 * table is static configuration data that changes only with server deployments.
 *
 * @returns A TanStack Query result containing an array of
 *   {@link ProgramStatusLookup} entries sorted by `displayOrder`.
 */
export function useLookupProgramStatus() {
  return useQuery({
    queryKey: PROGRAM_STATUS_KEY,
    queryFn: async () => {
      const raw = await graphqlClient.request(LOOKUP_PROGRAM_STATUS)
      return responseSchema.parse(raw).lookupProgramStatus
    },
    staleTime: Infinity,
  })
}
