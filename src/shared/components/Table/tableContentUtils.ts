import type { useTranslation } from 'react-i18next'

/**
 * Returns a safe loading-row count for the shared table.
 *
 * @param loadingRowsCount - Explicit loading-row override.
 * @param pageSize - The active page size, if pagination is enabled.
 * @returns The fallback loading-row count.
 */
export function getSafeLoadingRowCount(loadingRowsCount: number | undefined, pageSize?: number) {
  return Math.max(1, loadingRowsCount ?? pageSize ?? 5)
}

/**
 * Returns the default empty-state title for the shared table.
 *
 * @param t - Translation function.
 * @param emptyTitle - Optional caller-provided title.
 * @returns The resolved title.
 */
export function getDefaultEmptyTitle(
  t: ReturnType<typeof useTranslation>['t'],
  emptyTitle?: string,
) {
  return emptyTitle ?? t('shared.table.noDataTitle')
}

/**
 * Returns the default empty-state description for the shared table.
 *
 * @param t - Translation function.
 * @param emptyDescription - Optional caller-provided description.
 * @returns The resolved description.
 */
export function getDefaultEmptyDescription(
  t: ReturnType<typeof useTranslation>['t'],
  emptyDescription?: string,
) {
  return emptyDescription ?? t('shared.table.noDataDescription')
}
