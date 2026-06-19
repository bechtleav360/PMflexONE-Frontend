import { create } from 'zustand'

interface CreatePortfolioDialogState {
  /** Whether the create-portfolio dialog is open. */
  isOpen: boolean
  /** Opens the create-portfolio dialog. */
  open: () => void
  /** Closes the create-portfolio dialog. */
  close: () => void
}

/**
 * Zustand store controlling the visibility of the create-portfolio dialog.
 * @returns The dialog open state and open/close actions.
 */
export const useCreatePortfolioDialogStore = create<CreatePortfolioDialogState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
