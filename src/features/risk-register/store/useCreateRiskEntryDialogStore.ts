import { create } from 'zustand'

/**
 * Zustand state shape for the Create Risk Entry dialog.
 *
 * @property isOpen - Whether the dialog is currently visible.
 * @property open - Opens the dialog.
 * @property close - Closes the dialog.
 */
interface CreateRiskEntryDialogState {
  isOpen: boolean
  open: () => void
  close: () => void
}

/**
 * Global store for the Create Risk Entry dialog.
 *
 * Call `open()` to show the dialog and `close()` to hide it.
 */
export const useCreateRiskEntryDialogStore = create<CreateRiskEntryDialogState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
