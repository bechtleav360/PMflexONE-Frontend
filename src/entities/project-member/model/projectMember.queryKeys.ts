export /**
 * Query key factory for project-member entity queries.
 */
const projectMemberQueryKeys = {
  memberAssignments: (objectId: string) => ['memberAssignments', objectId] as const,
} as const
