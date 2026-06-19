import { useTranslation } from 'react-i18next'

/** Props for the {@link HistoryStatus} loading/error/empty state indicator. */
export interface HistoryStatusProps {
  isOpen: boolean
  isLoading: boolean
  isError: boolean
  isEmpty: boolean
}

/**
 * Renders a single status message for the change history panel based on load state.
 * Returns null when the panel is ready to display entries.
 * @param root0 - Component props.
 * @param root0.isOpen - Whether the panel is open (false = not yet fetched).
 * @param root0.isLoading - Whether the history query is in flight.
 * @param root0.isError - Whether the history query failed.
 * @param root0.isEmpty - Whether the history list is empty.
 * @returns A status paragraph, or null when entries should be shown.
 */
export function HistoryStatus({ isOpen, isLoading, isError, isEmpty }: HistoryStatusProps) {
  const { t } = useTranslation()
  if (!isOpen) return null
  if (isLoading) {
    return <p className="text-muted-foreground text-sm">{t('common.loading', 'Loading…')}</p>
  }
  if (isError) {
    return (
      <p className="text-destructive text-sm">
        {t('entities.workItemHistory.loadError', 'Failed to load history.')}
      </p>
    )
  }
  if (isEmpty) {
    return (
      <p className="text-muted-foreground text-sm">
        {t('entities.workItemHistory.noHistory', 'No changes recorded.')}
      </p>
    )
  }
  return null
}
