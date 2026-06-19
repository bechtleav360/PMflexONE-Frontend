import { z } from 'zod'

/** Zod schema for the requirement create/edit form with effort range validation. */
export const requirementFormSchema = z
  .object({
    name: z.string().trim().min(1, 'features.planningObjects.validation.nameRequired').max(500),
    requirementScope: z.enum(['IN_SCOPE', 'OUT_OF_SCOPE']),
    source: z.enum(['INTERNAL', 'EXTERNAL']),
    type: z.enum(['FUNCTIONAL', 'NON_FUNCTIONAL', 'CONSTRAINT']),
    priority: z.enum(['MUST_HAVE', 'SHOULD_HAVE', 'COULD_HAVE', 'WONT_HAVE']),
    status: z.enum(['NEW', 'ANALYSED', 'SPECIFIED', 'IMPLEMENTED', 'TESTED', 'ACCEPTED']),
    estimatedEffortMin: z.number().int().min(0).nullable().optional(),
    estimatedEffortMax: z.number().int().min(0).nullable().optional(),
    description: z.string().max(10000).nullable().optional(),
    acceptanceCriteria: z.string().max(10000).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const min = data.estimatedEffortMin ?? null
    const max = data.estimatedEffortMax ?? null
    if (min !== null && max !== null && min > max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'features.planningObjects.validation.effortMinGtMax',
        path: ['estimatedEffortMax'],
      })
    }
  })

/** Inferred TypeScript type from {@link requirementFormSchema}. */
export type RequirementFormValues = z.infer<typeof requirementFormSchema>
