import { useCreateRiskEntryDialogStore } from '../store/useCreateRiskEntryDialogStore'
import type { ScopeType } from '../types/scopeType'
import type { RiskEntryFormValues } from '../utils/riskEntrySchema'
import { useCreateRiskEntry } from './useCreateRiskEntry'
import { useEntrySubmit } from './useEntrySubmit'

/**
 * Encapsulates the submit handler and dialog close action for the create risk entry form.
 *
 * @param scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns The async submit handler, pending state, and dialog close function.
 */
export function useCreateRiskEntrySubmit(scopeType: ScopeType, scopeId: string) {
  const { mutateAsync, isPending } = useCreateRiskEntry(scopeType, scopeId)
  const close = useCreateRiskEntryDialogStore((s) => s.close)

  return useEntrySubmit({
    mutateAsync,
    isPending,
    close,
    successKey: 'pages.riskManagement.createRiskEntry.toast.success',
    errorKey: 'pages.riskManagement.createRiskEntry.toast.error',
    buildInput: (values: RiskEntryFormValues) => ({
      type: values.type,
      name: values.name,
      pestelCategory: values.pestelCategory,
      description: values.description || undefined,
      status: values.status,
      identificationDate: values.identificationDate,
      probability: values.probability ?? undefined,
      impact: values.impact ?? undefined,
      ownerId: values.ownerId || undefined,
      reporterId: values.reporterId || undefined,
    }),
  })
}
