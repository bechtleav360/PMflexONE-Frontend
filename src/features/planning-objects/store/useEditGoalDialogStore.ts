import { create } from 'zustand'

/**
 * Zustand state shape for the Edit Goal dialog.
 *
 * @property isOpen - Whether the dialog is currently visible.
 * @property goalId - The ID of the goal being edited, or `null` when closed.
 * @property mode - `'edit'` for full editing, `'view'` for read-only display.
 * @property open - Opens the dialog with the specified goal ID and optional mode.
 * @property close - Closes the dialog and clears the selected goal.
 */
interface EditGoalDialogState {
  isOpen: boolean
  goalId: string | null
  mode: 'edit' | 'view'
  open: (goalId: string, mode?: 'edit' | 'view') => void
  close: () => void
}

/**
 * Global store for the Edit Goal dialog.
 *
 * Call `open(goalId)` to edit, or `open(goalId, 'view')` for read-only mode.
 */
export const useEditGoalDialogStore = create<EditGoalDialogState>((set) => ({
  isOpen: false,
  goalId: null,
  mode: 'edit',
  open: (goalId, mode = 'edit') => set({ isOpen: true, goalId, mode }),
  close: () => set({ isOpen: false, goalId: null, mode: 'edit' }),
}))
