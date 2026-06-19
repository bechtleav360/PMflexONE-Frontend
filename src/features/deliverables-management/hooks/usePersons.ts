import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { GET_PERSONS, getPersonsResponseSchema, PERSONS_QUERY_KEY } from '../api/personsApi'

/**
 * Fetches all persons for owner typeahead selection in the deliverable form.
 *
 * @returns TanStack Query result with an array of `{ id, firstName, lastName }` person options.
 */
export function usePersons() {
  return useQuery({
    queryKey: PERSONS_QUERY_KEY,
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_PERSONS)
      return getPersonsResponseSchema.parse(raw).persons
    },
    staleTime: 60_000,
  })
}
