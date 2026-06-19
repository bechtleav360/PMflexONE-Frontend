import { create } from 'zustand'

/**
 * Zustand state shape for the Edit Assumption dialog.
 *
 * @property isOpen - Whether the dialog is currently visible.
 * @property assumptionId - The ID of the assumption being edited, or `null` when closed.
 * @property open - Opens the dialog with the specified assumption ID.
 * @property close - Closes the dialog and clears the selected assumption.
 */
interface EditAssumptionDialogState {
  isOpen: boolean
  assumptionId: string | null
  mode: 'view' | 'edit'
  open: (assumptionId: string, mode?: 'view' | 'edit') => void
  close: () => void
}

/**
 * Global store for the Edit Assumption dialog.
 *
 * Call `open(assumptionId)` to show the dialog for a specific assumption and `close()` to hide it.
 * Pass `mode: 'view'` to open in read-only mode.
 */
export const useEditAssumptionDialogStore = create<EditAssumptionDialogState>((set) => ({
  isOpen: false,
  assumptionId: null,
  mode: 'edit',
  open: (assumptionId, mode = 'edit') => set({ isOpen: true, assumptionId, mode }),
  close: () => set({ isOpen: false, assumptionId: null, mode: 'edit' }),
}))
