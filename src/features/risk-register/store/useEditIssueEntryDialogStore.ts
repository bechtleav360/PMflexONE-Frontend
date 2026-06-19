import { create } from 'zustand'

/**
 * Zustand state shape for the Edit Issue Entry dialog.
 *
 * @property isOpen - Whether the dialog is currently visible.
 * @property entryId - The ID of the entry being edited, or `null` when closed.
 * @property open - Opens the dialog with the specified entry ID.
 * @property close - Closes the dialog and clears the selected entry.
 */
interface EditIssueEntryDialogState {
  isOpen: boolean
  entryId: string | null
  open: (id: string) => void
  close: () => void
}

/**
 * Global store for the Edit Issue Entry dialog.
 *
 * Call `open(id)` to show the dialog for a specific entry and `close()` to hide it.
 */
export const useEditIssueEntryDialogStore = create<EditIssueEntryDialogState>((set) => ({
  isOpen: false,
  entryId: null,
  open: (id) => set({ isOpen: true, entryId: id }),
  close: () => set({ isOpen: false, entryId: null }),
}))
