import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components'

import { useCreateRiskEntryForm } from '../../hooks/useCreateRiskEntryForm'
import type { ScopeType } from '../../types/scopeType'
import type { RiskEntryFormValues } from '../../utils/riskEntrySchema'
import { RISK_ENTRY_STATUS } from '../../utils/statusConstants'
import { RiskEntryDescriptionField } from '../RiskEntryDescriptionField'
import { RiskEntryIdentificationDateField } from '../RiskEntryIdentificationDateField'
import { RiskEntryNameField } from '../RiskEntryNameField'
import { RiskEntryParticipantsSection } from '../RiskEntryParticipantsSection'
import { RiskEntryPestelField } from '../RiskEntryPestelField'
import { RiskEntryScoreSection } from '../RiskEntryScoreSection'
import { RiskEntryStatusField } from '../RiskEntryStatusField'
import { RiskEntryTypeField } from '../RiskEntryTypeField'

/** Props for {@link CreateRiskEntryForm}. */
interface CreateRiskEntryFormProps {
  scopeType: ScopeType
  scopeId: string
}

/**
 * Form for creating a new risk or opportunity entry.
 *
 * Pre-populates status with "Proposed" and identification date with today.
 * Passes `scopeType` and `scopeId` directly in the create input.
 *
 * @param props - Component props.
 * @param props.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param props.scopeId - The ID of the scoped entity.
 * @returns The rendered creation form.
 */
// eslint-disable-next-line max-lines-per-function -- form component; line count scales with number of domain fields, not logic complexity
export function CreateRiskEntryForm({ scopeType, scopeId }: CreateRiskEntryFormProps) {
  const { t } = useTranslation()
  const {
    handleSubmit,
    setValue,
    errors,
    onSubmit,
    isPending,
    close,
    type,
    pestelCategory,
    status,
    identificationDateObj,
    statusOptions,
    pestelOptions,
    typeOptions,
    statusesLoading,
    nameInputProps,
    descriptionInputProps,
    probabilityInputProps,
    impactInputProps,
    ownerValue,
    onOwnerChange,
    reporterValue,
    onReporterChange,
    personOptions,
    personsLoading,
    onDateChange,
  } = useCreateRiskEntryForm({ scopeType, scopeId })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <RiskEntryTypeField
        idPrefix="risk-entry"
        value={type}
        onChange={(v) => setValue('type', (v ?? 'RISK') as 'RISK' | 'OPPORTUNITY')}
        options={typeOptions}
        error={errors.type}
      />
      <RiskEntryNameField
        idPrefix="risk-entry"
        inputProps={nameInputProps}
        error={errors.name}
      />
      <div className="grid grid-cols-2 gap-4">
        <RiskEntryPestelField
          idPrefix="risk-entry"
          value={pestelCategory ?? null}
          onChange={(v) => setValue('pestelCategory', v as RiskEntryFormValues['pestelCategory'])}
          options={pestelOptions}
          error={errors.pestelCategory}
        />
        <RiskEntryStatusField
          idPrefix="risk-entry"
          value={status}
          onChange={(v) => setValue('status', v ?? RISK_ENTRY_STATUS.PROPOSED)}
          options={statusOptions}
          error={errors.status}
          loading={statusesLoading}
        />
      </div>
      <RiskEntryIdentificationDateField
        idPrefix="risk-entry"
        value={identificationDateObj}
        onChange={onDateChange}
        error={errors.identificationDate}
      />
      <RiskEntryDescriptionField
        idPrefix="risk-entry"
        inputProps={descriptionInputProps}
      />
      <RiskEntryScoreSection
        idPrefix="risk-entry"
        probabilityInputProps={probabilityInputProps}
        probabilityError={errors.probability}
        impactInputProps={impactInputProps}
        impactError={errors.impact}
      />
      <RiskEntryParticipantsSection
        idPrefix="risk-entry"
        ownerValue={ownerValue}
        onOwnerChange={onOwnerChange}
        reporterValue={reporterValue}
        onReporterChange={onReporterChange}
        personOptions={personOptions}
        personsLoading={personsLoading}
      />
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={close}
          disabled={isPending}
        >
          {t('pages.riskManagement.createRiskEntry.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isPending}
        >
          {t('pages.riskManagement.createRiskEntry.submit')}
        </Button>
      </div>
    </form>
  )
}
