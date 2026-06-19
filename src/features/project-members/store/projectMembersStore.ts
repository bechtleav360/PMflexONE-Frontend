import { create } from 'zustand'

import type { MemberAssignment } from '@/entities/project-member'

interface ProjectMembersStore {
  isAssignOpen: boolean
  pendingEdit: MemberAssignment | null
  pendingUnassign: { assignmentId: string; displayName: string } | null

  openAssign: () => void
  openEdit: (assignment: MemberAssignment) => void
  openUnassign: (assignmentId: string, displayName: string) => void
  closeAll: () => void
}

const INITIAL_STATE = {
  isAssignOpen: false,
  pendingEdit: null,
  pendingUnassign: null,
}

export /**
 * Zustand store managing dialog open/close state for the project-members feature.
 * Holds which action is pending (assign, edit, or unassign) and the related payload.
 */
const useProjectMembersStore = create<ProjectMembersStore>((set) => ({
  ...INITIAL_STATE,

  openAssign: () => set({ ...INITIAL_STATE, isAssignOpen: true }),

  openEdit: (assignment) => set({ ...INITIAL_STATE, pendingEdit: assignment }),

  openUnassign: (assignmentId, displayName) =>
    set({ ...INITIAL_STATE, pendingUnassign: { assignmentId, displayName } }),

  closeAll: () => set({ ...INITIAL_STATE }),
}))
