import { useTranslation } from 'react-i18next'

import { formatDate } from '@/shared/lib/utils'

import type { EscalatedEntry } from '../../types/escalatedEntry.types'

interface EscalatedEntrySourceFieldsProps {
  entry: EscalatedEntry
}

/**
 * Read-only snapshot of the source entry fields as captured at escalation time.
 *
 * @param root0 - Component props.
 * @param root0.entry - The full escalated entry with source snapshot fields.
 * @returns A read-only grid of source field labels and values.
 */
export function EscalatedEntrySourceFields({ entry }: EscalatedEntrySourceFieldsProps) {
  const { t } = useTranslation()

  const fields = [
    {
      label: t('features.escalatedEntries.detail.sourceFields.entryNumber'),
      value: entry.entryNumber,
    },
    { label: t('features.escalatedEntries.detail.sourceFields.name'), value: entry.name },
    {
      label: t('features.escalatedEntries.detail.sourceFields.type'),
      value: entry.sourceEntryType,
    },
    {
      label: t('features.escalatedEntries.detail.sourceFields.sourceStatus'),
      value: entry.sourceStatus ?? '—',
    },
    {
      label: t('features.escalatedEntries.detail.sourceFields.probability'),
      value: entry.probability?.toString() ?? '—',
    },
    {
      label: t('features.escalatedEntries.detail.sourceFields.impact'),
      value: entry.impact?.toString() ?? '—',
    },
    {
      label: t('features.escalatedEntries.detail.sourceFields.riskLevel'),
      value: entry.riskLevel?.toString() ?? '—',
    },
    {
      label: t('features.escalatedEntries.detail.sourceFields.pestelCategory'),
      value: entry.pestelCategory ?? '—',
    },
    {
      label: t('features.escalatedEntries.detail.sourceFields.escalatedAt'),
      value: formatDate(entry.escalatedAt),
    },
    {
      label: t('features.escalatedEntries.detail.sourceFields.escalationChain'),
      value: entry.escalationChain ?? '—',
    },
  ]

  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold">
        {t('features.escalatedEntries.detail.sourceFields.title')}
      </h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {fields.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
