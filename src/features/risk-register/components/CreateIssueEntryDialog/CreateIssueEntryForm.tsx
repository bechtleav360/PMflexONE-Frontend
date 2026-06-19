import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components'

import { useCreateIssueEntryForm } from '../../hooks/useCreateIssueEntryForm'
import type { ScopeType } from '../../types/scopeType'
import type { IssueEntryFormValues } from '../../utils/issueEntrySchema'
import { ISSUE_ENTRY_STATUS } from '../../utils/statusConstants'
import { IssueEntryScoreSection } from '../IssueEntryScoreSection'
import { RiskEntryDescriptionField } from '../RiskEntryDescriptionField'
import { RiskEntryIdentificationDateField } from '../RiskEntryIdentificationDateField'
import { RiskEntryNameField } from '../RiskEntryNameField'
import { RiskEntryParticipantsSection } from '../RiskEntryParticipantsSection'
import { RiskEntryPestelField } from '../RiskEntryPestelField'
import { RiskEntryStatusField } from '../RiskEntryStatusField'

/**
 * Form for creating a new issue entry.
 *
 * Pre-populates status with "Open" and identification date with today.
 * Passes `scopeType` and `scopeId` directly in the create input.
 *
 * @param props - Component props.
 * @param props.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param props.scopeId - The ID of the scoped entity.
 * @returns The rendered creation form.
 */
// eslint-disable-next-line max-lines-per-function -- form component; line count scales with number of domain fields, not logic complexity
export function CreateIssueEntryForm({
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
    urgencyInputProps,
    impactInputProps,
    ownerValue,
    onOwnerChange,
    reporterValue,
    onReporterChange,
    personOptions,
    personsLoading,
    onDateChange,
  } = useCreateIssueEntryForm({ scopeType, scopeId })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <RiskEntryNameField
        idPrefix="issue-entry"
        inputProps={nameInputProps}
        error={errors.name}
      />
      <div className="grid grid-cols-2 gap-4">
        <RiskEntryPestelField
          idPrefix="issue-entry"
          value={pestelCategory ?? null}
          onChange={(v) => setValue('pestelCategory', v as IssueEntryFormValues['pestelCategory'])}
          options={pestelOptions}
          error={errors.pestelCategory}
        />
        <RiskEntryStatusField
          idPrefix="issue-entry"
          value={status}
          onChange={(v) => setValue('status', v ?? ISSUE_ENTRY_STATUS.OPEN)}
          options={statusOptions}
          error={errors.status}
          loading={statusesLoading}
        />
      </div>
      <RiskEntryIdentificationDateField
        idPrefix="issue-entry"
        value={identificationDateObj}
        onChange={onDateChange}
        error={errors.identificationDate}
      />
      <RiskEntryDescriptionField
        idPrefix="issue-entry"
        inputProps={descriptionInputProps}
      />
      <IssueEntryScoreSection
        idPrefix="issue-entry"
        urgencyInputProps={urgencyInputProps}
        urgencyError={errors.urgency}
        impactInputProps={impactInputProps}
        impactError={errors.impact}
      />
      <RiskEntryParticipantsSection
        idPrefix="issue-entry"
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
          {t('pages.issueManagement.createIssueEntry.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isPending}
        >
          {t('pages.issueManagement.createIssueEntry.submit')}
        </Button>
      </div>
    </form>
  )
}
