import { useQuery } from '@tanstack/react-query'

import { listPortfolios } from '../api/listPortfoliosApi'

/**
 * Returns the stable TanStack Query key for the portfolio list.
 *
 * @returns Stable query key tuple.
 */
export const getPortfoliosQueryKey = () => ['entity', 'portfolio-list'] as const

/**
 * Fetches all portfolio summaries (id + name).
 *
 * @param root0 - Hook options.
 * @param root0.enabled - When false the query is skipped (default: true).
 * @returns TanStack Query result containing an array of {@link PortfolioSummary}.
 */
export function useGetPortfolios({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: getPortfoliosQueryKey(),
    queryFn: listPortfolios,
    staleTime: 5 * 60 * 1000,
    enabled,
  })
}
