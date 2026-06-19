import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components'

import { useDeEscalateEntryDialogStore } from '../../store/useDeEscalateEntryDialogStore'
import { useEscalatedEntryDetailStore } from '../../store/useEscalatedEntryDetailStore'
import type { EscalatedEntry } from '../../types/escalatedEntry.types'
import { EscalatedEntrySourceFields } from './EscalatedEntrySourceFields'
import { EscalatedEntryTabs } from './EscalatedEntryTabs'

function isEntryLocked(status: EscalatedEntry['status']): boolean {
  return status === 'ESCALATED' || status === 'RETURNED'
}

interface EscalatedEntryDetailProps {
  escalatedEntry: EscalatedEntry
  /** When false, the measures section is hidden. Defaults to true. */
  showMeasures?: boolean
}

/**
 * Detail view for a single escalated entry with tabbed layout.
 * Shows source snapshot, assessment form, optional measures, and escalation log.
 * The "Escalation Log" tab appears only when at least one protocol event exists.
 *
 * @param root0 - Component props.
 * @param root0.escalatedEntry - The escalated entry to display.
 * @param root0.showMeasures - Whether to render the measures section (default true).
 * @returns The tabbed detail layout.
 */
export function EscalatedEntryDetail({
  escalatedEntry,
  showMeasures = true,
}: EscalatedEntryDetailProps) {
  const { t } = useTranslation()
  const openDeEscalate = useDeEscalateEntryDialogStore((s) => s.open)
  const closeDetail = useEscalatedEntryDetailStore((s) => s.close)
  const isLocked = isEntryLocked(escalatedEntry.status)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <EscalatedEntrySourceFields entry={escalatedEntry} />
        {escalatedEntry.status === 'ACTIVE' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => openDeEscalate(escalatedEntry.id, escalatedEntry.version, closeDetail)}
          >
            {t('features.escalatedEntries.actions.return')}
          </Button>
        )}
      </div>
      <EscalatedEntryTabs
        escalatedEntry={escalatedEntry}
        isLocked={isLocked}
        showMeasures={showMeasures}
        closeDetail={closeDetail}
      />
    </div>
  )
}
