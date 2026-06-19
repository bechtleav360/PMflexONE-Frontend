/* eslint-disable max-lines -- API module groups all mutations and queries for a single domain entity */
import { gql } from 'graphql-request'
import { z } from 'zod'

import type { GoalListItem } from '../types/goal.types'

// ---------------------------------------------------------------------------
// GraphQL documents
// ---------------------------------------------------------------------------

/** Fetches the scoped list of goals. */
export const GET_GOALS = gql`
  query GetGoals($filter: GoalFilter) {
    goals(filter: $filter) {
      id
      version
      sortOrder
      name
      progress
      dueDate
      acceptedAt
      createdAt
      updatedAt
      acceptedBy {
        id
        firstName
        lastName
        mail
      }
      creator {
        id
        firstName
        lastName
        mail
      }
      parent {
        id
      }
      parentLevelGoalName
    }
  }
`

/** Fetches a single goal with full detail and linked entities. */
export const GET_GOAL = gql`
  query GetGoal($id: ID!) {
    goal(id: $id) {
      id
      version
      sortOrder
      name
      description
      progress
      dueDate
      keyResults
      impact
      outcome
      otherInformation
      acceptedAt
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
      acceptedBy {
        id
        firstName
        lastName
        mail
      }
      parent {
        id
      }
      children {
        id
      }
      parentLevelGoalName
      parentLevelGoal {
        id
        name
      }
      relatedGoals {
        id
        name
      }
      linkedRequirements {
        id
        name
        status
      }
      businessCase {
        id
        status
      }
      projectCharter {
        id
        status
      }
      initiationRequests {
        id
        name
      }
    }
  }
`

/** Creates a new goal. */
export const CREATE_GOAL = gql`
  mutation CreateGoal($input: CreateGoalInput!) {
    createGoal(input: $input) {
      id
      version
      name
      progress
      dueDate
      acceptedAt
      createdAt
      updatedAt
      acceptedBy {
        id
        firstName
        lastName
        mail
      }
      parent {
        id
      }
      parentLevelGoalName
    }
  }
`

/** Updates an existing goal. */
export const UPDATE_GOAL = gql`
  mutation UpdateGoal($input: UpdateGoalInput!) {
    updateGoal(input: $input) {
      id
      version
      name
      progress
      dueDate
      keyResults
      impact
      outcome
      otherInformation
      acceptedAt
      updatedAt
      acceptedBy {
        id
        firstName
        lastName
        mail
      }
      parent {
        id
      }
      parentLevelGoalName
    }
  }
`

/** Deletes a goal, optionally cascading to child goals. */
export const DELETE_GOAL = gql`
  mutation DeleteGoal($id: ID!, $version: Int!, $cascade: Boolean!) {
    deleteGoal(id: $id, version: $version, cascade: $cascade)
  }
`

/** Sets the parent goal of a goal (tree hierarchy). */
export const SET_GOAL_PARENT = gql`
  mutation SetGoalParent($goalId: ID!, $parentId: ID!, $version: Int!) {
    setGoalParent(goalId: $goalId, parentId: $parentId, version: $version) {
      id
      version
      parent {
        id
      }
    }
  }
`

/** Removes the parent goal of a goal (makes it a root goal). */
export const CLEAR_GOAL_PARENT = gql`
  mutation ClearGoalParent($goalId: ID!, $version: Int!) {
    clearGoalParent(goalId: $goalId, version: $version) {
      id
      version
      parent {
        id
      }
    }
  }
`

/** Sets the parent-level goal cross-scope reference (e.g. program goal for a project goal). */
export const SET_PARENT_LEVEL_GOAL = gql`
  mutation SetParentLevelGoal($goalId: ID!, $parentLevelGoalId: ID!, $version: Int!) {
    setParentLevelGoal(goalId: $goalId, parentLevelGoalId: $parentLevelGoalId, version: $version) {
      id
      version
      parentLevelGoal {
        id
        name
      }
      parentLevelGoalName
    }
  }
`

/** Clears the parent-level goal cross-scope reference. */
export const CLEAR_PARENT_LEVEL_GOAL = gql`
  mutation ClearParentLevelGoal($goalId: ID!, $version: Int!) {
    clearParentLevelGoal(goalId: $goalId, version: $version) {
      id
      version
      parentLevelGoal {
        id
        name
      }
      parentLevelGoalName
    }
  }
`

