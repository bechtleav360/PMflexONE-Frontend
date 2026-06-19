import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { GET_PROGRAMS, programListItemSchema, PROGRAMS_QUERY_KEY } from '../api/programsApi'
import type { ProgramFilter } from '../types/program.types'

export type { ProgramFilter }

const responseSchema = z.object({ programs: z.array(programListItemSchema) })

/**
 * Query hook that fetches the list of programs, optionally filtered.
 *
 * Omits the `filter` variable entirely when the argument is undefined/null so
 * the server receives an unfiltered request. The full filter object is included
 * in the query key so any field change triggers a cache-separate refetch.
 *
 * @param root0 - Hook options.
 * @param root0.filter - Optional filter forwarded to the GraphQL `ProgramFilter` argument.
 * @returns A TanStack Query result containing an array of program list items.
 */
export function usePrograms({ filter }: { filter?: ProgramFilter } = {}) {
  const hasFilter = filter !== undefined
  return useQuery({
    queryKey: hasFilter ? [...PROGRAMS_QUERY_KEY, filter] : PROGRAMS_QUERY_KEY,
    queryFn: async () => {
      const raw = await graphqlClient.request(
        GET_PROGRAMS,
        (hasFilter ? { filter } : {}) as { filter?: ProgramFilter },
      )
      return responseSchema.parse(raw).programs
    },
    staleTime: 0,
  })
}
