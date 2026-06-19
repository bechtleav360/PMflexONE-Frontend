import { create } from 'zustand'

import type { Portfolio } from '../types/portfolio.types'

interface DeletePortfolioDialogState {
  /** Whether the delete-portfolio confirmation dialog is open. */
  isOpen: boolean
  /** The portfolio pending deletion, or null when the dialog is closed. */
  portfolio: Portfolio | null
  /** Opens the delete-portfolio confirmation dialog for the given portfolio. */
  open: (portfolio: Portfolio) => void
  /** Closes the delete-portfolio dialog and clears the selected portfolio. */
  close: () => void
}

/**
 * Zustand store controlling the visibility and selected portfolio of the delete-portfolio dialog.
 * @returns The dialog open state, selected portfolio, and open/close actions.
 */
export const useDeletePortfolioDialogStore = create<DeletePortfolioDialogState>((set) => ({
  isOpen: false,
  portfolio: null,
  open: (portfolio) => set({ isOpen: true, portfolio }),
  close: () => set({ isOpen: false, portfolio: null }),
}))
