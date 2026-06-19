import { useQuery } from '@tanstack/react-query'

import { getPersons } from '../api/personApi'
import type { Person } from '../types/workItem.types'

/** TanStack Query cache key for the work-item assignee persons list. */
export const PERSONS_QUERY_KEY = ['workItem', 'persons'] as const

/**
 * Loads all persons with an associated user account (available as assignees).
 *
 * @returns TanStack Query result containing the persons list.
 */
export function usePersons(): ReturnType<typeof useQuery<Person[]>> {
  return useQuery<Person[]>({
    queryKey: PERSONS_QUERY_KEY,
    queryFn: getPersons,
    staleTime: 5 * 60 * 1000,
  })
}
