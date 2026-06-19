import type { ProjectCharterNode } from '@/entities/project-charter'

import type { ProjectCharterFormValues } from './projectCharterSchema'

const TEXT_FIELDS = [
  'projectSummary',
  'scopeSummary',
  'successCriteria',
  'stakeholders',
  'requirement',
  'projectConstraint',
  'assumption',
  'risk',
  'resources',
  'operationalImplementation',
] as const satisfies ReadonlyArray<keyof ProjectCharterFormValues>

/**
 * Maps a `ProjectCharterNode` to form values, coercing `null` fields to empty strings.
 *
 * @param charter - The charter node fetched from the API.
 * @returns Form values with all nullable string fields coerced to empty strings.
 */
export function charterToFormValues(charter: ProjectCharterNode): ProjectCharterFormValues {
  return Object.fromEntries(
    TEXT_FIELDS.map((field) => [field, charter[field] ?? '']),
  ) as ProjectCharterFormValues
}

/**
 * Maps form values to mutation input fields, converting empty strings to `undefined`.
 *
 * @param values - Form values from the project charter form.
 * @returns Mutation input fields with empty strings coerced to `undefined`.
 */
export function formValuesToMutationFields(
  values: ProjectCharterFormValues,
): Partial<Record<keyof ProjectCharterFormValues, string>> {
  return Object.fromEntries(TEXT_FIELDS.map((field) => [field, values[field] || undefined]))
}
