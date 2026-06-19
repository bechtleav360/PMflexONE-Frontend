import { create } from 'zustand'

import type { SourceEntryType } from '../types/escalatedEntry.types'

interface EscalateEntryDialogState {
  isOpen: boolean
  sourceEntryId: string | null
  sourceEntryType: SourceEntryType | null
  version: number | null
  open: (sourceEntryId: string, sourceEntryType: SourceEntryType, version: number) => void
  close: () => void
}

/** Zustand store controlling the escalate-entry dialog open state and source entry context. */
export const useEscalateEntryDialogStore = create<EscalateEntryDialogState>((set) => ({
  isOpen: false,
  sourceEntryId: null,
  sourceEntryType: null,
  version: null,
  open: (sourceEntryId, sourceEntryType, version) =>
    set({ isOpen: true, sourceEntryId, sourceEntryType, version }),
  close: () => set({ isOpen: false, sourceEntryId: null, sourceEntryType: null, version: null }),
}))
