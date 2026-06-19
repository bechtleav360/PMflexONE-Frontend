import { create } from 'zustand'

/**
 * Zustand state shape for the Create Requirement dialog.
 *
 * @property isOpen - Whether the dialog is currently visible.
 * @property parentId - Optional parent requirement ID when creating a child.
 * @property open - Opens the dialog, optionally with a parent requirement ID.
 * @property close - Closes the dialog and resets state.
 */
interface CreateRequirementDialogState {
  isOpen: boolean
  parentId: string | null
  open: (parentId?: string | null) => void
  close: () => void
}

/**
 * Global store for the Create Requirement dialog.
 *
 * Call `open()` to create a root requirement, or `open(parentId)` to create a child.
 */
export const useCreateRequirementDialogStore = create<CreateRequirementDialogState>((set) => ({
  isOpen: false,
  parentId: null,
  open: (parentId = null) => set({ isOpen: true, parentId }),
  close: () => set({ isOpen: false, parentId: null }),
}))
