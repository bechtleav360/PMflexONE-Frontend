import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'
import { PORTFOLIOS_QUERY_KEY } from '@/shared/lib/queryKeys'

import { CREATE_PROGRAM, programListItemSchema, PROGRAMS_QUERY_KEY } from '../api/programsApi'
import type { CreateProgramInput } from '../types/program.types'

const responseSchema = z.object({ createProgram: programListItemSchema })

/**
 * Mutation hook for creating a new program.
 *
 * On success, invalidates the programs list cache and the portfolios cache
 * so both views reflect the newly created program immediately.
 *
 * @returns A TanStack Query mutation object. Call `mutateAsync` with a
 *   {@link CreateProgramInput} to execute the mutation.
 */
export function useCreateProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateProgramInput) => {
      const raw = await graphqlClient.request(CREATE_PROGRAM, { input })
      return responseSchema.parse(raw).createProgram
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: PROGRAMS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: PORTFOLIOS_QUERY_KEY }),
      ])
    },
  })
}
