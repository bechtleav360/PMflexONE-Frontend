import { buildDefaultFilter } from '@/shared/lib/filterUtils'
import type { FilterFieldDef, FilterTranslateFn } from '@/shared/types'

import type { PortfolioFilter } from './types/portfolio.types'

/**
 * Returns translated filter field definitions for the portfolio list.
 *
 * Maps to the `PortfolioFilter` GraphQL input type.
 *
 * @param t - The i18next translate function from `useTranslation()`.
 * @returns Ordered array of {@link FilterFieldDef} with translated labels and options.
 */
export function buildPortfolioFilterFields(t: FilterTranslateFn): FilterFieldDef[] {
  return [
    {
      type: 'text-search',
      key: 'name',
      label: t('pages.portfolios.filters.searchLabel'),
      placeholder: t('pages.portfolios.filters.searchPlaceholder'),
      defaultValue: null,
    },
    {
      type: 'year',
      key: 'startYear',
      label: t('pages.portfolios.filters.startYear'),
      defaultValue: null,
    },
    {
      type: 'year',
      key: 'endYear',
      label: t('pages.portfolios.filters.endYear'),
      defaultValue: null,
    },
  ]
}

/**
 * Default filter derived from the portfolio filter field definitions — single source of truth for keys and defaults.
 *
 * The assertion must be kept in sync with the keys and value types defined in
 * {@link buildPortfolioFilterFields}. If a field is added or renamed there,
 * update this assertion accordingly — TypeScript will not catch the divergence.
 */
export const PORTFOLIO_DEFAULT_FILTER = buildDefaultFilter(
  buildPortfolioFilterFields((key) => key),
) as { name: string | null; startYear: number | null; endYear: number | null }

/** Shape of the portfolio list filter state object. */
export type PortfolioListFilter = typeof PORTFOLIO_DEFAULT_FILTER

/**
 * Maps the flat `PortfolioListFilter` state to the `PortfolioFilter` GraphQL input shape.
 *
 * Omits null values so the server receives only active constraints.
 * Returns `undefined` when no fields are set.
 *
 * @param filter - The current flat filter state from `useFilterState`.
 * @returns A `PortfolioFilter`-shaped record, or `undefined` when no filters are active.
 */
export function toPortfolioGraphqlFilter(filter: PortfolioListFilter): PortfolioFilter | undefined {
  const result: PortfolioFilter = {}
  if (filter.name) result.name = filter.name
  if (filter.startYear !== null) result.startYear = filter.startYear
  if (filter.endYear !== null) result.endYear = filter.endYear
  return Object.keys(result).length > 0 ? result : undefined
}
