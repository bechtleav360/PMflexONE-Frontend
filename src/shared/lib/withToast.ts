import { toast } from 'sonner'

/**
 * Wraps a TanStack `mutateAsync` call inside a Sonner promise toast.
 *
 * Use this instead of feature-local `*WithToast` helpers whenever a mutation
 * needs loading / success / error feedback. Using `mutateAsync` (rather than
 * `mutate`) is intentional: the returned promise resolves/rejects after the
 * request completes, so the toast lifecycle is independent of the component
 * that triggered it. Per-call `mutate` callbacks are dropped when the
 * component unmounts (e.g. when a modal closes on success), which would leave
 * the toast stuck in loading state.
 *
 * @param mutateAsync - The `mutateAsync` function returned by a TanStack mutation hook.
 * @param input - The argument to pass to `mutateAsync`.
 * @param messages - Toast copy for each state.
 * @param messages.loading - Shown while the mutation is in-flight.
 * @param messages.success - Shown on successful completion.
 * @param messages.error - Shown on failure; may be a static string or a function that receives the thrown error.
 */
export function withToast<TInput>(
  mutateAsync: (input: TInput) => Promise<unknown>,
  input: TInput,
  messages: {
    loading: string
    success: string
    error: string | ((err: unknown) => string)
  },
): void {
  const promise = mutateAsync(input)

  toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  })
}