/** Links a goal to a business case. */
export const LINK_GOAL_TO_BUSINESS_CASE = gql`
  mutation LinkGoalToBusinessCase($goalId: ID!, $businessCaseId: ID!) {
    linkGoalToBusinessCase(goalId: $goalId, businessCaseId: $businessCaseId)
  }
`

/** Removes the link between a goal and a business case. */
export const UNLINK_GOAL_FROM_BUSINESS_CASE = gql`
  mutation UnlinkGoalFromBusinessCase($goalId: ID!, $businessCaseId: ID!) {
    unlinkGoalFromBusinessCase(goalId: $goalId, businessCaseId: $businessCaseId)
  }
`

/** Links a goal to a project charter. */
export const LINK_GOAL_TO_PROJECT_CHARTER = gql`
  mutation LinkGoalToProjectCharter($goalId: ID!, $projectCharterId: ID!) {
    linkGoalToProjectCharter(goalId: $goalId, projectCharterId: $projectCharterId)
  }
`

/** Removes the link between a goal and a project charter. */
export const UNLINK_GOAL_FROM_PROJECT_CHARTER = gql`
  mutation UnlinkGoalFromProjectCharter($goalId: ID!, $projectCharterId: ID!) {
    unlinkGoalFromProjectCharter(goalId: $goalId, projectCharterId: $projectCharterId)
  }
`

/** Fetches the project's business case (for goal link selection). */
export const GET_BUSINESS_CASE_BY_PROJECT_ID = gql`
  query GetBusinessCaseByProjectId($projectId: ID!) {
    businessCaseByProjectId(projectId: $projectId) {
      id
      status
      project {
        id
        name
      }
    }
  }
`

/** Fetches the project's project charter (for goal link selection). */
export const GET_PROJECT_CHARTER_BY_PROJECT_ID = gql`
  query GetProjectCharterByProjectId($projectId: ID!) {
    projectCharterByProjectId(projectId: $projectId) {
      id
      status
      project {
        id
        name
      }
    }
  }
`

/** Links a goal to a project initiation request. */
export const LINK_GOAL_TO_INITIATION_REQUEST = gql`
  mutation LinkGoalToInitiationRequest($goalId: ID!, $initiationRequestId: ID!) {
    linkGoalToInitiationRequest(goalId: $goalId, initiationRequestId: $initiationRequestId)
  }
`

/** Removes the link between a goal and a project initiation request. */
export const UNLINK_GOAL_FROM_INITIATION_REQUEST = gql`
  mutation UnlinkGoalFromInitiationRequest($goalId: ID!, $initiationRequestId: ID!) {
    unlinkGoalFromInitiationRequest(goalId: $goalId, initiationRequestId: $initiationRequestId)
  }
`

/** Fetches the initiation requests for a project (for goal link selection). */
export const GET_INITIATION_REQUESTS_BY_PROJECT_ID = gql`
  query GetInitiationRequestsByProjectId($projectId: ID!) {
    initiationRequestsByProjectId(projectId: $projectId) {
      id
      name
      status
    }
  }
`

/** Fetches initiation requests for a given scope (project, program, or portfolio). */
export const GET_INITIATION_REQUESTS_BY_SCOPE_ID = gql`
  query GetInitiationRequestsByScopeId($scopeId: ID!, $scopeType: ScopeType!) {
    initiationRequestsByScopeId(scopeId: $scopeId, scopeType: $scopeType) {
      id
      name
      status
    }
  }
`

/** Creates a peer relationship between two goals. */
export const LINK_GOALS = gql`
  mutation LinkGoals($goalId: ID!, $relatedGoalId: ID!) {
    linkGoals(goalId: $goalId, relatedGoalId: $relatedGoalId)
  }
`

/** Removes a peer relationship between two goals. */
export const UNLINK_GOALS = gql`
  mutation UnlinkGoals($goalId: ID!, $relatedGoalId: ID!) {
    unlinkGoals(goalId: $goalId, relatedGoalId: $relatedGoalId)
  }
`

/** Links a goal to a requirement. */
export const LINK_GOAL_TO_REQUIREMENT = gql`
  mutation LinkGoalToRequirement($goalId: ID!, $requirementId: ID!) {
    linkGoalToRequirement(goalId: $goalId, requirementId: $requirementId)
  }
`

/** Removes the link between a goal and a requirement. */
export const UNLINK_GOAL_FROM_REQUIREMENT = gql`
  mutation UnlinkGoalFromRequirement($goalId: ID!, $requirementId: ID!) {
    unlinkGoalFromRequirement(goalId: $goalId, requirementId: $requirementId)
  }
`

