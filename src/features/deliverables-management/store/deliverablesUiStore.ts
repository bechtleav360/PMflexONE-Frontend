import { create } from 'zustand'

import type { DeliverableModalMode, DeliverableModalState } from '../types/deliverable.types'

/** State shape for the delete confirmation dialog. */
export interface DeliverableDeleteDialogState {
  open: boolean
  deliverableId: string | null
  version: number | null
}

/**
 * Zustand state shape for the Deliverables Management UI.
 *
 * @property expandedIds - Set of node IDs whose children are currently visible.
 * @property toggleExpand - Toggles the expanded state of a single node.
 * @property expandAll - Expands all provided node IDs at once.
 * @property collapseAll - Collapses all nodes (resets to root-only view).
 * @property activeDragId - ID of the deliverable currently being dragged, or null.
 * @property setActiveDragId - Sets or clears the active drag ID.
 * @property modal - Current modal visibility and context.
 * @property openCreateModal - Opens the modal in create mode, optionally pre-filling the parent.
 * @property openModal - Opens the modal in edit or read mode for the given deliverable ID.
 * @property openEditModal - Convenience wrapper: opens the modal in edit mode.
 * @property openReadModal - Convenience wrapper: opens the modal in read-only mode.
 * @property closeModal - Closes the modal and resets its state.
 * @property deleteDialog - Current delete confirmation dialog state.
 * @property openDeleteDialog - Opens the delete dialog for the given deliverable.
 * @property closeDeleteDialog - Closes the delete dialog and resets its state.
 */
interface DeliverablesUiState {
  expandedIds: Set<string>
  toggleExpand: (id: string) => void
  expandAll: (ids: string[]) => void
  collapseAll: () => void
  activeDragId: string | null
  setActiveDragId: (id: string | null) => void
  modal: DeliverableModalState
  openCreateModal: (initialParentId?: string) => void
  openModal: (mode: 'edit' | 'read', deliverableId: string) => void
  openEditModal: (deliverableId: string) => void
  openReadModal: (deliverableId: string) => void
  closeModal: () => void
  deleteDialog: DeliverableDeleteDialogState
  openDeleteDialog: (deliverableId: string, version: number) => void
  closeDeleteDialog: () => void
}

const CLOSED_MODAL: DeliverableModalState = {
  open: false,
  mode: 'create' as DeliverableModalMode,
  deliverableId: null,
  initialParentId: null,
}

const CLOSED_DELETE_DIALOG: DeliverableDeleteDialogState = {
  open: false,
  deliverableId: null,
  version: null,
}

/**
 * Global UI store for the Deliverables Management feature.
 *
 * Tracks which tree nodes are expanded and controls the create/edit/read modal
 * and the delete confirmation dialog. All state is ephemeral — reset on page
 * unmount (not persisted).
 */
export const useDeliverablesUiStore = create<DeliverablesUiState>((set) => ({
  expandedIds: new Set<string>(),

  activeDragId: null,
  setActiveDragId: (id) => set({ activeDragId: id }),

  toggleExpand: (id) =>
    set((state) => {
      const next = new Set(state.expandedIds)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return { expandedIds: next }
    }),

  expandAll: (ids) => set({ expandedIds: new Set(ids) }),

  collapseAll: () => set({ expandedIds: new Set<string>() }),

  modal: CLOSED_MODAL,

  openCreateModal: (initialParentId) =>
    set({
      modal: {
        open: true,
        mode: 'create',
        deliverableId: null,
        initialParentId: initialParentId ?? null,
      },
    }),

  openModal: (mode, deliverableId) =>
    set({ modal: { open: true, mode, deliverableId, initialParentId: null } }),

  openEditModal: (deliverableId) =>
    set({ modal: { open: true, mode: 'edit', deliverableId, initialParentId: null } }),

  openReadModal: (deliverableId) =>
    set({ modal: { open: true, mode: 'read', deliverableId, initialParentId: null } }),

  closeModal: () => set({ modal: CLOSED_MODAL }),

  deleteDialog: CLOSED_DELETE_DIALOG,

  openDeleteDialog: (deliverableId, version) =>
    set({
      deleteDialog: { open: true, deliverableId, version },
    }),

  closeDeleteDialog: () => set({ deleteDialog: CLOSED_DELETE_DIALOG }),
}))
