import { createModalStore } from '@/shared/lib'

/**
 * Ephemeral Zustand store for the create-project modal open/close state.
 *
 * The trigger button lives in `widgets/Layout` (a higher FSD layer) while the
 * modal lives in `features/create-project`. Using a Zustand store is the
 * correct FSD mechanism to share this UI state across layers without prop
 * drilling or React context.
 */
export const useCreateProjectStore = createModalStore()
