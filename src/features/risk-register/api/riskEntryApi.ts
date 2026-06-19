import { gql } from 'graphql-request'
import { z } from 'zod'

import { RISK_ENTRIES_QUERY_KEY } from '@/entities/risk-entry'

import {
  activeEscalationRefSchema,
  personSchema,
  PESTEL_ENUM,
  statusLookupSchema,
} from './sharedSchemas'

export { RISK_ENTRIES_QUERY_KEY }

/** GraphQL query document for fetching a scoped list of risk/opportunity entries. */
export const GET_RISK_ENTRIES = gql`
  query GetRiskEntries($filter: RiskEntryFilter, $orderBy: OrderBy) {
    riskEntries(filter: $filter, orderBy: $orderBy) {
      id
      version
      entryNumber
      type
      name
      pestelCategory
      description
      status
      identificationDate
      probability
      impact
      riskLevel
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

/** GraphQL query document for fetching a single risk entry by ID (includes linked issues). */
export const GET_RISK_ENTRY = gql`
  query GetRiskEntry($id: ID!) {
    riskEntry(id: $id) {
      id
      version
      entryNumber
      type
      name
      pestelCategory
      description
      status
      identificationDate
      probability
      impact
      riskLevel
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

/** GraphQL query document for loading the static risk entry status lookup table. */
export const LOOKUP_RISK_ENTRY_STATUS = gql`
  query LookupRiskEntryStatus {
    lookupRiskEntryStatus {
      status
      description
      displayOrder
    }
  }
`

/** GraphQL mutation document for creating a new risk or opportunity entry. */
export const CREATE_RISK_ENTRY = gql`
  mutation CreateRiskEntry($input: CreateRiskEntryInput!) {
    createRiskEntry(input: $input) {
      id
      version
      entryNumber
      type
      name
      pestelCategory
      description
      status
      identificationDate
      probability
      impact
      riskLevel
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

/** GraphQL mutation document for updating an existing risk or opportunity entry. */
export const UPDATE_RISK_ENTRY = gql`
  mutation UpdateRiskEntry($id: ID!, $input: UpdateRiskEntryInput!) {
    updateRiskEntry(id: $id, input: $input) {
      id
      version
      entryNumber
      type
      name
      pestelCategory
      description
      status
      identificationDate
      probability
      impact
      riskLevel
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

/** GraphQL mutation document for escalating a risk entry into an issue entry. */
export const CREATE_ISSUE_FROM_RISK = gql`
  mutation CreateIssueFromRisk($riskEntryId: ID!, $version: Int!) {
    createIssueFromRisk(riskEntryId: $riskEntryId, version: $version) {
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

const riskEntrySchema = z.object({
  id: z.string(),
  version: z.number().int(),
  entryNumber: z.string(),
  type: z.enum(['RISK', 'OPPORTUNITY']),
  name: z.string(),
  pestelCategory: z.enum(PESTEL_ENUM),
  description: z.string().nullable(),
  status: z.string(),
  identificationDate: z.string(),
  probability: z.number().int().nullable(),
  impact: z.number().int().nullable(),
  riskLevel: z.number().int().nullable(),
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

/** Zod schema for the response of GET_RISK_ENTRIES. */
export const getRiskEntriesResponseSchema = z.object({
  riskEntries: z.array(riskEntrySchema),
})

/** Zod schema for the response of GET_RISK_ENTRY. */
export const getRiskEntryResponseSchema = z.object({
  riskEntry: riskEntrySchema.nullable(),
})

/** Zod schema for the CREATE_RISK_ENTRY mutation response. */
export const createRiskEntryMutationResponseSchema = z.object({
  createRiskEntry: riskEntrySchema,
})

/** Zod schema for the UPDATE_RISK_ENTRY mutation response. */
export const updateRiskEntryMutationResponseSchema = z.object({
  updateRiskEntry: riskEntrySchema,
})

const createIssueFromRiskEntrySchema = z.object({
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

/** Zod schema for the CREATE_ISSUE_FROM_RISK mutation response. */
export const createIssueFromRiskResponseSchema = z.object({
  createIssueFromRisk: createIssueFromRiskEntrySchema,
})

/** Zod schema for LOOKUP_RISK_ENTRY_STATUS response. */
export const lookupRiskEntryStatusResponseSchema = z.object({
  lookupRiskEntryStatus: z.array(statusLookupSchema),
})

/** TanStack Query key for the risk entry status lookup (static, cached indefinitely). */
export const RISK_ENTRY_STATUSES_QUERY_KEY = ['riskEntryStatuses'] as const

/**
 * TanStack Query key factory for a single risk entry cache entry.
 *
 * @param id - The risk entry ID.
 * @returns A readonly tuple used as the TanStack Query cache key.
 */
export const RISK_ENTRY_QUERY_KEY = (id: string) => ['riskEntry', id] as const
