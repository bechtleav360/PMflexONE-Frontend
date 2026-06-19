import { createModalStoreWithPayload } from '@/shared/lib/createModalStore'

/** Zustand store controlling the edit-comment dialog state and payload. */
export const useEditCommentStore = createModalStoreWithPayload<{
  commentId: string
  version: number
}>()
