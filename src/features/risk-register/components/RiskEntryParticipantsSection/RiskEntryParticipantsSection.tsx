import { useTranslation } from 'react-i18next'

import { Combobox, Label } from '@/shared/components'

/** Props for {@link RiskEntryParticipantsSection}. */
interface RiskEntryParticipantsSectionProps {
  /** ID prefix for scoping form element IDs (e.g. `"risk-entry"` or `"edit-risk-entry"`). */
  idPrefix: string
  /** Controlled value for the owner combobox (person ID or null). */
  ownerValue: string | null
  /** Called when the owner selection changes. */
  onOwnerChange: (v: string | null) => void
  /** Controlled value for the reporter combobox (person ID or null). */
  reporterValue: string | null
  /** Called when the reporter selection changes. */
  onReporterChange: (v: string | null) => void
  /** Person options mapped to `{ value: id, label: 'firstName lastName' }`. */
  personOptions: { value: string; label: string }[]
  /** Whether the persons list is still loading. */
  personsLoading?: boolean
}

/**
 * Two-column grid with owner and reporter person comboboxes.
 *
 * @param props - Component props.
 * @param props.idPrefix - ID prefix for scoping form element IDs.
 * @param props.ownerValue - Controlled value for the owner combobox.
 * @param props.onOwnerChange - Called when the owner selection changes.
 * @param props.reporterValue - Controlled value for the reporter combobox.
 * @param props.onReporterChange - Called when the reporter selection changes.
 * @param props.personOptions - Person options for both comboboxes.
 * @param props.personsLoading - Whether the persons list is still loading.
 * @returns The labelled owner and reporter comboboxes in a two-column layout.
 */
export function RiskEntryParticipantsSection({
  idPrefix,
  ownerValue,
  onOwnerChange,
  reporterValue,
  onReporterChange,
  personOptions,
  personsLoading,
}: RiskEntryParticipantsSectionProps) {
  const { t } = useTranslation()
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-owner`}>
          {t('pages.riskManagement.createRiskEntry.fields.owner')}
        </Label>
        <Combobox
          id={`${idPrefix}-owner`}
          value={ownerValue}
          onChange={onOwnerChange}
          options={personOptions}
          placeholder={t('pages.riskManagement.createRiskEntry.fields.ownerPlaceholder')}
          loading={personsLoading}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-reporter`}>
          {t('pages.riskManagement.createRiskEntry.fields.reporter')}
        </Label>
        <Combobox
          id={`${idPrefix}-reporter`}
          value={reporterValue}
          onChange={onReporterChange}
          options={personOptions}
          placeholder={t('pages.riskManagement.createRiskEntry.fields.reporterPlaceholder')}
          loading={personsLoading}
        />
      </div>
    </div>
  )
}
