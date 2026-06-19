import { useTranslation } from 'react-i18next'

import { formatDate } from '@/shared/lib/utils'

import type { EscalationEvent } from '../../types/escalatedEntry.types'

interface EscalationLogTabProps {
  events: EscalationEvent[]
}

/**
 * Chronological read-only log of all escalation and de-escalation events.
 *
 * @param root0 - Component props.
 * @param root0.events - Protocol events to display, sorted ascending by time on render (oldest first).
 * @returns A list of log entries or an empty-state message.
 */
export function EscalationLogTab({ events }: EscalationLogTabProps) {
  const { t } = useTranslation()

  const sorted = [...events].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
  )

  if (sorted.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">{t('features.escalatedEntries.log.empty')}</p>
    )
  }

  return (
    <ul className="flex flex-col gap-4">
      {sorted.map((event) => (
        <li
          key={event.id}
          className="flex flex-col gap-1 rounded-md border p-3 text-sm"
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold">
              {t(`features.escalatedEntries.log.eventType.${event.eventType}`)}
            </span>
            <span className="text-muted-foreground text-xs">{formatDate(event.occurredAt)}</span>
            <span className="text-muted-foreground text-xs">
              {[event.performedBy.firstName, event.performedBy.lastName].join(' ')}
            </span>
          </div>
          <p className="text-muted-foreground">{event.reason}</p>
        </li>
      ))}
    </ul>
  )
}
