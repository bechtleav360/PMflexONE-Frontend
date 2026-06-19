import { create } from 'zustand'

/**
 * Zustand state shape for the Create Goal dialog.
 *
 * @property isOpen - Whether the dialog is currently visible.
 * @property parentId - Optional parent goal ID when creating a child goal.
 * @property open - Opens the dialog, optionally with a parent goal ID.
 * @property close - Closes the dialog and resets state.
 */
interface CreateGoalDialogState {
  isOpen: boolean
  parentId: string | null
  open: (parentId?: string | null) => void
  close: () => void
}

/**
 * Global store for the Create Goal dialog.
 *
 * Call `open()` to create a root goal, or `open(parentId)` to create a child.
 */
export const useCreateGoalDialogStore = create<CreateGoalDialogState>((set) => ({
  isOpen: false,
  parentId: null,
  open: (parentId = null) => set({ isOpen: true, parentId }),
  close: () => set({ isOpen: false, parentId: null }),
}))
