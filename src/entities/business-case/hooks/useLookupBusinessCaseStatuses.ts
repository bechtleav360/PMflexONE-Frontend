import { useQuery } from '@tanstack/react-query'

import { lookupBusinessCaseStatuses } from '../api/lookupBusinessCaseStatuses'
import { businessCaseStatusesQueryKey } from '../types/businessCase.types'

/**
 * Fetches all Business Case status definitions (id, name, label, position).
 * Results are cached indefinitely since status definitions rarely change.
 *
 * @returns TanStack Query result with `data` as `BusinessCaseStatus[]`.
 */
export function useLookupBusinessCaseStatuses() {
  return useQuery({
    queryKey: businessCaseStatusesQueryKey,
    queryFn: () => lookupBusinessCaseStatuses(),
    staleTime: Infinity,
  })
}
