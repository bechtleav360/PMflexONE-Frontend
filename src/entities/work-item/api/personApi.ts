import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import type { Person } from '../types/workItem.types'

// ─── GQL document ─────────────────────────────────────────────────────────────

/** GraphQL query to load all persons that have an associated user account. */
export const GET_PERSONS = /* GraphQL */ `
  query GetPersons($filter: PersonFilter) {
    persons(filter: $filter) {
      id
      firstName
      lastName
      mail
    }
  }
`

// ─── Response schema ──────────────────────────────────────────────────────────

const personSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  mail: z.string().nullable().optional(),
})

const getPersonsResponseSchema = z.object({
  persons: z.array(personSchema),
})

// ─── API function ─────────────────────────────────────────────────────────────

/**
 * Fetches all persons with an associated user account.
 *
 * @returns List of persons available for assignment.
 */
export async function getPersons(): Promise<Person[]> {
  const raw = await graphqlClient.request(GET_PERSONS, { filter: { hasUser: true } })
  return getPersonsResponseSchema.parse(raw).persons
}
