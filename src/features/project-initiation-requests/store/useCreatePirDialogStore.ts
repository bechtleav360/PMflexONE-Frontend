import { create } from 'zustand'

interface CreatePirDialogState {
  /** Whether the create-PIR dialog is currently open. */
  isOpen: boolean
  /** Opens the create-PIR dialog. */
  open: () => void
  /** Closes the create-PIR dialog. */
  close: () => void
}

/**
 * Zustand store controlling the visibility of the create-initiation-request dialog.
 * Follows the same pattern as `useCreatePortfolioDialogStore`.
 *
 * @returns The dialog open state and open/close actions.
 */
export const useCreatePirDialogStore = create<CreatePirDialogState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
