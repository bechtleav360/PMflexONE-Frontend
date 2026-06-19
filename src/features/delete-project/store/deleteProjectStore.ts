import { createModalStoreWithPayload } from '@/shared/lib'

/**
 * Ephemeral Zustand store for the delete-project confirmation dialog.
 *
 * Stores the ID of the project to be deleted as `payload` so the dialog can
 * dispatch the mutation without prop drilling.
 */
export const useDeleteProjectStore = createModalStoreWithPayload<string>()
