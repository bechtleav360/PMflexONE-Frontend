import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'
import { PORTFOLIOS_QUERY_KEY } from '@/shared/lib/queryKeys'

import {
  PROGRAM_QUERY_KEY,
  programDetailSchema,
  PROGRAMS_QUERY_KEY,
  UPDATE_PROGRAM,
} from '../api/programsApi'
import type { UpdateProgramInput } from '../types/program.types'

/** Variables accepted by the `updateProgram` mutation. */
interface UpdateProgramVariables {
  /** The ID of the program to update. */
  id: string
  /** Fields to update on the program. Must include the current `version` for optimistic locking. */
  input: UpdateProgramInput
}

const responseSchema = z.object({ updateProgram: programDetailSchema })

/**
 * Mutation hook for updating an existing program.
 *
 * On success, invalidates the program detail, programs list, and portfolios
 * caches so all views stay consistent.
 *
 * @returns A TanStack Query mutation object. Call `mutateAsync` with
 *   {@link UpdateProgramVariables} to execute the mutation.
 */
export function useUpdateProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: UpdateProgramVariables) => {
      const raw = await graphqlClient.request(UPDATE_PROGRAM, { id, input })
      return responseSchema.parse(raw).updateProgram
    },
    onSuccess: async (_data, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: PROGRAMS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: PROGRAM_QUERY_KEY(id) }),
        queryClient.invalidateQueries({ queryKey: PORTFOLIOS_QUERY_KEY }),
      ])
    },
  })
}
