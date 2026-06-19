import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  projectMemberQueryKeys,
  updateMemberAssignment,
  type UpdateMemberAssignmentInput,
} from '@/entities/project-member'
import { showError } from '@/shared/components'

/**
 * Mutation hook that updates an existing member assignment and invalidates the member list on success.
 * Shows a generic error toast on failure.
 *
 * @param objectId - The scope object ID whose member list is invalidated after update.
 * @returns Mutation object with mutateAsync, isPending, and error.
 */
export function useUpdateMember(objectId: string) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateMemberAssignmentInput) => updateMemberAssignment(input),
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
