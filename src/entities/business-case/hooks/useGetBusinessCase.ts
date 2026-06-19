import { useQuery } from '@tanstack/react-query'

import { getBusinessCase } from '../api/getBusinessCase'
import { getBusinessCaseQueryKey } from '../types/businessCase.types'

/**
 * Fetches a single Business Case by ID with all content fields.
 * Only enabled when `id` is a non-empty string.
 *
 * @param id - The Business Case identifier.
 * @returns TanStack Query result with `data` as `BusinessCaseNode`.
 */
export function useGetBusinessCase(id: string) {
  return useQuery({
    queryKey: getBusinessCaseQueryKey(id),
    queryFn: () => getBusinessCase(id),
    enabled: id.length > 0,
    staleTime: 0,
  })
}
