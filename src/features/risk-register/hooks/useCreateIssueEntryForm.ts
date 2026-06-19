import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { usePersons } from '@/entities/person'

import type { ScopeType } from '../types/scopeType'
import { toIsoDateString } from '../utils/dateUtils'
import { numericField } from '../utils/formUtils'
import { issueEntrySchema, type IssueEntryFormValues } from '../utils/issueEntrySchema'
import { PESTEL_OPTIONS } from '../utils/pestelOptions'
import { ISSUE_ENTRY_STATUS, ISSUE_ENTRY_STATUS_LABELS } from '../utils/statusConstants'
import { useCreateIssueEntrySubmit } from './useCreateIssueEntrySubmit'
import { useIssueEntryStatuses } from './useIssueEntryStatuses'

/** Options for {@link useCreateIssueEntryForm}. */
interface UseCreateIssueEntryFormOptions {
  scopeType: ScopeType
  scopeId: string
}

/**
 * Encapsulates all form state, field registrations, and watched values for the create issue entry form.
 *
 * @param options - Options.
 * @param options.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param options.scopeId - The ID of the scoped entity.
 * @returns Form state, pre-built input props, computed values, and submit/close handlers.
 */
export function useCreateIssueEntryForm({ scopeType, scopeId }: UseCreateIssueEntryFormOptions) {
  const { t } = useTranslation()
  const { onSubmit, isPending, close } = useCreateIssueEntrySubmit(scopeType, scopeId)
  const { data: statuses = [], isLoading: statusesLoading } = useIssueEntryStatuses()
  const { data: personOptions = [], isLoading: personsLoading } = usePersons()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<IssueEntryFormValues>({
    resolver: zodResolver(issueEntrySchema),
    defaultValues: {
      name: '',
      pestelCategory: undefined,
      description: undefined,
      status: ISSUE_ENTRY_STATUS.OPEN,
      identificationDate: toIsoDateString(new Date()),
      urgency: undefined,
      impact: undefined,
      ownerId: undefined,
      reporterId: undefined,
    },
  })

  const [pestelCategory, status, identificationDate, ownerId, reporterId] = useWatch({
    control,
    name: ['pestelCategory', 'status', 'identificationDate', 'ownerId', 'reporterId'],
  })
  const identificationDateObj = identificationDate
    ? new Date(`${identificationDate}T00:00:00`)
    : null

  const statusOptions = statuses.map((s) => ({
    value: s.status,
    label: t(ISSUE_ENTRY_STATUS_LABELS[s.status.toLowerCase()] ?? s.status),
  }))
  const pestelOptions = PESTEL_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))

  return {
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
    nameInputProps: register('name'),
    descriptionInputProps: register('description'),
    urgencyInputProps: register('urgency', { setValueAs: numericField }),
    impactInputProps: register('impact', { setValueAs: numericField }),
    ownerValue: ownerId ?? null,
    onOwnerChange: (v: string | null) => setValue('ownerId', v ?? undefined),
    reporterValue: reporterId ?? null,
    onReporterChange: (v: string | null) => setValue('reporterId', v ?? undefined),
    personOptions,
    personsLoading,
    onDateChange: (date: Date | null | undefined) =>
      setValue('identificationDate', toIsoDateString(date)),
  }
}
