import { createModalStore, createModalStoreWithPayload } from '@/shared/lib/createModalStore'

/** Zustand store for the Create Board dialog open/close state. */
export const useCreateBoardDialogStore = createModalStore()

/** Zustand store for the Edit Board dialog, carrying the target board ID. */
export const useEditBoardDialogStore = createModalStoreWithPayload<{ boardId: string }>()

/** Zustand store for the Create Board Column dialog, carrying the parent board ID. */
export const useCreateColumnDialogStore = createModalStoreWithPayload<{ boardId: string }>()

/** Zustand store for the Edit Board Column dialog, carrying both board and column IDs. */
export const useEditColumnDialogStore = createModalStoreWithPayload<{
  boardId: string
  columnId: string
}>()
