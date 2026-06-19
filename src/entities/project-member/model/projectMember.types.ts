/**
 * Person data embedded in a member assignment.
 */
export interface ProjectMemberPerson {
  id: string
  firstName: string | null
  lastName: string | null
  mail: string | null
}

/**
 * Role data embedded in a member assignment.
 */
export interface ProjectMemberRole {
  id: string
  name: string
  shortTitle: string
}

/**
 * Represents a single person-to-role assignment within a scope object.
 */
export interface MemberAssignment {
  id: string
  person: ProjectMemberPerson
  role: ProjectMemberRole
  initials: string | null
}

/**
 * Represents a person returned by the person search query.
 */
export interface PersonSearchResult {
  id: string
  firstName: string
  lastName: string
  mail: string
  userId: string | null
}
