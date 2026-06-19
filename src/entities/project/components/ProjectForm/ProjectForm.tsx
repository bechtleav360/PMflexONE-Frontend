import type { FormEventHandler } from 'react'

import type { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  MarkdownEditor,
} from '@/shared/components'
import { REQUIRED_MARKER } from '@/shared/lib/constants'

import type { ProjectFormValues } from '../../types/projectForm.types'
import { ProjectDateRangeFields } from '../ProjectDateRangeFields'
import { ProjectSizeField } from '../ProjectSizeField'

/**
 * i18n key bundles injected by each feature so the form can render its
 * own translated labels without being coupled to a specific key namespace.
 */
export interface ProjectFormI18nKeys {
  nameLabel: string
  namePlaceholder: string
  sizeClassificationLabel: string
  sizeClassificationPlaceholder: string
  sizeSmall: string
  sizeMedium: string
  sizeLarge: string
  startDateLabel: string
  endDateLabel: string
  descriptionLabel: string
  descriptionPlaceholder: string
  cancel: string
  submit: string
}

interface ProjectFormProps {
  /** The React Hook Form instance returned by the feature-level form hook. */
  form: UseFormReturn<ProjectFormValues>
  /** Mirrors the mutation pending state; disables all fields and buttons while true. */
  isPending: boolean
  /** The `handleSubmit`-wrapped submit handler from the feature-level form hook. */
  onSubmit: FormEventHandler<HTMLFormElement>
  /** Called when the user clicks the Cancel button. */
  onCancel?: () => void
  /** Resolved translation key paths for all user-visible strings. */
  i18nKeys: ProjectFormI18nKeys
}

/**
 * Shared form body for create-project and edit-project.
 *
 * Renders the project name, size classification, date range, and description
 * fields. All translatable strings are supplied via `i18nKeys` so each
 * consuming feature retains its own i18n namespace. Form state is fully
 * controlled by the caller via the `form`, `isPending`, and `onSubmit` props —
 * this component has no mutation logic of its own.
 *
 * @param props - Component props.
 * @param props.form - React Hook Form instance.
 * @param props.isPending - Disables all inputs and buttons while `true`.
 * @param props.onSubmit - Submit handler; wrap with `form.handleSubmit` before passing.
 * @param props.onCancel - Optional cancel callback.
 * @param props.i18nKeys - Feature-scoped translation key paths.
 * @returns The project form.
 */
export function ProjectForm({ form, isPending, onSubmit, onCancel, i18nKeys }: ProjectFormProps) {
  const { t } = useTranslation()

  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t(i18nKeys.nameLabel)}
                <span
                  className="text-destructive ml-0.5"
                  aria-hidden="true"
                >
                  {REQUIRED_MARKER}
                </span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t(i18nKeys.namePlaceholder)}
                  disabled={isPending}
                  aria-required="true"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ProjectSizeField
          control={form.control}
          isPending={isPending}
          i18nKeys={{
            label: i18nKeys.sizeClassificationLabel,
            placeholder: i18nKeys.sizeClassificationPlaceholder,
            small: i18nKeys.sizeSmall,
            medium: i18nKeys.sizeMedium,
            large: i18nKeys.sizeLarge,
          }}
        />

        <ProjectDateRangeFields
          control={form.control}
          isPending={isPending}
          i18nKeys={{
            startDateLabel: i18nKeys.startDateLabel,
            endDateLabel: i18nKeys.endDateLabel,
          }}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t(i18nKeys.descriptionLabel)}</FormLabel>
              <FormControl>
                <MarkdownEditor
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder={t(i18nKeys.descriptionPlaceholder)}
                  ariaLabel={t(i18nKeys.descriptionLabel)}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onCancel}
          >
            {t(i18nKeys.cancel)}
          </Button>
          <Button
            type="submit"
            disabled={isPending}
          >
            {t(i18nKeys.submit)}
          </Button>
        </div>
      </form>
    </Form>
  )
}
