import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'
import { PORTFOLIOS_QUERY_KEY } from '@/shared/lib/queryKeys'

import { GET_PORTFOLIOS, portfolioResponseSchema } from '../api/portfoliosApi'
import type { PortfolioFilter } from '../types/portfolio.types'

export { PORTFOLIOS_QUERY_KEY }
export type { PortfolioFilter }

const responseSchema = z.object({ portfolios: z.array(portfolioResponseSchema) })

/**
 * Fetches all portfolios from the GraphQL API, with optional server-side filtering.
 *
 * When `filter` is provided the query key includes the filter object so each
 * unique filter combination gets its own cache entry and triggers a refetch.
 * The `filter` variable is omitted from the request when undefined.
 *
 * @param root0 - Hook options.
 * @param root0.enabled - When false the query is skipped (default: true).
 * @param root0.filter - Optional filter forwarded to the GraphQL `PortfolioFilter` argument.
 * @returns TanStack Query result containing the portfolios array, loading, and error state.
 */
export function usePortfolios({
  enabled = true,
  filter,
}: { enabled?: boolean; filter?: PortfolioFilter } = {}) {
  const hasFilter = filter !== undefined
  return useQuery({
    queryKey: hasFilter ? [...PORTFOLIOS_QUERY_KEY, filter] : PORTFOLIOS_QUERY_KEY,
    queryFn: async () => {
      const raw = await graphqlClient.request(
        GET_PORTFOLIOS,
        (hasFilter ? { filter } : {}) as { filter?: PortfolioFilter },
      )
      return responseSchema.parse(raw).portfolios
    },
    enabled,
    staleTime: 0,
  })
}
