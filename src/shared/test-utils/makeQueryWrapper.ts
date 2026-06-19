import { createElement } from 'react'
import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Like {@link makeQueryWrapper} but also returns the QueryClient instance,
 * useful for spying on `invalidateQueries` or seeding cache in hook tests.
 *
 * @returns An object with `Wrapper` and `queryClient`.
 */
export function makeQueryWrapperWithClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return { Wrapper, queryClient }
}

/**
 * Creates a React Testing Library wrapper component backed by a fresh QueryClient.
 * Pass the returned value as the `wrapper` option in RTL `render()` calls.
 *
 * @returns A React wrapper component that provides TanStack Query context.
 */
export function makeQueryWrapper() {
  return makeQueryWrapperWithClient().Wrapper
}
