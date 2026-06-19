import { z } from 'zod'

export /**
 * Zod schema for validating ProjectMemberPerson API responses.
 */
const projectMemberPersonSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  mail: z.string().nullable(),
})

export /**
 * Zod schema for validating ProjectMemberRole API responses.
 */
const projectMemberRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortTitle: z.string(),
})

export /**
 * Zod schema for validating MemberAssignment API responses.
 */
const memberAssignmentSchema = z.object({
  id: z.string(),
  person: projectMemberPersonSchema,
  role: projectMemberRoleSchema,
  initials: z.string().nullable(),
})

export /**
 * Zod schema for validating PersonSearchResult API responses.
 */
const personSearchResultSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  mail: z.string(),
  userId: z.string().nullable(),
})
