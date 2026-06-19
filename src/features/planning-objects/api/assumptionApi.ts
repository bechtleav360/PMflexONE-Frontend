import { gql } from 'graphql-request'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// GraphQL documents
// ---------------------------------------------------------------------------

/** Fetches the scoped list of assumptions. */
export const GET_ASSUMPTIONS = gql`
  query GetAssumptions($filter: AssumptionFilter) {
    assumptions(filter: $filter) {
      id
      version
      name
      description
      dueDate
      validationStatus
      isRisk
      otherInformation
      createdAt
      updatedAt
      creator {
        id
        firstName
        lastName
        mail
      }
      validatedBy {
        id
        firstName
        lastName
        mail
      }
      linkedRisk {
        id
        name
        status
      }
      relatedRisks: linkedRisks {
        id
        name
      }
    }
  }
`

/** Fetches a single assumption with full detail. */
export const GET_ASSUMPTION = gql`
  query GetAssumption($id: ID!) {
    assumption(id: $id) {
      id
      version
      name
      description
      dueDate
      validationStatus
      isRisk
      otherInformation
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
      validatedBy {
        id
        firstName
        lastName
        mail
      }
      linkedRisk {
        id
        name
        status
      }
      relatedRisks: linkedRisks {
        id
        name
      }
      projectCharter {
        id
        status
      }
    }
  }
`

/** Fetches the available assumption validation status lookup values. */
export const LOOKUP_ASSUMPTION_VALIDATION_STATUS = gql`
  query LookupAssumptionValidationStatus {
    lookupAssumptionValidationStatus {
      status
      description
      displayOrder
    }
  }
`

/** Creates a new assumption. */
export const CREATE_ASSUMPTION = gql`
  mutation CreateAssumption($input: CreateAssumptionInput!) {
    createAssumption(input: $input) {
      id
      version
      name
      validationStatus
      isRisk
      dueDate
      otherInformation
      createdAt
      updatedAt
      validatedBy {
        id
        firstName
        lastName
        mail
      }
      linkedRisk {
        id
        name
        status
      }
    }
  }
`

/** Updates an existing assumption. */
export const UPDATE_ASSUMPTION = gql`
  mutation UpdateAssumption($input: UpdateAssumptionInput!) {
    updateAssumption(input: $input) {
      id
      version
      name
      validationStatus
      isRisk
      dueDate
      otherInformation
      updatedAt
      validatedBy {
        id
        firstName
        lastName
        mail
      }
      linkedRisk {
        id
        name
        status
      }
    }
  }
`

/** Deletes an assumption by ID and version. */
export const DELETE_ASSUMPTION = gql`
  mutation DeleteAssumption($id: ID!, $version: Int!) {
    deleteAssumption(id: $id, version: $version)
  }
`

/** Links an assumption to a project charter. */
export const LINK_ASSUMPTION_TO_PROJECT_CHARTER = gql`
  mutation LinkAssumptionToProjectCharter($assumptionId: ID!, $projectCharterId: ID!) {
    linkAssumptionToProjectCharter(assumptionId: $assumptionId, projectCharterId: $projectCharterId)
  }
`

/** Removes the link between an assumption and a project charter. */
export const UNLINK_ASSUMPTION_FROM_PROJECT_CHARTER = gql`
  mutation UnlinkAssumptionFromProjectCharter($assumptionId: ID!, $projectCharterId: ID!) {
    unlinkAssumptionFromProjectCharter(
      assumptionId: $assumptionId
      projectCharterId: $projectCharterId
    )
  }
`

/** Manually links an assumption to an existing risk entry. */
export const LINK_ASSUMPTION_TO_RISK_ENTRY = gql`
  mutation LinkAssumptionToRiskEntry($assumptionId: ID!, $riskEntryId: ID!) {
    linkAssumptionToRiskEntry(assumptionId: $assumptionId, riskEntryId: $riskEntryId)
  }
`

/** Removes the manual link between an assumption and a risk entry. */
export const UNLINK_ASSUMPTION_FROM_RISK_ENTRY = gql`
  mutation UnlinkAssumptionFromRiskEntry($assumptionId: ID!, $riskEntryId: ID!) {
    unlinkAssumptionFromRiskEntry(assumptionId: $assumptionId, riskEntryId: $riskEntryId)
  }
`

// ---------------------------------------------------------------------------
// Query key factories
// ---------------------------------------------------------------------------

/**
 * TanStack Query key for the scoped assumptions list.
 *
 * @param scopeType - Scope context (e.g. `'Project'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns Readonly tuple used as the TanStack Query cache key.
 */
export const ASSUMPTIONS_QUERY_KEY = (scopeType: string, scopeId: string) =>
  ['assumptions', scopeType, scopeId] as const

/**
 * TanStack Query key for a single assumption detail.
 *
 * @param id - The assumption ID.
 * @returns Readonly tuple used as the TanStack Query cache key.
 */
export const ASSUMPTION_QUERY_KEY = (id: string) => ['assumption', id] as const

/** TanStack Query key for the assumption validation status lookup (static, never stale). */
export const ASSUMPTION_VALIDATION_STATUSES_QUERY_KEY = ['assumptionValidationStatuses'] as const

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const personSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  mail: z.string(),
})

const linkedRiskSchema = z.object({ id: z.string(), name: z.string(), status: z.string() })
const relatedRiskSchema = z.object({ id: z.string(), name: z.string() })
const entityRefWithStatusSchema = z.object({ id: z.string(), status: z.string() })
const scopeSchema = z.object({ id: z.string(), scopeType: z.literal('Project') })

/** Zod schema for a single assumption list item. */
export const assumptionListItemSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  name: z.string(),
  description: z.string().nullable(),
  dueDate: z.string().nullable(),
  validationStatus: z.string(),
  isRisk: z.boolean(),
  otherInformation: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  creator: personSchema.nullable(),
  updater: personSchema.nullable().default(null),
  validatedBy: personSchema.nullable(),
  linkedRisk: linkedRiskSchema.nullable(),
  relatedRisks: z.array(relatedRiskSchema).default([]),
  projectCharter: entityRefWithStatusSchema.nullable().default(null),
  scope: scopeSchema.optional(),
})

/** Zod schema for the GetAssumptions query response. */
export const assumptionsResponseSchema = z.object({
  assumptions: z.array(assumptionListItemSchema),
})

/** Zod schema for the GetAssumption detail query response. */
export const assumptionDetailResponseSchema = z.object({
  assumption: assumptionListItemSchema.nullable(),
})

/** Zod schema for the assumption validation status lookup entry. */
export const assumptionValidationStatusSchema = z.object({
  status: z.string(),
  description: z.string(),
  displayOrder: z.number().int(),
})

/** Zod schema for the LookupAssumptionValidationStatus query response. */
export const assumptionValidationStatusesResponseSchema = z.object({
  lookupAssumptionValidationStatus: z.array(assumptionValidationStatusSchema),
})

const assumptionMutationItemSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  name: z.string(),
  dueDate: z.string().nullable(),
  validationStatus: z.string(),
  isRisk: z.boolean(),
  otherInformation: z.string().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string(),
  validatedBy: personSchema.nullable(),
  linkedRisk: linkedRiskSchema.nullable(),
})

/** Zod schema for the CreateAssumption mutation response. */
export const createAssumptionResponseSchema = z.object({
  createAssumption: assumptionMutationItemSchema,
})

/** Zod schema for the UpdateAssumption mutation response. */
export const updateAssumptionResponseSchema = z.object({
  updateAssumption: assumptionMutationItemSchema,
})
