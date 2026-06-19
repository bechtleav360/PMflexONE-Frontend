import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import type { RoleGroup } from '@/entities/role'
import { useRoleGroups } from '@/entities/role'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/shared/components'

/** Form values for the role definition form (excludes matrixId and tasks). */
export interface RoleDefinitionFormValues {
  name: string
  shortTitle: string
  description?: string
  groupId: string
}

type RoleFormT = (key: string, options?: Record<string, unknown>) => string

function renderDescriptionField(
  control: Control<RoleDefinitionFormValues>,
  isPending: boolean,
  label: string,
) {
  return (
    <FormField
      control={control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              {...field}
              rows={3}
              disabled={isPending}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function renderGroupIdField(
  control: Control<RoleDefinitionFormValues>,
  roleGroups: RoleGroup[],
  isPending: boolean,
  label: string,
  placeholder: string,
) {
  return (
    <FormField
      control={control}
      name="groupId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={isPending}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {roleGroups.map((group) => (
                <SelectItem
                  key={group.id}
                  value={group.id}
                >
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function buildSchema(t: RoleFormT) {
  return z.object({
    name: z.string().min(1, { message: t('pages.roleManagement.validation.required') }),
    shortTitle: z
      .string()
      .min(1, { message: t('pages.roleManagement.validation.required') })
      .max(10, { message: t('validation.maxLength', { max: 10 }) }),
    description: z.string().optional().default(''),
    groupId: z.string().min(1, { message: t('pages.roleManagement.validation.pleaseSelect') }),
  })
}

interface RoleDefinitionFormProps {
  formId?: string
  defaultValues?: Partial<RoleDefinitionFormValues>
  onSubmit: (values: RoleDefinitionFormValues) => void
  isPending?: boolean
}

/**
 * Form for creating or editing a role's core fields.
 * Task permission values are deferred (shown as a placeholder section).
 *
 * @param props - Form configuration.
 * @param props.formId - Optional HTML id for the form element.
 * @param props.defaultValues - Optional initial field values.
 * @param props.onSubmit - Called with validated values on form submission.
 * @param props.isPending - When true, disables the form.
 * @returns The rendered role definition form.
 */
export function RoleDefinitionForm({
  formId,
  defaultValues,
  onSubmit,
  isPending = false,
}: RoleDefinitionFormProps) {
  const { t } = useTranslation()
  const { data: roleGroups = [] } = useRoleGroups()
  const schema = buildSchema(t)

  const form = useForm<RoleDefinitionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      shortTitle: '',
      description: '',
      groupId: '',
      ...defaultValues,
    },
  })

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
              <FormLabel>{t('pages.roleManagement.roleNameLabel')}</FormLabel>
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
          name="shortTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('pages.roleManagement.roleShortTitleLabel')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  maxLength={10}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {renderDescriptionField(
          form.control,
          isPending,
          t('pages.roleManagement.roleDescriptionLabel'),
        )}
        {renderGroupIdField(
          form.control,
          roleGroups,
          isPending,
          t('pages.roleManagement.roleGroupLabel'),
          t('pages.roleManagement.roleGroupLabel'),
        )}
      </form>
    </Form>
  )
}
