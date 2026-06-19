import { graphql, HttpResponse } from 'msw'

import type { Portfolio } from '@/features/portfolios'

/**
 * In-memory portfolio store for MSW dev-mode mocking.
 * Seeded with one example portfolio; updated by CreatePortfolio mutations.
 */
const devPortfolios: Portfolio[] = [
  {
    id: 'portfolio-1',
    version: 0,
    name: 'Digital Transformation 2026',
    startYear: 2026,
    endYear: 2030,
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    // Canonical e2e portfolio (matches backend E2ePortfolioFixtures "Digital Transformation").
    id: 'e2e00000-0000-0000-0000-000000000002',
    version: 0,
    name: 'Digital Transformation',
    startYear: 2025,
    endYear: 2028,
    createdAt: '2026-01-01T00:00:00Z',
  },
]

let nextId = 2

/**
 * Default MSW handler for the `GetPortfolios` query.
 * Returns the in-memory portfolio list (updated by `CreatePortfolio` mutations).
 */
const getPortfoliosHandler = graphql.query('GetPortfolios', () =>
  HttpResponse.json({
    data: { portfolios: devPortfolios },
  }),
)

/**
 * Default MSW handler for the `CreatePortfolio` mutation.
 * Appends the new portfolio to the in-memory store so it shows up in `GetPortfolios`.
 */
const createPortfolioHandler = graphql.mutation('CreatePortfolio', ({ variables }) => {
  const input = (
    variables as {
      input: { name: string; startYear: number | null; endYear: number | null }
    }
  ).input

  const newPortfolio: Portfolio = {
    id: `portfolio-${nextId++}`,
    version: 0,
    name: input.name,
    startYear: input.startYear,
    endYear: input.endYear,
    createdAt: new Date().toISOString(),
  }

  devPortfolios.push(newPortfolio)

  return HttpResponse.json({ data: { createPortfolio: newPortfolio } })
})

/** MSW handlers for all portfolio-related GraphQL operations. */
export const portfolioHandlers = [getPortfoliosHandler, createPortfolioHandler]
