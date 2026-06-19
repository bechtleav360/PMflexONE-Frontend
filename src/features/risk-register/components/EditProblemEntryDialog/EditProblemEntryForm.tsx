import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components'

import { useEditProblemEntryForm } from '../../hooks/useEditProblemEntryForm'
import type { ProblemEntry } from '../../types/problemEntry.types'
import type { ScopeType } from '../../types/scopeType'
import type { ProblemEntryFormValues } from '../../utils/problemEntrySchema'
import { ProblemEntryImpactField } from '../ProblemEntryImpactField'
import { RiskEntryDescriptionField } from '../RiskEntryDescriptionField'
import { RiskEntryIdentificationDateField } from '../RiskEntryIdentificationDateField'
import { RiskEntryNameField } from '../RiskEntryNameField'
import { RiskEntryParticipantsSection } from '../RiskEntryParticipantsSection'
import { RiskEntryPestelField } from '../RiskEntryPestelField'
import { RiskEntryStatusField } from '../RiskEntryStatusField'

/**
 * Form for editing an existing problem entry (ITIL problem management).
 *
 * Assessment is impact-only (no urgency, no scope effort per FA3).
 * Status field is disabled once the entry reaches an irreversible status (Resolved, Closed).
 *
 * @param props - Component props.
 * @param props.entry - The current state of the problem entry to edit.
 * @param props.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param props.scopeId - The ID of the scoped entity.
 * @returns The rendered edit form.
 */
// eslint-disable-next-line max-lines-per-function -- form component; line count scales with number of domain fields, not logic complexity
export function EditProblemEntryForm({
  entry,
  scopeType,
  scopeId,
}: {
  entry: ProblemEntry
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
    isStatusIrreversible,
    statusesLoading,
    entryStatus,
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
  } = useEditProblemEntryForm({ entry, scopeType, scopeId })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <RiskEntryNameField
        idPrefix="edit-problem-entry"
        inputProps={nameInputProps}
        error={errors.name}
      />
      <div className="grid grid-cols-2 gap-4">
        <RiskEntryPestelField
          idPrefix="edit-problem-entry"
          value={pestelCategory ?? null}
          onChange={(v) =>
            setValue('pestelCategory', v as ProblemEntryFormValues['pestelCategory'])
          }
          options={pestelOptions}
          error={errors.pestelCategory}
        />
        <RiskEntryStatusField
          idPrefix="edit-problem-entry"
          value={status}
          onChange={(v) => setValue('status', v ?? entryStatus)}
          options={statusOptions}
          error={errors.status}
          loading={statusesLoading}
          disabled={isStatusIrreversible}
        />
      </div>
      <RiskEntryIdentificationDateField
        idPrefix="edit-problem-entry"
        value={identificationDateObj}
        onChange={onDateChange}
        error={errors.identificationDate}
      />
      <RiskEntryDescriptionField
        idPrefix="edit-problem-entry"
        inputProps={descriptionInputProps}
      />
      <div className="grid grid-cols-2 gap-4">
        <ProblemEntryImpactField
          idPrefix="edit-problem-entry"
          inputProps={impactInputProps}
          error={errors.impact}
        />
      </div>
      <RiskEntryParticipantsSection
        idPrefix="edit-problem-entry"
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
          {t('pages.problemManagement.editProblemEntry.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isPending}
        >
          {t('pages.problemManagement.editProblemEntry.submit')}
        </Button>
      </div>
    </form>
  )
}
