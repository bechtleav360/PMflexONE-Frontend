import { create } from 'zustand'

import type { Program } from '../types/program.types'

/**
 * Zustand state shape for the Edit Program dialog.
 *
 * @property isOpen - Whether the dialog is currently visible.
 * @property program - The program selected for editing, or `null` when closed.
 * @property open - Opens the dialog with the given program pre-loaded.
 * @property close - Closes the dialog and clears the selected program.
 */
interface EditProgramDialogState {
  isOpen: boolean
  program: Program | null
  open: (program: Program) => void
  close: () => void
}

/**
 * Global store for the Edit Program dialog.
 *
 * Call `open(program)` to show the dialog for a specific program and
 * `close()` to dismiss it.
 */
export const useEditProgramDialogStore = create<EditProgramDialogState>((set) => ({
  isOpen: false,
  program: null,
  open: (program) => set({ isOpen: true, program }),
  close: () => set({ isOpen: false, program: null }),
}))
