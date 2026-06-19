import { Wand2 } from 'lucide-react'
import type { Control, ControllerRenderProps, UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  Combobox,
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
} from '@/shared/components'
import type { ComboboxOption } from '@/shared/components'

interface AssignMemberFormValues {
  personId: string
  roleId: string
  initials?: string
}

type InitialsField = ControllerRenderProps<AssignMemberFormValues, 'initials'>
type MemberT = ReturnType<typeof useTranslation>['t']

function renderInitialsField(
  control: Control<AssignMemberFormValues>,
  isPending: boolean,
  onGenerateInitials: () => void,
  t: MemberT,
) {
  return (
    <FormField
      control={control}
      name="initials"
      render={({ field }: { field: InitialsField }) => (
        <FormItem>
          <FormLabel>{t('pages.projectMembers.initialsLabel')}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                maxLength={10}
                placeholder={t('pages.projectMembers.initialsPlaceholder')}
                disabled={isPending}
                className="pr-9"
              />
              <button
                type="button"
                disabled={isPending}
                aria-label={t('pages.projectMembers.initialsGenerate')}
                onClick={onGenerateInitials}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 disabled:opacity-50"
              >
                <Wand2 className="h-4 w-4" />
              </button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

interface AssignMemberFormProps {
  form: UseFormReturn<AssignMemberFormValues>
  formId: string
  isPending: boolean
  roleOptions: ComboboxOption[]
  onSearch: (query: string) => Promise<ComboboxOption[]>
  onGenerateInitials: () => void
  onSubmit: (values: AssignMemberFormValues) => Promise<void>
}

/**
 * Controlled form for assigning a member — includes person search, role selection, and initials.
 * Rendered inside AssignMemberDialog; the parent dialog owns submit and cancel actions.
 *
 * @param root0 - Component props.
 * @returns The rendered assign-member form element.
 */
export function AssignMemberForm({
  form,
  formId,
  isPending,
  roleOptions,
  onSearch,
  onGenerateInitials,
  onSubmit,
}: AssignMemberFormProps) {
  const { t } = useTranslation()

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="personId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('pages.projectMembers.personLabel')}</FormLabel>
              <FormControl>
                <Combobox
                  id="assign-person"
                  onSearch={onSearch}
                  debounceMs={300}
                  value={field.value || null}
                  onChange={(v) => field.onChange(v ?? '')}
                  placeholder={t('pages.projectMembers.personPlaceholder')}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="roleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('pages.projectMembers.roleLabel')}</FormLabel>
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('pages.projectMembers.rolePlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roleOptions.map((r) => (
                    <SelectItem
                      key={r.value}
                      value={r.value}
                    >
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {renderInitialsField(form.control, isPending, onGenerateInitials, t)}
      </form>
    </Form>
  )
}
