import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  DE_ESCALATE_ENTRY,
  deEscalateEntryResponseSchema,
  ESCALATED_ENTRY_QUERY_KEY,
} from '../api/escalatedEntryApi'
import type { DeEscalateEntryInput } from '../types/escalatedEntry.types'

/**
 * Returns (de-escalates) an escalated entry back to the source level.
 *
 * @returns TanStack Query mutation for the deEscalateEntry operation.
 */
export function useDeEscalateEntry() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async (input: DeEscalateEntryInput) => {
      const raw = await graphqlClient.request(DE_ESCALATE_ENTRY, { input })
      return deEscalateEntryResponseSchema.parse(raw).deEscalateEntry
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ESCALATED_ENTRY_QUERY_KEY(data.id) })
      queryClient.invalidateQueries({ queryKey: ['escalatedEntries'] })
      toast.success(t('features.escalatedEntries.toasts.deEscalateSuccess'))
    },
    onError: () => {
      toast.error(t('features.escalatedEntries.toasts.deEscalateError'))
    },
  })
}
