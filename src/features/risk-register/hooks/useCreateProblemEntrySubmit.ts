import { useCreateProblemEntryDialogStore } from '../store/useCreateProblemEntryDialogStore'
import type { ScopeType } from '../types/scopeType'
import type { ProblemEntryFormValues } from '../utils/problemEntrySchema'
import { useCreateProblemEntry } from './useCreateProblemEntry'
import { useEntrySubmit } from './useEntrySubmit'

/**
 * Encapsulates the submit handler and dialog close action for the create problem entry form.
 *
 * @param scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns The async submit handler, pending state, and dialog close function.
 */
export function useCreateProblemEntrySubmit(scopeType: ScopeType, scopeId: string) {
  const { mutateAsync, isPending } = useCreateProblemEntry(scopeType, scopeId)
  const close = useCreateProblemEntryDialogStore((s) => s.close)

  return useEntrySubmit({
    mutateAsync,
    isPending,
    close,
    successKey: 'pages.problemManagement.createProblemEntry.toast.success',
    errorKey: 'pages.problemManagement.createProblemEntry.toast.error',
    buildInput: (values: ProblemEntryFormValues) => ({
      name: values.name,
      pestelCategory: values.pestelCategory,
      description: values.description || undefined,
      status: values.status,
      identificationDate: values.identificationDate,
      impact: values.impact ?? undefined,
      ownerId: values.ownerId || undefined,
      reporterId: values.reporterId || undefined,
    }),
  })
}
