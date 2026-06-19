import { create } from 'zustand'

interface EscalatedEntryDetailState {
  isOpen: boolean
  selectedId: string | null
  /** When false, the measures section inside EscalatedEntryDetail is hidden. */
  showMeasures: boolean
  open: (id: string, showMeasures: boolean) => void
  close: () => void
}

/** Zustand store controlling the escalated-entry detail dialog open state and scope context. */
export const useEscalatedEntryDetailStore = create<EscalatedEntryDetailState>((set) => ({
  isOpen: false,
  selectedId: null,
  showMeasures: true,
  open: (id, showMeasures) => set({ isOpen: true, selectedId: id, showMeasures }),
  close: () => set({ isOpen: false, selectedId: null, showMeasures: true }),
}))
