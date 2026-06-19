// ─── Components ───────────────────────────────────────────────────────────────
export { Board } from './components/Board'
export { SidebarOnboardingHint } from './components/SidebarOnboardingHint'
export { BoardCard, QuickMovePopover, PRIORITY_ICON } from './components/BoardCard'
export { BoardColumn } from './components/BoardColumn'
export { BoardFilter } from './components/BoardFilter'
export { CreateBoardDialog } from './components/CreateBoardDialog'
export { EditBoardDialog } from './components/EditBoardDialog'
export { CreateBoardColumnDialog } from './components/CreateBoardColumnDialog'
export { EditBoardColumnDialog } from './components/EditBoardColumnDialog'
export { DeleteBoardDialog } from './components/DeleteBoardDialog'

// ─── Hooks ────────────────────────────────────────────────────────────────────
export { useCreateBoard } from './hooks/useCreateBoard'
export { useUpdateBoard } from './hooks/useUpdateBoard'
export { useDeleteBoard } from './hooks/useDeleteBoard'
export { useCreateBoardColumn } from './hooks/useCreateBoardColumn'
export { useUpdateBoardColumn } from './hooks/useUpdateBoardColumn'
export { useDeleteBoardColumn } from './hooks/useDeleteBoardColumn'
export { useReorderBoardColumns } from './hooks/useReorderBoardColumns'
export { useAssignWorkItemToColumn } from './hooks/useAssignWorkItemToColumn'
export { useMoveWorkItemInColumn } from './hooks/useMoveWorkItemInColumn'
export { useMoveWorkItemInPool } from './hooks/useMoveWorkItemInPool'

// ─── Stores ───────────────────────────────────────────────────────────────────
export {
  useCreateBoardDialogStore,
  useEditBoardDialogStore,
  useCreateColumnDialogStore,
  useEditColumnDialogStore,
} from './store/boardDialogStores'
export { useBoardFilterStore } from './store/useBoardFilterStore'

// ─── Utils ────────────────────────────────────────────────────────────────────
export { boardFormSchema, DEFAULT_BOARD_COLUMNS } from './utils/boardFormSchema'
export type { BoardFormValues, BoardColumnFormValues } from './utils/boardFormSchema'
