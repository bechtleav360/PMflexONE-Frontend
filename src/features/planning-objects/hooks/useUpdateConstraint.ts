import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  CONSTRAINT_QUERY_KEY,
  CONSTRAINTS_QUERY_KEY,
  UPDATE_PROJECT_CONSTRAINT,
  updateConstraintResponseSchema,
} from '../api/constraintApi'
import type { UpdateConstraintInput } from '../types/constraint.types'

/**
 * Mutation hook for updating an existing project constraint.
 *
 * When `input.timeConstrained` is `false`, `input.dueDate` is forced to `null`
 * so the server clears any previously stored deadline.
 *
 * Invalidates both the scoped constraints list and the individual constraint
 * cache entry on success.
 *
 * @param scopeType - Scope context (always `'Project'` for constraints).
 * @param scopeId - The ID of the project.
 * @returns A TanStack Query mutation object.
 */
export function useUpdateConstraint(scopeType: 'Project', scopeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateConstraintInput }) => {
      // Backend UpdateProjectConstraintInput: id inside input, no ownerId field
      const raw = await graphqlClient.request(UPDATE_PROJECT_CONSTRAINT, {
        input: {
          id,
          version: input.version,
          name: input.name,
          description: input.description,
          timeConstrained: input.timeConstrained,
          dueDate: input.timeConstrained === false ? null : input.dueDate,
          otherInformation: input.otherInformation,
        },
      })
      return updateConstraintResponseSchema.parse(raw).updateProjectConstraint
    },
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: CONSTRAINTS_QUERY_KEY(scopeType, scopeId) })
      void queryClient.invalidateQueries({ queryKey: CONSTRAINT_QUERY_KEY(id) })
    },
  })
}
