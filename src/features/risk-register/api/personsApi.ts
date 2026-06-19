import { gql } from 'graphql-request'
import { z } from 'zod'

/** GraphQL query document for fetching the list of persons (owner/reporter selection). */
export const GET_PERSONS = gql`
  query GetPersons {
    persons {
      id
      firstName
      lastName
    }
  }
`

const personOptionSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
})

/** Zod schema for the response of GET_PERSONS. */
export const getPersonsResponseSchema = z.object({
  persons: z.array(personOptionSchema),
})

/** TanStack Query key for the persons list. */
export const PERSONS_QUERY_KEY = ['persons'] as const
