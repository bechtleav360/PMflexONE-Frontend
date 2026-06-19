import { z } from 'zod'

/** Zod schema for the project charter form. All fields are optional free-text. */
export const projectCharterSchema = z.object({
  projectSummary: z.string().optional(),
  scopeSummary: z.string().optional(),
  successCriteria: z.string().optional(),
  stakeholders: z.string().optional(),
  requirement: z.string().optional(),
  projectConstraint: z.string().optional(),
  assumption: z.string().optional(),
  risk: z.string().optional(),
  resources: z.string().optional(),
  operationalImplementation: z.string().optional(),
})

/** Inferred form value type from the project charter Zod schema. */
export type ProjectCharterFormValues = z.infer<typeof projectCharterSchema>
