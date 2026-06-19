import { z } from 'zod'

/**
 * Zod validation schema for the Business Case form.
 * All 8 PMflex content fields are optional — no field is mandatory for either
 * draft saves or submission (`submitBusinessCase`).
 */
export const businessCaseSchema = z.object({
  clientSummary: z.string().optional(),
  projectRationale: z.string().optional(),
  expectedBenefit: z.string().optional(),
  options: z.string().optional(),
  investmentCalculation: z.string().optional(),
  keyRisks: z.string().optional(),
  expectedNegativeSideEffect: z.string().optional(),
  timeline: z.string().optional(),
})

/** Form value type inferred from the business case schema. */
export type BusinessCaseFormValues = z.infer<typeof businessCaseSchema>
