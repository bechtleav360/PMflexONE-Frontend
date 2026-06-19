import { createModalStore, createModalStoreWithPayload } from '@/shared/lib/createModalStore'

/** Zustand store controlling the create-label dialog open/close state. */
export const useCreateLabelDialogStore = createModalStore()

/** Zustand store controlling the edit-label dialog open/close state and the target label ID. */
export const useEditLabelDialogStore = createModalStoreWithPayload<{ labelId: string }>()

/** Zustand store controlling the label-manager dialog open/close state and its scope context. */
export const useLabelManagerDialogStore = createModalStoreWithPayload<{
  scopeType: string
  scopeId: string
}>()
