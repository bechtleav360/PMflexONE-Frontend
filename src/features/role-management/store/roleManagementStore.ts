import { create } from 'zustand'

import { createBulkSelectionSlice } from '@/shared/lib/createBulkSelectionSlice'
import type { BulkCell } from '@/shared/lib/createBulkSelectionSlice'

/** Selected cell data for the template RASCI cell editor. */
export interface SelectedCell {
  roleId: string
  taskId: string
  currentValue: string
}

/** A cell coordinate used for multi-select bulk editing. */
export type BulkSelectedCell = BulkCell

/**
 * Zustand state shape for the role management admin area.
 * Tracks which dialogs are open and which IDs / cells are currently selected.
 */
interface RoleManagementStore {
  // ─── Dialog open state ─────────────────────────────────────────────────────
  isAddRoleOpen: boolean
  isEditRoleOpen: boolean
  isDeleteRoleOpen: boolean
  isAddGroupOpen: boolean
  isEditGroupOpen: boolean
  isDeleteGroupOpen: boolean
  isTemplateCellEditOpen: boolean
  isBulkEditOpen: boolean

  // ─── Selected IDs ──────────────────────────────────────────────────────────
  selectedRoleId: string | null
  selectedGroupId: string | null

  // ─── Selected cell for template cell edit ──────────────────────────────────
  selectedCell: SelectedCell | null

  // ─── Multi-selected cells for bulk edit (key: `${roleId}:${taskId}`) ───────
  bulkSelectedCells: Map<string, BulkSelectedCell>

  // ─── Bulk selection mode (accessible toggle, no modifier key required) ──────
  isBulkMode: boolean

  // ─── Label shown in the bulk dialog when opened via task-group button ────────
  bulkContextLabel: string | null

  // ─── Actions ───────────────────────────────────────────────────────────────
  openAddRole: () => void
  openEditRole: (roleId: string) => void
  openDeleteRole: (roleId: string) => void
  openAddGroup: () => void
  openEditGroup: (groupId: string) => void
  openDeleteGroup: (groupId: string) => void
  openTemplateCellEdit: (cell: SelectedCell) => void
  toggleBulkCell: (cell: BulkSelectedCell) => void
  toggleBulkMode: () => void
  openBulkEdit: () => void
  openBulkEditForTaskGroup: (cells: BulkSelectedCell[], taskGroupName: string) => void
  clearBulkSelection: () => void
  closeAll: () => void
}

const INITIAL_STATE = {
  isAddRoleOpen: false,
  isEditRoleOpen: false,
  isDeleteRoleOpen: false,
  isAddGroupOpen: false,
  isEditGroupOpen: false,
  isDeleteGroupOpen: false,
  isTemplateCellEditOpen: false,
  isBulkEditOpen: false,
  selectedRoleId: null,
  selectedGroupId: null,
  selectedCell: null,
  bulkSelectedCells: new Map<string, BulkSelectedCell>(),
  isBulkMode: false,
  bulkContextLabel: null,
}

/**
 * Global Zustand store for role management admin UI state.
 * Use the action methods to open dialogs and `closeAll` to reset all open state.
 */
export const useRoleManagementStore = create<RoleManagementStore>((set) => ({
  ...INITIAL_STATE,

  openAddRole: () => set({ ...INITIAL_STATE, isAddRoleOpen: true }),

  openEditRole: (roleId: string) =>
    set({ ...INITIAL_STATE, isEditRoleOpen: true, selectedRoleId: roleId }),

  openDeleteRole: (roleId: string) =>
    set({ ...INITIAL_STATE, isDeleteRoleOpen: true, selectedRoleId: roleId }),

  openAddGroup: () => set({ ...INITIAL_STATE, isAddGroupOpen: true }),

  openEditGroup: (groupId: string) =>
    set({ ...INITIAL_STATE, isEditGroupOpen: true, selectedGroupId: groupId }),

  openDeleteGroup: (groupId: string) =>
    set({ ...INITIAL_STATE, isDeleteGroupOpen: true, selectedGroupId: groupId }),

  openTemplateCellEdit: (cell: SelectedCell) =>
    set({ ...INITIAL_STATE, isTemplateCellEditOpen: true, selectedCell: cell }),

  ...createBulkSelectionSlice<BulkSelectedCell>((fn) => set((state) => ({ ...fn(state) }))),

  openBulkEdit: () => set({ isBulkEditOpen: true }),

  openBulkEditForTaskGroup: (cells: BulkSelectedCell[], taskGroupName: string) => {
    const next = new Map<string, BulkSelectedCell>()
    for (const cell of cells) {
      next.set(`${cell.roleId}:${cell.taskId}`, cell)
    }
    set({ bulkSelectedCells: next, isBulkEditOpen: true, bulkContextLabel: taskGroupName })
  },

  clearBulkSelection: () =>
    set({ bulkSelectedCells: new Map(), isBulkEditOpen: false, bulkContextLabel: null }),

  closeAll: () => set({ ...INITIAL_STATE }),
}))
