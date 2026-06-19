import { z } from 'zod'

import { PESTEL_CATEGORY } from './pestelOptions'
import type { PestelCategory } from './pestelOptions'

const PESTEL_ENUM = Object.values(PESTEL_CATEGORY) as [PestelCategory, ...PestelCategory[]]

/** Zod validation schema for the create/edit risk entry form. */
export const riskEntrySchema = z.object({
  type: z.enum(['RISK', 'OPPORTUNITY']),
  name: z
    .string()
    .trim()
    .min(1, 'pages.riskManagement.validation.nameRequired')
    .max(255, 'pages.riskManagement.validation.nameTooLong'),
  pestelCategory: z.enum(PESTEL_ENUM),
  description: z
    .string()
    .max(2000, 'pages.riskManagement.validation.descriptionTooLong')
    .nullable()
    .optional(),
  status: z.string().min(1, 'pages.riskManagement.validation.statusRequired'),
  identificationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'pages.riskManagement.validation.dateInvalid'),
  probability: z
    .number()
    .int()
    .min(1, 'pages.riskManagement.validation.scoreRange')
    .max(5, 'pages.riskManagement.validation.scoreRange')
    .nullable()
    .optional(),
  impact: z
    .number()
    .int()
    .min(1, 'pages.riskManagement.validation.scoreRange')
    .max(5, 'pages.riskManagement.validation.scoreRange')
    .nullable()
    .optional(),
  ownerId: z.string().optional(),
  reporterId: z.string().optional(),
})

/** TypeScript type inferred from the risk entry form schema. */
export type RiskEntryFormValues = z.infer<typeof riskEntrySchema>
