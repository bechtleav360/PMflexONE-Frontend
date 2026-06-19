import { gql } from 'graphql-request'
import { z } from 'zod'

import {
  activeEscalationRefSchema,
  personSchema,
  PESTEL_ENUM,
  statusLookupSchema,
} from './sharedSchemas'

/** GraphQL query document for fetching a scoped list of problem entries. */
export const GET_PROBLEM_ENTRIES = gql`
  query GetProblemEntries($filter: ProblemEntryFilter, $orderBy: OrderBy) {
    problemEntries(filter: $filter, orderBy: $orderBy) {
      id
      version
      entryNumber
      name
      pestelCategory
      description
      status
      identificationDate
      impact
      createdAt
      updatedAt
      activeEscalations {
        id
        status
        scope {
          id
          scopeType
        }
        escalatedAt
        escalationChain
      }
      everEscalated
      owner {
        id
        firstName
        lastName
        mail
      }
      reporter {
        id
        firstName
        lastName
        mail
      }
    }
  }
`

/** GraphQL query document for fetching a single problem entry by ID (includes linked issues). */
export const GET_PROBLEM_ENTRY = gql`
  query GetProblemEntry($id: ID!) {
    problemEntry(id: $id) {
      id
      version
      entryNumber
      name
      pestelCategory
      description
      status
      identificationDate
      impact
      createdAt
      updatedAt
      activeEscalations {
        id
        status
        scope {
          id
          scopeType
        }
        escalatedAt
        escalationChain
      }
      everEscalated
      owner {
        id
        firstName
        lastName
        mail
      }
      reporter {
        id
        firstName
        lastName
        mail
      }
      linkedIssues {
        item {
          id
          entryNumber
          name
          status
        }
      }
    }
  }
`

/** GraphQL query document for loading the static problem entry status lookup table. */
export const LOOKUP_PROBLEM_ENTRY_STATUS = gql`
  query LookupProblemEntryStatus {
    lookupProblemEntryStatus {
      status
      description
      displayOrder
    }
  }
`

/** GraphQL mutation document for creating a new problem entry. */
export const CREATE_PROBLEM_ENTRY = gql`
  mutation CreateProblemEntry($input: CreateProblemEntryInput!) {
    createProblemEntry(input: $input) {
      id
      version
      entryNumber
      name
      pestelCategory
      description
      status
      identificationDate
      impact
      createdAt
      updatedAt
      owner {
        id
        firstName
        lastName
        mail
      }
      reporter {
        id
        firstName
        lastName
        mail
      }
    }
  }
`

/** GraphQL mutation document for updating an existing problem entry. */
export const UPDATE_PROBLEM_ENTRY = gql`
  mutation UpdateProblemEntry($id: ID!, $input: UpdateProblemEntryInput!) {
    updateProblemEntry(id: $id, input: $input) {
      id
      version
      entryNumber
      name
      pestelCategory
      description
      status
      identificationDate
      impact
      createdAt
      updatedAt
      owner {
        id
        firstName
        lastName
        mail
      }
      reporter {
        id
        firstName
        lastName
        mail
      }
    }
  }
`

/** GraphQL mutation document for escalating an issue entry into a problem entry. */
export const CREATE_PROBLEM_FROM_ISSUE = gql`
  mutation CreateProblemFromIssue($issueEntryId: ID!, $version: Int!) {
    createProblemFromIssue(issueEntryId: $issueEntryId, version: $version) {
      id
      version
      entryNumber
      name
      pestelCategory
      description
      status
      createdAt
      updatedAt
    }
  }
`

/** GraphQL mutation document for manually linking a risk entry to an issue entry. */
export const LINK_RISK_TO_ISSUE = gql`
  mutation LinkRiskToIssue($riskEntryId: ID!, $issueEntryId: ID!) {
    linkRiskToIssue(riskEntryId: $riskEntryId, issueEntryId: $issueEntryId)
  }
`

