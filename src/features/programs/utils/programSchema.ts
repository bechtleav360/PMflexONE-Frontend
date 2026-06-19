import { z } from 'zod'

// Returns true when the value is blank or a valid JSON string.
const isValidJsonOrEmpty = (v: string | null | undefined): boolean => {
  if (!v) return true
  try {
    JSON.parse(v)
    return true
  } catch {
    return false
  }
}

/** Reusable Zod field: trims input, normalises blank strings to `null`, and validates JSON. */
const jsonStringField = z
  .string()
  .trim()
  .nullable()
  .transform((v) => (!v ? null : v))
  .refine(isValidJsonOrEmpty, { message: 'invalid_json' })

const nameField = z
  .string()
  .trim()
  .min(1, { message: 'required' })
  .max(255, { message: 'too_long' })

/** Zod schema for the Create Program form. */
export const createProgramSchema = z.object({
  name: nameField,
  portfolioId: z.string().nullable().optional(),
  metadata: jsonStringField,
})

/** Inferred TypeScript type for the Create Program form values. */
export type CreateProgramFormValues = z.infer<typeof createProgramSchema>

/** Zod schema for the Edit Program form. */
export const editProgramSchema = z.object({
  name: nameField,
  status: z.string(),
  portfolioId: z.string().nullable().optional(),
  metadata: jsonStringField,
})

/** Inferred TypeScript type for the Edit Program form values. */
export type EditProgramFormValues = z.infer<typeof editProgramSchema>

/**
 * Translates Zod name-field error codes to user-facing i18n strings.
 *
 * @param message - The raw Zod error message code from `formState.errors.name.message`.
 * @param t - The i18next translation function.
 * @returns A translated error string, or `undefined` when there is no error.
 */
export function getProgramNameErrorMessage(
  message: string | undefined,
  t: (key: string) => string,
): string | undefined {
  if (!message) return undefined
  if (message === 'required') return t('pages.programs.validation.nameRequired')
  if (message === 'too_long') return t('pages.programs.validation.nameTooLong')
  return message
}
