import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components'

import { useEditIssueEntryForm } from '../../hooks/useEditIssueEntryForm'
import type { IssueEntry } from '../../types/issueEntry.types'
import type { ScopeType } from '../../types/scopeType'
import type { IssueEntryFormValues } from '../../utils/issueEntrySchema'
import { IssueEntryScoreSection } from '../IssueEntryScoreSection'
import { RiskEntryDescriptionField } from '../RiskEntryDescriptionField'
import { RiskEntryIdentificationDateField } from '../RiskEntryIdentificationDateField'
import { RiskEntryNameField } from '../RiskEntryNameField'
import { RiskEntryParticipantsSection } from '../RiskEntryParticipantsSection'
import { RiskEntryPestelField } from '../RiskEntryPestelField'
import { RiskEntryStatusField } from '../RiskEntryStatusField'

/**
 * Form for editing an existing issue entry.
 *
 * Pre-populates all fields from the provided `entry` object. Passes the entry's
 * `version` for optimistic concurrency control. Status field is disabled when
 * the entry has reached an irreversible status (Resolved, Closed).
 *
 * @param props - Component props.
 * @param props.entry - The current state of the issue entry to edit.
 * @param props.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param props.scopeId - The ID of the scoped entity.
 * @returns The rendered edit form.
 */
// eslint-disable-next-line max-lines-per-function -- form component; line count scales with number of domain fields, not logic complexity
export function EditIssueEntryForm({
  entry,
  scopeType,
  scopeId,
}: {
  entry: IssueEntry
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
    urgencyInputProps,
    impactInputProps,
    ownerValue,
    onOwnerChange,
    reporterValue,
    onReporterChange,
    personOptions,
    personsLoading,
    onDateChange,
  } = useEditIssueEntryForm({ entry, scopeType, scopeId })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <RiskEntryNameField
        idPrefix="edit-issue-entry"
        inputProps={nameInputProps}
        error={errors.name}
      />
      <div className="grid grid-cols-2 gap-4">
        <RiskEntryPestelField
          idPrefix="edit-issue-entry"
          value={pestelCategory ?? null}
          onChange={(v) => setValue('pestelCategory', v as IssueEntryFormValues['pestelCategory'])}
          options={pestelOptions}
          error={errors.pestelCategory}
        />
        <RiskEntryStatusField
          idPrefix="edit-issue-entry"
          value={status}
          onChange={(v) => setValue('status', v ?? entryStatus)}
          options={statusOptions}
          error={errors.status}
          loading={statusesLoading}
          disabled={isStatusIrreversible}
        />
      </div>
      <RiskEntryIdentificationDateField
        idPrefix="edit-issue-entry"
        value={identificationDateObj}
        onChange={onDateChange}
        error={errors.identificationDate}
      />
      <RiskEntryDescriptionField
        idPrefix="edit-issue-entry"
        inputProps={descriptionInputProps}
      />
      <IssueEntryScoreSection
        idPrefix="edit-issue-entry"
        urgencyInputProps={urgencyInputProps}
        urgencyError={errors.urgency}
        impactInputProps={impactInputProps}
        impactError={errors.impact}
      />
      <RiskEntryParticipantsSection
        idPrefix="edit-issue-entry"
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
          {t('pages.issueManagement.editIssueEntry.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isPending}
        >
          {t('pages.issueManagement.editIssueEntry.submit')}
        </Button>
      </div>
    </form>
  )
}
