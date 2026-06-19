import { useCreateIssueEntryDialogStore } from '../store/useCreateIssueEntryDialogStore'
import type { ScopeType } from '../types/scopeType'
import type { IssueEntryFormValues } from '../utils/issueEntrySchema'
import { useCreateIssueEntry } from './useCreateIssueEntry'
import { useEntrySubmit } from './useEntrySubmit'

/**
 * Encapsulates the submit handler and dialog close action for the create issue entry form.
 *
 * @param scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns The async submit handler, pending state, and dialog close function.
 */
export function useCreateIssueEntrySubmit(scopeType: ScopeType, scopeId: string) {
  const { mutateAsync, isPending } = useCreateIssueEntry(scopeType, scopeId)
  const close = useCreateIssueEntryDialogStore((s) => s.close)

  return useEntrySubmit({
    mutateAsync,
    isPending,
    close,
    successKey: 'pages.issueManagement.createIssueEntry.toast.success',
    errorKey: 'pages.issueManagement.createIssueEntry.toast.error',
    buildInput: (values: IssueEntryFormValues) => ({
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
