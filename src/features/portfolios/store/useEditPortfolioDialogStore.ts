import { create } from 'zustand'

import type { Portfolio } from '../types/portfolio.types'

interface EditPortfolioDialogState {
  /** Whether the edit-portfolio dialog is open. */
  isOpen: boolean
  /** The portfolio currently being edited, or null when the dialog is closed. */
  portfolio: Portfolio | null
  /** Opens the edit-portfolio dialog with the given portfolio pre-filled. */
  open: (portfolio: Portfolio) => void
  /** Closes the edit-portfolio dialog and clears the selected portfolio. */
  close: () => void
}

/**
 * Zustand store controlling the visibility and selected portfolio of the edit-portfolio dialog.
 * @returns The dialog open state, selected portfolio, and open/close actions.
 */
export const useEditPortfolioDialogStore = create<EditPortfolioDialogState>((set) => ({
  isOpen: false,
  portfolio: null,
  open: (portfolio) => set({ isOpen: true, portfolio }),
  close: () => set({ isOpen: false, portfolio: null }),
}))
