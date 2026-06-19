import { z } from 'zod'

/**
 * Zod schema for a Person reference (responsible / linked member).
 * Validates the shape returned by the `responsible` and `linkedMember` GraphQL fields.
 */
export const personSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  mail: z.string().nullable(),
})

/**
 * Zod schema for the scope that owns a stakeholder resource.
 * Validates the `scope` field returned by stakeholder GraphQL operations.
 */
export const scopeSchema = z.object({
  id: z.string(),
  name: z.string(),
  scopeType: z.enum(['Project', 'Program', 'Portfolio']),
})

/** Zod schema for a normalised [0, 1] matrix position coordinate pair. */
export const matrixPositionSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
})

/**
 * GraphQL selection set shared by every query/mutation that returns a StakeholderEntry.
 * Import this constant to avoid duplicating the field list across multiple documents.
 */
export const STAKEHOLDER_ENTRY_FIELDS = /* GraphQL */ `
  id
  version
  name
  role
  contactGroup
  email
  email2
  email3
  phone
  phone2
  phone3
  preferredCommunicationType
  matrixPosition {
    x
    y
  }
  typeOfAffectedness
  conflictPotential
  expectations
  responsible {
    id
    firstName
    lastName
    mail
  }
  inclusionMeasures
  linkedMember {
    id
    firstName
    lastName
    mail
  }
  behaviouralStrategy
  scope {
    id
    name
    scopeType
  }
  createdAt
  updatedAt
`

/** Zod schema validating the full shape of a stakeholder entry returned from the GraphQL API. */
export const stakeholderEntrySchema = z.object({
  id: z.string(),
  version: z.number().int(),
  name: z.string(),
  role: z.string(),
  contactGroup: z.enum(['INTERNAL', 'CUSTOMER', 'SUPPLIER', 'PARTNER']),
  email: z.string().nullable(),
  email2: z.string().nullable(),
  email3: z.string().nullable(),
  phone: z.string().nullable(),
  phone2: z.string().nullable(),
  phone3: z.string().nullable(),
  preferredCommunicationType: z.string().nullable(),
  matrixPosition: matrixPositionSchema.nullable(),
  typeOfAffectedness: z.enum(['POSITIVE', 'NEGATIVE', 'NEUTRAL']).nullable(),
  conflictPotential: z.enum(['LOW', 'MEDIUM', 'HIGH']).nullable(),
  expectations: z.string().nullable(),
  responsible: personSchema.nullable(),
  inclusionMeasures: z.string().nullable(),
  linkedMember: personSchema.nullable(),
  behaviouralStrategy: z
    .enum(['MONITOR', 'KEEP_INFORMED', 'KEEP_SATISFIED', 'MANAGE_CLOSELY'])
    .nullable(),
  scope: scopeSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})
