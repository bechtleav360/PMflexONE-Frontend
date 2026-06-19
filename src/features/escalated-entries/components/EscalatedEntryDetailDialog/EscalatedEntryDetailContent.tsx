import { useTranslation } from 'react-i18next'

import { Skeleton } from '@/shared/components'

import { useEscalatedEntry } from '../../hooks/useEscalatedEntry'
import { EscalatedEntryDetail } from '../EscalatedEntryDetail/EscalatedEntryDetail'

interface EscalatedEntryDetailContentProps {
  id: string
  showMeasures: boolean
}

/**
 * Fetches and renders the escalated entry detail for a given id.
 * Kept in a separate file so the dialog file satisfies react/no-multi-comp.
 *
 * @param root0 - Component props.
 * @param root0.id - The escalated entry ID to fetch.
 * @param root0.showMeasures - Whether to show the measures section.
 * @returns The detail view, a skeleton while loading, or an error message.
 */
export function EscalatedEntryDetailContent({
  id,
  showMeasures,
}: EscalatedEntryDetailContentProps) {
  const { t } = useTranslation()
  const { data: entry, isLoading, isError } = useEscalatedEntry(id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    )
  }

  if (isError || !entry) {
    return (
      <p className="text-muted-foreground text-sm">
        {t('features.escalatedEntries.detail.loadError')}
      </p>
    )
  }

  return (
    <EscalatedEntryDetail
      escalatedEntry={entry}
      showMeasures={showMeasures}
    />
  )
}
