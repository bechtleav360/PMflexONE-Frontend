import { create } from 'zustand'

/** State shape for the delete confirmation dialog. */
interface DeleteDialogState {
  open: boolean
  supportServiceId: string | null
  version: number | null
  hasChildren: boolean
}

/** State shape for the first-child warning dialog. */
interface FirstChildWarningState {
  open: boolean
  nodeId: string | null
  nodeName: string
  effort: number
}

/** State shape for the support service form dialog. */
interface FormDialogState {
  open: boolean
  supportServiceId: string | null
  defaultParentId: string | null
}

/**
 * Zustand state shape for the Support Services Management UI.
 *
 * @property expandedIds - Set of node IDs whose children are currently visible.
 * @property toggleExpand - Toggles the expanded state of a single node.
 * @property expandAll - Expands all provided node IDs at once.
 * @property collapseAll - Collapses all nodes (resets to root-only view).
 * @property activeDragId - ID of the support service currently being dragged, or null.
 * @property setActiveDragId - Sets or clears the active drag ID.
 * @property deleteDialog - Current delete confirmation dialog state.
 * @property openDeleteDialog - Opens the delete dialog for the given support service.
 * @property closeDeleteDialog - Closes the delete dialog and resets its state.
 * @property firstChildWarning - Current first-child warning dialog state.
 * @property openFirstChildWarning - Opens the warning dialog for a leaf node with effort.
 * @property closeFirstChildWarning - Closes the warning dialog and resets its state.
 * @property formDialog - Current form dialog state for creating/editing a support service.
 * @property openFormDialog - Opens the form dialog, optionally with an ID (edit) or parentId (create child).
 * @property closeFormDialog - Closes the form dialog and resets its state.
 */
interface SupportServicesUiState {
  expandedIds: Set<string>
  toggleExpand: (id: string) => void
  expandAll: (ids: string[]) => void
  collapseAll: () => void
  activeDragId: string | null
  setActiveDragId: (id: string | null) => void
  deleteDialog: DeleteDialogState
  openDeleteDialog: (id: string, version: number, hasChildren: boolean) => void
  closeDeleteDialog: () => void
  firstChildWarning: FirstChildWarningState
  openFirstChildWarning: (nodeId: string, nodeName: string, effort: number) => void
  closeFirstChildWarning: () => void
  formDialog: FormDialogState
  openFormDialog: (supportServiceId?: string | null, defaultParentId?: string | null) => void
  closeFormDialog: () => void
}

const CLOSED_DELETE_DIALOG: DeleteDialogState = {
  open: false,
  supportServiceId: null,
  version: null,
  hasChildren: false,
}

const CLOSED_FIRST_CHILD_WARNING: FirstChildWarningState = {
  open: false,
  nodeId: null,
  nodeName: '',
  effort: 0,
}

const CLOSED_FORM_DIALOG: FormDialogState = {
  open: false,
  supportServiceId: null,
  defaultParentId: null,
}

/**
 * Global UI store for the Support Services Management feature.
 *
 * Tracks which tree nodes are expanded and controls the delete confirmation
 * dialog and the first-child warning dialog. All state is ephemeral and
 * not persisted between sessions.
 */
export const useSupportServicesUiStore = create<SupportServicesUiState>((set) => ({
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

  expandAll: (ids) => set((s) => ({ expandedIds: new Set([...s.expandedIds, ...ids]) })),

  collapseAll: () => set({ expandedIds: new Set<string>() }),

  deleteDialog: CLOSED_DELETE_DIALOG,

  openDeleteDialog: (id, version, hasChildren) =>
    set({
      deleteDialog: { open: true, supportServiceId: id, version, hasChildren },
    }),

  closeDeleteDialog: () => set({ deleteDialog: CLOSED_DELETE_DIALOG }),

  firstChildWarning: CLOSED_FIRST_CHILD_WARNING,

  openFirstChildWarning: (nodeId, nodeName, effort) =>
    set({
      firstChildWarning: { open: true, nodeId, nodeName, effort },
    }),

  closeFirstChildWarning: () => set({ firstChildWarning: CLOSED_FIRST_CHILD_WARNING }),

  formDialog: CLOSED_FORM_DIALOG,

  openFormDialog: (supportServiceId, defaultParentId) =>
    set({
      formDialog: {
        open: true,
        supportServiceId: supportServiceId ?? null,
        defaultParentId: defaultParentId ?? null,
      },
    }),

  closeFormDialog: () => set({ formDialog: CLOSED_FORM_DIALOG }),
}))
