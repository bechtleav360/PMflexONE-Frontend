import { create } from 'zustand'

interface RiskEntryEditTargetState {
  editTargetId: string | null
  setEditTarget: (id: string) => void
  clearEditTarget: () => void
}

/** Coordination store: planning-objects feature sets editTargetId after creating
 *  a risk entry via assumption escalation; risk-register feature reads it on mount
 *  and opens the edit dialog for that entry. FSD-legal: both features import from
 *  the entities layer. */
export const useRiskEntryEditTarget = create<RiskEntryEditTargetState>((set) => ({
  editTargetId: null,
  setEditTarget: (id) => set({ editTargetId: id }),
  clearEditTarget: () => set({ editTargetId: null }),
}))
