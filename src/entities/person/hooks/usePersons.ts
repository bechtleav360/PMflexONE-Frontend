import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { GET_PERSONS, getPersonsResponseSchema, PERSONS_QUERY_KEY } from '../api/personsApi'

/**
 * Fetches all persons and maps them to `{ value, label }` combobox options.
 *
 * @returns TanStack Query result with persons as `{ value: id, label: 'firstName lastName' }`.
 */
export function usePersons() {
  return useQuery({
    queryKey: PERSONS_QUERY_KEY,
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_PERSONS)
      return getPersonsResponseSchema.parse(raw).persons.map((p) => ({
        value: p.id,
        label: `${p.firstName} ${p.lastName}`,
      }))
    },
    staleTime: 5 * 60 * 1000,
  })
}
