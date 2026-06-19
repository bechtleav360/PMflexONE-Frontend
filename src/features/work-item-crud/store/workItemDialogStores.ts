import { createModalStore, createModalStoreWithPayload } from '@/shared/lib/createModalStore'

/** Zustand store for the Create Work Item dialog open/close state. */
export const useCreateWorkItemDialogStore = createModalStore()

/** Zustand store for the Edit Work Item dialog, carrying the target work item ID. */
export const useEditWorkItemDialogStore = createModalStoreWithPayload<{ workItemId: string }>()

/** Zustand store for the Delete Work Item confirmation dialog, carrying the item ID and version. */
export const useDeleteWorkItemDialogStore = createModalStoreWithPayload<{
  workItemId: string
  version: number
}>()
