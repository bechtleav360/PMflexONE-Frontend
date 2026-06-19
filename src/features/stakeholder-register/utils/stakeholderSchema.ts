import { z } from 'zod'

const V = 'pages.stakeholderRegister.form.validation'

const matrixPositionSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
})

const optionalEmail = z
  .string()
  .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), `${V}.emailInvalid`)
  .nullable()
  .optional()

const optionalPhone = z
  .string()
  .refine((v) => !v || /^\+?[\d\s\-().]{7,20}$/.test(v), `${V}.phoneInvalid`)
  .nullable()
  .optional()

/** Zod schema for a single stakeholder activity log entry within the form. */
export const stakeholderLogSchema = z.object({
  id: z.string(),
  /** `undefined` = new log not yet persisted; number = server version for update/delete. */
  version: z.number().optional(),
  date: z.string().min(1, `${V}.logDateRequired`),
  content: z.string().min(1, `${V}.logContentRequired`),
})

/** Inferred type of a single log entry used in the stakeholder form. */
export type StakeholderLogValue = z.infer<typeof stakeholderLogSchema>

/**
 * Zod form schema for creating and editing stakeholder entries.
 *
 * Validates all fields including mandatory name/role/contactGroup, optional contact
 * details with format checks, matrix position, RASCI fields, and activity logs.
 */
export const stakeholderFormSchema = z.object({
  name: z.string().min(1, `${V}.nameRequired`).max(100, `${V}.nameTooLong`),
  role: z.string().min(1, `${V}.roleRequired`).max(100, `${V}.roleTooLong`),
  contactGroup: z.enum(['INTERNAL', 'CUSTOMER', 'SUPPLIER', 'PARTNER'], {
    error: `${V}.contactGroupRequired`,
  }),
  email: optionalEmail,
  email2: optionalEmail,
  email3: optionalEmail,
  phone: optionalPhone,
  phone2: optionalPhone,
  phone3: optionalPhone,
  preferredCommunicationType: z
    .string()
    .max(100, `${V}.preferredCommunicationTypeTooLong`)
    .nullable()
    .optional(),
  matrixPosition: matrixPositionSchema.nullable().optional(),
  typeOfAffectedness: z.enum(['POSITIVE', 'NEGATIVE', 'NEUTRAL']).nullable().optional(),
  conflictPotential: z.enum(['LOW', 'MEDIUM', 'HIGH']).nullable().optional(),
  expectations: z.string().max(300, `${V}.expectationsTooLong`).nullable().optional(),
  responsible: z.string().nullable().optional(),
  inclusionMeasures: z.string().max(1000, `${V}.inclusionMeasuresTooLong`).nullable().optional(),
  memberId: z.string().nullable().optional(),
  logs: z.array(stakeholderLogSchema).optional(),
})

/** Inferred type of the full stakeholder form, matching the shape of {@link stakeholderFormSchema}. */
export type StakeholderFormValues = z.infer<typeof stakeholderFormSchema>
