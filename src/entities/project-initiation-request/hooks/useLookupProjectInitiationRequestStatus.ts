import { useQuery } from '@tanstack/react-query'

import {
  lookupProjectInitiationRequestStatus,
  lookupProjectInitiationRequestStatusQueryKey,
} from '../api/lookupProjectInitiationRequestStatus'

/**
 * Returns the list of available PIR statuses for use in dropdowns and badges.
 *
 * @returns A TanStack Query result containing the lookup list.
 */
export function useLookupProjectInitiationRequestStatus() {
  return useQuery({
    queryKey: lookupProjectInitiationRequestStatusQueryKey,
    queryFn: () => lookupProjectInitiationRequestStatus(),
    staleTime: Infinity,
  })
}
