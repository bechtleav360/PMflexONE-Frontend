import { buildDefaultFilter } from '@/shared/lib/filterUtils'
import type { FilterFieldDef, FilterTranslateFn } from '@/shared/types'

import type { ProgramFilter } from './types/program.types'

/**
 * Returns translated filter field definitions for the program list.
 *
 * Maps to the `ProgramFilter` GraphQL input type.
 *
 * @param t - The i18next translate function from `useTranslation()`.
 * @returns Ordered array of {@link FilterFieldDef} with translated labels and options.
 */
export function buildProgramFilterFields(t: FilterTranslateFn): FilterFieldDef[] {
  return [
    {
      type: 'text-search',
      key: 'name',
      label: t('pages.programs.filters.searchLabel'),
      placeholder: t('pages.programs.filters.searchPlaceholder'),
      defaultValue: null,
    },
    {
      type: 'select',
      key: 'status',
      label: t('pages.programs.filters.status'),
      options: [
        { value: 'draft', label: t('pages.programs.status.draft') },
        { value: 'created', label: t('pages.programs.status.created') },
        { value: 'active', label: t('pages.programs.status.active') },
        { value: 'completed', label: t('pages.programs.status.completed') },
        { value: 'archived', label: t('pages.programs.status.archived') },
      ],
      defaultValue: null,
    },
  ]
}

/**
 * Default filter derived from the program filter field definitions — single source of truth for keys and defaults.
 *
 * The assertion must be kept in sync with the keys and value types defined in
 * {@link buildProgramFilterFields}. If a field is added or renamed there,
 * update this assertion accordingly — TypeScript will not catch the divergence.
 */
export const PROGRAM_DEFAULT_FILTER = buildDefaultFilter(
  buildProgramFilterFields((key) => key),
) as { name: string | null; status: string | null }

/** Shape of the program list filter state object. */
export type ProgramListFilter = typeof PROGRAM_DEFAULT_FILTER

/**
 * Maps the flat `ProgramListFilter` state to the `ProgramFilter` GraphQL input shape.
 *
 * Omits null and empty-string values so the server receives only active constraints.
 * Returns `undefined` when no fields are set.
 *
 * @param filter - The current flat filter state from `useFilterState`.
 * @returns A record of active filter fields, or `undefined` when no filters are active.
 */
export function toProgramGraphqlFilter(filter: ProgramListFilter): ProgramFilter | undefined {
  const result: ProgramFilter = {}
  if (filter.name) result.name = filter.name
  if (filter.status) result.status = filter.status
  return Object.keys(result).length > 0 ? result : undefined
}
