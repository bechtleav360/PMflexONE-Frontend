import { create } from 'zustand'

/**
 * Zustand state shape for the Create Program dialog.
 *
 * @property isOpen - Whether the dialog is currently visible.
 * @property defaultPortfolioId - Portfolio to pre-select when the dialog opens,
 *   or `null` when opened without a portfolio context.
 * @property open - Opens the dialog, optionally pre-selecting a portfolio.
 * @property close - Closes the dialog and resets the default portfolio selection.
 */
interface CreateProgramDialogState {
  isOpen: boolean
  defaultPortfolioId: string | null
  open: (portfolioId?: string | null) => void
  close: () => void
}

/**
 * Global store for the Create Program dialog.
 *
 * Call `open(portfolioId?)` to show the dialog (with an optional pre-selected
 * portfolio) and `close()` to hide it.
 */
export const useCreateProgramDialogStore = create<CreateProgramDialogState>((set) => ({
  isOpen: false,
  defaultPortfolioId: null,
  open: (portfolioId) => set({ isOpen: true, defaultPortfolioId: portfolioId ?? null }),
  close: () => set({ isOpen: false, defaultPortfolioId: null }),
}))