// ---------------------------------------------------------------------------
// Query key factories
// ---------------------------------------------------------------------------

/**
 * TanStack Query key for the scoped goals list.
 *
 * @param scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns Readonly tuple used as the TanStack Query cache key.
 */
export const GOALS_QUERY_KEY = (scopeType: string, scopeId: string) =>
  ['goals', scopeType, scopeId] as const

/**
 * TanStack Query key for a single goal detail.
 *
 * @param id - The goal ID.
 * @returns Readonly tuple used as the TanStack Query cache key.
 */
export const GOAL_QUERY_KEY = (id: string) => ['goal', id] as const

/**
 * TanStack Query key for the business case of a project.
 *
 * @param projectId - The project ID.
 * @returns Readonly tuple used as the TanStack Query cache key.
 */
export const BUSINESS_CASE_BY_PROJECT_QUERY_KEY = (projectId: string) =>
  ['businessCase', 'byProject', projectId] as const

/**
 * TanStack Query key for the project charter of a project.
 *
 * @param projectId - The project ID.
 * @returns Readonly tuple used as the TanStack Query cache key.
 */
export const PROJECT_CHARTER_BY_PROJECT_QUERY_KEY = (projectId: string) =>
  ['projectCharter', 'byProject', projectId] as const

/**
 * TanStack Query key for the initiation requests of a project.
 *
 * @param projectId - The project ID.
 * @returns Readonly tuple used as the TanStack Query cache key.
 */
export const INITIATION_REQUESTS_BY_PROJECT_QUERY_KEY = (projectId: string) =>
  ['initiationRequests', 'byProject', projectId] as const

/**
 * TanStack Query key for initiation requests scoped to a given scope entity.
 *
 * @param scopeId - The ID of the scope entity (project, program, or portfolio).
 * @param scopeType - The type of the scope entity.
 * @returns Readonly tuple used as the TanStack Query cache key.
 */
export const INITIATION_REQUESTS_BY_SCOPE_QUERY_KEY = (scopeId: string, scopeType: string) =>
  ['initiationRequests', 'byScope', scopeType, scopeId] as const

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const personSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  mail: z.string(),
})

const entityRefSchema = z.object({ id: z.string(), name: z.string() })
const entityRefWithStatusSchema = z.object({ id: z.string(), status: z.string() })
const goalRefSchema = z.object({ id: z.string(), name: z.string() })
const requirementRefSchema = z.object({ id: z.string(), name: z.string(), status: z.string() })
const scopeSchema = z.object({
  id: z.string(),
  scopeType: z.enum(['Project', 'Program', 'Portfolio']),
})

/** Recursive Zod schema for a goal list item (uses z.lazy for self-reference). */
export const goalListItemSchema: z.ZodType<GoalListItem> = z.lazy(() =>
  z.object({
    id: z.string(),
    version: z.number().int(),
    sortOrder: z.number().int(),
    name: z.string(),
    description: z.string().nullable().default(null),
    progress: z.number().int().min(0).max(100),
    dueDate: z.string().nullable(),
    keyResults: z.string().nullable().default(null),
    impact: z.string().nullable().default(null),
    outcome: z.string().nullable().default(null),
    otherInformation: z.string().nullable().default(null),
    acceptedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    creator: personSchema.nullable(),
    updater: personSchema.nullable().default(null),
    acceptedBy: personSchema.nullable(),
    parent: z.object({ id: z.string() }).nullable(),
    children: z.array(goalListItemSchema).default([]),
    scope: scopeSchema.optional(),
    parentLevelGoalName: z.string().nullable(),
  }),
)

/** Zod schema for the GetGoals query response. */
export const goalsResponseSchema = z.object({ goals: z.array(goalListItemSchema) })

