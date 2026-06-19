import { create } from 'zustand'

/**
 * Zustand state shape for the Edit Constraint dialog.
 *
 * @property isOpen - Whether the dialog is currently visible.
 * @property constraintId - The ID of the constraint being edited, or `null` when closed.
 * @property open - Opens the dialog with the specified constraint ID.
 * @property close - Closes the dialog and clears the selected constraint.
 */
interface EditConstraintDialogState {
  isOpen: boolean
  constraintId: string | null
  mode: 'view' | 'edit'
  open: (constraintId: string, mode?: 'view' | 'edit') => void
  close: () => void
}

/**
 * Global store for the Edit Constraint dialog.
 *
 * Call `open(constraintId)` to show the dialog for a specific constraint and `close()` to hide it.
 * Pass `mode: 'view'` to open in read-only mode.
 */
export const useEditConstraintDialogStore = create<EditConstraintDialogState>((set) => ({
  isOpen: false,
  constraintId: null,
  mode: 'edit',
  open: (constraintId, mode = 'edit') => set({ isOpen: true, constraintId, mode }),
  close: () => set({ isOpen: false, constraintId: null, mode: 'edit' }),
}))
