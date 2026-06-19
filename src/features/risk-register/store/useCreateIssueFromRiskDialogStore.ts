import { create } from 'zustand'

/**
 * Zustand state shape for the "Create issue from risk" confirmation dialog.
 *
 * @property isOpen - Whether the dialog is currently visible.
 * @property sourceRiskId - The ID of the source risk entry, or `null` when closed.
 * @property sourceRiskName - The display name of the source risk entry, or `null` when closed.
 * @property sourceRiskVersion - The optimistic-lock version of the source risk entry, or `null` when closed.
 * @property open - Opens the dialog with the source risk's ID, name, and version.
 * @property close - Closes the dialog and clears the source risk context.
 */
interface CreateIssueFromRiskDialogState {
  isOpen: boolean
  sourceRiskId: string | null
  sourceRiskName: string | null
  sourceRiskVersion: number | null
  open: (id: string, name: string, version: number) => void
  close: () => void
}

/**
 * Global store for the "Create issue from risk" confirmation dialog.
 *
 * Call `open(id, name, version)` to show the confirmation for a specific risk entry
 * and `close()` to dismiss it.
 */
export const useCreateIssueFromRiskDialogStore = create<CreateIssueFromRiskDialogState>((set) => ({
  isOpen: false,
  sourceRiskId: null,
  sourceRiskName: null,
  sourceRiskVersion: null,
  open: (id, name, version) =>
    set({ isOpen: true, sourceRiskId: id, sourceRiskName: name, sourceRiskVersion: version }),
  close: () =>
    set({ isOpen: false, sourceRiskId: null, sourceRiskName: null, sourceRiskVersion: null }),
}))
