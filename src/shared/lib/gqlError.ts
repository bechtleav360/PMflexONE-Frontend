import { ClientError } from 'graphql-request'

/**
 * Extracts the first GraphQL error message from an unknown error value.
 * Returns undefined when the error is not a ClientError or carries no message.
 *
 * @param err - The unknown error value to inspect.
 * @returns The first GraphQL error message string, or undefined.
 */
export function extractGqlErrorMessage(err: unknown): string | undefined {
  return err instanceof ClientError ? (err.response.errors?.[0]?.message ?? undefined) : undefined
}

/**
 * Returns true when the error is a GraphQL ClientError whose first extension
 * code is "CONFLICT", indicating an optimistic-lock conflict on the server.
 *
 * @param err - The unknown error value to inspect.
 * @returns True if the error represents an optimistic-lock conflict.
 */
export function isOptimisticLockConflict(err: unknown): boolean {
  if (!(err instanceof ClientError)) return false
  return (err.response.errors ?? []).some(
    (e) => (e.extensions?.['code'] as string | undefined) === 'CONFLICT',
  )
}
