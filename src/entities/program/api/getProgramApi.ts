import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

const QUERY = /* GraphQL */ `
  query GetProgramSummary($id: ID!) {
    program(id: $id) {
      id
      name
    }
  }
`

/** Zod schema for a program summary (id + name). */
export const programSummarySchema = z.object({ id: z.string(), name: z.string() })
const responseSchema = z.object({ program: programSummarySchema.nullable() })
/** TypeScript type inferred from {@link programSummarySchema}. */
export type ProgramSummary = z.infer<typeof programSummarySchema>

/**
 * Fetches a single program summary by ID.
 *
 * @param id - The program ID to fetch.
 * @returns The program summary, or `null` if not found.
 */
export async function getProgram(id: string): Promise<ProgramSummary | null> {
  const raw = await graphqlClient.request(QUERY, { id })
  return responseSchema.parse(raw).program
}
