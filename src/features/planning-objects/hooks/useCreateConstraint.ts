import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  CONSTRAINTS_QUERY_KEY,
  CREATE_PROJECT_CONSTRAINT,
  createConstraintResponseSchema,
} from '../api/constraintApi'
import type { CreateConstraintInput } from '../types/constraint.types'

/**
 * Mutation hook for creating a new project constraint within a given scope.
 *
 * @param scopeType - Scope context (always `'Project'` for constraints).
 * @param scopeId - The ID of the project.
 * @returns A TanStack Query mutation object.
 */
export function useCreateConstraint(scopeType: 'Project', scopeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: Omit<CreateConstraintInput, 'scopeType' | 'scopeId'>) => {
      const raw = await graphqlClient.request(CREATE_PROJECT_CONSTRAINT, {
        input: {
          name: input.name,
          description: input.description,
          timeConstrained: input.timeConstrained,
          dueDate: input.dueDate,
          otherInformation: input.otherInformation,
          scopeType,
          scopeId,
        },
      })
      return createConstraintResponseSchema.parse(raw).createProjectConstraint
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CONSTRAINTS_QUERY_KEY(scopeType, scopeId) })
    },
  })
}
