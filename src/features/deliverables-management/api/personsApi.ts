import { gql } from 'graphql-request'
import { z } from 'zod'

/** GraphQL query document for fetching all persons (used for owner typeahead). */
export const GET_PERSONS = gql`
  query GetPersons {
    persons {
      id
      firstName
      lastName
      userId
    }
  }
`

/** Schema for a single person option in the owner typeahead. */
export const personOptionSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  /** Null or empty string means the person has no linked user account → inactive. */
  userId: z.string().nullable(),
})

/** Response schema for `GetPersons`. */
export const getPersonsResponseSchema = z.object({
  persons: z.array(personOptionSchema),
})

/** TanStack Query key for the persons list. */
export const PERSONS_QUERY_KEY = ['deliverables', 'persons'] as const
