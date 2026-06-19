import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { ESCALATE_ENTRY, escalateEntryResponseSchema } from '../api/escalatedEntryApi'
import type { EscalateEntryInput } from '../types/escalatedEntry.types'

/**
 * Escalates a source entry to its direct parent scope.
 *
 * @returns TanStack Query mutation for the createEscalatedEntry operation.
 */
export function useCreateEscalatedEntry() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async (input: EscalateEntryInput) => {
      const raw = await graphqlClient.request(ESCALATE_ENTRY, { input })
      return escalateEntryResponseSchema.parse(raw).createEscalatedEntry
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['escalatedEntries'] })
      const sourceKey = sourceEntryQueryKey(data.sourceEntryType)
      queryClient.invalidateQueries({ queryKey: [sourceKey] })
      toast.success(t('features.escalatedEntries.toasts.escalateSuccess'))
    },
    onError: () => {
      toast.error(t('features.escalatedEntries.toasts.escalateError'))
    },
  })
}

function sourceEntryQueryKey(sourceEntryType: string): string {
  switch (sourceEntryType) {
    case 'RISK':
    case 'OPPORTUNITY':
      return 'riskEntries'
    case 'PROBLEM':
      return 'problemEntries'
    case 'ISSUE':
      return 'issueEntries'
    default:
      throw new Error(`Unhandled sourceEntryType: ${sourceEntryType}`)
  }
}
