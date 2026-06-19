import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { useDeleteStakeholder } from './useDeleteStakeholder'

vi.mock('sonner', () => ({
  toast: { promise: vi.fn(), error: vi.fn() },
}))

function makeWrapper(queryClient?: QueryClient) {
  const client =
    queryClient ??
    new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client }, children)
  }
  return Wrapper
}

describe('useDeleteStakeholder', () => {
  it('resolves on success', async () => {
    server.use(
      graphql.mutation('DeleteStakeholderEntry', () =>
        HttpResponse.json({ data: { deleteStakeholderEntry: true } }),
      ),
    )

    const { result } = renderHook(() => useDeleteStakeholder(), { wrapper: makeWrapper() })

    await act(async () => {
      await result.current.mutateAsync({
        id: 'e1',
        version: 1,
        scopeType: 'Project',
        scopeId: 'proj-1',
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('enters error state on GraphQL error', async () => {
    server.use(
      graphql.mutation('DeleteStakeholderEntry', () =>
        HttpResponse.json(
          {
            errors: [
              { message: 'OPTIMISTIC_LOCK_ERROR', extensions: { code: 'OPTIMISTIC_LOCK_ERROR' } },
            ],
          },
          { status: 200 },
        ),
      ),
    )

    const { result } = renderHook(() => useDeleteStakeholder(), { wrapper: makeWrapper() })

    await act(async () => {
      await result.current
        .mutateAsync({
          id: 'e1',
          version: 99,
          scopeType: 'Project',
          scopeId: 'proj-1',
        })
        .catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('invalidates the stakeholder register query on success', async () => {
    server.use(
      graphql.mutation('DeleteStakeholderEntry', () =>
        HttpResponse.json({ data: { deleteStakeholderEntry: true } }),
      ),
    )

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteStakeholder(), {
      wrapper: makeWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync({
        id: 'e1',
        version: 1,
        scopeType: 'Project',
        scopeId: 'proj-1',
      })
    })

    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['stakeholderEntries']),
        }),
      ),
    )
  })
})
