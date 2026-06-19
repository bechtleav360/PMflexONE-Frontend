import { z } from 'zod'

/** Zod schema for the constraint create/edit form. */
export const constraintFormSchema = z.object({
  name: z.string().trim().min(1, 'features.planningObjects.validation.nameRequired').max(500),
  description: z.string().max(5000).nullable().optional(),
  timeConstrained: z.boolean(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  otherInformation: z.string().max(5000).nullable().optional(),
  ownerId: z.string().nullable().optional(),
})

/** Inferred TypeScript type from {@link constraintFormSchema}. */
export type ConstraintFormValues = z.infer<typeof constraintFormSchema>
