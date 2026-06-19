import { gql } from 'graphql-request'
import { z } from 'zod'

import type { RequirementListItem } from '../types/requirement.types'

// ---------------------------------------------------------------------------
// GraphQL documents
// ---------------------------------------------------------------------------

/** Fetches the scoped flat list of requirements. */
export const GET_REQUIREMENTS = gql`
  query GetRequirements($filter: RequirementFilter) {
    requirements(filter: $filter) {
      id
      version
      sortOrder
      name
      requirementScope
      source
      estimatedEffortMin
      estimatedEffortMax
      type
      priority
      status
      createdAt
      updatedAt
      creator {
        id
        firstName
        lastName
        mail
      }
      parent {
        id
      }
    }
  }
`

/** Fetches a single requirement with full detail and linked entities. */
export const GET_REQUIREMENT = gql`
  query GetRequirement($id: ID!) {
    requirement(id: $id) {
      id
      version
      sortOrder
      name
      requirementScope
      source
      estimatedEffortMin
      estimatedEffortMax
      type
      priority
      status
      description
      acceptanceCriteria
      createdAt
      updatedAt
      creator {
        id
        firstName
        lastName
        mail
      }
      updater {
        id
        firstName
        lastName
        mail
      }
      parent {
        id
      }
      dependencies {
        edgeTypeName
        requirement {
          id
          name
          status
        }
      }
      linkedGoals {
        id
        name
      }
    }
  }
`

/** Creates a new requirement. */
export const CREATE_REQUIREMENT = gql`
  mutation CreateRequirement($input: CreateRequirementInput!) {
    createRequirement(input: $input) {
      id
      version
      name
      requirementScope
      source
      estimatedEffortMin
      estimatedEffortMax
      type
      priority
      status
      createdAt
      updatedAt
      parent {
        id
      }
    }
  }
`

/** Updates an existing requirement. */
export const UPDATE_REQUIREMENT = gql`
  mutation UpdateRequirement($input: UpdateRequirementInput!) {
    updateRequirement(input: $input) {
      id
      version
      name
      requirementScope
      source
      estimatedEffortMin
      estimatedEffortMax
      type
      priority
      status
      updatedAt
      parent {
        id
      }
    }
  }
`

/** Deletes a requirement, optionally cascading to child requirements. */
export const DELETE_REQUIREMENT = gql`
  mutation DeleteRequirement($id: ID!, $version: Int!, $cascade: Boolean!) {
    deleteRequirement(id: $id, version: $version, cascade: $cascade)
  }
`

/** Sets the parent requirement of a requirement (tree hierarchy). */
export const SET_REQUIREMENT_PARENT = gql`
  mutation SetRequirementParent($requirementId: ID!, $parentId: ID!, $version: Int!) {
    setRequirementParent(requirementId: $requirementId, parentId: $parentId, version: $version) {
      id
      version
      parent {
        id
      }
    }
  }
`

/** Removes the parent of a requirement (makes it a root requirement). */
export const CLEAR_REQUIREMENT_PARENT = gql`
  mutation ClearRequirementParent($requirementId: ID!, $version: Int!) {
    clearRequirementParent(requirementId: $requirementId, version: $version) {
      id
      version
      parent {
        id
      }
    }
  }
`

/** Creates a directed dependency link between two requirements. */
export const LINK_REQUIREMENTS = gql`
  mutation LinkRequirements($input: LinkRequirementsInput!) {
    linkRequirements(input: $input)
  }
`

/** Removes a directed dependency link between two requirements. */
export const UNLINK_REQUIREMENTS = gql`
  mutation UnlinkRequirements($fromId: ID!, $toId: ID!, $linkType: String!) {
    unlinkRequirements(fromId: $fromId, toId: $toId, linkType: $linkType)
  }
`

// ---------------------------------------------------------------------------
// Query key factories
// ---------------------------------------------------------------------------

/**
 * TanStack Query key for the scoped requirements list.
 *
 * @param scopeType - Scope context (`'Project'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns Readonly tuple used as the TanStack Query cache key.
 */
export const REQUIREMENTS_QUERY_KEY = (scopeType: string, scopeId: string) =>
  ['requirements', scopeType, scopeId] as const

/**
 * TanStack Query key for a single requirement detail.
 *
 * @param id - The requirement ID.
 * @returns Readonly tuple used as the TanStack Query cache key.
 */
export const REQUIREMENT_QUERY_KEY = (id: string) => ['requirement', id] as const

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const personSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  mail: z.string(),
})

const scopeSchema = z.object({
  id: z.string(),
  scopeType: z.enum(['Project', 'Program', 'Portfolio']),
})

