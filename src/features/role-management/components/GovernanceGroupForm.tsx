import { zodResolver } from '@hookform/resolvers/zod'
import { useController, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { createRoleGroupInputSchema } from '@/entities/role'
import type { CreateRoleGroupInput } from '@/entities/role'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from '@/shared/components'

import { RgbColorInput } from './RgbColorInput'

/** Form values for the governance group form. */
export type GovernanceGroupFormValues = CreateRoleGroupInput

interface GovernanceGroupFormProps {
  formId?: string
  defaultValues?: Partial<GovernanceGroupFormValues>
  onSubmit: (values: GovernanceGroupFormValues) => void
  isPending?: boolean
}

/**
 * Form for creating or editing a governance (role) group.
 * Fields: name (required), description (optional), sortOrder (number, min 0), color (optional hex).
 *
 * @param props - Form configuration.
 * @param props.formId - Optional HTML id for the form element.
 * @param props.defaultValues - Optional initial field values.
 * @param props.onSubmit - Called with validated values on form submission.
 * @param props.isPending - When true, disables the form.
 * @returns The rendered governance group form.
 */
export function GovernanceGroupForm({
  formId,
  defaultValues,
  onSubmit,
  isPending = false,
}: GovernanceGroupFormProps) {
  const { t } = useTranslation()

  const form = useForm<GovernanceGroupFormValues>({
    resolver: zodResolver(createRoleGroupInputSchema),
    defaultValues: {
      name: '',
      description: '',
      sortOrder: 0,
      color: '',
      ...defaultValues,
    },
  })

  const colorController = useController({ control: form.control, name: 'color' })

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('pages.roleManagement.groupNameLabel')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('pages.roleManagement.groupDescriptionLabel')}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={2}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sortOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('pages.roleManagement.groupSortOrderLabel')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={0}
                  disabled={isPending}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>{t('pages.roleManagement.groupColorLabel', 'Color')}</FormLabel>
          <FormControl>
            <RgbColorInput
              value={colorController.field.value ?? ''}
              onChange={(v) => colorController.field.onChange(v || undefined)}
              disabled={isPending}
            />
          </FormControl>
          <FormMessage>{form.formState.errors.color?.message}</FormMessage>
        </FormItem>
      </form>
    </Form>
  )
}
