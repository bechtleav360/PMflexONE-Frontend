import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ClientError } from 'graphql-request'
import { useTranslation } from 'react-i18next'

import {
  createMemberAssignment,
  projectMemberQueryKeys,
  type CreateMemberAssignmentInput,
} from '@/entities/project-member'
import { showError } from '@/shared/components'

function isConflictError(error: unknown): boolean {
  if (!(error instanceof ClientError)) return false
  return (error.response.errors ?? []).some(
    (e) => (e.extensions?.['code'] as string | undefined) === 'CONFLICT',
  )
}

/**
 * Mutation hook that creates a member assignment and invalidates the member list on success.
 * Shows a conflict or generic error toast on failure.
 *
 * @param objectId - The scope object ID whose member list is invalidated after assignment.
 * @returns Mutation object with mutateAsync, isPending, and error.
 */
export function useAssignMember(objectId: string) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateMemberAssignmentInput) => createMemberAssignment(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: projectMemberQueryKeys.memberAssignments(objectId),
      })
    },
    onError: (error) => {
      if (isConflictError(error)) {
        showError(t('pages.projectMembers.errors.conflict'))
      } else {
        showError(t('pages.projectMembers.errors.unknown'))
      }
    },
  })
}
