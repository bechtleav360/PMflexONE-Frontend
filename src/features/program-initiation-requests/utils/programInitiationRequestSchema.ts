import { z } from 'zod'

const deliveryTypeValues = ['internal', 'external', 'mixed', 'unknown'] as const

const isoDateOrEmpty = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'invalidDate')
  .nullable()

/**
 * Draft-save schema: only `name` and `requestingProgramId` are required.
 * All other fields are optional per the PMflex data model.
 */
export const draftSchema = z.object({
  name: z.string().trim().min(1).max(500),
  requestingProgramId: z.string().min(1),
  portfolioId: z.string().optional().default(''),
  documentVersion: z.string().trim().max(100).optional().default(''),
  projectInitiator: z.string().trim().max(500).nullable().optional().default(null),
  projectOwner: z.string().trim().max(500).nullable().optional().default(null),
  organizationalUnit: z.string().trim().max(500).nullable().optional().default(null),
  solutionProvider: z.string().trim().max(500).nullable().optional().default(null),
  approvalAuthority: z.string().trim().max(500).nullable().optional().default(null),
  requestDate: isoDateOrEmpty.optional().default(null),
  estimatedEffort: z.number().positive().nullable().optional().default(null),
  estimatedEffortComment: z.string().trim().max(2000).optional().default(''),
  targetDeliveryDate: isoDateOrEmpty.optional().default(null),
  deliveryType: z.enum(deliveryTypeValues).nullable().optional().default(null),
})

/** Submit schema: extends draft schema with all backend-required fields enforced as non-null. */
export const submitSchema = draftSchema.extend({
  documentVersion: z.string().trim().min(1).max(100),
  projectInitiator: z.string().trim().min(1).max(500),
  projectOwner: z.string().trim().min(1).max(500),
  organizationalUnit: z.string().trim().min(1).max(500),
  approvalAuthority: z.string().trim().min(1).max(500),
  targetDeliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'invalidDate'),
  deliveryType: z.enum(deliveryTypeValues),
})

/** Form value type inferred from the draft schema. */
export type ProgramInitiationRequestFormValues = z.infer<typeof draftSchema>
