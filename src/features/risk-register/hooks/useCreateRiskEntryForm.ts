import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { usePersons } from '@/entities/person'

import type { ScopeType } from '../types/scopeType'
import { toIsoDateString } from '../utils/dateUtils'
import { numericField } from '../utils/formUtils'
import { PESTEL_OPTIONS, translateOptions } from '../utils/pestelOptions'
import { riskEntrySchema, type RiskEntryFormValues } from '../utils/riskEntrySchema'
import { RISK_TYPE_OPTIONS } from '../utils/riskTypeOptions'
import { RISK_ENTRY_STATUS, RISK_ENTRY_STATUS_LABELS } from '../utils/statusConstants'
import { useCreateRiskEntrySubmit } from './useCreateRiskEntrySubmit'
import { useRiskEntryStatuses } from './useRiskEntryStatuses'

/** Options for {@link useCreateRiskEntryForm}. */
interface UseCreateRiskEntryFormOptions {
  scopeType: ScopeType
  scopeId: string
}

/**
 * Encapsulates all form state, field registrations, and watched values for the create risk entry form.
 *
 * @param options - Options.
 * @param options.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param options.scopeId - The ID of the scoped entity.
 * @returns Form state, pre-built input props, computed values, and submit/close handlers.
 */
export function useCreateRiskEntryForm({ scopeType, scopeId }: UseCreateRiskEntryFormOptions) {
  const { t } = useTranslation()
  const { onSubmit, isPending, close } = useCreateRiskEntrySubmit(scopeType, scopeId)
  const { data: statuses = [], isLoading: statusesLoading } = useRiskEntryStatuses()
  const { data: personOptions = [], isLoading: personsLoading } = usePersons()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<RiskEntryFormValues>({
    resolver: zodResolver(riskEntrySchema),
    defaultValues: {
      type: 'RISK',
      name: '',
      pestelCategory: undefined,
      description: undefined,
      status: RISK_ENTRY_STATUS.PROPOSED,
      identificationDate: toIsoDateString(new Date()),
      probability: undefined,
      impact: undefined,
      ownerId: undefined,
      reporterId: undefined,
    },
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

  return {
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
    nameInputProps: register('name'),
    descriptionInputProps: register('description'),
    probabilityInputProps: register('probability', { setValueAs: numericField }),
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
