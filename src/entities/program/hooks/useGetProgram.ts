import { useQuery } from '@tanstack/react-query'

import { getProgram } from '../api/getProgramApi'

/**
 * Returns the stable TanStack Query key for a program.
 *
 * @param id - The program ID, or `'_disabled'` when the query is skipped.
 * @returns Stable query key tuple including the program ID.
 */
export const getProgramQueryKey = (id: string) => ['entity', 'program', id] as const

/**
 * Fetches a program summary (id + name) by ID.
 *
 * The query is disabled when `id` is `null`.
 *
 * @param id - The program ID to fetch, or `null` to keep the query disabled.
 * @returns TanStack Query result containing a {@link ProgramSummary} or `null`.
 */
export function useGetProgram(id: string | null) {
  return useQuery({
    queryKey: getProgramQueryKey(id ?? '_disabled'),
    queryFn: () => getProgram(id!),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}
