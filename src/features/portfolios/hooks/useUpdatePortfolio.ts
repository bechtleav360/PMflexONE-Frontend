import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { portfolioResponseSchema, UPDATE_PORTFOLIO } from '../api/portfoliosApi'
import type { UpdatePortfolioInput } from '../types/portfolio.types'
import { PORTFOLIOS_QUERY_KEY } from './usePortfolios'

interface UpdatePortfolioVariables {
  id: string
  input: UpdatePortfolioInput
}

const responseSchema = z.object({ updatePortfolio: portfolioResponseSchema })

/**
 * TanStack Query mutation hook for updating an existing portfolio.
 * Response is validated with Zod at the API boundary.
 * On success, invalidates the portfolios query so the list refreshes automatically.
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and `error`.
 */
export function useUpdatePortfolio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: UpdatePortfolioVariables) => {
      const raw = await graphqlClient.request(UPDATE_PORTFOLIO, { id, input })
      return responseSchema.parse(raw).updatePortfolio
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PORTFOLIOS_QUERY_KEY })
    },
  })
}
