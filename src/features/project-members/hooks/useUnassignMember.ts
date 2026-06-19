import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { deleteMemberAssignment, projectMemberQueryKeys } from '@/entities/project-member'
import { showError } from '@/shared/components'

/**
 * Mutation hook that deletes a member assignment and invalidates the member list on success.
 * Shows a generic error toast on failure.
 *
 * @param objectId - The scope object ID whose member list is invalidated after deletion.
 * @returns Mutation object with mutateAsync, isPending, and error.
 */
export function useUnassignMember(objectId: string) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assignmentId: string) => deleteMemberAssignment(assignmentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: projectMemberQueryKeys.memberAssignments(objectId),
      })
    },
    onError: () => {
      showError(t('pages.projectMembers.errors.unknown'))
    },
  })
}
