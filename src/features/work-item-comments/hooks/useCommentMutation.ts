import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { COMMENTS_QUERY_KEY } from '@/entities/work-item'

/**
 * Shared hook that wires up the COMMENTS_QUERY_KEY invalidation and error-toast
 * pattern common to all comment mutations.  Each concrete hook supplies its own
 * `mutationFn` and the i18n error key to show on failure.
 *
 * @param workItemId    - The work item whose comments cache should be invalidated.
 * @param mutationFn    - The async function that performs the actual API call.
 * @param errorKey      - The i18n translation key used in the error toast.
 * @param errorFallback - Fallback message shown when the key is missing.
 * @returns TanStack Mutation result.
 */
export function useCommentMutation<TVariables>(
  workItemId: string,
  mutationFn: (variables: TVariables) => Promise<unknown>,
  errorKey: string,
  errorFallback: string,
) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: COMMENTS_QUERY_KEY(workItemId) })
    },
    onError: () => {
      toast.error(t(errorKey, errorFallback))
    },
  })
}
