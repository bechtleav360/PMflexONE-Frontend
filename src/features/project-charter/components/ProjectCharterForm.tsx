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

import { projectCharterSchema, type ProjectCharterFormValues } from '../utils/projectCharterSchema'

/**
 * Handle exposed via ref for external submit wiring (e.g. a Dialog footer).
 * Call `triggerSubmit` only when `onSubmit` is defined on the form.
 */
export interface ProjectCharterFormHandle {
  /** Validates the form and, if valid, calls `onSubmit`. No-op when `onSubmit` is absent. */
  triggerSubmit: () => void
}

const FIELDS: Array<{
  name: keyof ProjectCharterFormValues
  labelKey: string
  placeholderKey: string
}> = [
  {
    name: 'projectSummary',
    labelKey: 'pages.projectCharter.form.projectSummaryLabel',
    placeholderKey: 'pages.projectCharter.form.projectSummaryPlaceholder',
  },
  {
    name: 'scopeSummary',
    labelKey: 'pages.projectCharter.form.scopeSummaryLabel',
    placeholderKey: 'pages.projectCharter.form.scopeSummaryPlaceholder',
  },
  {
    name: 'successCriteria',
    labelKey: 'pages.projectCharter.form.successCriteriaLabel',
    placeholderKey: 'pages.projectCharter.form.successCriteriaPlaceholder',
  },
  {
    name: 'stakeholders',
    labelKey: 'pages.projectCharter.form.stakeholdersLabel',
    placeholderKey: 'pages.projectCharter.form.stakeholdersPlaceholder',
  },
  {
    name: 'requirement',
    labelKey: 'pages.projectCharter.form.requirementLabel',
    placeholderKey: 'pages.projectCharter.form.requirementPlaceholder',
  },
  {
    name: 'projectConstraint',
    labelKey: 'pages.projectCharter.form.projectConstraintLabel',
    placeholderKey: 'pages.projectCharter.form.projectConstraintPlaceholder',
  },
  {
    name: 'assumption',
    labelKey: 'pages.projectCharter.form.assumptionLabel',
    placeholderKey: 'pages.projectCharter.form.assumptionPlaceholder',
  },
  {
    name: 'risk',
    labelKey: 'pages.projectCharter.form.riskLabel',
    placeholderKey: 'pages.projectCharter.form.riskPlaceholder',
  },
  {
    name: 'resources',
    labelKey: 'pages.projectCharter.form.resourcesLabel',
    placeholderKey: 'pages.projectCharter.form.resourcesPlaceholder',
  },
  {
    name: 'operationalImplementation',
    labelKey: 'pages.projectCharter.form.operationalImplementationLabel',
    placeholderKey: 'pages.projectCharter.form.operationalImplementationPlaceholder',
  },
]

const DEFAULT_CHARTER_VALUES: ProjectCharterFormValues = {
  projectSummary: '',
  scopeSummary: '',
  successCriteria: '',
  stakeholders: '',
  requirement: '',
  projectConstraint: '',
  assumption: '',
  risk: '',
  resources: '',
  operationalImplementation: '',
}

interface ProjectCharterFormProps {
  mode: 'create' | 'edit'
  defaultValues?: Partial<ProjectCharterFormValues>
  onSave: (values: ProjectCharterFormValues) => void
  /** When `undefined`, the Submit button is not rendered. */
  onSubmit?: (values: ProjectCharterFormValues) => void
  isSavePending: boolean
  isSubmitPending?: boolean
  /** HTML `id` applied to the `<form>` element — lets external buttons associate via the `form` attribute. */
  formId?: string
  /** When `true`, the built-in action buttons are not rendered. Use with `formId` and `ref` for external button placement. */
  hideActions?: boolean
  /** Ref exposing `triggerSubmit` for external button placement (e.g. a Dialog footer). */
  ref?: Ref<ProjectCharterFormHandle>
}

/**
 * Form for creating or editing a Project Charter with 10 optional textarea fields.
 * Used on `ProjectCharterNewPage` (create), `ProjectCharterDetailPage` (edit), and
 * `ProjectCharterDialog` (create / edit in a dialog).
 *
 * When `onSubmit` is provided the "Submit" button is rendered; when absent only
 * the Save button is shown. Pass `hideActions` + `formId` to move buttons outside
 * the form (e.g. a dialog footer). A `ref` exposes `triggerSubmit` for external wiring.
 *
 * @param props - Form configuration.
 * @param props.mode - Whether the form is creating or editing a charter.
 * @param props.defaultValues - Optional field values to pre-populate the form.
 * @param props.onSave - Called with validated values when Save is clicked.
 * @param props.onSubmit - Called with validated values when Submit is clicked. When undefined, the Submit button is not rendered.
 * @param props.isSavePending - Disables the Save button while a save mutation is in flight.
 * @param props.isSubmitPending - Disables the Submit button while a submit mutation is in flight.
 * @param props.formId - Optional HTML id for the form element.
 * @param props.hideActions - When true, suppresses built-in action buttons.
 * @param props.ref - Ref to the form handle exposing `triggerSubmit`.
 * @returns The rendered project charter form with Save and optional Submit actions.
 */
export function ProjectCharterForm({
  mode,
  defaultValues,
  onSave,
  onSubmit,
  isSavePending,
  isSubmitPending = false,
  formId,
  hideActions = false,
  ref,
}: ProjectCharterFormProps) {
  const { t } = useTranslation()

  const form = useForm<ProjectCharterFormValues>({
    resolver: zodResolver(projectCharterSchema),
    defaultValues: { ...DEFAULT_CHARTER_VALUES, ...defaultValues },
  })

  useImperativeHandle(
    ref,
    () => ({
      triggerSubmit: () => {
        if (!onSubmit) return
        void form.handleSubmit(onSubmit)()
      },
    }),
    [form, onSubmit],
  )

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSave)}
        className="space-y-6"
        aria-label={
          mode === 'create'
            ? t('pages.projectCharter.newPage.heading')
            : t('pages.projectCharter.detailPage.heading')
        }
      >
        {FIELDS.map(({ name, labelKey, placeholderKey }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
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
              {t('pages.projectCharter.form.saveButton')}
            </Button>
            {onSubmit && (
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitPending}
                aria-disabled={isSubmitPending}
                onClick={() => void form.handleSubmit(onSubmit)()}
              >
                {t('pages.projectCharter.form.submitButton')}
              </Button>
            )}
          </div>
        )}
      </form>
    </Form>
  )
}
