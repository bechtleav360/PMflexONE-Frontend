import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { usePersons } from '@/entities/person'

import type { IssueEntry } from '../types/issueEntry.types'
import type { ScopeType } from '../types/scopeType'
import { toIsoDateString } from '../utils/dateUtils'
import { numericField } from '../utils/formUtils'
import { issueEntrySchema, type IssueEntryFormValues } from '../utils/issueEntrySchema'
import { PESTEL_OPTIONS, translateOptions } from '../utils/pestelOptions'
import {
  ISSUE_ENTRY_IRREVERSIBLE_STATUSES,
  ISSUE_ENTRY_STATUS_LABELS,
} from '../utils/statusConstants'
import { useEditIssueEntrySubmit } from './useEditIssueEntrySubmit'
import { useIssueEntryStatuses } from './useIssueEntryStatuses'

/** Options for {@link useEditIssueEntryForm}. */
interface UseEditIssueEntryFormOptions {
  /** The issue entry being edited. */
  entry: IssueEntry
  scopeType: ScopeType
  /** The ID of the scoped entity. */
  scopeId: string
}

function buildDefaultValues(entry: IssueEntry) {
  return {
    name: entry.name,
    pestelCategory: entry.pestelCategory,
    description: entry.description ?? undefined,
    status: entry.status,
    identificationDate: entry.identificationDate,
    urgency: entry.urgency ?? undefined,
    impact: entry.impact ?? undefined,
    ownerId: entry.owner?.id ?? undefined,
    reporterId: entry.reporter?.id ?? undefined,
  }
}

/**
 * Encapsulates all form state, field registrations, and watched values for the edit issue entry form.
 *
 * @param options - Options.
 * @param options.entry - The issue entry being edited.
 * @param options.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param options.scopeId - The ID of the scoped entity.
 * @returns Form state, pre-built input props, computed values, and submit/close handlers.
 */
export function useEditIssueEntryForm({ entry, scopeType, scopeId }: UseEditIssueEntryFormOptions) {
  const { t } = useTranslation()
  const { onSubmit, isPending, close } = useEditIssueEntrySubmit({ entry, scopeType, scopeId })
  const { data: statuses = [], isLoading: statusesLoading } = useIssueEntryStatuses()
  const { data: personOptions = [], isLoading: personsLoading } = usePersons()
  const isStatusIrreversible = ISSUE_ENTRY_IRREVERSIBLE_STATUSES.includes(entry.status)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<IssueEntryFormValues>({
    resolver: zodResolver(issueEntrySchema),
    defaultValues: buildDefaultValues(entry),
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
  const pestelOptions = translateOptions(PESTEL_OPTIONS, t)

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
    isStatusIrreversible,
    statusesLoading,
    entryStatus: entry.status,
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
