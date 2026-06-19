import { gql } from 'graphql-request'
import { z } from 'zod'

import type { ConstraintListItem } from '../types/constraint.types'

// ---------------------------------------------------------------------------
// GraphQL documents
// ---------------------------------------------------------------------------

/** Fetches the scoped list of project constraints. */
export const GET_PROJECT_CONSTRAINTS = gql`
  query GetProjectConstraints($filter: ProjectConstraintFilter) {
    projectConstraints(filter: $filter) {
      id
      version
      name
      description
      timeConstrained
      dueDate
      otherInformation
      createdAt
      updatedAt
      creator {
        id
        firstName
        lastName
        mail
      }
      owner {
        id
        firstName
        lastName
        mail
      }
      projectCharter {
        id
        status
      }
    }
  }
`

/** Creates a new project constraint. */
export const CREATE_PROJECT_CONSTRAINT = gql`
  mutation CreateProjectConstraint($input: CreateProjectConstraintInput!) {
    createProjectConstraint(input: $input) {
      id
      version
      name
      timeConstrained
      dueDate
      otherInformation
      createdAt
      updatedAt
      owner {
        id
        firstName
        lastName
        mail
      }
      projectCharter {
        id
        status
      }
    }
  }
`

/** Updates an existing project constraint. */
export const UPDATE_PROJECT_CONSTRAINT = gql`
  mutation UpdateProjectConstraint($input: UpdateProjectConstraintInput!) {
    updateProjectConstraint(input: $input) {
      id
      version
      name
      timeConstrained
      dueDate
      otherInformation
      updatedAt
      owner {
        id
        firstName
        lastName
        mail
      }
      projectCharter {
        id
        status
      }
    }
  }
`

/** Deletes a project constraint. */
export const DELETE_PROJECT_CONSTRAINT = gql`
  mutation DeleteProjectConstraint($id: ID!, $version: Int!) {
    deleteProjectConstraint(id: $id, version: $version)
  }
`

/** Links a project constraint to a project charter. */
export const LINK_PROJECT_CONSTRAINT_TO_PROJECT_CHARTER = gql`
  mutation LinkProjectConstraintToProjectCharter($constraintId: ID!, $projectCharterId: ID!) {
    linkProjectConstraintToProjectCharter(
      constraintId: $constraintId
      projectCharterId: $projectCharterId
    )
  }
`

/** Removes the link between a project constraint and a project charter. */
export const UNLINK_PROJECT_CONSTRAINT_FROM_PROJECT_CHARTER = gql`
  mutation UnlinkProjectConstraintFromProjectCharter($constraintId: ID!, $projectCharterId: ID!) {
    unlinkProjectConstraintFromProjectCharter(
      constraintId: $constraintId
      projectCharterId: $projectCharterId
    )
  }
`

// ---------------------------------------------------------------------------
// Query key factories
// ---------------------------------------------------------------------------

/**
 * TanStack Query key for the scoped constraints list.
 *
 * @param scopeType - Scope context (always `'Project'` for constraints).
 * @param scopeId - The ID of the project.
 * @returns Readonly tuple used as the TanStack Query cache key.
 */
export const CONSTRAINTS_QUERY_KEY = (scopeType: string, scopeId: string) =>
  ['constraints', scopeType, scopeId] as const

/**
 * TanStack Query key for a single constraint detail.
 *
 * @param id - The constraint ID.
 * @returns Readonly tuple used as the TanStack Query cache key.
 */
export const CONSTRAINT_QUERY_KEY = (id: string) => ['constraint', id] as const

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const personSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  mail: z.string(),
})

const entityRefWithStatusSchema = z.object({ id: z.string(), status: z.string() })

const scopeSchema = z.object({
  id: z.string(),
  scopeType: z.literal('Project'),
})

/** Zod schema for a single constraint list item. */
export const constraintListItemSchema: z.ZodType<ConstraintListItem> = z.object({
  id: z.string(),
  version: z.number().int(),
  name: z.string(),
  description: z.string().nullable(),
  timeConstrained: z.boolean(),
  dueDate: z.string().nullable(),
  otherInformation: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  creator: personSchema.nullable(),
  updater: personSchema.nullable().default(null),
  owner: personSchema.nullable(),
  projectCharter: entityRefWithStatusSchema.nullable(),
  scope: scopeSchema.optional(),
})

/** Zod schema for the GetProjectConstraints query response. */
export const constraintsResponseSchema = z.object({
  projectConstraints: z.array(constraintListItemSchema),
})

/** Zod schema for a constraint mutation response item (subset of full item). */
const constraintMutationItemSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  name: z.string(),
  timeConstrained: z.boolean(),
  dueDate: z.string().nullable(),
  otherInformation: z.string().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string(),
  owner: personSchema.nullable(),
  projectCharter: entityRefWithStatusSchema.nullable(),
})

/** Zod schema for the CreateProjectConstraint mutation response. */
export const createConstraintResponseSchema = z.object({
  createProjectConstraint: constraintMutationItemSchema,
})

/** Zod schema for the UpdateProjectConstraint mutation response. */
export const updateConstraintResponseSchema = z.object({
  updateProjectConstraint: constraintMutationItemSchema,
})
