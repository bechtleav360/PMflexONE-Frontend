import { create } from 'zustand'

/**
 * Zustand state shape for the Create Issue Entry dialog.
 *
 * @property isOpen - Whether the dialog is currently visible.
 * @property open - Opens the dialog.
 * @property close - Closes the dialog.
 */
interface CreateIssueEntryDialogState {
  isOpen: boolean
  open: () => void
  close: () => void
}

/**
 * Global store for the Create Issue Entry dialog.
 *
 * Call `open()` to show the dialog and `close()` to hide it.
 */
export const useCreateIssueEntryDialogStore = create<CreateIssueEntryDialogState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
