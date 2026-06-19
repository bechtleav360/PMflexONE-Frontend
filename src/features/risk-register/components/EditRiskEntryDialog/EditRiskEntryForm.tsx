import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { usePersons } from '@/entities/person'

import { useRiskEntryStatuses } from '../../hooks/useRiskEntryStatuses'
import type { RiskEntry } from '../../types/riskEntry.types'
import { toIsoDateString } from '../../utils/dateUtils'
import { numericField } from '../../utils/formUtils'
import { PESTEL_OPTIONS, translateOptions } from '../../utils/pestelOptions'
import { riskEntrySchema, type RiskEntryFormValues } from '../../utils/riskEntrySchema'
import { RISK_TYPE_OPTIONS } from '../../utils/riskTypeOptions'
import {
  RISK_ENTRY_IRREVERSIBLE_STATUSES,
  RISK_ENTRY_STATUS_LABELS,
} from '../../utils/statusConstants'
import { RiskEntryDescriptionField } from '../RiskEntryDescriptionField'
import { RiskEntryIdentificationDateField } from '../RiskEntryIdentificationDateField'
import { RiskEntryNameField } from '../RiskEntryNameField'
import { RiskEntryParticipantsSection } from '../RiskEntryParticipantsSection'
import { RiskEntryPestelField } from '../RiskEntryPestelField'
import { RiskEntryScoreSection } from '../RiskEntryScoreSection'
import { RiskEntryStatusField } from '../RiskEntryStatusField'
import { RiskEntryTypeField } from '../RiskEntryTypeField'

function getDefaultValues(entry: RiskEntry): RiskEntryFormValues {
  return {
    type: entry.type,
    name: entry.name,
    pestelCategory: entry.pestelCategory,
    description: entry.description ?? undefined,
    status: entry.status,
    identificationDate: entry.identificationDate,
    probability: entry.probability ?? undefined,
    impact: entry.impact ?? undefined,
    ownerId: entry.owner?.id ?? undefined,
    reporterId: entry.reporter?.id ?? undefined,
  }
}

/** Props for {@link EditRiskEntryForm}. */
interface EditRiskEntryFormProps {
  /** The current state of the risk entry to edit. */
  entry: RiskEntry
  /** Called with validated form values on submit. */
  onSubmit: (values: RiskEntryFormValues) => void | Promise<void>
  /** Whether a submit mutation is in flight. */
  isPending: boolean
}

/**
 * Form for editing an existing risk or opportunity entry.
 *
 * Pre-populates all fields from the provided `entry` object. Passes the entry's
 * `version` for optimistic concurrency control. Status field is disabled when
 * the entry has reached an irreversible status (Approved, Occurred, Rejected, Closed).
 *
 * @param props - Component props.
 * @param props.entry - The current state of the risk entry to edit.
 * @param props.onSubmit - Called with validated form values on submit.
 * @param props.isPending - Whether a submit mutation is in flight.
 * @returns The rendered edit form.
 */
export function EditRiskEntryForm({
  entry,
  onSubmit,
  isPending: _isPending,
}: EditRiskEntryFormProps) {
  const { t } = useTranslation()
  const { data: statuses = [], isLoading: statusesLoading } = useRiskEntryStatuses()
  const { data: personOptions = [], isLoading: personsLoading } = usePersons()
  const isStatusIrreversible = RISK_ENTRY_IRREVERSIBLE_STATUSES.includes(entry.status)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<RiskEntryFormValues>({
    resolver: zodResolver(riskEntrySchema),
    defaultValues: getDefaultValues(entry),
  })

  const [type, pestelCategory, status, identificationDate, ownerId, reporterId] = useWatch({
    control,
    name: ['type', 'pestelCategory', 'status', 'identificationDate', 'ownerId', 'reporterId'],
  })
  const identificationDateObj = identificationDate
    ? new Date(`${identificationDate}T00:00:00`)
    : null

  const statusOptions = statuses.map((s) => ({
    value: s.status,
    label: t(RISK_ENTRY_STATUS_LABELS[s.status.toLowerCase()] ?? s.status),
  }))
  const pestelOptions = translateOptions(PESTEL_OPTIONS, t)
  const typeOptions = translateOptions(RISK_TYPE_OPTIONS, t)
  return (
    <form
      id="edit-risk-entry-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <RiskEntryTypeField
        idPrefix="edit-risk-entry"
        value={type}
        onChange={(v) => setValue('type', (v ?? 'RISK') as 'RISK' | 'OPPORTUNITY')}
        options={typeOptions}
        error={errors.type}
        disabled
      />
      <RiskEntryNameField
        idPrefix="edit-risk-entry"
        inputProps={register('name')}
        error={errors.name}
      />
      <RiskEntryPestelField
        idPrefix="edit-risk-entry"
        value={pestelCategory ?? null}
        onChange={(v) => setValue('pestelCategory', v as RiskEntryFormValues['pestelCategory'])}
        options={pestelOptions}
        error={errors.pestelCategory}
      />
      <RiskEntryStatusField
        idPrefix="edit-risk-entry"
        value={status}
        onChange={(v) => setValue('status', v ?? entry.status)}
        options={statusOptions}
        error={errors.status}
        loading={statusesLoading}
        disabled={isStatusIrreversible}
      />
      <RiskEntryIdentificationDateField
        idPrefix="edit-risk-entry"
        value={identificationDateObj}
        onChange={(date) => setValue('identificationDate', toIsoDateString(date))}
        error={errors.identificationDate}
      />
      <RiskEntryDescriptionField
        idPrefix="edit-risk-entry"
        inputProps={register('description')}
      />
      <RiskEntryScoreSection
        idPrefix="edit-risk-entry"
        probabilityInputProps={register('probability', { setValueAs: numericField })}
        probabilityError={errors.probability}
        impactInputProps={register('impact', { setValueAs: numericField })}
        impactError={errors.impact}
      />
      <RiskEntryParticipantsSection
        idPrefix="edit-risk-entry"
        ownerValue={ownerId ?? null}
        onOwnerChange={(v) => setValue('ownerId', v ?? undefined)}
        reporterValue={reporterId ?? null}
        onReporterChange={(v) => setValue('reporterId', v ?? undefined)}
        personOptions={personOptions}
        personsLoading={personsLoading}
      />
    </form>
  )
}
