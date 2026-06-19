import { z } from 'zod'

/** Possible lifecycle statuses of a project charter. */
export type ProjectCharterStatus = 'DRAFT' | 'SUBMITTED' | 'ACCEPTED'

/** A person record referenced as charter creator or updater. */
export interface PersonReference {
  id: string
  firstName: string
  lastName: string
}

/** Lightweight summary of a project charter used in list/navigation contexts. */
export interface ProjectCharterSummary {
  id: string
  status: ProjectCharterStatus
}

/** Zod schema for validating the project charter status enum. */
export const projectCharterStatusSchema = z.enum(['DRAFT', 'SUBMITTED', 'ACCEPTED'])

/** Zod schema for the lightweight project charter summary (id + status). */
export const projectCharterSummarySchema = z.object({
  id: z.string(),
  status: projectCharterStatusSchema,
})

const personSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
})

/** Zod schema for the full project charter node returned by the API. */
export const projectCharterNodeSchema = z.object({
  id: z.string(),
  status: projectCharterStatusSchema,
  projectSummary: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  scopeSummary: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  successCriteria: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  stakeholders: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  requirement: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  projectConstraint: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  assumption: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  risk: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  resources: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  operationalImplementation: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.number(),
  creator: personSchema.nullish().transform((v) => v ?? null),
  updater: personSchema.nullish().transform((v) => v ?? null),
  project: z
    .object({ id: z.string() })
    .nullish()
    .transform((v) => v ?? null),
})

/** Full project charter node, derived from the Zod schema to prevent interface/schema drift. */
export type ProjectCharterNode = z.infer<typeof projectCharterNodeSchema>

/**
 * @param id - Project charter ID.
 * @returns TanStack Query key for a single project charter.
 */
export function getProjectCharterQueryKey(id: string) {
  return ['projectCharter', id] as const
}

/**
 * @param projectId - ID of the project.
 * @returns TanStack Query key for the charter linked to a project.
 */
export function getProjectCharterByProjectIdQueryKey(projectId: string) {
  return ['projectCharterByProjectId', projectId] as const
}
