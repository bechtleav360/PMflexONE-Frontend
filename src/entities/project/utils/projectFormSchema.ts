import { z } from 'zod'

/**
 * Zod validation schema shared by the create-project and edit-project forms.
 *
 * Rules:
 * - `name`: required; whitespace-only values are rejected via `.trim().min(1)`.
 * - `sizeClassification`: required; must be one of `small`, `medium`, `large`.
 * - `startDate`: required; must be a valid Date instance.
 * - `endDate`: required; must be a valid Date instance on or after `startDate`.
 * - `description`: optional; any string (including empty) is valid.
 *
 * Error messages use i18n keys scoped to `entities.project.errors.*` so both
 * create and edit consumers share the same translated error copy.
 */
export const projectFormSchema = z
  .object({
    name: z.string().trim().min(1, 'entities.project.errors.nameRequired'),
    sizeClassification: z.enum(['small', 'medium', 'large'], {
      error: 'entities.project.errors.sizeClassificationRequired',
    }),
    startDate: z.date({
      error: 'entities.project.errors.startDateRequired',
    }),
    endDate: z.date({
      error: 'entities.project.errors.endDateRequired',
    }),
    description: z.string().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'entities.project.errors.endDateBeforeStartDate',
    path: ['endDate'],
  })

/** Inferred TypeScript type from the project form Zod schema. */
export type ProjectFormSchema = z.infer<typeof projectFormSchema>
