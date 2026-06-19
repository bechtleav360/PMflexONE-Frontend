import { ClientError } from 'graphql-request'

/**
 * Returns `true` when the given error is a GraphQL `OPTIMISTIC_LOCK_ERROR`.
 *
 * Checks the `extensions.code` field on every error in the response so callers
 * can surface a user-friendly "reload and retry" message instead of a generic
 * failure toast.
 *
 * @param error - The unknown error value caught from a mutation handler.
 * @returns Whether the error represents an optimistic locking conflict.
 */
export function isOptimisticLockError(error: unknown): boolean {
  if (error instanceof ClientError) {
    return (
      error.response.errors?.some((e) => {
        const code = e.extensions?.['code']
        return typeof code === 'string' && code === 'OPTIMISTIC_LOCK_ERROR'
      }) ?? false
    )
  }
  return false
}
