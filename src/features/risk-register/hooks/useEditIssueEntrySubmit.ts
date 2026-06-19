import { useEditIssueEntryDialogStore } from '../store/useEditIssueEntryDialogStore'
import type { IssueEntry } from '../types/issueEntry.types'
import type { ScopeType } from '../types/scopeType'
import type { IssueEntryFormValues } from '../utils/issueEntrySchema'
import { useEntrySubmit } from './useEntrySubmit'
import { useUpdateIssueEntry } from './useUpdateIssueEntry'

interface UseEditIssueEntrySubmitOptions {
  entry: IssueEntry
  scopeType: ScopeType
  scopeId: string
}

/**
 * Encapsulates the submit handler and dialog close action for the edit issue entry form.
 *
 * @param options - Options.
 * @param options.entry - The issue entry being edited.
 * @param options.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param options.scopeId - The ID of the scoped entity.
 * @returns The async submit handler, pending state, and dialog close function.
 */
export function useEditIssueEntrySubmit({
  entry,
  scopeType,
  scopeId,
}: UseEditIssueEntrySubmitOptions) {
  const { mutateAsync, isPending } = useUpdateIssueEntry(scopeType, scopeId)
  const close = useEditIssueEntryDialogStore((s) => s.close)

  return useEntrySubmit({
    mutateAsync: (input) => mutateAsync({ id: entry.id, input }),
    isPending,
    close,
    successKey: 'pages.issueManagement.editIssueEntry.toast.success',
    errorKey: 'pages.issueManagement.editIssueEntry.toast.error',
    buildInput: (values: IssueEntryFormValues) => ({
      version: entry.version,
      name: values.name,
      pestelCategory: values.pestelCategory,
      description: values.description || undefined,
      status: values.status,
      identificationDate: values.identificationDate,
      urgency: values.urgency ?? undefined,
      impact: values.impact ?? undefined,
      ownerId: values.ownerId || undefined,
      reporterId: values.reporterId || undefined,
    }),
  })
}
