import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  GET_PORTFOLIO_PROGRAMS,
  PORTFOLIO_PROGRAMS_QUERY_KEY,
  portfolioProgramsResponseSchema,
} from '../api/programsApi'

/**
 * Query hook that fetches all programs belonging to a specific portfolio.
 *
 * The query is disabled (no network request is made) when `portfolioId` is
 * `undefined` or empty, allowing parent components to defer loading until
 * the user explicitly requests the data.
 *
 * @param portfolioId - ID of the portfolio whose programs to fetch.
 *   Pass `undefined` to keep the query disabled.
 * @returns A TanStack Query result containing the array of program list items
 *   for the given portfolio.
 */
export function usePortfolioPrograms(portfolioId: string | undefined) {
  return useQuery({
    queryKey: PORTFOLIO_PROGRAMS_QUERY_KEY(portfolioId ?? ''),
    enabled: !!portfolioId,
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_PORTFOLIO_PROGRAMS, { id: portfolioId })
      const parsed = portfolioProgramsResponseSchema.parse(raw)
      return parsed.portfolio.programs.map((edge) => edge.item)
    },
    staleTime: 0,
  })
}
