import { gql } from 'graphql-request'
import { z } from 'zod'

import {
  activeEscalationRefSchema,
  personSchema,
  PESTEL_ENUM,
  statusLookupSchema,
} from './sharedSchemas'

/** GraphQL query document for fetching a scoped list of issue entries. */
export const GET_ISSUE_ENTRIES = gql`
  query GetIssueEntries($filter: IssueEntryFilter, $orderBy: OrderBy) {
    issueEntries(filter: $filter, orderBy: $orderBy) {
      id
      version
      entryNumber
      name
      pestelCategory
      description
      status
      identificationDate
      urgency
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

/** GraphQL query document for fetching a single issue entry by ID (includes linked entries). */
export const GET_ISSUE_ENTRY = gql`
  query GetIssueEntry($id: ID!) {
    issueEntry(id: $id) {
      id
      version
      entryNumber
      name
      pestelCategory
      description
      status
      identificationDate
      urgency
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
      linkedRisks {
        item {
          id
          entryNumber
          name
          status
          type
        }
      }
      linkedProblems {
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

/** GraphQL query document for loading the issue entry status lookup table. */
export const LOOKUP_ISSUE_ENTRY_STATUS = gql`
  query LookupIssueEntryStatus {
    lookupIssueEntryStatus {
      status
      description
      displayOrder
    }
  }
`

/** GraphQL mutation document for creating a new issue entry. */
export const CREATE_ISSUE_ENTRY = gql`
  mutation CreateIssueEntry($input: CreateIssueEntryInput!) {
    createIssueEntry(input: $input) {
      id
      version
      entryNumber
      name
      pestelCategory
      description
      status
      identificationDate
      urgency
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

/** GraphQL mutation document for updating an existing issue entry. */
export const UPDATE_ISSUE_ENTRY = gql`
  mutation UpdateIssueEntry($id: ID!, $input: UpdateIssueEntryInput!) {
    updateIssueEntry(id: $id, input: $input) {
      id
      version
      entryNumber
      name
      pestelCategory
      description
      status
      identificationDate
      urgency
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

const issueEntrySchema = z.object({
  id: z.string(),
  version: z.number().int(),
  entryNumber: z.string(),
  name: z.string(),
  pestelCategory: z.enum(PESTEL_ENUM),
  description: z.string().nullable(),
  status: z.string(),
  identificationDate: z.string(),
  urgency: z.number().int().nullable(),
  impact: z.number().int().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  activeEscalations: z.array(activeEscalationRefSchema).default([]),
  everEscalated: z.boolean().optional(),
  owner: personSchema.nullable(),
  reporter: personSchema.nullable(),
  linkedRisks: z
    .array(
      z.object({
        item: z.object({
          id: z.string(),
          entryNumber: z.string(),
          name: z.string(),
          status: z.string(),
          type: z.string(),
        }),
      }),
    )
    .optional(),
  linkedProblems: z
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

/** Zod schema for the response of GET_ISSUE_ENTRIES. */
export const getIssueEntriesResponseSchema = z.object({
  issueEntries: z.array(issueEntrySchema),
})

/** Zod schema for the response of GET_ISSUE_ENTRY. */
export const getIssueEntryResponseSchema = z.object({
  issueEntry: issueEntrySchema.nullable(),
})

/** Zod schema for the CREATE_ISSUE_ENTRY mutation response. */
export const createIssueEntryMutationResponseSchema = z.object({
  createIssueEntry: issueEntrySchema,
})

/** Zod schema for the UPDATE_ISSUE_ENTRY mutation response. */
export const updateIssueEntryMutationResponseSchema = z.object({
  updateIssueEntry: issueEntrySchema,
})

/** Zod schema for LOOKUP_ISSUE_ENTRY_STATUS response. */
export const lookupIssueEntryStatusResponseSchema = z.object({
  lookupIssueEntryStatus: z.array(statusLookupSchema),
})

/**
 * TanStack Query key factory for the scoped issue entries list cache.
 *
 * @param scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param scopeId - The domain entity ID.
 * @returns A readonly tuple used as the TanStack Query cache key.
 */
export const ISSUE_ENTRIES_QUERY_KEY = (scopeType: string, scopeId: string) =>
  ['issueEntries', scopeType, scopeId] as const

/** TanStack Query key for the issue entry status lookup (static, cached indefinitely). */
export const ISSUE_ENTRY_STATUSES_QUERY_KEY = ['issueEntryStatuses'] as const

/**
 * TanStack Query key factory for a single issue entry cache entry.
 *
 * @param id - The issue entry ID.
 * @returns A readonly tuple used as the TanStack Query cache key.
 */
export const ISSUE_ENTRY_QUERY_KEY = (id: string) => ['issueEntry', id] as const
