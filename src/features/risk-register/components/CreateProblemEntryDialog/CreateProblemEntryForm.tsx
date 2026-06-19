import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components'

import { useCreateProblemEntryForm } from '../../hooks/useCreateProblemEntryForm'
import type { ScopeType } from '../../types/scopeType'
import type { ProblemEntryFormValues } from '../../utils/problemEntrySchema'
import { PROBLEM_ENTRY_STATUS } from '../../utils/statusConstants'
import { ProblemEntryImpactField } from '../ProblemEntryImpactField'
import { RiskEntryDescriptionField } from '../RiskEntryDescriptionField'
import { RiskEntryIdentificationDateField } from '../RiskEntryIdentificationDateField'
import { RiskEntryNameField } from '../RiskEntryNameField'
import { RiskEntryParticipantsSection } from '../RiskEntryParticipantsSection'
import { RiskEntryPestelField } from '../RiskEntryPestelField'
import { RiskEntryStatusField } from '../RiskEntryStatusField'

/**
 * Form for creating a new problem entry (ITIL problem management).
 *
 * Assessment fields are limited to impact only (no urgency, no scope effort per FA3).
 * Status defaults to {@link PROBLEM_ENTRY_STATUS.OPEN}.
 *
 * @param props - Component props.
 * @param props.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param props.scopeId - The ID of the scoped entity.
 * @returns The rendered create form.
 */
// eslint-disable-next-line max-lines-per-function -- form component; line count scales with number of domain fields, not logic complexity
export function CreateProblemEntryForm({
  scopeType,
  scopeId,
}: {
  scopeType: ScopeType
  scopeId: string
}) {
  const { t } = useTranslation()
  const {
    handleSubmit,
    setValue,
    errors,
    onSubmit,
    isPending,
    close,
    pestelCategory,
    status,
    identificationDateObj,
    statusOptions,
    pestelOptions,
    statusesLoading,
    nameInputProps,
    descriptionInputProps,
    impactInputProps,
    ownerValue,
    onOwnerChange,
    reporterValue,
    onReporterChange,
    personOptions,
    personsLoading,
    onDateChange,
  } = useCreateProblemEntryForm({ scopeType, scopeId })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <RiskEntryNameField
        idPrefix="create-problem-entry"
        inputProps={nameInputProps}
        error={errors.name}
      />
      <div className="grid grid-cols-2 gap-4">
        <RiskEntryPestelField
          idPrefix="create-problem-entry"
          value={pestelCategory ?? null}
          onChange={(v) =>
            setValue('pestelCategory', v as ProblemEntryFormValues['pestelCategory'])
          }
          options={pestelOptions}
          error={errors.pestelCategory}
        />
        <RiskEntryStatusField
          idPrefix="create-problem-entry"
          value={status}
          onChange={(v) => setValue('status', v ?? PROBLEM_ENTRY_STATUS.OPEN)}
          options={statusOptions}
          error={errors.status}
          loading={statusesLoading}
        />
      </div>
      <RiskEntryIdentificationDateField
        idPrefix="create-problem-entry"
        value={identificationDateObj}
        onChange={onDateChange}
        error={errors.identificationDate}
      />
      <RiskEntryDescriptionField
        idPrefix="create-problem-entry"
        inputProps={descriptionInputProps}
      />
      <div className="grid grid-cols-2 gap-4">
        <ProblemEntryImpactField
          idPrefix="create-problem-entry"
          inputProps={impactInputProps}
          error={errors.impact}
        />
      </div>
      <RiskEntryParticipantsSection
        idPrefix="create-problem-entry"
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
          {t('pages.problemManagement.createProblemEntry.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isPending}
        >
          {t('pages.problemManagement.createProblemEntry.submit')}
        </Button>
      </div>
    </form>
  )
}
