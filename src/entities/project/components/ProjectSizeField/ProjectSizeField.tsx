import type { Control } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components'
import { REQUIRED_MARKER } from '@/shared/lib/constants'

import type { ProjectFormValues } from '../../types/projectForm.types'

interface ProjectSizeFieldProps {
  /** RHF control wired to a project form. */
  control: Control<ProjectFormValues>
  /** Mirrors the mutation pending state to disable the select. */
  isPending: boolean
  /** i18n keys for all translatable strings in this field. */
  i18nKeys: {
    label: string
    placeholder: string
    small: string
    medium: string
    large: string
  }
}

/**
 * Renders the Size Classification select field for a project form.
 *
 * Shared by `CreateProjectForm` and `EditProjectForm`. All translatable
 * strings are injected via `i18nKeys` so each feature can use its own
 * translation scope.
 *
 * @param props - Component props.
 * @param props.control - React Hook Form control instance.
 * @param props.isPending - When `true`, the select is disabled.
 * @param props.i18nKeys - Resolved translation strings for labels and options.
 * @returns The size classification form field.
 */
export function ProjectSizeField({ control, isPending, i18nKeys }: ProjectSizeFieldProps) {
  const { t } = useTranslation()

  return (
    <FormField
      control={control}
      name="sizeClassification"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {t(i18nKeys.label)}
            <span
              className="text-destructive ml-0.5"
              aria-hidden="true"
            >
              {REQUIRED_MARKER}
            </span>
          </FormLabel>
          <FormControl>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isPending}
            >
              <SelectTrigger aria-required="true">
                <SelectValue placeholder={t(i18nKeys.placeholder)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="small"
                  data-testid="option-small"
                >
                  {t(i18nKeys.small)}
                </SelectItem>
                <SelectItem
                  value="medium"
                  data-testid="option-medium"
                >
                  {t(i18nKeys.medium)}
                </SelectItem>
                <SelectItem
                  value="large"
                  data-testid="option-large"
                >
                  {t(i18nKeys.large)}
                </SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
