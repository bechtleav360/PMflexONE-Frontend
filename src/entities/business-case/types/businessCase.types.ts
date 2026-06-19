import { z } from 'zod'

/** Zod schema for a person reference (creator/updater). */
export const personReferenceSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  mail: z.string(),
})

/** Minimal person reference returned on creator/updater fields of a BusinessCaseNode. */
export type PersonReference = z.infer<typeof personReferenceSchema>

/** Zod schema for the minimal project reference on a BusinessCaseNode. */
export const projectReferenceSchema = z.object({
  id: z.string(),
  name: z.string(),
})

/** Minimal project reference returned on the project edge of a BusinessCaseNode. */
export type ProjectReference = z.infer<typeof projectReferenceSchema>

/**
 * Edge wrapper returned when navigating from a BusinessCaseNode to its owning Project.
 * GraphQL field: `project` on `BusinessCaseNode` (typed via `ProjectNode`).
 */
export interface BusinessCaseProjectEdge {
  /** The owning project. */
  node: ProjectReference
}

/**
 * Edge wrapper returned when navigating from a Project to its Business Case.
 * GraphQL type: `ProjectBusinessCaseEdge`.
 */
export interface ProjectBusinessCaseEdge {
  /** The Business Case node, or null if none exists. */
  node: BusinessCaseNode | null
}

/** Zod schema for the full Business Case node returned by the API. */
export const businessCaseNodeSchema = z.object({
  id: z.string(),
  version: z.number(),
  /** Current lifecycle status name (e.g. `"draft"`, `"submitted"`). */
  status: z.string(),
  clientSummary: z.string().nullable(),
  projectRationale: z.string().nullable(),
  expectedBenefit: z.string().nullable(),
  options: z.string().nullable(),
  investmentCalculation: z.string().nullable(),
  keyRisks: z.string().nullable(),
  expectedNegativeSideEffect: z.string().nullable(),
  timeline: z.string().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
  metadata: z.string().nullable(),
  creator: personReferenceSchema.nullable(),
  updater: personReferenceSchema.nullable(),
  project: projectReferenceSchema.nullable(),
})

/**
 * A PMflex Business Case document providing economic justification for a project.
 * Status lifecycle: `draft` → `submitted` (user-facing label: "Complete").
 * Linked 1:1 to a Project via `ProjectBusinessCaseEdge`.
 *
 * GraphQL type: `BusinessCaseNode`
 */
export type BusinessCaseNode = z.infer<typeof businessCaseNodeSchema>

/** Zod schema for a single status entry from the `businessCaseStatuses` lookup query. */
export const businessCaseStatusSchema = z.object({
  status: z.string(),
  description: z.string().nullable(),
  displayOrder: z.number(),
})

/**
 * A single status entry returned by the `businessCaseStatuses` lookup query.
 * Used by `BusinessCaseStatusBadge` for dynamic label resolution.
 */
export type BusinessCaseStatus = z.infer<typeof businessCaseStatusSchema>

/**
 * Returns a stable TanStack Query key for a single Business Case detail query.
 * @param id - The Business Case identifier.
 * @returns The query key tuple.
 */
export function getBusinessCaseQueryKey(id: string) {
  return ['businessCase', id] as const
}

/**
 * Returns a stable TanStack Query key for the businessCaseByProjectId query.
 * @param projectId - The project identifier.
 * @returns The query key tuple.
 */
export function getBusinessCaseByProjectIdQueryKey(projectId: string) {
  return ['businessCaseByProjectId', projectId] as const
}

/** Stable TanStack Query key for the businessCaseStatuses lookup query. */
export const businessCaseStatusesQueryKey = ['businessCaseStatuses'] as const
