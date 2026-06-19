import { useCallback } from 'react'

import type { PersonResult } from '@/shared/components'
import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  PERSON_SEARCH_PAGE_SIZE,
  SEARCH_PERSONS,
  searchPersonsResponseSchema,
} from '../api/personsApi'

/**
 * Returns a stable search callback for querying persons with user accounts via GraphQL.
 *
 * @returns Async search function compatible with PersonPicker's `onSearch` prop.
 */
export function useSearchPersons(): (query: string, page: number) => Promise<PersonResult[]> {
  return useCallback(async (query: string, page: number): Promise<PersonResult[]> => {
    const raw = await graphqlClient.request(SEARCH_PERSONS, {
      input: {
        hasUser: true,
        searchText: query.trim(),
        offset: page * PERSON_SEARCH_PAGE_SIZE,
        limit: PERSON_SEARCH_PAGE_SIZE,
      },
    })
    return searchPersonsResponseSchema.parse(raw).searchPersons
  }, [])
}
