import { z } from 'zod'

/** Zod validation schema for the work item create/edit form. */
export const workItemFormSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000).nullable().optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be ISO date (YYYY-MM-DD)')
    .nullable()
    .optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  labelIds: z.array(z.string()).optional(),
})

/** Inferred type for validated work item form data. */
export type WorkItemFormValues = z.infer<typeof workItemFormSchema>
