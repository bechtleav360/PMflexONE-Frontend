import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { CREATE_PORTFOLIO, portfolioResponseSchema } from '../api/portfoliosApi'
import type { CreatePortfolioInput } from '../types/portfolio.types'
import { PORTFOLIOS_QUERY_KEY } from './usePortfolios'

const responseSchema = z.object({ createPortfolio: portfolioResponseSchema })

/**
 * TanStack Query mutation hook for creating a new portfolio.
 * Response is validated with Zod at the API boundary.
 * On success, invalidates the portfolios query so the list refreshes automatically.
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and `error`.
 */
export function useCreatePortfolio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreatePortfolioInput) => {
      const raw = await graphqlClient.request(CREATE_PORTFOLIO, { input })
      return responseSchema.parse(raw).createPortfolio
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PORTFOLIOS_QUERY_KEY })
    },
  })
}
