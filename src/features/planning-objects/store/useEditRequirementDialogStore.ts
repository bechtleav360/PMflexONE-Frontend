import { create } from 'zustand'

/**
 * Zustand state shape for the Edit Requirement dialog.
 *
 * @property isOpen - Whether the dialog is currently visible.
 * @property requirementId - The ID of the requirement being edited, or `null` when closed.
 * @property open - Opens the dialog with the specified requirement ID.
 * @property close - Closes the dialog and clears the selected requirement.
 */
interface EditRequirementDialogState {
  isOpen: boolean
  requirementId: string | null
  mode: 'view' | 'edit'
  open: (requirementId: string, mode?: 'view' | 'edit') => void
  close: () => void
}

/**
 * Global store for the Edit Requirement dialog.
 *
 * Call `open(requirementId)` to show the dialog for a specific requirement and `close()` to hide it.
 * Pass `mode: 'view'` to open in read-only mode.
 */
export const useEditRequirementDialogStore = create<EditRequirementDialogState>((set) => ({
  isOpen: false,
  requirementId: null,
  mode: 'edit',
  open: (requirementId, mode = 'edit') => set({ isOpen: true, requirementId, mode }),
  close: () => set({ isOpen: false, requirementId: null, mode: 'edit' }),
}))
