import { create } from 'zustand'

interface DeEscalateEntryDialogState {
  isOpen: boolean
  escalatedEntryId: string | null
  version: number | null
  onSuccess?: () => void
  open: (escalatedEntryId: string, version: number, onSuccess?: () => void) => void
  close: () => void
}

/** Zustand store controlling the de-escalate-entry dialog open state and target entry context. */
export const useDeEscalateEntryDialogStore = create<DeEscalateEntryDialogState>((set) => ({
  isOpen: false,
  escalatedEntryId: null,
  version: null,
  onSuccess: undefined,
  open: (escalatedEntryId, version, onSuccess) =>
    set({ isOpen: true, escalatedEntryId, version, onSuccess }),
  close: () => set({ isOpen: false, escalatedEntryId: null, version: null, onSuccess: undefined }),
}))
