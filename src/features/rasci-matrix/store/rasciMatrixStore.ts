import { create } from 'zustand'

import { createBulkSelectionSlice } from '@/shared/lib/createBulkSelectionSlice'
import type { BulkCell } from '@/shared/lib/createBulkSelectionSlice'

/** Selected cell data for the RASCI override dialog. */
export interface RasciSelectedCell {
  roleId: string
  taskId: string
  roleName: string
  taskName: string
  currentValue: string
  isOverridden: boolean
  templateValue: string | null
}

/** A cell coordinate used for bulk override selection. */
export type RasciBulkCell = BulkCell

/**
 * Zustand state shape for the RASCI matrix object view.
 * Tracks which dialogs are open and which IDs / cells are currently selected.
 */
interface RasciMatrixStore {
  // ─── Selected state ────────────────────────────────────────────────────────
  selectedCell: RasciSelectedCell | null
  selectedColumnRoleId: string | null

  // ─── Dialog open state ─────────────────────────────────────────────────────
  isOverrideDialogOpen: boolean
  isResetColumnDialogOpen: boolean
  isObjectRoleDialogOpen: boolean
  isEditObjectRoleDialogOpen: boolean
  isDeleteObjectRoleDialogOpen: boolean
  isBulkOverrideOpen: boolean

  // ─── Multi-selected cells for bulk override (key: `${roleId}:${taskId}`) ───
  bulkSelectedCells: Map<string, RasciBulkCell>

  // ─── Bulk selection mode (accessible toggle, no modifier key required) ──────
  isBulkMode: boolean

  // ─── Label shown in the bulk dialog when opened via task-group button ────────
  bulkContextLabel: string | null

  // ─── Actions ───────────────────────────────────────────────────────────────
  openOverrideDialog: (cell: {
    roleId: string
    taskId: string
    roleName: string
    taskName: string
    currentValue: string
    isOverridden: boolean
    templateValue: string | null
  }) => void
  openResetColumnDialog: (roleId: string) => void
  openObjectRoleDialog: () => void
  openEditObjectRoleDialog: (roleId: string) => void
  openDeleteObjectRoleDialog: (roleId: string) => void
  toggleBulkCell: (cell: RasciBulkCell) => void
  toggleBulkMode: () => void
  openBulkOverride: () => void
  openBulkOverrideForTaskGroup: (cells: RasciBulkCell[], taskGroupName: string) => void
  clearBulkSelection: () => void
  closeAll: () => void
}

const INITIAL_STATE = {
  selectedCell: null,
  selectedColumnRoleId: null,
  isOverrideDialogOpen: false,
  isResetColumnDialogOpen: false,
  isObjectRoleDialogOpen: false,
  isEditObjectRoleDialogOpen: false,
  isDeleteObjectRoleDialogOpen: false,
  isBulkOverrideOpen: false,
  isBulkMode: false,
  bulkSelectedCells: new Map<string, RasciBulkCell>(),
  bulkContextLabel: null,
}

/** Resets only dialog/selection state — preserves ongoing bulk selection. */
const DIALOG_RESET = {
  selectedCell: null,
  selectedColumnRoleId: null,
  isOverrideDialogOpen: false,
  isResetColumnDialogOpen: false,
  isObjectRoleDialogOpen: false,
  isEditObjectRoleDialogOpen: false,
  isDeleteObjectRoleDialogOpen: false,
  isBulkOverrideOpen: false,
}

/**
 * Global Zustand store for RASCI matrix object UI state.
 * Use the action methods to open dialogs and `closeAll` to reset all open state.
 */
export const useRasciMatrixStore = create<RasciMatrixStore>((set) => ({
  ...INITIAL_STATE,

  openOverrideDialog: (cell: {
    roleId: string
    taskId: string
    roleName: string
    taskName: string
    currentValue: string
    isOverridden: boolean
    templateValue: string | null
  }) =>
    set({
      ...DIALOG_RESET,
      isOverrideDialogOpen: true,
      selectedCell: {
        roleId: cell.roleId,
        taskId: cell.taskId,
        roleName: cell.roleName,
        taskName: cell.taskName,
        currentValue: cell.currentValue,
        isOverridden: cell.isOverridden,
        templateValue: cell.templateValue,
      },
    }),

  openResetColumnDialog: (roleId: string) =>
    set({ ...DIALOG_RESET, isResetColumnDialogOpen: true, selectedColumnRoleId: roleId }),

  openObjectRoleDialog: () => set({ ...DIALOG_RESET, isObjectRoleDialogOpen: true }),

  openEditObjectRoleDialog: (roleId: string) =>
    set({ ...DIALOG_RESET, isEditObjectRoleDialogOpen: true, selectedColumnRoleId: roleId }),

  openDeleteObjectRoleDialog: (roleId: string) =>
    set({
      ...DIALOG_RESET,
      isDeleteObjectRoleDialogOpen: true,
      selectedColumnRoleId: roleId,
    }),

  ...createBulkSelectionSlice<RasciBulkCell>((fn) => set((state) => ({ ...fn(state) }))),

  openBulkOverride: () => set({ isBulkOverrideOpen: true }),

  openBulkOverrideForTaskGroup: (cells: RasciBulkCell[], taskGroupName: string) => {
    const next = new Map<string, RasciBulkCell>()
    for (const cell of cells) {
      next.set(`${cell.roleId}:${cell.taskId}`, cell)
    }
    set({ bulkSelectedCells: next, isBulkOverrideOpen: true, bulkContextLabel: taskGroupName })
  },

  clearBulkSelection: () =>
    set({ bulkSelectedCells: new Map(), isBulkOverrideOpen: false, bulkContextLabel: null }),

  closeAll: () => set({ ...INITIAL_STATE }),
}))
