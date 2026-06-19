import { useEditRiskEntryDialogStore } from '../store/useEditRiskEntryDialogStore'
import type { RiskEntry } from '../types/riskEntry.types'
import type { ScopeType } from '../types/scopeType'
import type { RiskEntryFormValues } from '../utils/riskEntrySchema'
import { useEntrySubmit } from './useEntrySubmit'
import { useUpdateRiskEntry } from './useUpdateRiskEntry'

interface UseEditRiskEntrySubmitOptions {
  entry: RiskEntry
  scopeType: ScopeType
  scopeId: string
}

/**
 * Encapsulates the submit handler and dialog close action for the edit risk entry form.
 *
 * @param options - Options.
 * @param options.entry - The risk entry being edited.
 * @param options.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param options.scopeId - The ID of the scoped entity.
 * @returns The async submit handler, pending state, and dialog close function.
 */
export function useEditRiskEntrySubmit({
  entry,
  scopeType,
  scopeId,
}: UseEditRiskEntrySubmitOptions) {
  const { mutateAsync, isPending } = useUpdateRiskEntry(scopeType, scopeId)
  const close = useEditRiskEntryDialogStore((s) => s.close)

  return useEntrySubmit({
    mutateAsync: (input) => mutateAsync({ id: entry.id, input }),
    isPending,
    close,
    successKey: 'pages.riskManagement.editRiskEntry.toast.success',
    errorKey: 'pages.riskManagement.editRiskEntry.toast.error',
    buildInput: (values: RiskEntryFormValues) => ({
      version: entry.version,
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
