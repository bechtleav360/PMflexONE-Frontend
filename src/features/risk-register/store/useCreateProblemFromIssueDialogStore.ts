import { create } from 'zustand'

/**
 * Zustand state shape for the "Create problem from issue" confirmation dialog.
 *
 * @property isOpen - Whether the dialog is currently visible.
 * @property sourceIssueId - The ID of the source issue entry, or `null` when closed.
 * @property sourceIssueName - The display name of the source issue entry, or `null` when closed.
 * @property sourceIssueVersion - The optimistic-lock version of the source issue, or `null` when closed.
 * @property open - Opens the dialog with the source issue's ID, name, and version.
 * @property close - Closes the dialog and clears the source issue context.
 */
interface CreateProblemFromIssueDialogState {
  isOpen: boolean
  sourceIssueId: string | null
  sourceIssueName: string | null
  sourceIssueVersion: number | null
  open: (id: string, name: string, version: number) => void
  close: () => void
}

/**
 * Global store for the "Create problem from issue" confirmation dialog.
 *
 * Call `open(id, name, version)` to show the confirmation for a specific issue entry
 * and `close()` to dismiss it.
 */
export const useCreateProblemFromIssueDialogStore = create<CreateProblemFromIssueDialogState>(
  (set) => ({
    isOpen: false,
    sourceIssueId: null,
    sourceIssueName: null,
    sourceIssueVersion: null,
    open: (id, name, version) =>
      set({
        isOpen: true,
        sourceIssueId: id,
        sourceIssueName: name,
        sourceIssueVersion: version,
      }),
    close: () =>
      set({
        isOpen: false,
        sourceIssueId: null,
        sourceIssueName: null,
        sourceIssueVersion: null,
      }),
  }),
)
