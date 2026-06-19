import { z } from 'zod'

import { PESTEL_CATEGORY } from './pestelOptions'
import type { PestelCategory } from './pestelOptions'

const PESTEL_ENUM = Object.values(PESTEL_CATEGORY) as [PestelCategory, ...PestelCategory[]]

/** Zod validation schema for the create/edit issue entry form. */
export const issueEntrySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'pages.issueManagement.validation.nameRequired')
    .max(255, 'pages.issueManagement.validation.nameTooLong'),
  pestelCategory: z.enum(PESTEL_ENUM),
  description: z
    .string()
    .max(2000, 'pages.issueManagement.validation.descriptionTooLong')
    .nullable()
    .optional(),
  status: z.string().min(1, 'pages.issueManagement.validation.statusRequired'),
  identificationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'pages.issueManagement.validation.dateInvalid'),
  urgency: z
    .number()
    .int()
    .min(1, 'pages.issueManagement.validation.scoreRange')
    .max(5, 'pages.issueManagement.validation.scoreRange')
    .nullable()
    .optional(),
  impact: z
    .number()
    .int()
    .min(1, 'pages.issueManagement.validation.scoreRange')
    .max(5, 'pages.issueManagement.validation.scoreRange')
    .nullable()
    .optional(),
  ownerId: z.string().optional(),
  reporterId: z.string().optional(),
})

/** TypeScript type inferred from the issue entry form schema. */
export type IssueEntryFormValues = z.infer<typeof issueEntrySchema>
