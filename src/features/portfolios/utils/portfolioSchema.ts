import { z } from 'zod'

const nullableYear = z.number().int().min(1000).max(9999).nullable()

/**
 * Zod validation schema for the portfolio creation form.
 * Enforces title constraints and cross-field year-range validation.
 */
export const portfolioSchema = z
  .object({
    name: z.string().trim().min(1).max(255, { message: 'too_big' }),
    startYear: nullableYear,
    endYear: nullableYear,
  })
  .refine(
    (data) => data.startYear === null || data.endYear === null || data.endYear >= data.startYear,
    {
      path: ['endYear'],
      message: 'yearRangeInvalid',
    },
  )

/** Form value shape inferred from the portfolio schema. */
export type PortfolioFormValues = z.infer<typeof portfolioSchema>