const requirementScopeSchema = z.enum(['IN_SCOPE', 'OUT_OF_SCOPE'])
const requirementSourceSchema = z.enum(['INTERNAL', 'EXTERNAL'])
const requirementTypeSchema = z.enum(['FUNCTIONAL', 'NON_FUNCTIONAL', 'CONSTRAINT'])
const requirementPrioritySchema = z.enum(['MUST_HAVE', 'SHOULD_HAVE', 'COULD_HAVE', 'WONT_HAVE'])
const requirementStatusSchema = z.enum([
  'NEW',
  'ANALYSED',
  'SPECIFIED',
  'IMPLEMENTED',
  'TESTED',
  'ACCEPTED',
])

/**
 * Recursive Zod schema for a requirement list item.
 * Uses `z.lazy()` for the self-referencing `children` field.
 */
export const requirementListItemSchema: z.ZodType<RequirementListItem> = z.lazy(() =>
  z.object({
    id: z.string(),
    version: z.number().int(),
    sortOrder: z.number().int(),
    name: z.string(),
    requirementScope: requirementScopeSchema,
    source: requirementSourceSchema,
    estimatedEffortMin: z.number().nullable(),
    estimatedEffortMax: z.number().nullable(),
    type: requirementTypeSchema,
    priority: requirementPrioritySchema,
    status: requirementStatusSchema,
    createdAt: z.string(),
    updatedAt: z.string(),
    creator: personSchema.nullable(),
    parent: z.object({ id: z.string() }).nullable(),
    scope: scopeSchema.optional(),
  }),
)

/** Zod schema for the GetRequirements query response. */
export const requirementsResponseSchema = z.object({
  requirements: z.array(requirementListItemSchema),
})

const requirementDependencySchema = z.object({
  edgeTypeName: z.enum(['blocks', 'blocked_by', 'duplicates', 'duplicated_by', 'relates_to']),
  requirement: z.object({
    id: z.string(),
    name: z.string(),
    status: requirementStatusSchema,
  }),
})

/** Zod schema for the GetRequirement detail query response. */
export const requirementDetailSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  sortOrder: z.number().int(),
  name: z.string(),
  requirementScope: requirementScopeSchema,
  source: requirementSourceSchema,
  estimatedEffortMin: z.number().nullable(),
  estimatedEffortMax: z.number().nullable(),
  type: requirementTypeSchema,
  priority: requirementPrioritySchema,
  status: requirementStatusSchema,
  description: z.string().nullable(),
  acceptanceCriteria: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  creator: personSchema.nullable(),
  updater: personSchema.nullable(),
  parent: z.object({ id: z.string() }).nullable(),
  scope: scopeSchema.optional(),
  dependencies: z.array(requirementDependencySchema),
  linkedGoals: z.array(z.object({ id: z.string(), name: z.string() })),
})

/** Zod schema for the GetRequirement query response wrapper. */
export const requirementDetailResponseSchema = z.object({
  requirement: requirementDetailSchema.nullable(),
})

const requirementMutationItemSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  name: z.string(),
  requirementScope: requirementScopeSchema,
  source: requirementSourceSchema,
  estimatedEffortMin: z.number().nullable(),
  estimatedEffortMax: z.number().nullable(),
  type: requirementTypeSchema,
  priority: requirementPrioritySchema,
  status: requirementStatusSchema,
  createdAt: z.string().optional(),
  updatedAt: z.string(),
  creator: personSchema.nullable().optional(),
  parent: z.object({ id: z.string() }).nullable(),
})

/** Zod schema for the CreateRequirement mutation response. */
export const createRequirementResponseSchema = z.object({
  createRequirement: requirementMutationItemSchema,
})

/** Zod schema for the UpdateRequirement mutation response. */
export const updateRequirementResponseSchema = z.object({
  updateRequirement: requirementMutationItemSchema,
})

const parentRefSchema = z.object({ id: z.string() }).nullable()

/** Zod schema for the SetRequirementParent mutation response. */
export const setRequirementParentResponseSchema = z.object({
  setRequirementParent: z.object({
    id: z.string(),
    version: z.number().int(),
    parent: parentRefSchema,
  }),
})

/** Zod schema for the ClearRequirementParent mutation response. */
export const clearRequirementParentResponseSchema = z.object({
  clearRequirementParent: z.object({
    id: z.string(),
    version: z.number().int(),
    parent: parentRefSchema,
  }),
})

/** Reorders requirements within a scope by providing the full ordered ID list. */
export const REORDER_REQUIREMENTS = gql`
  mutation ReorderRequirements($input: ReorderRequirementsInput!) {
    reorderRequirements(input: $input) {
      id
      sortOrder
    }
  }
`

/** Zod schema for the ReorderRequirements mutation response. */
export const reorderRequirementsResponseSchema = z.object({
  reorderRequirements: z.array(z.object({ id: z.string(), sortOrder: z.number().int() })),
})
