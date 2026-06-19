import { z } from 'zod'

import { PESTEL_CATEGORY } from '../utils/pestelOptions'
import type { PestelCategory } from '../utils/pestelOptions'

/** Zod schema for a person reference (owner/reporter) returned by risk-register API responses. */
export const personSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  mail: z.string(),
})

/** Zod schema for an active escalation reference embedded in risk, issue, and problem entries. */
export const activeEscalationRefSchema = z.object({
  id: z.string(),
  status: z.enum(['ACTIVE', 'RETURNED', 'ESCALATED']),
  scope: z.object({ id: z.string(), scopeType: z.string() }).nullable(),
  escalatedAt: z.string(),
  escalationChain: z.string().nullable().optional(),
})

/** Tuple of all valid PESTEL category values for use in Zod enum schemas. */
export const PESTEL_ENUM = Object.values(PESTEL_CATEGORY) as [PestelCategory, ...PestelCategory[]]

/** Zod schema for a single status lookup entry shared by risk, issue, and problem APIs. */
export const statusLookupSchema = z.object({
  status: z.string(),
  description: z.string(),
  displayOrder: z.number().int(),
})
