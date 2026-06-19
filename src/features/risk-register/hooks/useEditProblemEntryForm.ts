import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { usePersons } from '@/entities/person'

import type { ProblemEntry } from '../types/problemEntry.types'
import type { ScopeType } from '../types/scopeType'
import { toIsoDateString } from '../utils/dateUtils'
import { numericField } from '../utils/formUtils'
import { PESTEL_OPTIONS, translateOptions } from '../utils/pestelOptions'
import { problemEntrySchema, type ProblemEntryFormValues } from '../utils/problemEntrySchema'
import {
  PROBLEM_ENTRY_IRREVERSIBLE_STATUSES,
  PROBLEM_ENTRY_STATUS_LABELS,
} from '../utils/statusConstants'
import { useEditProblemEntrySubmit } from './useEditProblemEntrySubmit'
import { useProblemEntryStatuses } from './useProblemEntryStatuses'

/** Options for {@link useEditProblemEntryForm}. */
interface UseEditProblemEntryFormOptions {
  /** The problem entry being edited. */
  entry: ProblemEntry
  scopeType: ScopeType
  /** The ID of the scoped entity. */
  scopeId: string
}

function buildDefaultValues(entry: ProblemEntry) {
  return {
    name: entry.name,
    pestelCategory: entry.pestelCategory,
    description: entry.description ?? undefined,
    status: entry.status,
    identificationDate: entry.identificationDate,
    impact: entry.impact ?? undefined,
    ownerId: entry.owner?.id ?? undefined,
    reporterId: entry.reporter?.id ?? undefined,
  }
}

/**
 * Encapsulates all form state, field registrations, and watched values for the edit problem entry form.
 *
 * @param options - Options.
 * @param options.entry - The problem entry being edited.
 * @param options.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param options.scopeId - The ID of the scoped entity.
 * @returns Form state, pre-built input props, computed values, and submit/close handlers.
 */
export function useEditProblemEntryForm({
  entry,
  scopeType,
  scopeId,
}: UseEditProblemEntryFormOptions) {
  const { t } = useTranslation()
  const { onSubmit, isPending, close } = useEditProblemEntrySubmit({ entry, scopeType, scopeId })
  const { data: statuses = [], isLoading: statusesLoading } = useProblemEntryStatuses()
  const { data: personOptions = [], isLoading: personsLoading } = usePersons()
  const isStatusIrreversible = PROBLEM_ENTRY_IRREVERSIBLE_STATUSES.includes(entry.status)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProblemEntryFormValues>({
    resolver: zodResolver(problemEntrySchema),
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
    label: t(PROBLEM_ENTRY_STATUS_LABELS[s.status.toLowerCase()] ?? s.status),
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
