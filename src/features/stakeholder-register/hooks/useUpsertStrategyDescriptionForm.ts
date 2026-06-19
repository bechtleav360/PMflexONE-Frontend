import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import type { ScopeType } from '@/shared/types/scopeType'

import type { UpsertStrategyDescriptionInput } from '../api/upsertStrategyDescriptionApi'
import { useUpsertStrategyDescription } from './useUpsertStrategyDescription'

/** Zod schema for the strategy descriptions form. */
export const strategyDescriptionsFormSchema = z.object({
  monitor: z.string(),
  keepInformed: z.string(),
  keepSatisfied: z.string(),
  manageClosely: z.string(),
})

/** Form values for the strategy descriptions edit form. */
export type StrategyDescriptionsFormValues = z.infer<typeof strategyDescriptionsFormSchema>

/** Options for {@link useUpsertStrategyDescriptionForm}. */
export interface UseUpsertStrategyDescriptionFormOptions {
  /** The type of scope (Project, Program, Portfolio). */
  scopeType: ScopeType
  /** The ID of the scope. */
  scopeId: string
  /** Callback invoked after a successful save. */
  onSuccess: () => void
}

/**
 * Hook encapsulating the submit logic for the strategy descriptions form.
 *
 * Maps form values to the mutation input, fires the upsert mutation,
 * dispatches success/error toasts, and calls {@link UseUpsertStrategyDescriptionFormOptions.onSuccess}.
 *
 * @param options - Scope context and success callback.
 * @returns An object with `submit` handler and `isPending` mutation state.
 */
export function useUpsertStrategyDescriptionForm({
  scopeType,
  scopeId,
  onSuccess,
}: UseUpsertStrategyDescriptionFormOptions) {
  const { t } = useTranslation()
  const { mutateAsync, isPending } = useUpsertStrategyDescription()

  async function submit(values: StrategyDescriptionsFormValues) {
    const input: UpsertStrategyDescriptionInput = {
      monitor: values.monitor || null,
      keepInformed: values.keepInformed || null,
      keepSatisfied: values.keepSatisfied || null,
      manageClosely: values.manageClosely || null,
    }
    try {
      await mutateAsync({ scopeType, scopeId, input })
      toast.success(t('pages.stakeholderRegister.strategyConfig.toast.success'))
      onSuccess()
    } catch {
      toast.error(t('pages.stakeholderRegister.strategyConfig.toast.error'))
    }
  }

  return { submit, isPending }
}