/** GraphQL mutation document for manually unlinking a risk entry from an issue entry. */
export const UNLINK_RISK_FROM_ISSUE = gql`
  mutation UnlinkRiskFromIssue($riskEntryId: ID!, $issueEntryId: ID!) {
    unlinkRiskFromIssue(riskEntryId: $riskEntryId, issueEntryId: $issueEntryId)
  }
`

/** GraphQL mutation document for manually linking an issue entry to a problem entry. */
export const LINK_ISSUE_TO_PROBLEM = gql`
  mutation LinkIssueToProblem($issueEntryId: ID!, $problemEntryId: ID!) {
    linkIssueToProblem(issueEntryId: $issueEntryId, problemEntryId: $problemEntryId)
  }
`

/** GraphQL mutation document for manually unlinking an issue entry from a problem entry. */
export const UNLINK_ISSUE_FROM_PROBLEM = gql`
  mutation UnlinkIssueFromProblem($issueEntryId: ID!, $problemEntryId: ID!) {
    unlinkIssueFromProblem(issueEntryId: $issueEntryId, problemEntryId: $problemEntryId)
  }
`

const problemEntrySchema = z.object({
  id: z.string(),
  version: z.number().int(),
  entryNumber: z.string(),
  name: z.string(),
  pestelCategory: z.enum(PESTEL_ENUM),
  description: z.string().nullable(),
  status: z.string(),
  identificationDate: z.string(),
  impact: z.number().int().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  activeEscalations: z.array(activeEscalationRefSchema).default([]),
  everEscalated: z.boolean().optional(),
  owner: personSchema.nullable(),
  reporter: personSchema.nullable(),
  linkedIssues: z
    .array(
      z.object({
        item: z.object({
          id: z.string(),
          entryNumber: z.string(),
          name: z.string(),
          status: z.string(),
        }),
      }),
    )
    .optional(),
})

/** Zod schema for the response of GET_PROBLEM_ENTRIES. */
export const getProblemEntriesResponseSchema = z.object({
  problemEntries: z.array(problemEntrySchema),
})

/** Zod schema for the response of GET_PROBLEM_ENTRY. */
export const getProblemEntryResponseSchema = z.object({
  problemEntry: problemEntrySchema.nullable(),
})

/** Zod schema for the CREATE_PROBLEM_ENTRY mutation response. */
export const createProblemEntryMutationResponseSchema = z.object({
  createProblemEntry: problemEntrySchema,
})

/** Zod schema for the UPDATE_PROBLEM_ENTRY mutation response. */
export const updateProblemEntryMutationResponseSchema = z.object({
  updateProblemEntry: problemEntrySchema,
})

const createProblemFromIssueEntrySchema = z.object({
  id: z.string(),
  version: z.number().int(),
  entryNumber: z.string(),
  name: z.string(),
  pestelCategory: z.enum(PESTEL_ENUM),
  description: z.string().nullable(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

/** Zod schema for the CREATE_PROBLEM_FROM_ISSUE mutation response. */
export const createProblemFromIssueResponseSchema = z.object({
  createProblemFromIssue: createProblemFromIssueEntrySchema,
})

/** Zod schema for LOOKUP_PROBLEM_ENTRY_STATUS response. */
export const lookupProblemEntryStatusResponseSchema = z.object({
  lookupProblemEntryStatus: z.array(statusLookupSchema),
})

/**
 * TanStack Query key factory for the scoped problem entries list cache.
 *
 * @param scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param scopeId - The domain entity ID.
 * @returns A readonly tuple used as the TanStack Query cache key.
 */
export const PROBLEM_ENTRIES_QUERY_KEY = (scopeType: string, scopeId: string) =>
  ['problemEntries', scopeType, scopeId] as const

/** TanStack Query key for the problem entry status lookup (static, cached indefinitely). */
export const PROBLEM_ENTRY_STATUSES_QUERY_KEY = ['problemEntryStatuses'] as const

/**
 * TanStack Query key factory for a single problem entry cache entry.
 *
 * @param id - The problem entry ID.
 * @returns A readonly tuple used as the TanStack Query cache key.
 */
export const PROBLEM_ENTRY_QUERY_KEY = (id: string) => ['problemEntry', id] as const
