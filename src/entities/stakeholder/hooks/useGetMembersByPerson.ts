import { useQuery } from '@tanstack/react-query'

import { getMembersByPerson } from '../api/getMembersByPersonApi'
import type { ProjectMember } from '../types/stakeholder.types'

/**
 * Derives the TanStack Query key for the members-by-person query.
 *
 * @param objectId - The person/object ID to scope the query.
 * @returns A readonly tuple used as the query key.
 */
export const getMembersByPersonQueryKey = (objectId: string) =>
  ['membersByPerson', objectId] as const

/**
 * TanStack Query hook that fetches project members associated with a given person.
 *
 * Disabled automatically when `objectId` is undefined.
 *
 * @param objectId - The person ID to look up. Pass `undefined` to skip fetching.
 * @returns A query result with an array of {@link ProjectMember} objects.
 */
export function useGetMembersByPerson(objectId: string | undefined) {
  return useQuery<ProjectMember[]>({
    queryKey: getMembersByPersonQueryKey(objectId ?? ''),
    queryFn: () => getMembersByPerson(objectId as string),
    enabled: Boolean(objectId),
    staleTime: 5 * 60 * 1000,
  })
}
