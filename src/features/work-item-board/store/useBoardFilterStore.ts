import { create } from 'zustand'

interface BoardFilterState {
  priorities: ReadonlySet<string>
  assigneeId: string | null
  labelId: string | null
  setPriorities: (v: ReadonlySet<string>) => void
  setAssigneeId: (v: string | null) => void
  setLabelId: (v: string | null) => void
  reset: () => void
}

/** Zustand store for active board filter state (priority, assignee, label). */
export const useBoardFilterStore = create<BoardFilterState>((set) => ({
  priorities: new Set(),
  assigneeId: null,
  labelId: null,
  setPriorities: (priorities) => set({ priorities }),
  setAssigneeId: (assigneeId) => set({ assigneeId }),
  setLabelId: (labelId) => set({ labelId }),
  reset: () => set({ priorities: new Set(), assigneeId: null, labelId: null }),
}))
