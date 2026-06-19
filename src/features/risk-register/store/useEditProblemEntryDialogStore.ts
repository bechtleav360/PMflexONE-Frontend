import { create } from 'zustand'

/**
 * Zustand state shape for the Edit Problem Entry dialog.
 *
 * @property isOpen - Whether the dialog is currently visible.
 * @property entryId - The ID of the entry being edited, or `null` when closed.
 * @property open - Opens the dialog with the specified entry ID.
 * @property close - Closes the dialog and clears the selected entry.
 */
interface EditProblemEntryDialogState {
  isOpen: boolean
  entryId: string | null
  open: (id: string) => void
  close: () => void
}

/**
 * Global store for the Edit Problem Entry dialog.
 *
 * Call `open(id)` to show the dialog for a specific entry and `close()` to hide it.
 */
export const useEditProblemEntryDialogStore = create<EditProblemEntryDialogState>((set) => ({
  isOpen: false,
  entryId: null,
  open: (id) => set({ isOpen: true, entryId: id }),
  close: () => set({ isOpen: false, entryId: null }),
}))
