import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import type { StrategyDescription } from '@/entities/stakeholder'
import {
  Button,
  DialogFooter,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Textarea,
} from '@/shared/components'
import type { ScopeType } from '@/shared/types/scopeType'

import {
  strategyDescriptionsFormSchema,
  useUpsertStrategyDescriptionForm,
  type StrategyDescriptionsFormValues,
} from '../hooks/useUpsertStrategyDescriptionForm'

/** Props for {@link StrategyDescriptionsEditForm}. */
export interface StrategyDescriptionsEditFormProps {
  scopeType: ScopeType
  scopeId: string
  initialValues?: StrategyDescription | null
  onSuccess: () => void
}

/**
 * Form for editing the four strategy description quadrant texts.
 *
 * @param props - Component props.
 * @param props.scopeType - The type of scope (Project, Program, Portfolio).
 * @param props.scopeId - The ID of the scope.
 * @param props.initialValues - Existing strategy descriptions to pre-fill the form.
 * @param props.onSuccess - Callback invoked after a successful save.
 * @returns A form with text areas for each quadrant strategy description.
 */
export function StrategyDescriptionsEditForm({
  scopeType,
  scopeId,
  initialValues,
  onSuccess,
}: StrategyDescriptionsEditFormProps) {
  const { t } = useTranslation()
  const { submit, isPending } = useUpsertStrategyDescriptionForm({ scopeType, scopeId, onSuccess })

  const form = useForm<StrategyDescriptionsFormValues>({
    resolver: zodResolver(strategyDescriptionsFormSchema),
    defaultValues: {
      monitor: initialValues?.monitor ?? '',
      keepInformed: initialValues?.keepInformed ?? '',
      keepSatisfied: initialValues?.keepSatisfied ?? '',
      manageClosely: initialValues?.manageClosely ?? '',
    },
  })

  const fields = [
    { name: 'monitor' as const, label: t('pages.stakeholderRegister.strategyConfig.monitorLabel') },
    {
      name: 'keepInformed' as const,
      label: t('pages.stakeholderRegister.strategyConfig.keepInformedLabel'),
    },
    {
      name: 'keepSatisfied' as const,
      label: t('pages.stakeholderRegister.strategyConfig.keepSatisfiedLabel'),
    },
    {
      name: 'manageClosely' as const,
      label: t('pages.stakeholderRegister.strategyConfig.manageCloselyLabel'),
    },
  ]

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit)}
        className="flex flex-col gap-3"
      >
        {fields.map(({ name, label }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={2}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ))}
        <DialogFooter>
          <Button
            type="submit"
            disabled={isPending}
          >
            {t('pages.stakeholderRegister.strategyConfig.saveButton')}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
