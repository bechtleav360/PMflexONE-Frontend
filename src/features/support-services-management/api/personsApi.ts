import { gql } from 'graphql-request'
import { z } from 'zod'

/** Default page size for person search results. */
export const PERSON_SEARCH_PAGE_SIZE = 20

/** Zod schema for a person search result. */
export const personSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  mail: z.string(),
})

/** Inferred TypeScript type for a person search result. */
export type PersonSearchResult = z.infer<typeof personSchema>

/** Response schema for `SearchPersons`. */
export const searchPersonsResponseSchema = z.object({
  searchPersons: z.array(personSchema),
})

/** Searches for persons that have a user account, with optional pagination. */
export const SEARCH_PERSONS = gql`
  query SearchPersons($input: PersonSearchInput!) {
    searchPersons(input: $input) {
      id
      firstName
      lastName
      mail
    }
  }
`
