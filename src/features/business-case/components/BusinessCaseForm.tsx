import { useImperativeHandle } from 'react'
import type { Ref } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  MarkdownEditor,
} from '@/shared/components'

import { businessCaseSchema, type BusinessCaseFormValues } from '../utils/businessCaseSchema'

const FIELDS: Array<{
  name: keyof BusinessCaseFormValues
  labelKey: string
  placeholderKey: string
}> = [
  {
    name: 'clientSummary',
    labelKey: 'pages.businessCase.form.clientSummaryLabel',
    placeholderKey: 'pages.businessCase.form.clientSummaryPlaceholder',
  },
  {
    name: 'projectRationale',
    labelKey: 'pages.businessCase.form.projectRationaleLabel',
    placeholderKey: 'pages.businessCase.form.projectRationalePlaceholder',
  },
  {
    name: 'expectedBenefit',
    labelKey: 'pages.businessCase.form.expectedBenefitLabel',
    placeholderKey: 'pages.businessCase.form.expectedBenefitPlaceholder',
  },
  {
    name: 'options',
    labelKey: 'pages.businessCase.form.optionsLabel',
    placeholderKey: 'pages.businessCase.form.optionsPlaceholder',
  },
  {
    name: 'investmentCalculation',
    labelKey: 'pages.businessCase.form.investmentCalculationLabel',
    placeholderKey: 'pages.businessCase.form.investmentCalculationPlaceholder',
  },
  {
    name: 'keyRisks',
    labelKey: 'pages.businessCase.form.keyRisksLabel',
    placeholderKey: 'pages.businessCase.form.keyRisksPlaceholder',
  },
  {
    name: 'expectedNegativeSideEffect',
    labelKey: 'pages.businessCase.form.expectedNegativeSideEffectLabel',
    placeholderKey: 'pages.businessCase.form.expectedNegativeSideEffectPlaceholder',
  },
  {
    name: 'timeline',
    labelKey: 'pages.businessCase.form.timelineLabel',
    placeholderKey: 'pages.businessCase.form.timelinePlaceholder',
  },
]

const DEFAULT_BC_VALUES: BusinessCaseFormValues = {
  clientSummary: '',
  projectRationale: '',
  expectedBenefit: '',
  options: '',
  investmentCalculation: '',
  keyRisks: '',
  expectedNegativeSideEffect: '',
  timeline: '',
}

/**
 * Handle exposed via ref for external submit wiring (e.g. a Dialog footer).
 * Call `triggerMarkComplete` only when `onMarkComplete` is defined on the form.
 */
export interface BusinessCaseFormHandle {
  /** Validates the form and, if valid, calls `onMarkComplete`. No-op when `onMarkComplete` is absent. */
  triggerMarkComplete: () => void
}

interface BusinessCaseFormProps {
  /** Whether this form is in create or edit mode. */
  mode: 'create' | 'edit'
  /** Pre-populated values for edit mode. */
  defaultValues?: Partial<BusinessCaseFormValues>
  /**
   * Called when the user clicks "Save as Draft" (draft BC) or "Save" (submitted BC).
   * Always rendered — label adapts based on whether `onMarkComplete` is provided.
   */
  onSaveDraft: (values: BusinessCaseFormValues) => void
  /**
   * Called when the user clicks "Mark as Complete".
   * When `undefined`, the button is hidden entirely.
   */
  onMarkComplete?: (values: BusinessCaseFormValues) => void
  /** When `true`, the save button shows a loading state and is disabled. */
  isSavePending: boolean
  /** When `true`, the mark-complete button shows a loading state and is disabled. */
  isSubmitPending?: boolean
  /** HTML `id` applied to the `<form>` element — lets external buttons associate via the `form` attribute. */
  formId?: string
  /** When `true`, the built-in action buttons are not rendered. Use with `formId` and `ref` for external button placement. */
  hideActions?: boolean
  /** Ref exposing `triggerMarkComplete` for external button placement (e.g. a Dialog footer). */
  ref?: Ref<BusinessCaseFormHandle>
}

/**
 * Form for creating or editing a Business Case with 8 optional textarea fields.
 * Used on `BusinessCaseNewPage` (create), `BusinessCaseDetailPage` (edit), and
 * `BusinessCaseDialog` (create / edit in a dialog).
 *
 * When `onMarkComplete` is provided the "Mark as Complete" button is rendered;
 * when absent only the save button is shown.
 *
 * Pass `hideActions` + `formId` to move buttons outside the form (e.g. into a dialog footer).
 * A `ref` exposes `triggerMarkComplete` for external submit wiring.
 *
 * @param props - Component props.
 * @param props.mode - `"create"` or `"edit"`.
 * @param props.defaultValues - Optional pre-populated field values.
 * @param props.onSaveDraft - Save handler — always present.
 * @param props.onMarkComplete - Submit handler — when provided shows "Mark as Complete" button.
 * @param props.isSavePending - Disables save button and shows spinner while pending.
 * @param props.isSubmitPending - Disables mark-complete button and shows spinner while pending.
 * @param props.formId - Optional HTML id for the form element.
 * @param props.hideActions - When true, suppresses built-in action buttons.
 * @param props.ref - Ref to the form handle exposing `triggerMarkComplete`.
 * @returns The business case form.
 */
export function BusinessCaseForm({
  mode,
  defaultValues,
  onSaveDraft,
  onMarkComplete,
  isSavePending,
  isSubmitPending = false,
  formId,
  hideActions = false,
  ref,
}: BusinessCaseFormProps) {
  const { t } = useTranslation()

  const form = useForm<BusinessCaseFormValues>({
    resolver: zodResolver(businessCaseSchema),
    defaultValues: { ...DEFAULT_BC_VALUES, ...defaultValues },
  })

  useImperativeHandle(
    ref,
    () => ({
      triggerMarkComplete: () => {
        if (!onMarkComplete) return
        void form.handleSubmit(onMarkComplete)()
      },
    }),
    [form, onMarkComplete],
  )

  const saveLabel = onMarkComplete
    ? t('pages.businessCase.form.saveDraftButton')
    : t('pages.businessCase.form.saveButton')

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSaveDraft)}
        className="space-y-6"
        aria-label={
          mode === 'create'
            ? t('pages.businessCase.newPage.heading')
            : t('pages.businessCase.detailPage.heading')
        }
      >
        {FIELDS.map(({ name, labelKey, placeholderKey }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem data-testid={`bc-field-${name}`}>
                <FormLabel>{t(labelKey)}</FormLabel>
                <FormControl>
                  <MarkdownEditor
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    placeholder={t(placeholderKey)}
                    ariaLabel={t(labelKey)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        {!hideActions && (
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSavePending}
              aria-disabled={isSavePending}
            >
              {saveLabel}
            </Button>
            {onMarkComplete && (
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitPending}
                aria-disabled={isSubmitPending}
                onClick={() => void form.handleSubmit(onMarkComplete)()}
              >
                {t('pages.businessCase.form.markCompleteButton')}
              </Button>
            )}
          </div>
        )}
      </form>
    </Form>
  )
}