/** Zod schema for the GetGoal detail query response. */
export const goalDetailSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  sortOrder: z.number().int(),
  name: z.string(),
  description: z.string().nullable(),
  progress: z.number().int().min(0).max(100),
  dueDate: z.string().nullable(),
  keyResults: z.string().nullable(),
  impact: z.string().nullable(),
  outcome: z.string().nullable(),
  otherInformation: z.string().nullable(),
  acceptedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  creator: personSchema.nullable(),
  updater: personSchema.nullable(),
  acceptedBy: personSchema.nullable(),
  parent: z.object({ id: z.string() }).nullable(),
  children: z.array(z.object({ id: z.string() })).default([]),
  scope: scopeSchema.optional(),
  parentLevelGoalName: z.string().nullable(),
  parentLevelGoal: goalRefSchema.nullable(),
  relatedGoals: z.array(goalRefSchema),
  linkedRequirements: z.array(requirementRefSchema),
  businessCase: entityRefWithStatusSchema.nullable(),
  projectCharter: entityRefWithStatusSchema.nullable(),
  initiationRequests: z.array(entityRefSchema).default([]),
})

/** Zod schema for the GetGoal query response wrapper. */
export const goalDetailResponseSchema = z.object({ goal: goalDetailSchema.nullable() })

const goalMutationItemSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  name: z.string(),
  progress: z.number().int().min(0).max(100),
  dueDate: z.string().nullable(),
  keyResults: z.string().nullable().default(null),
  otherInformation: z.string().nullable().default(null),
  acceptedAt: z.string().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string(),
  acceptedBy: personSchema.nullable(),
  parent: z.object({ id: z.string() }).nullable(),
  parentLevelGoalName: z.string().nullable(),
})

/** Zod schema for the CreateGoal mutation response. */
export const createGoalResponseSchema = z.object({ createGoal: goalMutationItemSchema })

/** Zod schema for the UpdateGoal mutation response. */
export const updateGoalResponseSchema = z.object({ updateGoal: goalMutationItemSchema })

const parentRefSchema = z.object({ id: z.string() }).nullable()
const goalLinkRefSchema = z.object({ id: z.string(), name: z.string() }).nullable()

/** Zod schema for the SetGoalParent mutation response. */
export const setGoalParentResponseSchema = z.object({
  setGoalParent: z.object({ id: z.string(), version: z.number().int(), parent: parentRefSchema }),
})

/** Zod schema for the ClearGoalParent mutation response. */
export const clearGoalParentResponseSchema = z.object({
  clearGoalParent: z.object({ id: z.string(), version: z.number().int(), parent: parentRefSchema }),
})

/** Zod schema for the SetParentLevelGoal mutation response. */
export const setParentLevelGoalResponseSchema = z.object({
  setParentLevelGoal: z.object({
    id: z.string(),
    version: z.number().int(),
    parentLevelGoal: goalLinkRefSchema,
    parentLevelGoalName: z.string().nullable(),
  }),
})

/** Zod schema for the ClearParentLevelGoal mutation response. */
export const clearParentLevelGoalResponseSchema = z.object({
  clearParentLevelGoal: z.object({
    id: z.string(),
    version: z.number().int(),
    parentLevelGoal: goalLinkRefSchema,
    parentLevelGoalName: z.string().nullable(),
  }),
})

const entityRefWithStatusAndProjectSchema = z.object({
  id: z.string(),
  status: z.string(),
  project: z.object({ id: z.string(), name: z.string() }).nullable().optional(),
})

/** Zod schema for the GetBusinessCaseByProjectId query response. */
export const businessCaseByProjectResponseSchema = z.object({
  businessCaseByProjectId: entityRefWithStatusAndProjectSchema.nullable(),
})

/** Zod schema for the GetProjectCharterByProjectId query response. */
export const projectCharterByProjectResponseSchema = z.object({
  projectCharterByProjectId: entityRefWithStatusAndProjectSchema.nullable(),
})

/** Zod schema for the GetInitiationRequestsByProjectId query response. */
export const initiationRequestsByProjectResponseSchema = z.object({
  initiationRequestsByProjectId: z.array(
    z.object({ id: z.string(), name: z.string(), status: z.string().nullable() }),
  ),
})

/** Zod schema for the GetInitiationRequestsByScopeId query response. */
export const initiationRequestsByScopeResponseSchema = z.object({
  initiationRequestsByScopeId: z.array(
    z.object({ id: z.string(), name: z.string(), status: z.string().nullable() }),
  ),
})

/** Reorders goals within a scope by providing the full ordered ID list. */
export const REORDER_GOALS = gql`
  mutation ReorderGoals($input: ReorderGoalsInput!) {
    reorderGoals(input: $input) {
      id
      sortOrder
    }
  }
`

/** Zod schema for the ReorderGoals mutation response. */
export const reorderGoalsResponseSchema = z.object({
  reorderGoals: z.array(z.object({ id: z.string(), sortOrder: z.number().int() })),
})
