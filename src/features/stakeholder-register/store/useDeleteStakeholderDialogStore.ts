import type { StakeholderEntry } from '@/entities/stakeholder'
import { createModalStoreWithPayload } from '@/shared/lib/createModalStore'

/**
 * Zustand store for the delete stakeholder confirmation dialog.
 *
 * Payload is the entry to be deleted.
 */
export const useDeleteStakeholderDialogStore = createModalStoreWithPayload<StakeholderEntry>()
