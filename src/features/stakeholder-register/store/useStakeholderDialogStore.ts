import type { StakeholderEntry } from '@/entities/stakeholder'
import { createModalStoreWithPayload } from '@/shared/lib/createModalStore'

/**
 * Zustand store for the create/edit stakeholder dialog.
 *
 * Payload is the entry to edit, or `null` when opening in create mode.
 */
export const useStakeholderDialogStore = createModalStoreWithPayload<StakeholderEntry | null>()
