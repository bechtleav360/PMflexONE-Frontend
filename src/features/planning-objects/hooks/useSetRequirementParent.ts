import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  REQUIREMENTS_QUERY_KEY,
  SET_REQUIREMENT_PARENT,
  setRequirementParentResponseSchema,
} from '../api/requirementApi'
import type { PlanningObjectScopeType } from '../types/shared.types'

/**
 * Mutation hook for setting the parent of a requirement (tree hierarchy).
 *
 * Detects cycle errors from the backend and surfaces them as a toast.
 *
 * @param scopeType - Scope context (`'Project'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object.
 */
export function useSetRequirementParent(scopeType: PlanningObjectScopeType, scopeId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async ({
      id,
      version,
      parentId,
    }: {
      id: string
      version: number
      parentId: string
    }) => {
      const raw = await graphqlClient.request(SET_REQUIREMENT_PARENT, {
        requirementId: id,
        parentId,
        version,
      })
      return setRequirementParentResponseSchema.parse(raw).setRequirementParent
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: REQUIREMENTS_QUERY_KEY(scopeType, scopeId) })
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error)
      if (/cycle|circular/i.test(message)) {
        toast.error(t('features.planningObjects.errors.cycleDetected'))
      }
    },
  })
}
