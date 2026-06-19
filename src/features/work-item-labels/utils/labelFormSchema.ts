import { z } from 'zod'

/** Zod validation schema for the label create/edit form. */
export const labelFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
  color: z.string().regex(/^#[0-9A-Fa-f]{8}$/, 'Color must be in #AARRGGBB format'),
})

/** Inferred type for validated label form data. */
export type LabelFormValues = z.infer<typeof labelFormSchema>
