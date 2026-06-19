import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

const QUERY = /* GraphQL */ `
  query ListPortfolioSummaries {
    portfolios {
      id
      name
    }
  }
`

/** Zod schema for a portfolio summary (id + name). */
export const portfolioSummarySchema = z.object({ id: z.string(), name: z.string() })
const responseSchema = z.object({ portfolios: z.array(portfolioSummarySchema) })
/** TypeScript type inferred from {@link portfolioSummarySchema}. */
export type PortfolioSummary = z.infer<typeof portfolioSummarySchema>

/**
 * Lists all portfolio summaries from the GraphQL API.
 *
 * @returns Array of portfolio id/name pairs.
 */
export async function listPortfolios(): Promise<PortfolioSummary[]> {
  const raw = await graphqlClient.request(QUERY)
  return responseSchema.parse(raw).portfolios
}
