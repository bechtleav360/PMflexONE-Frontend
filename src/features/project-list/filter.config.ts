import type { ProjectFilter } from '@/entities/project'
import { buildDefaultFilter } from '@/shared/lib/filterUtils'
import type { FilterFieldDef, FilterTranslateFn } from '@/shared/types'

/**
 * Returns translated filter field definitions for the project list.
 *
 * @param t - The i18next translate function from `useTranslation()`.
 * @returns Ordered array of {@link FilterFieldDef} with translated labels and options.
 */
export function buildProjectFilterFields(t: FilterTranslateFn): FilterFieldDef[] {
  return [
    {
      type: 'text-search',
      key: 'name',
      label: t('pages.projects.filters.searchLabel'),
      placeholder: t('pages.projects.filters.searchPlaceholder'),
      defaultValue: null,
    },
    {
      type: 'select',
      key: 'governanceStatus',
      label: t('pages.projects.filters.governanceStatus'),
      options: [
        { value: 'formal', label: t('pages.projects.governanceStatus.formal') },
        { value: 'unmanaged', label: t('pages.projects.governanceStatus.unmanaged') },
      ],
      defaultValue: null,
    },
    {
      type: 'select',
      key: 'sizeClassification',
      label: t('pages.projects.filters.sizeClassification'),
      options: [
        { value: 'small', label: t('pages.projects.sizeClassification.small') },
        { value: 'medium', label: t('pages.projects.sizeClassification.medium') },
        { value: 'large', label: t('pages.projects.sizeClassification.large') },
      ],
      defaultValue: null,
    },
  ]
}

/**
 * Default filter derived from the project filter field definitions — single source of truth for keys and defaults.
 *
 * The assertion must be kept in sync with the keys and value types defined in
 * {@link buildProjectFilterFields}. If a field is added or renamed there,
 * update this assertion accordingly — TypeScript will not catch the divergence.
 */
export const PROJECT_DEFAULT_FILTER = buildDefaultFilter(
  buildProjectFilterFields((key) => key),
) as {
  name: string | null
  governanceStatus: string | null
  sizeClassification: string | null
}

/** Shape of the project list filter state object. */
export type ProjectListFilter = typeof PROJECT_DEFAULT_FILTER

/**
 * Maps the flat `ProjectListFilter` state to the `ProjectFilter` GraphQL input shape.
 *
 * Omits null values so the server receives only active constraints.
 * Returns `undefined` when no fields are set.
 *
 * @param filter - The current flat filter state from {@link useFilterState}.
 * @returns A `ProjectFilter`-shaped object, or `undefined` when the filter is empty.
 */
export function toProjectGraphqlFilter(filter: ProjectListFilter): ProjectFilter | undefined {
  const result: ProjectFilter = {}

  if (filter.name) result.name = filter.name
  if (filter.governanceStatus) result.governanceStatus = filter.governanceStatus
  if (filter.sizeClassification) result.sizeClassification = filter.sizeClassification

  return Object.keys(result).length > 0 ? result : undefined
}
