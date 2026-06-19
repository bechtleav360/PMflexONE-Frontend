import { useQuery } from '@tanstack/react-query'

import { getMemberAssignments } from '../api/getMemberAssignments'
import { projectMemberQueryKeys } from '../model/projectMember.queryKeys'
import type { MemberAssignment } from '../model/projectMember.types'

/**
 * Fetches the member assignments for a given scope object and returns the React Query result.
 *
 * @param objectId - The ID of the scope object (project, program, or portfolio).
 * @returns The React Query result containing the array of MemberAssignment records.
 */
export function useUserRoles(objectId: string) {
  return useQuery<MemberAssignment[]>({
    queryKey: projectMemberQueryKeys.memberAssignments(objectId),
    queryFn: () => getMemberAssignments(objectId),
    staleTime: 0,
  })
}
