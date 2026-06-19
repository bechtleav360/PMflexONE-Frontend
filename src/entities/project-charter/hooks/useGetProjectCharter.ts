import { useQuery } from '@tanstack/react-query'

import { getProjectCharter } from '../api/getProjectCharter'
import { getProjectCharterQueryKey } from '../types/projectCharter.types'

/**
 * @param id - Project charter ID.
 * @returns TanStack Query result for the project charter node.
 */
export function useGetProjectCharter(id: string) {
  return useQuery({
    queryKey: getProjectCharterQueryKey(id),
    queryFn: () => getProjectCharter(id),
    enabled: id.length > 0,
    staleTime: 0,
  })
}
