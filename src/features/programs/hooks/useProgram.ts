import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { GET_PROGRAM, PROGRAM_QUERY_KEY, programDetailSchema } from '../api/programsApi'

const responseSchema = z.object({ program: programDetailSchema.nullable() })

/**
 * Query hook that fetches the full detail of a single program.
 *
 * The query is disabled when `id` is `null`, so the hook is safe to call
 * unconditionally before a program has been selected.
 *
 * @param id - The program ID to fetch, or `null` to keep the query disabled.
 * @returns A TanStack Query result containing the program detail object or
 *   `null` if the program was not found.
 */
export function useProgram(id: string | null) {
  return useQuery({
    queryKey: PROGRAM_QUERY_KEY(id ?? '_disabled'),
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_PROGRAM, { id })
      return responseSchema.parse(raw).program
    },
    staleTime: 0,
    enabled: !!id,
  })
}
