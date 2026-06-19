import { useTranslation } from 'react-i18next'

import { showError, showSuccess } from '@/shared/components'
import { getGraphQLErrorMessage } from '@/shared/lib/utils'

interface UseEntrySubmitOptions<TValues, TInput> {
  mutateAsync: (input: TInput) => Promise<unknown>
  isPending: boolean
  close: () => void
  successKey: string
  errorKey: string
  buildInput: (values: TValues) => TInput
}

/**
 * Generic submit handler for entry create/edit forms.
 * Calls `mutateAsync(buildInput(values))`, then closes the dialog and shows a success
 * toast, or shows a GraphQL-aware error toast on failure.
 *
 * @param options - Options.
 * @param options.mutateAsync - The mutation function to call with the built input.
 * @param options.isPending - Whether the mutation is in flight (passed through to the return value).
 * @param options.close - Closes the dialog on success.
 * @param options.successKey - i18n key for the success toast.
 * @param options.errorKey - i18n key for the fallback error toast.
 * @param options.buildInput - Maps form values to the mutation input shape.
 * @returns The async submit handler, pending state, and dialog close function.
 */
export function useEntrySubmit<TValues, TInput>({
  mutateAsync,
  isPending,
  close,
  successKey,
  errorKey,
  buildInput,
}: UseEntrySubmitOptions<TValues, TInput>) {
  const { t } = useTranslation()

  async function onSubmit(values: TValues) {
    try {
      await mutateAsync(buildInput(values))
      close()
      showSuccess(t(successKey))
    } catch (error) {
      showError(getGraphQLErrorMessage(error, t(errorKey)))
    }
  }

  return { onSubmit, isPending, close }
}
