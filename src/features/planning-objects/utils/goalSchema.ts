import { z } from 'zod'

/** Zod schema for the goal create/edit form. */
export const goalFormSchema = z.object({
  name: z.string().trim().min(1, 'features.planningObjects.validation.nameRequired').max(500),
  description: z.string().max(5000).nullable().optional(),
  progress: z.number().int().min(0).max(100).optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  keyResults: z.string().max(5000).nullable().optional(),
  impact: z.string().max(5000).nullable().optional(),
  outcome: z.string().max(5000).nullable().optional(),
  otherInformation: z.string().max(5000).nullable().optional(),
  acceptedById: z.string().nullable().optional(),
  acceptedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
})

/** Inferred TypeScript type from {@link goalFormSchema}. */
export type GoalFormValues = z.infer<typeof goalFormSchema>
