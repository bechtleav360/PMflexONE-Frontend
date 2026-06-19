import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'

import { isAuthError, useAuthSessionStore } from './authSession'

/**
 * Shared TanStack Query client with `staleTime: 0` as the global default.
 * Individual queries may override this with a longer stale time where appropriate.
 * Auth errors (401/403) are surfaced globally via the session expired dialog.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      networkMode: 'always',
      retry: (failureCount, error) => {
        if (isAuthError(error)) return false
        return failureCount < 3
      },
    },
    mutations: {
      networkMode: 'always',
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (isAuthError(error)) {
        useAuthSessionStore.getState().markExpired()
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      if (isAuthError(error)) {
        useAuthSessionStore.getState().markExpired()
      }
    },
  }),
})
