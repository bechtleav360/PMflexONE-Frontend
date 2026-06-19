import { useEditProblemEntryDialogStore } from '../store/useEditProblemEntryDialogStore'
import type { ProblemEntry } from '../types/problemEntry.types'
import type { ScopeType } from '../types/scopeType'
import type { ProblemEntryFormValues } from '../utils/problemEntrySchema'
import { useEntrySubmit } from './useEntrySubmit'
import { useUpdateProblemEntry } from './useUpdateProblemEntry'

interface UseEditProblemEntrySubmitOptions {
  entry: ProblemEntry
  scopeType: ScopeType
  scopeId: string
}

/**
 * Encapsulates the submit handler and dialog close action for the edit problem entry form.
 *
 * @param options - Options.
 * @param options.entry - The problem entry being edited.
 * @param options.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param options.scopeId - The ID of the scoped entity.
 * @returns The async submit handler, pending state, and dialog close function.
 */
export function useEditProblemEntrySubmit({
  entry,
  scopeType,
  scopeId,
}: UseEditProblemEntrySubmitOptions) {
  const { mutateAsync, isPending } = useUpdateProblemEntry(scopeType, scopeId)
  const close = useEditProblemEntryDialogStore((s) => s.close)

  return useEntrySubmit({
    mutateAsync: (input) => mutateAsync({ id: entry.id, input }),
    isPending,
    close,
    successKey: 'pages.problemManagement.editProblemEntry.toast.success',
    errorKey: 'pages.problemManagement.editProblemEntry.toast.error',
    buildInput: (values: ProblemEntryFormValues) => ({
      version: entry.version,
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
