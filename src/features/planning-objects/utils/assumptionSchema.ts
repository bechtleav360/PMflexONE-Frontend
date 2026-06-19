import { z } from 'zod'

/** Zod schema for the assumption create/edit form. */
export const assumptionFormSchema = z.object({
  name: z.string().trim().min(1, 'features.planningObjects.validation.nameRequired').max(500),
  description: z.string().max(5000).nullable().optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  validationStatus: z.string().min(1),
  isRisk: z.boolean(),
  otherInformation: z.string().max(5000).nullable().optional(),
  validatedById: z.string().nullable().optional(),
})

/** Inferred TypeScript type from {@link assumptionFormSchema}. */
export type AssumptionFormValues = z.infer<typeof assumptionFormSchema>
