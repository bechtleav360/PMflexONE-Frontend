import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { DELETE_PORTFOLIO } from '../api/portfoliosApi'
import { PORTFOLIOS_QUERY_KEY } from './usePortfolios'

const responseSchema = z.object({ deletePortfolio: z.boolean() })

/**
 * TanStack Query mutation hook for deleting a portfolio by ID.
 * Response is validated with Zod at the API boundary.
 * On success, invalidates the portfolios query so the list refreshes automatically.
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and `error`.
 */
export function useDeletePortfolio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const raw = await graphqlClient.request(DELETE_PORTFOLIO, { input: { id } })
      return responseSchema.parse(raw).deletePortfolio
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PORTFOLIOS_QUERY_KEY })
    },
  })
}
