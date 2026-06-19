import { createModalStoreWithPayload } from '@/shared/lib/createModalStore'

/** Zustand store controlling the create-work-item-link dialog state and payload. */
export const useCreateWorkItemLinkDialogStore = createModalStoreWithPayload<{
  workItemId: string
}>()
