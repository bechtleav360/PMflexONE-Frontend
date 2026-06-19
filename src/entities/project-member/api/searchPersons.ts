import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { personSearchResultSchema } from '../model/projectMember.schema'
import type { PersonSearchResult } from '../model/projectMember.types'

const QUERY = /* GraphQL */ `
  query SearchPersons($input: PersonSearchInput!) {
    searchPersons(input: $input) {
      id
      firstName
      lastName
      mail
      userId
    }
  }
`

const responseSchema = z.object({
  searchPersons: z.array(personSearchResultSchema),
})

/**
 * Input parameters for the person search query.
 */
export interface SearchPersonsInput {
  hasUser: boolean
  searchText: string
}

/**
 * Searches for persons matching the given criteria via the GraphQL API.
 *
 * @param input - Search parameters including optional user-filter and search text.
 * @returns Array of PersonSearchResult records matching the query.
 */
export async function searchPersons(input: SearchPersonsInput): Promise<PersonSearchResult[]> {
  const raw = await graphqlClient.request(QUERY, { input })
  const parsed = responseSchema.parse(raw)
  return parsed.searchPersons
}
