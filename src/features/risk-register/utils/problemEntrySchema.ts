import { z } from 'zod'

import { PESTEL_CATEGORY } from './pestelOptions'
import type { PestelCategory } from './pestelOptions'

const PESTEL_ENUM = Object.values(PESTEL_CATEGORY) as [PestelCategory, ...PestelCategory[]]

/** Zod validation schema for the create/edit problem entry form (ITIL problem management). */
export const problemEntrySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'pages.problemManagement.validation.nameRequired')
    .max(255, 'pages.problemManagement.validation.nameTooLong'),
  pestelCategory: z.enum(PESTEL_ENUM),
  description: z
    .string()
    .max(2000, 'pages.problemManagement.validation.descriptionTooLong')
    .nullable()
    .optional(),
  status: z.string().min(1, 'pages.problemManagement.validation.statusRequired'),
  identificationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'pages.problemManagement.validation.dateInvalid'),
  impact: z
    .number()
    .int()
    .min(1, 'pages.problemManagement.validation.scoreRange')
    .max(5, 'pages.problemManagement.validation.scoreRange')
    .nullable()
    .optional(),
  ownerId: z.string().optional(),
  reporterId: z.string().optional(),
})

/** TypeScript type inferred from the problem entry form schema. */
export type ProblemEntryFormValues = z.infer<typeof problemEntrySchema>
